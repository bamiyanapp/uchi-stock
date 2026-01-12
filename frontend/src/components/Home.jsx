import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, ExternalLink } from "lucide-react";

const API_BASE_URL = "https://b974xlcqia.execute-api.ap-northeast-1.amazonaws.com/dev";

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/items`);
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newItemName || !newItemUnit) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItemName, unit: newItemUnit }),
      });
      if (response.ok) {
        setNewItemName("");
        setNewItemUnit("");
        await fetchItems();
      } else {
        const data = await response.json();
        alert(`追加に失敗しました: ${data.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error adding item:", error);
      alert("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = async (item, newStock) => {
    const diff = newStock - item.currentStock;
    if (diff === 0) return;

    try {
      const type = diff > 0 ? "add" : "consume";
      const quantity = Math.abs(diff);
      const endpoint = type === "add" ? "stock" : "consume";

      const response = await fetch(`${API_BASE_URL}/items/${item.itemId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        // Update local state for immediate feedback
        setItems(items.map(i => 
          i.itemId === item.itemId ? { ...i, currentStock: newStock, updatedAt: new Date().toISOString() } : i
        ));
      }
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  const deleteItem = async (itemId) => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: "DELETE",
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
      <header className="text-center mb-5">
        <h1 className="display-4 fw-bold">家庭用品在庫管理</h1>
        <p className="text-muted">気が向いた時に在庫をチェック</p>
      </header>

      <main>
        <section className="mb-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h2 className="h5 mb-4 d-flex align-items-center">
                <Plus size={20} className="me-2 text-primary" />
                新しい品目を追加
              </h2>
              <form onSubmit={addItem} className="row g-3">
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="品目名（例: トイレットペーパー）"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="単位（例: ロール, パック）"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <button type="submit" className="btn btn-primary w-100">追加</button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section>
          <h2 className="h5 mb-4">在庫一覧</h2>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">読み込み中...</span>
              </div>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {items.map((item) => (
                <div key={item.itemId} className="col">
                  <div className="card h-100 shadow-sm border-0">
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
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="mb-4">
                        <label className="small text-muted mb-1 d-block">現在の在庫数</label>
                        <div className="d-flex align-items-center gap-2">
                          <select 
                            className="form-select form-select-lg w-auto"
                            value={item.currentStock}
                            onChange={(e) => handleStockChange(item, parseInt(e.target.value))}
                          >
                            {[...Array(21).keys()].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                            {item.currentStock > 20 && (
                              <option value={item.currentStock}>{item.currentStock}</option>
                            )}
                          </select>
                          <span className="fs-5 text-muted">{item.unit}</span>
                        </div>
                      </div>

                      <div className="d-grid">
                        <Link to={`/item/${item.itemId}`} className="btn btn-outline-primary btn-sm">
                          詳細・履歴を見る
                        </Link>
                      </div>
                    </div>
                    <div className="card-footer bg-transparent border-0 text-center pb-3">
                      <small className="text-muted">
                        更新日: {new Date(item.updatedAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="col-12 text-center py-5">
                  <p className="text-muted">品目が登録されていません。</p>
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
