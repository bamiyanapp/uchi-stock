import { History as HistoryIcon } from "lucide-react";
import type { HistoryEntry } from "../types";

type HistoryRow = HistoryEntry & { stockLevel: number };

interface ItemHistoryTableProps {
  history: HistoryRow[];
  unit: string;
}

// ItemDetail.tsxから分離（issue #633）。componentのcomplexity上限（15）
// 対応で、履歴テーブル部分を独立したコンポーネントへ抽出した
export default function ItemHistoryTable({ history, unit }: ItemHistoryTableProps) {
  return (
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
              {history.length > 0 ? (
                history.map((h) => (
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
                      {h.quantity} {unit}
                    </td>
                    <td className="fw-bold">
                      {h.stockLevel} {unit}
                    </td>
                    <td className="text-muted">{h.memo || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    履歴がありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
