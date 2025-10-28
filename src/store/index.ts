/**
 * Global state (Zustand)
 * --------------------------------------
 * This file defines the single source of truth for the app:
 * - Domain state: transactions, categories, budgets, goals, settings
 * - UI flags: quickAddOpen
 * - Actions: CRUD for all entities, settings updates, quick-add modal
 *
 * Persistence: via AsyncStorage using zustand/middleware persist.
 * Only a partial subset of state is persisted (see `partialize`).
 *
 * Category rules:
 * - Default categories (custom=false) cannot be edited or removed.
 * - Custom categories (custom=true) can be edited/removed.
 * - When a category is removed/reset, affected transactions are remapped to `cat_other`.
 *
 * Settings:
 * - seenOnboarding gates the initial walkthrough screen.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Budget, Category, Goal, Settings, Transaction } from '../models/types';
import { isSameMonth } from 'date-fns';

export type FinanceState = {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  goals: Goal[];
  settings: Settings;
  // UI ephemeral
  quickAddOpen: boolean;

  // actions
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addCategory: (c: Omit<Category, 'id' | 'custom'>) => void;
  updateCategory: (id: string, c: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  resetCategoriesToDefault: () => void;

  setBudget: (b: Budget) => void;
  removeBudget: (id: string) => void;

  addGoal: (g: Omit<Goal, 'id' | 'savedAmount'>) => void;
  updateGoal: (id: string, g: Partial<Goal>) => void;

  updateSettings: (s: Partial<Settings>) => void;

  openQuickAdd: () => void;
  closeQuickAdd: () => void;
};

const defaultCategories: Category[] = [
  { id: 'cat_food', name: 'Ăn uống', color: '#FF6B6B', icon: 'food', type: 'expense', custom: false },
  { id: 'cat_transport', name: 'Di chuyển', color: '#4D96FF', icon: 'car', type: 'expense', custom: false },
  { id: 'cat_home', name: 'Nhà ở', color: '#6BCB77', icon: 'home', type: 'expense', custom: false },
  { id: 'cat_entertain', name: 'Giải trí', color: '#FFD93D', icon: 'gamepad-variant', type: 'expense', custom: false },
  { id: 'cat_shopping', name: 'Mua sắm', color: '#A66CFF', icon: 'cart', type: 'expense', custom: false },
  { id: 'cat_education', name: 'Giáo dục', color: '#00C1D4', icon: 'school', type: 'expense', custom: false },
  { id: 'cat_health', name: 'Sức khỏe', color: '#FF8FB1', icon: 'heart', type: 'expense', custom: false },
  { id: 'cat_other', name: 'Khác', color: '#9AA0A6', icon: 'dots-horizontal', type: 'expense', custom: false },
  { id: 'cat_salary', name: 'Lương', color: '#34A853', icon: 'cash-multiple', type: 'income', custom: false },
  { id: 'cat_bonus', name: 'Thưởng', color: '#0F9D58', icon: 'gift', type: 'income', custom: false },
];

const defaultSettings: Settings = {
  currency: 'VND',
  theme: 'system',
  pinEnabled: false,
  seenOnboarding: false,
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, _get) => ({
      transactions: [],
      categories: defaultCategories,
      budgets: [],
      goals: [],
      settings: defaultSettings,
      quickAddOpen: false,

      addTransaction: (t: Omit<Transaction, 'id'>) =>
        set((state: FinanceState) => ({
          transactions: [
            { id: `tx_${Date.now()}`, ...t },
            ...state.transactions,
          ],
        })),

      updateTransaction: (id: string, t: Partial<Transaction>) =>
        set((state: FinanceState) => ({
          transactions: state.transactions.map((it: Transaction) => (it.id === id ? { ...it, ...t } : it)),
        })),

      deleteTransaction: (id: string) =>
        set((state: FinanceState) => ({ transactions: state.transactions.filter((it: Transaction) => it.id !== id) })),

      addCategory: (c: Omit<Category, 'id' | 'custom'>) =>
        set((state: FinanceState) => ({ categories: [...state.categories, { id: `cat_${Date.now()}`, custom: true, ...c }] })),
      removeCategory: (id: string) =>
        set((state: FinanceState) => {
          const cat = state.categories.find((x) => x.id === id);
          if (!cat || !cat.custom) return {} as any; // only allow removing custom
          const categories = state.categories.filter((x) => x.id !== id);
          const transactions = state.transactions.map((t) =>
            t.categoryId === id ? { ...t, categoryId: 'cat_other' } : t,
          );
          const budgets = state.budgets.filter((b) => b.categoryId !== id);
          return { categories, transactions, budgets } as Partial<FinanceState>;
        }),

      resetCategoriesToDefault: () =>
        set((state: FinanceState) => {
          const defaultIds = new Set(defaultCategories.map((c) => c.id));
          const categories = [...defaultCategories];
          const transactions = state.transactions.map((t) =>
            defaultIds.has(t.categoryId) ? t : { ...t, categoryId: 'cat_other' },
          );
          const budgets = state.budgets.filter((b) => defaultIds.has(b.categoryId));
          return { categories, transactions, budgets } as Partial<FinanceState>;
        }),

      updateCategory: (id: string, c: Partial<Category>) =>
        set((state: FinanceState) => ({
          categories: state.categories.map((it: Category) => {
            if (it.id !== id) return it;
            // Chỉ cho phép sửa danh mục tuỳ chỉnh
            if (!it.custom) return it;
            const next: Category = { ...it } as Category;
            if (typeof c.name === 'string') next.name = c.name;
            if (typeof c.color === 'string') next.color = c.color;
            if (typeof c.icon === 'string') next.icon = c.icon;
            return next;
          })
        })),

      setBudget: (b: Budget) =>
        set((state: FinanceState) => {
          const idx = state.budgets.findIndex((x: Budget) => x.id === b.id);
          if (idx >= 0) {
            const copy = [...state.budgets];
            copy[idx] = b;
            return { budgets: copy };
          }
          return { budgets: [...state.budgets, b] };
        }),

      removeBudget: (id: string) => set((state: FinanceState) => ({ budgets: state.budgets.filter((b: Budget) => b.id !== id) })),

      addGoal: (g: Omit<Goal, 'id' | 'savedAmount'>) =>
        set((state: FinanceState) => ({ goals: [...state.goals, { id: `goal_${Date.now()}`, savedAmount: 0, ...g }] })),

      updateGoal: (id: string, g: Partial<Goal>) => set((state: FinanceState) => ({ goals: state.goals.map((it: Goal) => (it.id === id ? { ...it, ...g } : it)) })),

      updateSettings: (s: Partial<Settings>) => set((state: FinanceState) => ({ settings: { ...state.settings, ...s } })),

      openQuickAdd: () => set({ quickAddOpen: true }),
      closeQuickAdd: () => set({ quickAddOpen: false }),
    }),
    {
      name: 'moneylover-store',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        categories: state.categories,
        budgets: state.budgets,
        goals: state.goals,
        settings: state.settings,
      }),
    },
  ),
);

// Selectors and helpers
export const selectors = {
  byMonth(transactions: Transaction[], date: Date) {
    return transactions.filter((t: Transaction) => isSameMonth(new Date(t.datetime), date));
  },
  groupExpenseByCategory(transactions: Transaction[]) {
    const map: Record<string, { total: number; category: Category }> = {};
    const cats = useFinanceStore.getState().categories;
    transactions
      .filter((t: Transaction) => t.type === 'expense')
      .forEach((t: Transaction) => {
        const cat = cats.find((c: Category) => c.id === t.categoryId) || ({ id: 'unknown', name: 'Khác', color: '#9AA0A6' } as Category);
        map[t.categoryId] = map[t.categoryId] || { total: 0, category: cat };
        map[t.categoryId].total += t.amount;
      });
    return Object.values(map).sort((a, b) => b.total - a.total);
  },
};
