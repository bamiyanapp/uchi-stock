// バックエンドAPI（backend/handler.js・serverless.yml）が返すデータの型。
// フロントエンド側で必要な範囲のみを定義する。

export interface Estimate {
  estimatedDepletionDate?: string;
  dailyConsumption?: number;
  predictedStock?: number;
  stockPercentage?: number;
  message?: string;
}

export interface Item {
  itemId: string;
  name: string;
  unit: string;
  currentStock: number;
  updatedAt: string;
  createdAt?: string;
  estimate?: Estimate | null;
}

export interface HistoryEntry {
  historyId: string;
  date: string;
  type: 'purchase' | 'consumption' | 'creation' | 'update';
  quantity: number;
  memo?: string;
}

export interface FamilyMember {
  userId: string;
  displayName: string;
  email?: string;
  photoURL?: string;
}
