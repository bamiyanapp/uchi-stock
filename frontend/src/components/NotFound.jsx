import React from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon, AlertCircle } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import Header from "./Header";

/**
 * NotFound コンポーネント
 * 
 * 指定されたアイテムが存在しない場合や、存在しないルートにアクセスした場合に表示する
 * ユーザーが迷わないよう、在庫一覧（ホーム）への導線を提供する
 */
const NotFound = ({ message = "お探しのページまたはアイテムが見つかりませんでした。" }) => {
  const authContext = useUser() || {};
  const { userId = 'pending' } = authContext;

  // ログインユーザーがいる場合はそのユーザーの在庫一覧へ、そうでない場合はトップへ戻す
  const homePath = userId && userId !== 'test-user' && userId !== 'pending' ? `/${userId}` : "/";

  return (
    <>
      <Header />
      <div className="container py-5">
        <div className="header-spacer mb-4"></div>
        <div className="row justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
          <div className="col-md-6 text-center">
            <div className="mb-4">
              <AlertCircle size={80} className="text-muted opacity-50" />
            </div>
            <h1 className="display-5 fw-bold mb-3">404</h1>
            <p className="lead text-muted mb-5">
              {message}
            </p>
            <Link to={homePath} className="btn btn-primary btn-lg d-inline-flex align-items-center px-4">
              <HomeIcon size={20} className="me-2" />
              在庫一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
