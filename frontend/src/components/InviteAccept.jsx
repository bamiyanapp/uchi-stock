import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const InviteAccept = () => {
  const { token } = useParams();
  const { userId, getIdToken, login } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "https://u8ix9o2m78.execute-api.ap-northeast-1.amazonaws.com/dev";

  const acceptInvitation = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const idToken = await getIdToken();
      const response = await fetch(`${API_URL}/invitations/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ invitationToken: token }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "招待の受諾に失敗しました");
      }

      // 成功したらホームへ
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, getIdToken, API_URL, navigate]);

  useEffect(() => {
    if (userId && userId !== 'pending' && userId !== 'test-user') {
      acceptInvitation();
    }
  }, [userId, acceptInvitation]);

  const handleLogin = async () => {
    try {
      await login();
      // login() 成功後、userIdが更新され、useEffectでacceptInvitationが呼ばれる
    } catch {
      setError("ログインに失敗しました");
    }
  };

  return (
    <div className="container py-5 text-center">
      <div className="card shadow-sm mx-auto" style={{ maxWidth: "500px" }}>
        <div className="card-body p-5">
          <h1 className="h3 mb-4">家族への招待が届いています</h1>
          
          {loading ? (
            <div className="py-4">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">処理中...</span>
              </div>
              <p>家族登録を処理しています...</p>
            </div>
          ) : error ? (
            <div className="py-4">
              <div className="alert alert-danger mb-4">{error}</div>
              <button className="btn btn-primary" onClick={() => navigate("/")}>
                ホームへ戻る
              </button>
            </div>
          ) : !userId || userId === 'pending' || userId === 'test-user' ? (
            <div className="py-4">
              <p className="mb-4">家族登録を完了するにはログインが必要です。</p>
              <button className="btn btn-primary btn-lg w-100" onClick={handleLogin}>
                Googleでログインして受諾する
              </button>
            </div>
          ) : (
            <div className="py-4">
               <p>家族として登録しています...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteAccept;
