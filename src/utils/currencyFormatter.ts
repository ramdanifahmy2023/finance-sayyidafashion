// Utility functions for Indonesian currency formatting

export const formatCurrency = (amount: number | string | null | undefined): string => {
  if (!amount || amount === 0) return 'Rp 0';
  
  const numericAmount = typeof amount === 'string' ? parseInt(amount) : amount;
  if (isNaN(numericAmount)) return 'Rp 0';
  
  const formatted = numericAmount.toLocaleString('id-ID');
  return `Rp ${formatted}`;
};

export const validateAmount = (amount: string, fieldName: string): string | null => {
  const numericAmount = parseInt(amount);
  
  if (isNaN(numericAmount) || numericAmount < 0) {
    return `${fieldName} harus berupa angka positif`;
  }
  
  // Reasonable business limits
  if (numericAmount > 100000000) { // 100 million
    return `${fieldName} terlalu besar. Maksimal Rp 100.000.000`;
  }
  
  if (numericAmount < 100 && fieldName.toLowerCase().includes('harga')) {
    return `${fieldName} terlalu kecil. Minimal Rp 100`;
  }
  
  return null;
};

export const parseAmount = (formattedAmount: string): number => {
  // Remove 'Rp', spaces, and dots, then convert to number
  const cleaned = formattedAmount.replace(/[Rp\s.]/g, '');
  return parseInt(cleaned) || 0;
};