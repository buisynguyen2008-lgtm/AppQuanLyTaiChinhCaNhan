# Hướng dẫn khởi động (Onboarding)

- Màn hình: `src/screens/onboarding/WalkthroughScreen.tsx`
- Điều hướng: `src/navigation/RootNavigator.tsx`

## Gate hiển thị

- Sử dụng cờ `settings.seenOnboarding` từ Zustand store
- `RootNavigator` đặt `initialRouteName` thành `Onboarding` nếu `seenOnboarding=false`, ngược lại là `Tabs`

## Luồng người dùng

- Slide 1–3 lướt ngang; có chấm trang (dots)
- Nút `Bỏ qua`: đặt `seenOnboarding=true` và `navigation.replace('Tabs')`
- Nút `Tiếp/Bắt đầu`: chuyển slide; ở slide cuối cùng sẽ đặt `seenOnboarding=true` rồi vào `Tabs`

## Mở rộng

- Có thể thêm ảnh/illustration riêng trong `src/assets/images`
- Có thể thêm mục "Xem lại hướng dẫn" ở Cài đặt để reset `seenOnboarding`
