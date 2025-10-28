/**
 * Backup/Restore service
 * --------------------------------------
 * - exportToJson: Serialize a minimal payload (versioned) from the store.
 * - copyJsonToClipboard: Convenience helper to place JSON on the clipboard.
 * - importFromJson: Validate payload and safely restore into the store.
 *   - Transactions whose category no longer exists are remapped to `cat_other`.
 *   - If backup contains no categories, default categories are used.
 */
import Clipboard from '@react-native-clipboard/clipboard';
import { useFinanceStore } from '../store';
import type { FinanceState } from '../store';

// Shape to persist/restore
export type BackupPayload = {
  version: number;
  date: string;
  data: Pick<FinanceState, 'transactions' | 'categories' | 'budgets' | 'goals' | 'settings'>;
};

export function exportToJson(): string {
  const state = useFinanceStore.getState();
  const payload: BackupPayload = {
    version: 1,
    date: new Date().toISOString(),
    data: {
      transactions: state.transactions,
      categories: state.categories,
      budgets: state.budgets,
      goals: state.goals,
      settings: state.settings,
    },
  };
  return JSON.stringify(payload);
}

export function copyJsonToClipboard(): void {
  const json = exportToJson();
  Clipboard.setString(json);
}

export function importFromJson(json: string): { ok: true } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(json) as BackupPayload;
    if (!parsed || typeof parsed !== 'object') return { ok: false, error: 'File không hợp lệ' };
    if (typeof parsed.version !== 'number' || !parsed.data) return { ok: false, error: 'Định dạng không đúng' };

    const data = parsed.data;
    if (!Array.isArray(data.transactions) || !Array.isArray(data.categories) ||
        !Array.isArray(data.budgets) || !Array.isArray(data.goals) || !data.settings) {
      return { ok: false, error: 'Thiếu dữ liệu cần thiết' };
    }

    const defaultCats = useFinanceStore.getState().categories.filter((c) => !c.custom);
    const catIds = new Set(data.categories.map((c: any) => c.id));
    if (!catIds.size) {
      // Nếu không có danh mục trong backup, dùng mặc định
      data.categories = defaultCats;
      defaultCats.forEach((c) => catIds.add(c.id));
    }

    // Remap transactions với category không tồn tại
    const safeTransactions = data.transactions.map((t: any) => ({
      ...t,
      categoryId: catIds.has(t.categoryId) ? t.categoryId : 'cat_other',
    }));

    useFinanceStore.setState({
      transactions: safeTransactions,
      categories: data.categories,
      budgets: data.budgets,
      goals: data.goals,
      settings: data.settings,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: 'Không thể đọc file JSON' };
  }
}
