import { useState, useEffect } from 'react';
import { formatIndonesianNumber, parseIndonesianNumber } from '@/utils/indonesianFormatter';

// Custom hook for number input formatting
export const useIndonesianNumberInput = (initialValue: string | number = '') => {
  const [displayValue, setDisplayValue] = useState(formatIndonesianNumber(initialValue.toString()));
  const [rawValue, setRawValue] = useState(initialValue.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const parsed = parseIndonesianNumber(inputValue);
    const formatted = formatIndonesianNumber(parsed);

    setDisplayValue(formatted);
    setRawValue(parsed);
  };

  const setValue = (value: string | number) => {
    const stringValue = value.toString();
    setRawValue(stringValue);
    setDisplayValue(formatIndonesianNumber(stringValue));
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    displayValue,
    rawValue,
    handleChange,
    setValue,
  };
};