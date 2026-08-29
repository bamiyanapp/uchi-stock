import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Share2 } from "lucide-react";

// dev-standards/shared/ui/ShareButton.jsxを個別コピーしたもの（symlinkではない）。
// 共有版はdaisyUI固有のクラス名（modal/modal-open/modal-box/btn等）を前提にしており、
// uchi-stockはBootstrap 5.3構成（Bootstrap JS本体は読み込んでおらずCSSのみ）のため
// そのままでは無スタイルになる。UpdateNotifier.jsxと同様、独自のposition-fixed
// オーバーレイ＋Bootstrapユーティリティクラスへ書き換えた個別コピーとして管理する
// （dev-standards/docs/shared-ui-components.md「daisyUI固有のクラス名を使う共有
// コンポーネントを流用する場合」参照）。
//
// 現在のページ（既定ではwindow.location.href）をQRコードで表示し、URLをワンタップ
// コピーできるボタン＋モーダル。スマートフォンオンリーの利用環境で、家族間の
// 画面共有にQRコードの読み取りが最も簡便であることを想定している。
//
// label: トリガーボタン・モーダル見出しの文言
// className: トリガーボタンへ追加するクラス名（メニュー項目等、埋め込み先の見た目に合わせる）
// getUrl: 共有するURLを返す関数（既定はwindow.location.href）
export default function ShareButton({ label = "アプリを共有", className = "", getUrl = () => window.location.href }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  function openShare() {
    setCopied(false);
    setShareUrl(getUrl());
    setOpen(true);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      // クリップボードAPIが使えない環境では、URLのテキスト選択・手動コピーで代替する
    }
  }

  return (
    <>
      <button type="button" onClick={openShare} className={className}>
        <Share2 size={16} />
        {label}
      </button>

      {open && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1090 }}
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-3 shadow p-4"
            style={{ maxWidth: "320px", width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="h5 fw-bold mb-3">{label}</h3>
            <div className="my-4 d-flex justify-content-center">
              <QRCodeSVG value={shareUrl} size={200} />
            </div>
            <p className="bg-light rounded p-2 small text-break user-select-all">{shareUrl}</p>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button type="button" className="btn btn-sm btn-primary" onClick={handleCopy}>
                {copied ? "コピーしました" : "URLをコピー"}
              </button>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setOpen(false)}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
