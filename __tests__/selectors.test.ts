jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { selectors } from '../src/store';
import { Transaction } from '../src/models/types';

describe('selectors', () => {
  const base: Transaction[] = [
    { id: '1', amount: 100, type: 'expense', categoryId: 'cat_food', datetime: '2025-10-01T10:00:00.000Z' },
    { id: '2', amount: 200, type: 'income', categoryId: 'cat_salary', datetime: '2025-10-05T10:00:00.000Z' },
    { id: '3', amount: 50, type: 'expense', categoryId: 'cat_food', datetime: '2025-09-29T10:00:00.000Z' },
  ];

  test('byMonth filters same month', () => {
    const res = selectors.byMonth(base, new Date('2025-10-10T00:00:00.000Z'));
    expect(res.map((t) => t.id)).toEqual(['1', '2']);
  });

  test('groupExpenseByCategory aggregates and sorts desc', () => {
    const month = selectors.byMonth(base, new Date('2025-10-10T00:00:00.000Z'));
    const grouped = selectors.groupExpenseByCategory(month);
    expect(grouped[0].category.name).toBeDefined();
    expect(grouped[0].total).toBeGreaterThanOrEqual(grouped[grouped.length - 1]?.total ?? 0);
  });
});
