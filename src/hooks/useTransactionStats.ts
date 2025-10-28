import { useMemo } from 'react';
import { Transaction } from '../models/types';
import { selectors } from '../store';

/**
 * Hook to calculate transaction statistics with memoization
 */
export const useTransactionStats = (transactions: Transaction[], date: Date) => {
  return useMemo(() => {
    const monthTx = selectors.byMonth(transactions, date);
    const income = monthTx
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expense = monthTx
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;
    
    const byCat = selectors.groupExpenseByCategory(monthTx);
    const topCategory = byCat[0];
    const topCategoryLabel = topCategory
      ? `${topCategory.category.name} (${Math.round((topCategory.total / Math.max(expense, 1)) * 100)}%)`
      : undefined;

    return {
      monthTx,
      income,
      expense,
      balance,
      byCat,
      topCategoryLabel,
    };
  }, [transactions, date]);
};

/**
 * Hook to get recent transactions with memoization
 */
export const useRecentTransactions = (transactions: Transaction[], limit: number = 5) => {
  return useMemo(() => transactions.slice(0, limit), [transactions, limit]);
};

/**
 * Hook to count today's transactions for badge
 */
export const useTodayTransactionsCount = (transactions: Transaction[]) => {
  return useMemo(() => {
    const today = new Date();
    return transactions.filter(t => {
      const transactionDate = new Date(t.datetime);
      return transactionDate.toDateString() === today.toDateString();
    }).length;
  }, [transactions]);
};
