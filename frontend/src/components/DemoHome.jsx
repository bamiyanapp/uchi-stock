import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import Header from "./Header";
import StockList from "./StockList";

function DemoHome() {
  const navigate = useNavigate();
  const { userId } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleStart = async () => {
    if (userId && userId !== 'test-user' && userId !== 'pending') {
      navigate(`/${userId}`);
    } else {
      try {
        const { login } = useUser();
        const loggedInUser = await login();
        if (loggedInUser) {
          navigate(`/${loggedInUser.uid}`, { replace: true });
        }
      } catch (error) {
        console.error("Login failed:", error);
      }
    }
  };

  const handleGuide = () => {
    navigate("/guide");
  };

  return (
    <>
      <Header />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 text-center mb-4">
            <h1 className="display-4 fw-bold text-primary mb-3">
              デモモード
            </h1>
            <p className="lead text-muted mb-4">
              サンプルデータでアプリの機能を体験できます。<br />
              ログインせずに在庫管理の流れを確認できます。
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button 
                onClick={handleStart} 
                className="btn btn-primary btn-lg px-4"
              >
                ログインして開始
              </button>
              <button 
                onClick={handleGuide} 
                className="btn btn-outline-secondary btn-lg px-4"
              >
                使い方を見る
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="alert alert-info d-flex align-items-center">
              <span className="badge bg-info text-dark me-3">INFO</span>
              <div>
                デモモードではサンプルデータが表示されます。<br />
                在庫の更新や品目の追加はできませんが、予測機能や画面遷移を確認できます。
              </div>
            </div>
          </div>
        </div>

        <StockList
          isDemo={true}
          showDebug={false}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>
    </>
  );
}

export default DemoHome;