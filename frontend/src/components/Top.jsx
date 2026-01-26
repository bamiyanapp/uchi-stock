import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import topImage from "../assets/top.png";
import "./Top.css";

function Top() {
  const navigate = useNavigate();
  const { userId, login, loading: authLoading } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = async () => {
    if (userId && userId !== 'test-user' && userId !== 'pending') {
      navigate(`/${userId}`);
    } else {
      try {
        const loggedInUser = await login();
        if (loggedInUser) {
          navigate(`/${loggedInUser.uid}`, { replace: true });
        }
      } catch (error) {
        console.error("Login failed:", error);
      }
    }
  };

  const handleDemo = () => {
    navigate("/demo");
  };

  const handleGuide = () => {
    navigate("/guide");
  };

  return (
    <div className={`top-container ${isLoaded ? "is-loaded" : ""}`}>
      {/* ヒーローセクション：感情に訴えかけるビジュアル */}
      <section className="hero-section">
        <div className="hero-image-container">
          <img src={topImage} alt="悲痛な叫び" className="hero-image" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-catchphrase">
            <span>「もう、</span>
            <span>トイレットペーパーを</span>
            <br />
            <span>切らすのはごめんだ」</span>
          </h1>
          <div className="scroll-indicator">
            <span>Scroll for Solution</span>
            <div className="arrow"></div>
          </div>
        </div>
      </section>

      {/* ナビゲーションセクション：解決策への導線 */}
      <section className="navigation-section">
        <div className="navigation-content">
          <h2 className="section-title">在庫管理のストレスから、解放されよう。</h2>
          <p className="section-description">
            うちストックは、日常の「うっかり」をなくし、<br />
            あなたの暮らしに安心をストックするアプリです。
          </p>
          <div className="button-group">
            <button 
              onClick={handleStart} 
              className="btn-top btn-start" 
              disabled={authLoading}
            >
              {authLoading ? "準備中..." : "利用開始"}
              <span className="btn-subtext">ログインして在庫を確認</span>
            </button>
            <button onClick={handleGuide} className="btn-top btn-guide">
              使い方
              <span className="btn-subtext">ユーザーガイドを見る</span>
            </button>
            <button onClick={handleDemo} className="btn-top btn-demo">
              デモモード
              <span className="btn-subtext">ログインなしでお試し</span>
            </button>
          </div>
        </div>
      </section>

      <footer className="top-footer">
        <p>&copy; 2026 uchi-stock</p>
      </footer>
    </div>
  );
}

export default Top;
