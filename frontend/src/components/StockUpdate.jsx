import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Minus, Plus } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import Header from "./Header";
import NotFound from "./NotFound";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://b974xlcqia.execute-api.ap-northeast-1.amazonaws.com/dev";

const StockUpdate = () => {
  const { itemId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetUserId = queryParams.get("userId");

  const navigate = useNavigate();
  const authContext = useUser() || {};
  const { userId = 'pending', idToken = null, user = null } = authContext;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [consumption, setConsumption] = useState(0);
  const [purchase, setPurchase] = useState(0);
  const [memo, setMemo] = useState("");

  const getHeaders = useCallback(() => {
    if (userId === 'pending') return null;
    const headers = {
      "x-user-id": userId
    };
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }
    return headers;
  }, [userId, idToken]);

  const fetchData = useCallback(async () => {
    if (user && !idToken) return;

    const headers = getHeaders();
    if (!headers) return;

    try {
      const url = new URL(`${API_BASE_URL}/items`);
      if (targetUserId) {
        url.searchParams.append("userId", targetUserId);
      }
      const response = await fetch(url.toString(), { headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      const itemsData = await response.json();
      if (Array.isArray(itemsData)) {
        const currentItem = itemsData.find(i => i.itemId === itemId);
        setItem(currentItem);
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
    }
  }, [itemId, getHeaders, user, idToken, targetUserId]);

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };

    initialFetch();
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const headers = getHeaders();
    if (!headers) {
      alert("認証の準備ができるまでお待ちください。");
      return;
    }

    if (user && !idToken) {
      alert("認証情報の準備中です。少々お待ちください。");
      return;
    }

    if (consumption === 0 && purchase === 0) {
      alert("消費量または購入数を入力してください。");
      return;
    }

    if (consumption > 0 && item && Number(consumption) > Number(item.currentStock)) {
      alert(`消費量は現在の在庫数 (${item.currentStock}) を超えることはできません。`);
      return;
    }

    setSubmitting(true);
    try {
      const fullHeaders = {
        ...headers,
        "Content-Type": "application/json"
      };

      const dateStr = new Date().toISOString();

      if (consumption > 0) {
        const url = new URL(`${API_BASE_URL}/items/${itemId}/consume`);
        if (targetUserId) {
          url.searchParams.append("userId", targetUserId);
        }
        const res = await fetch(url.toString(), {
          method: "POST",
          headers: fullHeaders,
          body: JSON.stringify({ quantity: consumption, memo, date: dateStr }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `消費の登録に失敗しました (${res.status})`);
        }
      }

      if (purchase > 0) {
        const url = new URL(`${API_BASE_URL}/items/${itemId}/stock`);
        if (targetUserId) {
          url.searchParams.append("userId", targetUserId);
        }
        const res = await fetch(url.toString(), {
          method: "POST",
          headers: fullHeaders,
          body: JSON.stringify({ quantity: purchase, memo, date: dateStr }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `購入の登録に失敗しました (${res.status})`);
        }
      }

      navigate(`/item/${itemId}${targetUserId ? `?userId=${targetUserId}` : ''}`);
    } catch (error) {
      console.error("Error updating stock:", error);
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (userId === 'pending' || loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">読み込み中...</span>
        </div>
      </div>
    );
  }

  if (!item) {
    return <NotFound message="指定された品目が見つかりませんでした。既に削除された可能性があります。" />;
  }


  const daysSinceUpdate = Math.floor((new Date() - new Date(item.updatedAt)) / (1000 * 60 * 60 * 24));

  return (
    <>
      <Header />
      <div className="container py-5">
        <div className="header-spacer mb-4"></div>
        <div className="mb-4">
          <Link 
            to={`/item/${itemId}${targetUserId ? `?userId=${targetUserId}` : ''}`} 
            className="btn btn-link p-0 text-decoration-none d-inline-flex align-items-center"
          >
            <ArrowLeft size={20} className="me-1" /> 詳細へ戻る
          </Link>
        </div>

        <header className="mb-5">
          <h1 className="h2 fw-bold mb-2">在庫を更新する</h1>
          <p className="text-muted">{item.name}</p>
        </header>

        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="mb-4 p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted small">前回更新からの経過</span>
                    <span className="fw-bold">{daysSinceUpdate} 日</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">現在の在庫（前回登録分）</span>
                    <span className="fw-bold">{item.currentStock} {item.unit}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="consumption-input" className="form-label fw-bold d-flex align-items-center">
                      <Minus size={18} className="me-2 text-warning" />
                      消費した量 ({item.unit})
                    </label>
                    <div className="input-group">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setConsumption(Math.max(0, consumption - 1))}
                      >
                        -1
                      </button>
                      <input 
                        id="consumption-input"
                        type="number" 
                        className="form-control text-center fs-5"
                        value={consumption}
                        onChange={(e) => setConsumption(Math.max(0, parseFloat(e.target.value) || 0))}
                        min="0"
                        max={item.currentStock}
                        step="any"
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setConsumption(consumption + 1)}
                      >
                        +1
                      </button>
                    </div>
                    <div className="form-text">前回確認から今日までに消費した量を入力してください。</div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="purchase-input" className="form-label fw-bold d-flex align-items-center">
                      <Plus size={18} className="me-2 text-primary" />
                      新しく購入した量 ({item.unit})
                    </label>
                    <div className="input-group">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setPurchase(Math.max(0, purchase - 1))}
                      >
                        -1
                      </button>
                      <input 
                        id="purchase-input"
                        type="number" 
                        className="form-control text-center fs-5"
                        value={purchase}
                        onChange={(e) => setPurchase(Math.max(0, parseFloat(e.target.value) || 0))}
                        min="0"
                        step="any"
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setPurchase(purchase + 1)}
                      >
                        +1
                      </button>
                    </div>
                    <div className="form-text">新しく補充した量がある場合に入力してください。</div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-bold">メモ（任意）</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="例: 特売で購入"
                    />
                  </div>

                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg d-flex align-items-center justify-content-center"
                      disabled={submitting || (consumption === 0 && purchase === 0)}
                    >
                      {submitting ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      ) : (
                        <Save size={20} className="me-2" />
                      )}
                      更新を保存する
                    </button>
                    <Link 
                      to={`/item/${itemId}${targetUserId ? `?userId=${targetUserId}` : ''}`} 
                      className="btn btn-outline-secondary"
                    >
                      キャンセル
                    </Link>
                  </div>
                </form>
              </div>
            </div>

            <div className="mt-4 p-3 bg-info bg-opacity-10 border border-info border-opacity-25 rounded">
              <h3 className="h6 fw-bold mb-2">在庫計算の仕組み</h3>
              <p className="small text-muted mb-0">
                新しい在庫 = (現在の在庫) - (消費した量) + (購入した量) <br />
                として計算されます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StockUpdate;
