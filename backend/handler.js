const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const pollyClient = new PollyClient({ region: "ap-northeast-1" });

exports.getPhrase = async (event) => {
  console.log("Event:", JSON.stringify(event));
  console.log("Table Name:", process.env.TABLE_NAME);
  try {
    // 1. DynamoDBから全件取得（簡易化のため。本来は件数が多い場合は別の方法を検討）
    const scanParams = {
      TableName: process.env.TABLE_NAME,
    };
    const scanResult = await docClient.send(new ScanCommand(scanParams));
    const items = scanResult.Items;
    console.log("Fetched items count:", items ? items.length : 0);

    if (!items || items.length === 0) {
      console.log("No items found in table.");
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "No phrases found" }),
      };
    }

    // 2. ランダムに1つ選択
    const randomIndex = Math.floor(Math.random() * items.length);
    const selectedItem = items[randomIndex];
    const text = selectedItem.phrase;

    // 3. Pollyで署名付きURLを生成（フロントエンドで直接再生させるため）
    const pollyParams = {
      Text: text,
      OutputFormat: "mp3",
      VoiceId: "Mizuki", // 日本語女性ボイス
      Engine: "standard"
    };

    // AWS SDK v3のPolly署名では、明示的にエンドポイントとパラメータを指定する必要がある
    const command = new SynthesizeSpeechCommand(pollyParams);
    
    // 署名付きURLを生成
    // getSignedUrlはデフォルトでパラメータをクエリ文字列に含めない場合があるため、手動で付与するか、
    // 正しい実装方法（Presignerの直接利用など）を検討する。
    // ここではSDKの標準的な動作に期待しつつ、パラメータが確実に含まれるように再試行する。
    const signedUrl = await getSignedUrl(pollyClient, command, { 
      expiresIn: 300,
    });

    // もしURLにパラメータが含まれていない場合、手動で付与する（暫定対応）
    let finalUrl = signedUrl;
    if (!finalUrl.includes("Text=")) {
      const params = new URLSearchParams({
        Text: text,
        OutputFormat: "mp3",
        VoiceId: "Mizuki",
        Engine: "standard"
      });
      finalUrl += (finalUrl.includes("?") ? "&" : "?") + params.toString();
    }
    console.log("Generated URL (first 100 chars):", finalUrl.substring(0, 100));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        id: selectedItem.id,
        phrase: text,
        audioUrl: finalUrl,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};
