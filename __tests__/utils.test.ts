import { toCSV } from '../src/utils/csv';
import { Transaction } from '../src/models/types';

test('toCSV generates header and rows', () => {
  const txs: Transaction[] = [
    { id: '1', amount: 100000, type: 'income', categoryId: 'cat_salary', datetime: '2025-10-01T00:00:00.000Z', note: 'Lương' },
    { id: '2', amount: 50000, type: 'expense', categoryId: 'cat_food', datetime: '2025-10-02T00:00:00.000Z', note: 'Ăn sáng, cà phê' },
  ];
  const csv = toCSV(txs);
  expect(csv.split('\n').length).toBe(3);
  expect(csv).toContain('id,datetime,type,amount,categoryId,wallet,note');
  expect(csv).toContain('1,2025-10-01T00:00:00.000Z,income,100000,cat_salary,,Lương');
  // Note with comma should be quoted
  expect(csv).toContain('2,2025-10-02T00:00:00.000Z,expense,50000,cat_food,,"Ăn sáng, cà phê"');
});
