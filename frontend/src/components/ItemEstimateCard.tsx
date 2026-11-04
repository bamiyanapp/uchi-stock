import { TrendingDown } from "lucide-react";
import type { Estimate } from "../types";

interface ItemEstimateCardProps {
  estimate: Estimate | null;
  unit: string;
}

// ItemDetail.tsxから分離（issue #633）。componentのcomplexity上限（15）
// 対応で、推定カード部分を独立したコンポーネントへ抽出した
export default function ItemEstimateCard({ estimate, unit }: ItemEstimateCardProps) {
  return (
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
                {estimate.dailyConsumption} {unit} / 日
              </span>
            </div>
          </div>
        ) : (
          <p className="text-muted">データが不足しているため推定できません。</p>
        )}
      </div>
    </div>
  );
}
