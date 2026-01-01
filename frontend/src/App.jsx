import { useState } from "react";
import "./App.css";

function App() {
  const [phrase, setPhrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");

  const playKaruta = async () => {
    setLoading(true);
    try {
      // API GatewayのURLをここに設定する（デプロイ後に書き換えが必要）
      const apiUrl = "https://zr6f3qp6vg.execute-api.ap-northeast-1.amazonaws.com/dev/get-phrase";
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok) {
        setPhrase(data.phrase);
        setAudioUrl(data.audioUrl);
        
        // 音声を再生
        const audio = new Audio(data.audioUrl);
        audio.play();
      } else {
        alert("エラーが発生しました: " + data.message);
      }
    } catch (error) {
      console.error("Error fetching phrase:", error);
      alert("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>カルタ読み上げアプリ</h1>
      <div className="card">
        <button onClick={playKaruta} disabled={loading}>
          {loading ? "読み込み中..." : "次の札を読み上げる"}
        </button>
        {phrase && (
          <div className="phrase-container">
            <p className="phrase-text">{phrase}</p>
          </div>
        )}
      </div>
      <p className="read-the-docs">
        ボタンを押すとランダムに札が選ばれ、Amazon Pollyで読み上げられます。
      </p>
    </div>
  );
}

export default App;
