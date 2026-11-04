import { useState, useEffect, useCallback, type ChangeEvent, type FormEvent } from "react";
import { Clock, Plus, X } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import StockItemCard from "./StockItemCard";
import AddItemForm from "./AddItemForm";
import FamilySwitcher from "./FamilySwitcher";
import type { Item, FamilyMember } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://b974xlcqia.execute-api.ap-northeast-1.amazonaws.com/dev";

interface StockListProps {
  userId?: string;
  isDemo?: boolean;
  showDebug?: boolean;
  onDateChange?: (date: Date) => void;
  selectedDate: Date;
}

function StockList({
  userId: propUserId,
  isDemo = false,
  onDateChange,
  selectedDate
}: StockListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [families, setFamilies] = useState<FamilyMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(propUserId || null);
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { userId, idToken, user } = useUser();

  const getHeaders = useCallback((): Record<string, string> | null => {
    if (isDemo) {
      return { "x-user-id": "test-user" };
    }

    if (userId === 'pending') return null;

    const headers: Record<string, string> = {
      "x-user-id": userId
    };
    if (idToken) {
      headers["Authorization"] = `Bearer ${idToken}`;
    }
    return headers;
  }, [userId, idToken, isDemo]);

  const fetchFamilies = useCallback(async () => {
    try {
      const headers = getHeaders();
      if (!headers) return;
      const response = await fetch(`${API_BASE_URL}/families`, { headers });
      if (response.ok) {
        const data = await response.json();
        setFamilies(data);
      }
    } catch (err) {
      console.error("Failed to fetch families", err);
    }
  }, [getHeaders]);

  useEffect(() => {
    if (propUserId) {
      // propUserIdをそのままstateへ同期しており、react-hooks/set-state-in-effectが
      // 指摘する「propからstateを直接同期する」パターンに本当に該当する。ただし
      // propUserIdは呼び出し元（Home.jsx）でマウント時に一度確定した後は
      // 変化しない運用のため実害は無い。将来的にはpropUserId ?? 内部stateの
      // 導出計算へリファクタする余地があるが、挙動変更を伴うため本対応の
      // スコープ外とする（issue #253参照）
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedUserId(propUserId);
    } else if (userId && userId !== 'pending') {
      setSelectedUserId(userId);
      fetchFamilies();
    }
  }, [propUserId, userId, fetchFamilies]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE');
  };

  const handleDateChangeInternal = (e: ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split('-').map(Number);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const newDate = new Date(year, month - 1, day);
      if (onDateChange) {
        onDateChange(newDate);
      }
    }
  };

  const fetchItems = useCallback(async () => {
    const headers = getHeaders();
    if (!headers) return;

    // ログイン中だがトークンが未取得の場合は待機する
    if (user && !idToken) {
      return;
    }

    setLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/items`);
      if (selectedUserId) {
        url.searchParams.append("userId", selectedUserId);
      }

      const response = await fetch(url.toString(), {
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const itemsList = Array.isArray(data) ? data : [];

      // 各アイテムの在庫切れ予想を取得
      const itemsWithEstimates = await Promise.all(
        itemsList.map(async (item) => {
          try {
            const estUrl = new URL(`${API_BASE_URL}/items/${item.itemId}/estimate`);
            estUrl.searchParams.append("date", selectedDate.toISOString());
            if (selectedUserId) {
              estUrl.searchParams.append("userId", selectedUserId);
            }

            const estResponse = await fetch(estUrl.toString(), {
              headers
            });
            const estData = await estResponse.json();
            return { ...item, estimate: estData };
          } catch (error) {
            console.error(`Error fetching estimate for item ${item.itemId}:`, error);
            return { ...item, estimate: null };
          }
        })
      );

      setItems(itemsWithEstimates);
    } catch (error) {
      console.error("[StockList] fetchItems error:", error);
    } finally {
      setLoading(false);
    }
  }, [getHeaders, selectedDate, user, idToken, selectedUserId]);

  useEffect(() => {
    // fetchItemsは非同期関数で、setItems等の呼び出しはawait後（非同期）に発生する。
    // react-hooks/set-state-in-effectはこのマウント時fetchパターンを静的解析で
    // 誤検出する既知の課題があるため抑制する（issue #253参照）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchItems();
  }, [fetchItems]);

  const deleteItem = async (itemId: string) => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      const headers = getHeaders();
      if (!headers) return;

      const url = new URL(`${API_BASE_URL}/items/${itemId}`);
      if (selectedUserId) {
        url.searchParams.append("userId", selectedUserId);
      }

      const response = await fetch(url.toString(), {
        method: "DELETE",
        headers
      });
      if (response.ok) {
        fetchItems();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`削除に失敗しました: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleAddItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newItemName || !newItemUnit) return;

    const headers = getHeaders();
    if (!headers) {
      alert("認証の準備ができるまでお待ちください。");
      return;
    }

    if (user && !idToken) {
      alert("認証情報の準備中です。少々お待ちください。");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullHeaders = {
        ...headers,
        "Content-Type": "application/json",
      };
      
      const url = new URL(`${API_BASE_URL}/items`);
      if (selectedUserId) {
        url.searchParams.append("userId", selectedUserId);
      }

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: fullHeaders,
        body: JSON.stringify({
          name: newItemName,
          unit: newItemUnit,
        }),
      });

      if (response.ok) {
        setNewItemName("");
        setNewItemUnit("");
        setIsAdding(false);
        fetchItems();
      } else {
        const data = await response.json();
        console.error('[StockList] handleAddItem: Error', data);
        const detail = data.error ? `\n詳細: ${data.error}` : "";
        alert(`エラー (${response.status}): ${data.message}${detail}`);
      }
    } catch (error) {
      console.error("[StockList] handleAddItem exception:", error);
      alert("エラーが発生しました: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">

      <div className="header-spacer mb-4 text-center">
        <p className="text-muted small">家庭用品在庫管理</p>
      </div>

      <main>
        <FamilySwitcher
          families={families}
          selectedUserId={selectedUserId}
          ownUserId={userId}
          onSelect={setSelectedUserId}
        />

        <div className="row mb-4 g-3">
          <div className="col-md-6">
            <label htmlFor="date-picker" className="form-label fw-bold">基準日付</label>
            <input
              id="date-picker"
              type="date"
              className="form-control"
              value={formatDate(selectedDate)}
              onChange={handleDateChangeInternal}
            />
          </div>
          <div className="col-md-6 d-flex align-items-end">
            {!isAdding ? (
              <button 
                onClick={() => setIsAdding(true)}
                className="btn btn-success d-flex align-items-center gap-2"
              >
                <Plus size={20} />
                新しい品目を追加
              </button>
            ) : (
              <button 
                onClick={() => setIsAdding(false)}
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
              >
                <X size={20} />
                キャンセル
              </button>
            )}
          </div>
        </div>

        {isAdding && (
          <AddItemForm
            newItemName={newItemName}
            setNewItemName={setNewItemName}
            newItemUnit={newItemUnit}
            setNewItemUnit={setNewItemUnit}
            isSubmitting={isSubmitting}
            onSubmit={handleAddItem}
          />
        )}

        <section className="mb-5">
          <h2 className="h5 mb-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Clock size={20} className="me-2 text-primary" />
              残量予測とステータス
            </div>
          </h2>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">読み込み中...</span>
              </div>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {items.map((item) => (
                <StockItemCard
                  key={item.itemId}
                  item={item}
                  selectedDate={selectedDate}
                  linkUserId={selectedUserId !== userId ? selectedUserId : null}
                  onDelete={deleteItem}
                />
              ))}
              {items.length === 0 && (
                <div className="col-12 text-center py-5">
                  <p className="text-muted">品目が登録されていません。管理者に依頼して追加してください。</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default StockList;