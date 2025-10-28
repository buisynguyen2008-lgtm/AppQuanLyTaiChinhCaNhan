import { useEffect, useState } from 'react';

/**
 * useDebounce: Trì hoãn cập nhật giá trị cho đến khi dừng thay đổi trong khoảng delay.
 * Thường dùng để giảm số lần tính toán/gọi API khi người dùng nhập liệu liên tục.
 *
 * @param value Giá trị cần debounce
 * @param delay Thời gian delay (milliseconds)
 * @returns Giá trị đã được debounce
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
