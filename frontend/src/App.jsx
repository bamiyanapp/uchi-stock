import { useState, useEffect } from "react";
import "./App.css";

const API_BASE_URL = "https://akmnirkx3m.execute-api.ap-northeast-1.amazonaws.com/dev";

function App() {
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

  const updateStock = async (itemId, type, quantity) => {
    try {
      const endpoint = type === "add" ? "stock" : "consume";
      const response = await fetch(`${API_BASE_URL}/items/${itemId}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: Number(quantity) }),
      });
      if (response.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error(`Error updating stock (${type}):`, error);
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
      </header>

      <main>
        <section className="mb-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="h4 mb-4">新しい品目を追加</h2>
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
          <h2 className="h4 mb-4">在庫一覧</h2>
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
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h3 className="h5 card-title mb-0">{item.name}</h3>
                        <button 
                          onClick={() => deleteItem(item.itemId)} 
                          className="btn btn-sm btn-outline-danger border-0"
                        >
                          &times;
                        </button>
                      </div>
                      <div className="display-6 mb-3">
                        {item.currentStock} <small className="text-muted fs-6">{item.unit}</small>
                      </div>
                      <div className="d-grid gap-2">
                        <div className="input-group">
                          <button 
                            className="btn btn-outline-success" 
                            onClick={() => updateStock(item.itemId, "add", 1)}
                          >
                            +1 購入
                          </button>
                          <button 
                            className="btn btn-outline-warning" 
                            onClick={() => updateStock(item.itemId, "consume", 1)}
                            disabled={item.currentStock <= 0}
                          >
                            -1 消費
                          </button>
                        </div>
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
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
