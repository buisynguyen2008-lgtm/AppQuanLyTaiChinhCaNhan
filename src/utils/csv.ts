import { Transaction } from '../models/types';

export function toCSV(items: Transaction[]) {
  const header = ['id', 'datetime', 'type', 'amount', 'categoryId', 'wallet', 'note'];
  const lines = [header.join(',')];
  items.forEach((t) => {
    const row = [
      t.id,
      t.datetime,
      t.type,
      String(t.amount),
      t.categoryId,
      t.wallet ?? '',
      safeCSV(t.note ?? ''),
    ];
    lines.push(row.join(','));
  });
  return lines.join('\n');
}

function safeCSV(s: string) {
  if (s.includes(',') || s.includes('\n') || s.includes('"')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}
