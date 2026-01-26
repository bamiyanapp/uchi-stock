import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import Header from "./Header";
import StockList from "./StockList";

function Home() {
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams();
  const { userId, idToken, user, loading: authLoading } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // URLのユーザーIDとログイン中のユーザーIDが異なる場合、正しいURLにリダイレクト
  useEffect(() => {
    if (!authLoading && userId !== 'pending') {
      if (urlUserId && urlUserId !== userId) {
        navigate(`/${userId}`, { replace: true });
      }
    }
  }, [userId, urlUserId, navigate, authLoading]);

  if (userId === 'pending') {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">認証状態を確認中...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <StockList
        userId={urlUserId || userId}
        isDemo={false}
        showDebug={true}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </>
  );
}

export default Home;
