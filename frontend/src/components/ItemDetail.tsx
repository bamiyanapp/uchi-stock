import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ArrowLeft, Edit } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import Header from "./Header";
import NotFound from "./NotFound";
import ItemEstimateCard from "./ItemEstimateCard";
import ItemHistoryTable from "./ItemHistoryTable";
import type { Item, HistoryEntry, Estimate } from "../types";
import { appendUserIdQuery } from "../utils";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://b974xlcqia.execute-api.ap-northeast-1.amazonaws.com/dev";

const ItemDetail = () => {
  const { itemId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetUserId = queryParams.get("userId");

  const [item, setItem] = useState<Item | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const authContext = useUser() || {};
  const { userId = 'pending', idToken = null, user = null } = authContext;

  const homePath = userId && userId !== 'test-user' && userId !== 'pending' ? `/${userId}` : "/";

  const getHeaders = useCallback((): Record<string, string> | null => {
    if (userId === 'pending') return null;
    const headers: Record<string, string> = {
      "x-user-id": userId,
    };
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }
    return headers;
  }, [userId, idToken]);

  // アイテム・履歴・推定の3種のデータ取得は「パスへGETし、失敗時はログを
  // 出してnullを返す」という同一の形のため共通化する（issue #633、
  // sonarjs/cognitive-complexityの上限対応で元のfetchDataから抽出）
  const fetchFromApi = useCallback(async (path: string, headers: Record<string, string>, errorLabel: string) => {
    try {
      const url = new URL(`${API_BASE_URL}${path}`);
      if (targetUserId) {
        url.searchParams.append("userId", targetUserId);
      }
      const res = await fetch(url.toString(), { headers });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error(`Failed to fetch ${errorLabel}:`, data.error);
        return null;
      }
      return await res.json();
    } catch (error) {
      console.error(`Error fetching ${errorLabel}:`, error);
      return null;
    }
  }, [targetUserId]);

  const fetchData = useCallback(async () => {
    if (user && !idToken) return;

    const headers = getHeaders();
    if (!headers) return;

    const itemsData = await fetchFromApi("/items", headers, "item");
    if (Array.isArray(itemsData)) {
      setItem(itemsData.find((i) => i.itemId === itemId));
    }

    const historyData = await fetchFromApi(`/items/${itemId}/history`, headers, "history");
    setHistory(Array.isArray(historyData) ? historyData : []);

    const estimateData = await fetchFromApi(`/items/${itemId}/estimate`, headers, "estimate");
    if (estimateData) setEstimate(estimateData);
  }, [itemId, getHeaders, user, idToken, fetchFromApi]);

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
      const quantity = Number(h.quantity) || 0;
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
    return <NotFound message="指定された品目が見つかりませんでした。既に削除された可能性があります。" />;
  }

  return (
    <>
      <Header />
      <div className="container py-5">
        <div className="header-spacer mb-4"></div>
        <div className="mb-4">
          <Link to={homePath} className="btn btn-link p-0 text-decoration-none d-inline-flex align-items-center">
            <ArrowLeft size={20} className="me-1" /> 在庫一覧へ戻る
          </Link>
        </div>

        <header className="mb-5">
          <div className="row align-items-center g-3">
            <div className="col-md-6">
              <h1 data-testid="item-name" className="display-5 fw-bold mb-2">{item.name}</h1>
              <div className="d-flex align-items-baseline">
                <span className="display-6 me-2">
                  {estimate?.predictedStock !== undefined ? estimate.predictedStock : item.currentStock}
                </span>
                <span className="text-muted fs-4">{item.unit}</span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2 justify-content-md-end">
                <Link 
                  to={appendUserIdQuery(`/item/${itemId}/update`, targetUserId)}
                  className="btn btn-primary d-inline-flex align-items-center px-4 py-2"
                >
                  <Edit size={20} className="me-2" /> 在庫を更新する
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="row g-4">
          <div className="col-md-4">
            <ItemEstimateCard estimate={estimate} unit={item.unit} />
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
            <ItemHistoryTable history={historyWithStockLevel} unit={item.unit} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemDetail;
