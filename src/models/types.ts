export type TransactionType = 'income' | 'expense';

export type Category = {
  id: string;
  name: string;
  color: string; // hex
  icon?: string; // icon name
  type?: TransactionType | 'both';
  custom?: boolean; // user-created category
};

export type Transaction = {
  id: string;
  amount: number; // >=0
  type: TransactionType;
  categoryId: string;
  datetime: string; // ISO string
  note?: string;
  wallet?: string; // e.g., cash, bank, momo
};

export type Budget = {
  id: string;
  categoryId: string;
  limit: number; // monthly limit in default currency
};

export type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  monthlyTarget?: number; // optional monthly saving target
  savedAmount: number;
  deadline?: string; // ISO
};

export type Settings = {
  currency: string; // 'VND', 'USD'
  theme: 'light' | 'dark' | 'system';
  pinEnabled: boolean;
  pinCode?: string; // stored hashed in future; for now plain for demo
  seenOnboarding?: boolean; // flag to show walkthrough on first launch
};
