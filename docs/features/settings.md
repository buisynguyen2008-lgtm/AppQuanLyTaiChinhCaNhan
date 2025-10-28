# Cài đặt (Settings)

Điểm vào màn hình: `src/screens/settings/SettingsScreen.tsx`

Màn Cài đặt được chia thành các section độc lập để dễ bảo trì:

- App Settings (`AppSettingsSection.tsx`)
- Bảo mật/PIN (`SecuritySection.tsx`)
- Quản lý dữ liệu (CSV/JSON) (`DataManagementSection.tsx`)
- Quản lý danh mục (`CategoryManagementSection.tsx`)

## App Settings

- Chủ đề (light/dark/system) và đơn vị tiền tệ
- Lưu trong `settings` của store qua `updateSettings`

## Bảo mật (PIN)

File: `src/screens/settings/SecuritySection.tsx`

- Luồng bật PIN được "trì hoãn":
  - Bật công tắc chỉ hiển thị ô nhập, CHƯA đặt `pinEnabled=true`.
  - Bấm Lưu (đúng 4–6 chữ số và khớp xác nhận) mới gọi `updateSettings({ pinCode, pinEnabled: true })`.
  - Tắt công tắc sẽ xóa cả `pinEnabled` và `pinCode` để tránh so khớp sai.
- Mục tiêu: tránh hiện modal khóa toàn cục trước khi người dùng lưu PIN.

Store liên quan: `updateSettings` trong `src/store/index.ts`.

## Quản lý dữ liệu (CSV/JSON)

File: `src/screens/settings/DataManagementSection.tsx`

- CSV export: hiển thị alert và sao chép vào clipboard (simple demo)
- JSON backup/restore:
  - `Sao lưu JSON (Sao chép)`: gọi `copyJsonToClipboard()`
  - `Khôi phục từ JSON`: mở modal dán JSON và gọi `importFromJson(json)`

Dịch vụ: `src/services/backup.ts`

- `exportToJson()`: sinh payload `{ version, date, data }`
- `copyJsonToClipboard()`: tiện ích sao chép vào clipboard
- `importFromJson(json)`: kiểm tra & khôi phục an toàn
  - Nếu thiếu danh mục: dùng mặc định
  - Giao dịch có category không tồn tại → remap `cat_other`

## Quản lý danh mục

File: `src/screens/settings/CategoryManagementSection.tsx`

Quy tắc danh mục (thực thi trong store):

- Danh mục mặc định (`custom=false`) không được sửa/xóa
- Danh mục tùy chỉnh (`custom=true`) có thể sửa/xóa
- "Khôi phục danh mục mặc định": gọi `resetCategoriesToDefault()`
  - Remap giao dịch về `cat_other` khi cần

Store liên quan: `addCategory`, `updateCategory` (chỉ cho `custom=true`), `removeCategory` (chỉ `custom=true`), `resetCategoriesToDefault`.

## Gợi ý mở rộng

- Thêm "Xem lại hướng dẫn" để đặt `seenOnboarding=false`
- Bổ sung xác thực sinh trắc học (FaceID/TouchID) sau này
