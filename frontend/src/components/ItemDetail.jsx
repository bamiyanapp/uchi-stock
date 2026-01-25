import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ArrowLeft, History as HistoryIcon, TrendingDown, Edit } from "lucide-react";
import { useUser } from "../contexts/UserContext";

const API_BASE_URL = "https://b974xlcqia.execute-api.ap-northeast-1.amazonaws.com/dev";

const ItemDetail = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estimate, setEstimate] = useState(null);
  const authContext = useUser() || {};
  const { userId = 'pending', idToken = null, user = null } = authContext;

  const homePath = userId && userId !== 'test-user' && userId !== 'pending' ? `/uchi-stock/${userId}` : "/";

  const getHeaders = useCallback(() => {
    if (userId === 'pending') return null;
    const headers = {
      "x-user-id": userId,
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

    // アイテム情報の取得
    try {
      const itemRes = await fetch(`${API_BASE_URL}/items`, { headers });
      if (itemRes.ok) {
        const itemsData = await itemRes.json();
        if (Array.isArray(itemsData)) {
          const currentItem = itemsData.find((i) => i.itemId === itemId);
          setItem(currentItem);
        }
      } else {
        const data = await itemRes.json().catch(() => ({}));
        console.error("Failed to fetch item:", data.error);
      }
    } catch (error) {
      console.error("Error fetching item:", error);
    }

    // 履歴の取得
    try {
      const historyRes = await fetch(`${API_BASE_URL}/items/${itemId}/history`, { headers });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setHistory(Array.isArray(historyData) ? historyData : []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }

    // 推定データの取得
    try {
      const estimateRes = await fetch(`${API_BASE_URL}/items/${itemId}/estimate`, { headers });
      if (estimateRes.ok) {
        const estimateData = await estimateRes.json();
        setEstimate(estimateData);
      }
    } catch (error) {
      console.error("Error fetching estimate:", error);
    }
  }, [itemId, getHeaders, user, idToken]);

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };

    initialFetch();
  }, [fetchData]);

  // 履歴データに当時の在庫数を付与する
  const historyWithStockLevel = React.useMemo(() => {
    if (!item || !history) return [];

    let current = item.currentStock;
    return history.map((h) => {
      const stockLevelAtThatTime = current;
      const quantity = parseFloat(h.quantity) || 0;
      if (h.type === "consumption") {
        current += quantity;
      } else if (h.type === "purchase") {
        current -= quantity;
      }
      return { ...h, stockLevel: stockLevelAtThatTime };
    });
  }, [item, history]);

  const chartData = React.useMemo(() => {
    if (!item || !historyWithStockLevel) return [];

    const trend = [
      {
        date: "現在",
        stock: estimate?.predictedStock !== undefined ? estimate.predictedStock : item.currentStock,
        displayDate: new Date().toLocaleDateString(),
      },
    ];

    historyWithStockLevel.forEach((h) => {
      trend.push({
        date: new Date(h.date).toLocaleDateString(),
        stock: h.stockLevel,
        displayDate: new Date(h.date).toLocaleDateString(),
      });
    });

    return trend.reverse();
  }, [item, historyWithStockLevel, estimate]);

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
    return (
      <div className="container py-5 text-center">
        <h2>品目が見つかりませんでした。</h2>
        <Link to={homePath} className="btn btn-primary mt-3">
          戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="mb-4">
        <Link to={homePath} className="btn btn-link p-0 text-decoration-none d-inline-flex align-items-center">
          <ArrowLeft size={20} className="me-1" /> 在庫一覧へ戻る
        </Link>
      </div>

      <header className="mb-5">
        <div className="row align-items-center g-3">
          <div className="col-md-6">
            <h1 className="display-5 fw-bold mb-2">{item.name}</h1>
            <div className="d-flex align-items-baseline">
              <span className="display-6 me-2">
                {estimate?.predictedStock !== undefined ? estimate.predictedStock : item.currentStock}
              </span>
              <span className="text-muted fs-4">{item.unit}</span>
            </div>
          </div>
          <div className="col-md-6">
            <div className="d-flex gap-2 justify-content-md-end">
              <Link to={`/item/${itemId}/update`} className="btn btn-primary d-inline-flex align-items-center px-4 py-2">
                <Edit size={20} className="me-2" /> 在庫を更新する
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0 bg-light">
            <div className="card-body">
              <h2 className="h5 card-title mb-4 d-flex align-items-center">
                <TrendingDown size={20} className="me-2 text-primary" />
                在庫推定
              </h2>
              {estimate && estimate.estimatedDepletionDate ? (
                <div>
                  <div className="mb-2">
                    <small className="text-muted d-block">在庫切れ予想日</small>
                    <span className="fs-4 fw-bold text-danger">
                      {new Date(estimate.estimatedDepletionDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <small className="text-muted d-block">1日あたりの平均消費量</small>
                    <span className="fs-5">
                      {estimate.dailyConsumption} {item.unit} / 日
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted">データが不足しているため推定できません。</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h2 className="h5 card-title mb-4">在庫数推移</h2>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayDate" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="stepAfter"
                      dataKey="stock"
                      name="在庫数"
                      stroke="#0d6efd"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h2 className="h5 card-title mb-4 d-flex align-items-center">
                <HistoryIcon size={20} className="me-2 text-primary" />
                履歴詳細
              </h2>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>日付</th>
                      <th>種別</th>
                      <th>数量</th>
                      <th>残量</th>
                      <th>メモ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyWithStockLevel.length > 0 ? (
                      historyWithStockLevel.map((h) => (
                        <tr key={h.historyId}>
                          <td>{new Date(h.date).toLocaleString()}</td>
                          <td>
                            <span
                              className={`badge ${h.type === "consumption" ? "bg-warning text-dark" : "bg-success"}`}
                            >
                              {h.type === "consumption" ? "消費" : "購入"}
                            </span>
                          </td>
                          <td>
                            {h.quantity} {item.unit}
                          </td>
                          <td className="fw-bold">
                            {h.stockLevel} {item.unit}
                          </td>
                          <td className="text-muted">{h.memo || "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          履歴がありません
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
