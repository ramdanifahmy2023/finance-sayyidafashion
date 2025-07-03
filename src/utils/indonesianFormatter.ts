// Utility for Indonesian number formatting
export const formatIndonesianNumber = (value: string | number): string => {
  if (!value && value !== 0) return '';
  
  // Remove any non-numeric characters except decimal point
  const cleanValue = value.toString().replace(/[^\d.]/g, '');
  
  // Split into integer and decimal parts
  const parts = cleanValue.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Add thousand separators using Indonesian format (dots)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Return formatted number
  return decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger;
};

// Utility to parse formatted number back to raw number
export const parseIndonesianNumber = (formattedValue: string): string => {
  if (!formattedValue) return '';
  
  // Remove thousand separators and convert decimal comma to dot
  return formattedValue
    .replace(/\./g, '') // Remove thousand separators
    .replace(/,/g, '.') // Convert decimal comma to dot
    .replace(/[^\d.]/g, ''); // Remove any other non-numeric characters
};

// Format currency for display
export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);
};