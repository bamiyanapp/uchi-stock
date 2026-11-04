import { Link } from "react-router-dom";
import { Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import type { Item } from "../types";
import { appendUserIdQuery } from "../utils";

interface StockItemCardProps {
  item: Item;
  selectedDate: Date;
  // 自分以外の家族の在庫を表示中の場合のみ、リンクへ付与するuserId
  // （appendUserIdQueryへそのまま渡す。本人の在庫表示中はnull）
  linkUserId: string | null;
  onDelete: (itemId: string) => void;
}

function resolveStatus(item: Item): { statusClass: string; statusText: string } {
  const stockPercentage = item.estimate?.stockPercentage;

  if (stockPercentage !== undefined && stockPercentage !== null) {
    const statusText = `在庫残り ${stockPercentage}%`;
    if (stockPercentage <= 20) return { statusClass: "bg-danger", statusText };
    if (stockPercentage <= 50) return { statusClass: "bg-warning text-dark", statusText };
    return { statusClass: "bg-success", statusText };
  }

  if (item.currentStock === 0) {
    return { statusClass: "bg-danger", statusText: "在庫なし" };
  }

  return { statusClass: "bg-secondary", statusText: "在庫割合不明" };
}

function resolvePastHistoryLabel(item: Item, selectedDate: Date): string | null {
  const predictedStock = item.estimate?.predictedStock;
  const updatedAt = new Date(item.updatedAt);
  const selected = new Date(selectedDate);

  const updatedAtDate = new Date(updatedAt.getFullYear(), updatedAt.getMonth(), updatedAt.getDate());
  const selectedDateOnly = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());

  const isPrediction = predictedStock !== undefined && predictedStock !== item.currentStock;
  const isPastHistory = !isPrediction && updatedAtDate < selectedDateOnly;

  return isPastHistory ? `${updatedAt.toLocaleDateString()} 時点の情報` : null;
}

// StockList.tsxから分離（issue #633）。品目1件分のカード表示を独立した
// コンポーネントへ抽出することで、元のitems.map内のロジック（complexity超過）
// とStockList.tsx自体の行数（max-lines超過）の両方を解消した
export default function StockItemCard({ item, selectedDate, linkUserId, onDelete }: StockItemCardProps) {
  const daysRemaining = item.estimate && item.estimate.estimatedDepletionDate
    ? Math.ceil((new Date(item.estimate.estimatedDepletionDate).getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const { statusClass, statusText } = resolveStatus(item);
  const pastHistoryLabel = resolvePastHistoryLabel(item, selectedDate);

  return (
    <div className="col">
      <div className="card h-100 shadow-sm border-0 overflow-hidden">
        <div className={`py-1 px-3 small fw-bold text-center text-white ${statusClass}`}>
          {statusText}
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h3 className="h5 card-title mb-0">
              <Link to={appendUserIdQuery(`/item/${item.itemId}`, linkUserId)} className="text-decoration-none text-dark hover-primary">
                {item.name} <ExternalLink size={14} className="text-muted" />
              </Link>
            </h3>
            <button
              onClick={() => onDelete(item.itemId)}
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
              {pastHistoryLabel && <small className="text-muted">{pastHistoryLabel}</small>}
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
              to={appendUserIdQuery(`/item/${item.itemId}/update`, linkUserId)}
              className="btn btn-primary"
            >
              在庫を更新する
            </Link>
            <Link
              to={appendUserIdQuery(`/item/${item.itemId}`, linkUserId)}
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
}
