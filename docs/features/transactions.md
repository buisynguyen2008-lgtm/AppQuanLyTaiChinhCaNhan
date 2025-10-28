# Giao dịch (Transactions)

- Màn danh sách: `src/screens/TransactionsScreen.tsx`
- Màn thêm/sửa: `src/screens/TransactionFormScreen.tsx`
- Điều hướng stack: `src/navigation/TransactionsStack.tsx`

## Dòng dữ liệu

- Dùng Zustand store trong `src/store/index.ts`
  - `addTransaction(t)` thêm giao dịch mới (id tạo từ timestamp)
  - `updateTransaction(id, patch)` cập nhật từng trường
  - `deleteTransaction(id)` xóa
- `Transaction` model: xem `src/models/types.ts`

## Danh sách và tổng hợp

- Danh sách hiển thị các giao dịch gần đây và tổng tiền theo ngày
- Utils định dạng: `src/utils/format.ts` (VD: `formatCurrency`, `formatCurrencyWithSign`)
- Màu/biểu tượng theo `Category` của giao dịch (`categoryId`)

## Thêm/Sửa giao dịch

- Điều hướng từ `TransactionsScreen` sang `TransactionFormScreen` với params `{ id? }`
- Form lưu bằng các action trong store (thêm mới hoặc cập nhật nếu có id)

## Tối ưu hiệu năng (kế hoạch)

- Tối ưu `FlatList` trong `TransactionsScreen.tsx`:
  - Cấu hình `initialNumToRender`, `windowSize`, `removeClippedSubviews`
  - Thêm `getItemLayout` nếu kích thước item cố định
  - Memo hóa `renderItem` và tách nhỏ item component
- Lazy-load icon theo category nếu cần

