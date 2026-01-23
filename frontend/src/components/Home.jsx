import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Trash2, ExternalLink, AlertTriangle, Clock, Plus, X } from "lucide-react";
import { useUser } from "../contexts/UserContext";

const API_BASE_URL = "https://b974xlcqia.execute-api.ap-northeast-1.amazonaws.com/dev";

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date()); // デフォルト今日の日付
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId, idToken, user, login, logout, loading: authLoading } = useUser();

  const formatDate = (date) => {
    return date.toLocaleDateString('sv-SE');
  };

  const handleDateChange = (e) => {
    const [year, month, day] = e.target.value.split('-').map(Number);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      setSelectedDate(new Date(year, month - 1, day));
    }
  };

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

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName || !newItemUnit) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: "POST",
        headers: {
          ...getHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newItemName,
          unit: newItemUnit,
        }),
      });

      if (response.ok) {
        setNewItemName("");
        setNewItemUnit("");
        setIsAdding(false);
        fetchItems();
      } else {
        const data = await response.json();
        alert(`エラー: ${data.message}`);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      alert("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
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
        <div className="row mb-4 g-3">
          <div className="col-md-6">
            <label htmlFor="date-picker" className="form-label fw-bold">基準日付</label>
            <input
              id="date-picker"
              type="date"
              className="form-control"
              value={formatDate(selectedDate)}
              onChange={handleDateChange}
            />
          </div>
          <div className="col-md-6 d-flex align-items-end">
            {!isAdding ? (
              <button 
                onClick={() => setIsAdding(true)}
                className="btn btn-success d-flex align-items-center gap-2"
              >
                <Plus size={20} />
                新しい品目を追加
              </button>
            ) : (
              <button 
                onClick={() => setIsAdding(false)}
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
              >
                <X size={20} />
                キャンセル
              </button>
            )}
          </div>
        </div>

        {isAdding && (
          <div className="card mb-5 border-success shadow-sm">
            <div className="card-body">
              <h2 className="h5 card-title mb-4">新しい品目の登録</h2>
              <form onSubmit={handleAddItem} className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="itemName" className="form-label">品目名</label>
                  <input
                    type="text"
                    className="form-control"
                    id="itemName"
                    placeholder="例: トイレットペーパー"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="itemUnit" className="form-label">単位</label>
                  <input
                    type="text"
                    className="form-control"
                    id="itemUnit"
                    placeholder="例: ロール、袋、個"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button 
                    type="submit" 
                    className="btn btn-success w-100"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      "登録する"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <section className="mb-5">
          <h2 className="h5 mb-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Clock size={20} className="me-2 text-primary" />
              残量予測とステータス
            </div>
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
                
                let statusClass = "bg-secondary";
                let statusText = "在庫割合不明";
                const stockPercentage = item.estimate?.stockPercentage;

                if (stockPercentage !== undefined && stockPercentage !== null) {
                  statusText = `在庫残り ${stockPercentage}%`;
                  if (stockPercentage <= 20) {
                    statusClass = "bg-danger";
                  } else if (stockPercentage <= 50) {
                    statusClass = "bg-warning text-dark";
                  } else {
                    statusClass = "bg-success";
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
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="display-6 fw-bold">
                              {item.estimate?.predictedStock !== undefined ? item.estimate.predictedStock : item.currentStock}
                            </span>
                            <span className="text-muted">{item.unit}</span>
                          </div>
                          <div className="mb-3">
                            {(() => {
                              const predictedStock = item.estimate?.predictedStock;
                              const currentStock = item.currentStock;
                              const updatedAt = new Date(item.updatedAt);
                              const selected = new Date(selectedDate);
                              
                              // 日付のみを比較
                              const updatedAtDate = new Date(updatedAt.getFullYear(), updatedAt.getMonth(), updatedAt.getDate());
                              const selectedDateOnly = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
                              
                              const isPrediction = predictedStock !== undefined && predictedStock !== currentStock;
                              const isPastHistory = !isPrediction && updatedAtDate < selectedDateOnly;

                              if (isPastHistory) {
                                return (
                                  <small className="text-muted">
                                    {updatedAt.toLocaleDateString()} 時点の情報
                                  </small>
                                );
                              }
                              return null;
                            })()}
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
