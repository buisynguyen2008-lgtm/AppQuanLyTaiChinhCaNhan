# Sao lưu/Khôi phục (Backup & Restore)

- UI: `src/screens/settings/DataManagementSection.tsx`
- Dịch vụ: `src/services/backup.ts`

## Định dạng JSON

```json
{
  "version": 1,
  "date": "2025-10-24T10:00:00.000Z",
  "data": {
    "transactions": [...],
    "categories": [...],
    "budgets": [...],
    "goals": [...],
    "settings": { ... }
  }
}
```

## Chức năng

- `exportToJson()`: trả về chuỗi JSON của payload
- `copyJsonToClipboard()`: sao chép JSON ra clipboard
- `importFromJson(json)`: validate & khôi phục an toàn
  - Nếu backup không có danh mục → dùng danh mục mặc định
  - Giao dịch có category không tồn tại → remap sang `cat_other`

## Luồng UI

- Nút "Sao lưu JSON (Sao chép)": gọi `copyJsonToClipboard()` và hiện thông báo
- Nút "Khôi phục từ JSON": mở modal dán nội dung và gọi `importFromJson` → hiện thông báo kết quả

## Lưu ý

- Payload có `version` để phục vụ nâng cấp schema tương lai
- Chỉ restore phần dữ liệu có trong payload (không ghi đè giá trị khác nếu không cung cấp)
