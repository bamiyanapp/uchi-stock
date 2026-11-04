import type { FamilyMember } from "../types";

interface FamilySwitcherProps {
  families: FamilyMember[];
  selectedUserId: string | null;
  ownUserId: string;
  onSelect: (userId: string) => void;
}

// StockList.tsxから分離（issue #633、max-lines上限対応）。表示する在庫
// （自分 / 家族）を切り替えるボタン群を独立したコンポーネントへ抽出した
export default function FamilySwitcher({ families, selectedUserId, ownUserId, onSelect }: FamilySwitcherProps) {
  if (families.length === 0) return null;

  return (
    <div className="mb-4">
      <label className="form-label fw-bold">表示する在庫を選択</label>
      <div className="d-flex gap-2 overflow-auto pb-2">
        <button
          className={`btn btn-sm ${selectedUserId === ownUserId ? 'btn-primary' : 'btn-outline-primary'} text-nowrap`}
          onClick={() => onSelect(ownUserId)}
        >
          自分の在庫
        </button>
        {families.map(member => (
          <button
            key={member.userId}
            className={`btn btn-sm ${selectedUserId === member.userId ? 'btn-primary' : 'btn-outline-primary'} text-nowrap`}
            onClick={() => onSelect(member.userId)}
          >
            {member.displayName} の在庫
          </button>
        ))}
      </div>
    </div>
  );
}
