# MoneyLover

Ứng dụng quản lý thu chi cá nhân: ghi giao dịch nhanh, thống kê trực quan, ngân sách, mục tiêu, và sao lưu/khôi phục an toàn.

---

## Nội dung

- Giới thiệu nhanh
- Tính năng chính
- Công nghệ sử dụng
- Yêu cầu môi trường
- Cài đặt & chạy trên Android/iOS
- Cấu trúc thư mục
- Tài liệu chi tiết theo phần (docs)
- Troubleshooting nhanh

## Giới thiệu nhanh

MoneyLover giúp bạn:

- Ghi lại Thu/Chi hằng ngày thật nhanh (Quick Add)
- Theo dõi thống kê trực quan (biểu đồ tròn/cột) với cơ chế fallback để tránh crash
- Quản lý ngân sách theo danh mục và đặt mục tiêu tiết kiệm
- Sao lưu/khôi phục dữ liệu JSON an toàn (tự động remap danh mục thiếu)
- Cài đặt PIN (luồng bật "trì hoãn" để tránh modal khoá sớm)
- Hướng dẫn khởi động (Onboarding) xuất hiện lần đầu

## Tính năng chính

- Dashboard tổng quan hôm nay/tháng
- Transactions: danh sách, thêm/sửa nhanh, badge số giao dịch hôm nay trên Tab
- Statistics: Pie/Donut + Bar chart, legend ổn định, UI card-ized
- Budget & Goals: thiết lập và theo dõi
- Settings:
  - Theme, Currency
  - Bảo mật PIN (bật sau khi lưu hợp lệ), Xoá PIN khi tắt
  - Danh mục mặc định (khóa sửa/xóa) + Danh mục tùy chỉnh (sửa/xóa) + Khôi phục mặc định
  - Quản lý dữ liệu: CSV export (demo), JSON backup/restore
- Onboarding: 3 slide, Skip/Bắt đầu, gate bằng `seenOnboarding`

## Công nghệ sử dụng

- React Native 0.82, React 19, TypeScript
- Navigation v7 (Bottom Tabs + Native Stack)
- Zustand (persist với AsyncStorage)
- react-native-svg, victory-native (composable) + fallback SVG cho chart
- react-native-vector-icons, react-native-safe-area-context, react-native-reanimated/gesture-handler

## Yêu cầu môi trường

- Node >= 20, Yarn 1.x
- Android: Android Studio + SDK/NDK phù hợp, JDK 17 (hoặc theo RN 0.82 khuyến nghị)
- iOS (tùy chọn, trên macOS): Xcode + CocoaPods
- Đảm bảo đã làm theo hướng dẫn RN: <https://reactnative.dev/docs/set-up-your-environment>

## Cài đặt & chạy

> Windows PowerShell/cmd đều được. Android thường chỉ cần một lệnh là chạy.

1. Cài dependencies

```sh
# trong thư mục dự án
yarn install
```

1. Android

```sh
# bật emulator hoặc cắm thiết bị Android, bật USB debugging
# chạy app (Metro sẽ tự khởi động nếu chưa chạy)
yarn android
```

1. iOS (tùy chọn, chỉ trên macOS)

```sh
# cài CocoaPods deps
cd ios
bundle install  # lần đầu
bundle exec pod install
cd ..

# chạy iOS simulator
yarn ios
```

Mẹo:
- Bạn cũng có thể chủ động mở Metro riêng: `yarn start`
- Android Studio/Xcode có thể build trực tiếp nếu bạn muốn debug native

## Cấu trúc thư mục (rút gọn)

```
src/
	components/        # UI dùng lại (buttons, cards, icons, charts wrappers)
	hooks/             # hooks chung (animations, selectors, debounce, stats)
	models/            # Typescript models/types
	navigation/        # Tab/Stack navigator, gate Onboarding
	screens/           # Màn hình; nhóm theo feature khi phức tạp
		settings/        # SettingsScreen + sections (Security, Categories, Data)
		onboarding/      # WalkthroughScreen
	services/          # backup.ts (export/import JSON)
	store/             # Zustand store + selectors
	styles/            # Theme tokens (colors, typography, shadows)
	utils/             # Helpers (format tiền, CSV, ...)
```

- Kiến trúc chi tiết: xem `docs/ARCHITECTURE.md`
- Tài liệu theo phần: xem `docs/FEATURES.md`

## Troubleshooting nhanh

Nếu `yarn android` lỗi (Exit Code 1):

1) Clean build Android
```sh
# Windows
cd android
gradlew.bat clean
cd ..
```

2) Xoá build cũ và cache Metro (tùy chọn)
```sh
rimraf android/app/build node_modules
yarn install
yarn start --reset-cache
```

3) Kiểm tra SDK/NDK và license
- Mở Android Studio > SDK Manager > cài Android SDK Platform phù hợp
- Tools > SDK Manager > SDK Tools > cài NDK (nếu Gradle yêu cầu)
- Đảm bảo JAVA_HOME/JDK đúng phiên bản

4) iOS pod lỗi (trên macOS)
```sh
cd ios
bundle exec pod repo update
bundle exec pod install
cd ..
```

Nếu vẫn lỗi, vui lòng gửi log lỗi đầu ra của `yarn android` để mình hỗ trợ chi tiết hơn.

## Scripts hữu ích

Xem `package.json`:
- `yarn start`: khởi động Metro bundler
- `yarn android`: build+run Android
- `yarn ios`: build+run iOS (macOS)
- `yarn lint`: ESLint
- `yarn test`: Jest

## Bản quyền & giấy phép

Dự án mục đích học tập/nội bộ. Tài nguyên icon/illustration thuộc về chủ sở hữu tương ứng.
