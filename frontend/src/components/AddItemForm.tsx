import type { FormEvent } from "react";

interface AddItemFormProps {
  newItemName: string;
  setNewItemName: (value: string) => void;
  newItemUnit: string;
  setNewItemUnit: (value: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

// StockList.tsxから分離（issue #633、max-lines上限対応）。「新しい品目の登録」
// フォーム部分を独立したコンポーネントへ抽出した
export default function AddItemForm({
  newItemName,
  setNewItemName,
  newItemUnit,
  setNewItemUnit,
  isSubmitting,
  onSubmit,
}: AddItemFormProps) {
  return (
    <div className="card mb-5 border-success shadow-sm">
      <div className="card-body">
        <h2 className="h5 card-title mb-4">新しい品目の登録</h2>
        <form onSubmit={onSubmit} className="row g-3">
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
  );
}
