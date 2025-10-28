/**
 * Utility functions for formatting
 */

/**
 * Format currency to Vietnamese Dong
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('vi-VN')} đ`;
};

/**
 * Format currency with sign (+ or -)
 */
export const formatCurrencyWithSign = (amount: number): string => {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${formatCurrency(amount)}`;
};

/**
 * Format number as Vietnamese Dong without suffix
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('vi-VN');
};

/**
 * Clean and format amount input
 */
export const formatAmountInput = (text: string): string => {
  // Remove non-numeric characters except decimal point
  const cleaned = text.replace(/[^0-9.]/g, '');
  // Only allow one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
};

/**
 * Validate amount
 */
export const validateAmount = (amount: string): { valid: boolean; error?: string } => {
  if (!amount.trim()) {
    return { valid: false, error: 'Vui lòng nhập số tiền' };
  }
  const num = Number(amount);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'Số tiền phải lớn hơn 0' };
  }
  return { valid: true };
};
