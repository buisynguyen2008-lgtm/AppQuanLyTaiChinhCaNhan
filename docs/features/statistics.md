# Thống kê (Statistics)

- Màn hình: `src/screens/StatisticsScreen.tsx`
- Wrapper biểu đồ: `src/components/charts/*`

## Nguồn dữ liệu

- Lấy từ store qua selector và hooks (VD: `useTransactionStats`, `selectors.groupExpenseByCategory`)
- Dữ liệu hiển thị bao gồm: tổng Thu/Chi/Cân đối, biểu đồ tròn (theo danh mục), biểu đồ cột (theo ngày)

## Biểu đồ tròn (Pie/Donut)

- Ưu tiên dùng API composable nếu có (Victory)
- Fallback SVG tự vẽ khi đối tượng biểu đồ không sẵn sàng để tránh crash
- Truyền số liệu đã nhóm theo Category và render legend bên cạnh

## Biểu đồ cột (Bar)

- Thử dùng `CartesianChart + Bar` (Victory composable) nếu khả dụng
- Nếu thiếu: fallback vẽ bằng `react-native-svg`
- Các thông số spacing (barGap, maxBarWidth, groupInnerRatio) có thể tinh chỉnh để đẹp hơn

## Ghi chú UI

- Legend viết bằng View/Text để đảm bảo ổn định trên mọi nền tảng
- Layout đã được card-ized và căn giữa biểu đồ để tránh tràn bố cục

