import { useEffect } from "react";

// dev-standards（shared/pwa/ServiceWorkerRegistration.jsx）からのsymlinkではなく
// 個別コピー。uchi-stockはGitHub Pagesのプロジェクトサイト（vite.config.jsの
// base: "/uchi-stock/"）としてサブパス配信されており、共有版がハードコードしている
// register("/sw.js")（サイトルート配信前提）ではスコープが合わない
// （issue #319）。import.meta.env.BASE_URLを使いサブパス配下のsw.jsを登録する
// 点のみが差分で、それ以外のロジックは共有版と同一。
//
// iOS PWA（ホーム画面から起動したスタンドアロン表示）はブラウザの自動的な
// Service Worker更新チェック（ページ遷移時・約24時間おき）が働きにくく、
// アプリを終了せずバックグラウンドへ回して再度開いただけでは新バージョンに
// 気づかないことがある。アプリがフォアグラウンドに戻るたびに明示的に
// registration.update()を呼び、新バージョンの検知（UpdateNotifierが拾う
// controllerchangeイベント）を確実にする。詳細な経緯・キャッシュ戦略の全体像は
// dev-standards/docs/service-worker-update-pattern.mdを参照
const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration;
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((reg) => {
        registration = reg;
      })
      .catch((error) => {
        console.error("Service Worker registration failed", error);
      });

    function checkForUpdate() {
      if (document.visibilityState === "visible") {
        registration?.update().catch(() => {
          // オフライン等での更新チェック失敗は致命的ではないため無視する
        });
      }
    }

    document.addEventListener("visibilitychange", checkForUpdate);
    const intervalId = setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", checkForUpdate);
      clearInterval(intervalId);
    };
  }, []);

  return null;
}
