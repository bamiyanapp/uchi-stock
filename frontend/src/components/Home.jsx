import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Trash2, ExternalLink, AlertTriangle, Clock } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import UserSelector from "./UserSelector";

const API_BASE_URL = "https://b974xlcqia.execute-api.ap-northeast-1.amazonaws.com/dev";

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 1)); // デフォルト2026/1/1
  const { userId, idToken, user, login, logout, loading: authLoading } = useUser();

  const getHeaders = useCallback(() => {
    const headers = {
      "x-user-id": userId
    };
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }
    return headers;
  }, [userId, idToken]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        headers: getHeaders()
      });
      const data = await response.json();
      const itemsList = Array.isArray(data) ? data : [];

      // 各アイテムの在庫切れ予想を取得
      const itemsWithEstimates = await Promise.all(
        itemsList.map(async (item) => {
          try {
            const estResponse = await fetch(`${API_BASE_URL}/items/${item.itemId}/estimate?date=${selectedDate.toISOString()}`, {
              headers: getHeaders()
            });
            const estData = await estResponse.json();
            return { ...item, estimate: estData };
          } catch (error) {
            console.error(`Error fetching estimate for item ${item.itemId}:`, error);
            return { ...item, estimate: null };
          }
        })
      );

      setItems(itemsWithEstimates);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  }, [getHeaders, selectedDate]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const deleteItem = async (itemId) => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (response.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div className="container py-5">
      <header className="text-center mb-5 position-relative">
        <div className="position-absolute top-0 end-0 p-2">
          {authLoading ? (
            <div className="spinner-border spinner-border-sm text-secondary" role="status"></div>
          ) : user ? (
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted d-none d-md-inline">{user.username || user.userId}</span>
              <button onClick={logout} className="btn btn-sm btn-outline-secondary">ログアウト</button>
            </div>
          ) : (
            <button onClick={login} className="btn btn-sm btn-primary">Googleでログイン</button>
          )}
        </div>
        <h1 className="display-4 fw-bold">家庭用品在庫管理</h1>
        <p className="text-muted">気が向いた時に在庫をチェック</p>
      </header>

      <main>
        <UserSelector />

        <div className="mb-4">
          <label htmlFor="date-picker" className="form-label fw-bold">基準日付</label>
          <input
            id="date-picker"
            type="date"
            className="form-control"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
          />
        </div>

        <section className="mb-5">
          <h2 className="h5 mb-4 d-flex align-items-center">
            <Clock size={20} className="me-2 text-primary" />
            残量予測とステータス
          </h2>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">読み込み中...</span>
              </div>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {items.map((item) => {
                const daysRemaining = item.estimate && item.estimate.estimatedDepletionDate
                  ? Math.ceil((new Date(item.estimate.estimatedDepletionDate) - selectedDate) / (1000 * 60 * 60 * 24))
                  : null;
                
                let statusClass = "bg-success";
                let statusText = "余裕あり";
                if (daysRemaining !== null) {
                  if (daysRemaining <= 3) {
                    statusClass = "bg-danger";
                    statusText = "まもなく在庫切れ";
                  } else if (daysRemaining <= 7) {
                    statusClass = "bg-warning text-dark";
                    statusText = "少なくなっています";
                  }
                } else if (item.currentStock === 0) {
                    statusClass = "bg-danger";
                    statusText = "在庫なし";
                }

                return (
                  <div key={item.itemId} className="col">
                    <div className="card h-100 shadow-sm border-0 overflow-hidden">
                      <div className={`py-1 px-3 small fw-bold text-center text-white ${statusClass}`}>
                        {statusText}
                      </div>
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h3 className="h5 card-title mb-0">
                            <Link to={`/item/${item.itemId}`} className="text-decoration-none text-dark hover-primary">
                              {item.name} <ExternalLink size={14} className="text-muted" />
                            </Link>
                          </h3>
                          <button 
                            onClick={() => deleteItem(item.itemId)} 
                            className="btn btn-sm btn-outline-danger border-0 opacity-50 hover-opacity-100"
                            title="品目を削除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <div className="d-flex align-items-center gap-2 mb-3">
                            <span className="display-6 fw-bold">{item.currentStock}</span>
                            <span className="text-muted">{item.unit}</span>
                          </div>

                          {daysRemaining !== null ? (
                            <div className={`d-flex align-items-center p-2 rounded ${daysRemaining <= 3 ? 'bg-danger bg-opacity-10 text-danger' : 'bg-light'}`}>
                              <AlertTriangle size={18} className="me-2" />
                              <span className="fw-bold">
                                あと約 <span className="fs-4">{daysRemaining}</span> 日
                              </span>
                            </div>
                          ) : (
                            <div className="p-2 bg-light rounded text-muted small">
                              {item.estimate?.message === "Not enough history to estimate" ? "履歴不足のため予想不可" : "在庫切れ予想なし"}
                            </div>
                          )}
                        </div>

                        <div className="d-grid gap-2">
                          <Link to={`/item/${item.itemId}/update`} className="btn btn-primary">
                            在庫を更新する
                          </Link>
                          <Link to={`/item/${item.itemId}`} className="btn btn-outline-secondary btn-sm">
                            詳細・履歴
                          </Link>
                        </div>
                      </div>
                      <div className="card-footer bg-transparent border-0 text-center pb-3">
                        <small className="text-muted">
                          最終更新: {new Date(item.updatedAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </div>
                );
              })}
              {items.length === 0 && (
                <div className="col-12 text-center py-5">
                  <p className="text-muted">品目が登録されていません。管理者に依頼して追加してください。</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Home;
