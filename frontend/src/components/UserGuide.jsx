import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Info, HelpCircle, User, Users, ClipboardList, ShoppingBag, TrendingDown, ShieldAlert, Sparkles } from "lucide-react";

function UserGuide() {
  return (
    <div className="container py-5">
      <header className="mb-5 d-flex align-items-center gap-3">
        <Link to="/" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
          <ChevronLeft size={18} />
          戻る
        </Link>
        <h1 className="h2 mb-0 fw-bold d-flex align-items-center gap-2">
          <Info className="text-primary" />
          ユーザーガイド
        </h1>
      </header>

      <main className="row g-4">
        <section className="col-12">
          <div className="card shadow-sm border-0 bg-light">
            <div className="card-body">
              <h2 className="h4 card-title mb-4 d-flex align-items-center gap-2">
                <ClipboardList className="text-success" />
                うちストックとは
              </h2>
              <p className="card-text">
                「うちストック」は、家庭内の消耗品在庫をスマートに管理するためのアプリです。
                日々の使用量を学習し、あと何日で在庫が切れるかを予測することで、
                「トイレットペーパーを買い忘れた！」という悲劇を防ぎます。
              </p>
            </div>
          </div>
        </section>

        <section className="col-12">
          <div className="card shadow-sm border-0 border-start border-primary border-4">
            <div className="card-body">
              <h2 className="h5 card-title mb-4 d-flex align-items-center gap-2">
                <Sparkles className="text-primary" />
                こんな時に便利（利用イメージ）
              </h2>
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="d-flex gap-3">
                    <div className="bg-primary-subtle p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px", flexShrink: 0 }}>
                      <ShoppingBag className="text-primary" size={24} />
                    </div>
                    <div>
                      <h3 className="h6 fw-bold mb-2">ドラッグストアでの買い物に</h3>
                      <p className="small text-muted mb-0">
                        「あれ、まだあったっけ？」と迷う必要はありません。アプリを見れば現在の正確な在庫が分かり、今買うべき日用品がすぐに明確になります。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex gap-3">
                    <div className="bg-warning-subtle p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px", flexShrink: 0 }}>
                      <TrendingDown className="text-warning" size={24} />
                    </div>
                    <div>
                      <h3 className="h6 fw-bold mb-2">セールの買い溜め防止に</h3>
                      <p className="small text-muted mb-0">
                        特売品を見つけた時、今のストック量と消費予測を確認。買い溜めしすぎて収納スペースを圧迫するのを防げます。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex gap-3">
                    <div className="bg-success-subtle p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px", flexShrink: 0 }}>
                      <ShieldAlert className="text-success" size={24} />
                    </div>
                    <div>
                      <h3 className="h6 fw-bold mb-2">防災用品の備蓄管理に</h3>
                      <p className="small text-muted mb-0">
                        「ローリングストック」を賢く実践。日常的に使いながら備蓄する際、適切なストック量をコントロールしやすくなります。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="col-md-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h2 className="h5 card-title mb-3 d-flex align-items-center gap-2">
                <User className="text-primary" />
                利用開始
              </h2>
              <ul className="list-group list-group-flush">
                <li className="list-group-item border-0 px-0">
                  <strong>Googleログイン:</strong> データを保存するためにGoogleアカウントでログインしてください。
                </li>
                <li className="list-group-item border-0 px-0">
                  <strong>デモモード:</strong> ログインせずに機能を試すことができます。
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="col-md-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h2 className="h5 card-title mb-3 d-flex align-items-center gap-2">
                <HelpCircle className="text-warning" />
                在庫の管理
              </h2>
              <ul className="list-group list-group-flush">
                <li className="list-group-item border-0 px-0">
                  <strong>品目の追加:</strong> 管理したい消耗品を登録します（例：トイレットペーパー、洗剤）。
                </li>
                <li className="list-group-item border-0 px-0">
                  <strong>在庫更新:</strong> 買い足した際や、消費した際に数値を入力します。
                </li>
                <li className="list-group-item border-0 px-0">
                  <strong>AI予測:</strong> 入力された履歴から、在庫切れの目安を自動で計算します。
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="h5 card-title mb-3 d-flex align-items-center gap-2">
                <Users className="text-info" />
                家族との共有
              </h2>
              <p>
                「家族を招待」メニューから招待リンクを生成し、家族に送ることで、
                同じ在庫リストを共同で管理・閲覧することができます。
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-5 text-center">
        <Link to="/" className="btn btn-primary btn-lg px-5">
          さっそく使ってみる
        </Link>
      </footer>
    </div>
  );
}

export default UserGuide;
