const { buildOpsAlertMessage, sendOpsAlert } = require("./ops-alert-notifier"); // symlink

/**
 * CloudWatch Alarm発報時のSNS通知を受け取り、運用監視専用LINE Botへ通知する
 * （dev-standards/docs/ops-monitoring-pattern.md）。
 * OPS_ALERT_LINE_CHANNEL_ACCESS_TOKEN・OPS_ALERT_LINE_USER_IDが未設定の場合、
 * Secrets未登録でもデプロイ・実行自体が失敗しないよう送信をスキップする。
 */
exports.opsAlert = async (event) => {
  const channelAccessToken = process.env.OPS_ALERT_LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.OPS_ALERT_LINE_USER_ID;

  for (const record of event.Records || []) {
    try {
      const alarm = JSON.parse(record.Sns.Message);
      const message = buildOpsAlertMessage({
        appName: "uchi-stock",
        alarmName: alarm.AlarmName,
        newState: alarm.NewStateValue,
        reason: alarm.NewStateReason,
      });

      if (!channelAccessToken || !userId) {
        console.warn("[opsAlert] OPS_ALERT_LINE_CHANNEL_ACCESS_TOKEN/OPS_ALERT_LINE_USER_IDが未設定のため送信をスキップします:", message);
        continue;
      }

      await sendOpsAlert({ message, channelAccessToken, userId });
    } catch (error) {
      // 1件の通知失敗が他のレコード処理・Lambda全体の失敗に波及しないようにする
      console.error("[opsAlert] 通知処理に失敗しました:", error.message);
    }
  }
};
