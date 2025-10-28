/**
 * Optimized Zustand selectors for better performance
 * These selectors prevent unnecessary re-renders by only subscribing to specific slices
 */

import { useFinanceStore } from '../store';

/**
 * Get only transactions without subscribing to other state
 */
export const useTransactions = () => 
  useFinanceStore(state => state.transactions);

/**
 * Get only categories without subscribing to other state
 */
export const useCategories = () => 
  useFinanceStore(state => state.categories);

/**
 * Get only budgets without subscribing to other state
 */
export const useBudgets = () => 
  useFinanceStore(state => state.budgets);

/**
 * Get only goals without subscribing to other state
 */
export const useGoals = () => 
  useFinanceStore(state => state.goals);

/**
 * Get only settings without subscribing to other state
 */
export const useSettings = () => 
  useFinanceStore(state => state.settings);

/**
 * Get only UI state (quickAddOpen)
 */
export const useQuickAddState = () => 
  useFinanceStore(state => state.quickAddOpen);

/**
 * Get actions only (won't cause re-renders)
 */
export const useFinanceActions = () => ({
  addTransaction: useFinanceStore.getState().addTransaction,
  updateTransaction: useFinanceStore.getState().updateTransaction,
  deleteTransaction: useFinanceStore.getState().deleteTransaction,
  addCategory: useFinanceStore.getState().addCategory,
  updateCategory: useFinanceStore.getState().updateCategory,
  removeCategory: useFinanceStore.getState().removeCategory,
  setBudget: useFinanceStore.getState().setBudget,
  removeBudget: useFinanceStore.getState().removeBudget,
  addGoal: useFinanceStore.getState().addGoal,
  updateGoal: useFinanceStore.getState().updateGoal,
  updateSettings: useFinanceStore.getState().updateSettings,
  openQuickAdd: useFinanceStore.getState().openQuickAdd,
  closeQuickAdd: useFinanceStore.getState().closeQuickAdd,
});

/**
 * Get specific category by ID
 */
export const useCategory = (categoryId: string) => 
  useFinanceStore(
    state => state.categories.find(c => c.id === categoryId)
  );

/**
 * Get categories by type with memoization
 */
export const useCategoriesByType = (type: 'income' | 'expense') =>
  useFinanceStore(
    state => state.categories.filter(c => 
      c.type === type || c.type === 'both'
    )
  );

/**
 * Get transaction count (cheap selector)
 */
export const useTransactionCount = () =>
  useFinanceStore(state => state.transactions.length);
