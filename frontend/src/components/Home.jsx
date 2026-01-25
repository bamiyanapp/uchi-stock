import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Trash2, ExternalLink, AlertTriangle, Clock, Plus, X, Bug } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import Header from "./Header";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://b974xlcqia.execute-api.ap-northeast-1.amazonaws.com/dev";

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [families, setFamilies] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams();
  const authContext = useUser() || {};
  const { 
    userId = 'pending', 
    idToken = null, 
    user = null, 
    loading: authLoading = false 
  } = authContext;

  const getHeaders = useCallback(() => {
    if (userId === 'pending') return null;
    
    // 表示対象がデモユーザー（test-user）の場合は、ログイン状態に関わらず認証ヘッダーを送らない。
    // これによりバックエンドはリクエストをデモユーザーのものとして処理する。
    if (urlUserId === 'test-user' || selectedUserId === 'test-user') {
      return { "x-user-id": "test-user" };
    }

    const headers = {
      "x-user-id": userId
    };
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }
    return headers;
  }, [userId, idToken, urlUserId, selectedUserId]);

  const fetchFamilies = useCallback(async () => {
    try {
      const headers = getHeaders();
      if (!headers) return;
      const response = await fetch(`${API_BASE_URL}/families`, { headers });
      if (response.ok) {
        const data = await response.json();
        setFamilies(data);
      }
    } catch (err) {
      console.error("Failed to fetch families", err);
    }
  }, [getHeaders]);

  useEffect(() => {
    if (userId && userId !== 'pending') {
      // デモモード（test-user）が指定されている場合は、ログイン状態に関わらずデモモードとして振る舞う
      if (urlUserId === 'test-user') {
        setSelectedUserId('test-user');
      } else if (userId !== 'test-user') {
        setSelectedUserId(userId);
        fetchFamilies();
      }
    }
  }, [userId, urlUserId, fetchFamilies]);

  // URLのユーザーIDとログイン中のユーザーIDが異なる場合、正しいURLにリダイレクト
  useEffect(() => {
    if (!authLoading && userId !== 'pending') {
      // デモモード（test-user）へのアクセスは常に許可する
      if (urlUserId === 'test-user') {
        return;
      }

      if (userId !== 'test-user') {
        // ログイン済みの場合、自分以外のID（かつデモIDでない）へのアクセスなら自分のページへリダイレクト
        // ただし、将来的に家族の在庫を見る機能があるため、ここでは「urlUserIdが存在し、かつ自分でもデモでもない」場合のみチェック
        if (urlUserId && urlUserId !== userId) {
          // fetchFamiliesで家族一覧を取得しているはずなので、家族のIDであればリダイレクトしない
          const isFamilyMember = families.some(f => f.userId === urlUserId);
          if (!isFamilyMember) {
            navigate(`/${userId}`, { replace: true });
          }
        }
      } else {
        // 未ログイン状態で /uchi-stock/:userId にアクセスした場合はトップへ（デモモード以外）
        if (urlUserId) {
          navigate("/", { replace: true });
        }
      }
    }
  }, [userId, urlUserId, navigate, authLoading, families]);

  const formatDate = (date) => {
    return date.toLocaleDateString('sv-SE');
  };

  const handleDateChange = (e) => {
    const [year, month, day] = e.target.value.split('-').map(Number);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      setSelectedDate(new Date(year, month - 1, day));
    }
  };

  const fetchItems = useCallback(async () => {
    const headers = getHeaders();
    if (!headers) return;

    // ログイン中だがトークンが未取得の場合は待機する
    if (user && !idToken) {
      return;
    }

    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/items`);
      if (selectedUserId) {
        url.searchParams.append("userId", selectedUserId);
      }

      const response = await fetch(url.toString(), {
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const itemsList = Array.isArray(data) ? data : [];

      // 各アイテムの在庫切れ予想を取得
      const itemsWithEstimates = await Promise.all(
        itemsList.map(async (item) => {
          try {
            const estUrl = new URL(`${API_BASE_URL}/items/${item.itemId}/estimate`);
            estUrl.searchParams.append("date", selectedDate.toISOString());
            if (selectedUserId) {
              estUrl.searchParams.append("userId", selectedUserId);
            }

            const estResponse = await fetch(estUrl.toString(), {
              headers
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
      console.error("[Home] fetchItems error:", error);
    } finally {
      setLoading(false);
    }
  }, [getHeaders, selectedDate, user, idToken, selectedUserId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const deleteItem = async (itemId) => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      const headers = getHeaders();
      if (!headers) return;

      const url = new URL(`${API_BASE_URL}/items/${itemId}`);
      if (selectedUserId) {
        url.searchParams.append("userId", selectedUserId);
      }

      const response = await fetch(url.toString(), {
        method: "DELETE",
        headers
      });
      if (response.ok) {
        fetchItems();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`削除に失敗しました: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName || !newItemUnit) return;

    const headers = getHeaders();
    if (!headers) {
      alert("認証の準備ができるまでお待ちください。");
      return;
    }

    if (user && !idToken) {
      alert("認証情報の準備中です。少々お待ちください。");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullHeaders = {
        ...headers,
        "Content-Type": "application/json",
      };
      
      const url = new URL(`${API_BASE_URL}/items`);
      if (selectedUserId) {
        url.searchParams.append("userId", selectedUserId);
      }

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: fullHeaders,
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
        console.error('[Home] handleAddItem: Error', data);
        const detail = data.error ? `\n詳細: ${data.error}` : "";
        if (typeof window !== 'undefined' && window.alert) {
          alert(`エラー (${response.status}): ${data.message}${detail}`);
        }
      }
    } catch (error) {
      console.error("[Home] handleAddItem exception:", error);
      if (typeof window !== 'undefined' && window.alert) {
        alert("エラーが発生しました: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="container py-5">
        {/* デバッグボタン */}
        <button 
          className="btn btn-sm btn-link text-muted position-fixed bottom-0 start-0 m-2" 
          onClick={() => setShowDebug(!showDebug)}
          title="Debug Info"
        >
          <Bug size={16} />
        </button>

        {/* デバッグパネル */}
        {showDebug && (
          <div className="alert alert-info small py-2 px-3 mb-4 shadow-sm border-info">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <h6 className="m-0 fs-6 fw-bold">Debug Panel</h6>
              <button className="btn btn-sm p-0" onClick={() => setShowDebug(false)}><X size={14}/></button>
            </div>
            <div>userId: <code>{userId}</code></div>
            <div>token: <code>{idToken ? 'Present (JWT)' : 'None'}</code></div>
            <div>API URL: <code>{API_BASE_URL}</code></div>
            <div className="mt-2">
              <button className="btn btn-xs btn-primary py-0 px-2 fs-7" onClick={() => fetchItems()}>Manual Refresh</button>
            </div>
          </div>
        )}

        <div className="header-spacer mb-4 text-center">
          <p className="text-muted small">家庭用品在庫管理</p>
        </div>

        <main>
          {families.length > 0 && (
            <div className="mb-4">
              <label className="form-label fw-bold">表示する在庫を選択</label>
              <div className="d-flex gap-2 overflow-auto pb-2">
                <button
                  className={`btn btn-sm ${selectedUserId === userId ? 'btn-primary' : 'btn-outline-primary'} text-nowrap`}
                  onClick={() => setSelectedUserId(userId)}
                >
                  自分の在庫
                </button>
                {families.map(member => (
                  <button
                    key={member.userId}
                    className={`btn btn-sm ${selectedUserId === member.userId ? 'btn-primary' : 'btn-outline-primary'} text-nowrap`}
                    onClick={() => setSelectedUserId(member.userId)}
                  >
                    {member.displayName} の在庫
                  </button>
                ))}
              </div>
            </div>
          )}

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
                              <Link to={`/item/${item.itemId}${selectedUserId !== userId ? `?userId=${selectedUserId}` : ''}`} className="text-decoration-none text-dark hover-primary">
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
                            <Link 
                              to={`/item/${item.itemId}/update${selectedUserId !== userId ? `?userId=${selectedUserId}` : ''}`} 
                              className="btn btn-primary"
                            >
                              在庫を更新する
                            </Link>
                            <Link 
                              to={`/item/${item.itemId}${selectedUserId !== userId ? `?userId=${selectedUserId}` : ''}`} 
                              className="btn btn-outline-secondary btn-sm"
                            >
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
    </>
  );
}

export default Home;
