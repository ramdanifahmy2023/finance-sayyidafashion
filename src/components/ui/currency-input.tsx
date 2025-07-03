import React, { useEffect } from 'react';
import { useIndonesianNumberInput } from '@/hooks/useIndonesianNumberInput';
import { formatCurrency } from '@/utils/indonesianFormatter';

interface CurrencyInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "0",
  required = false,
  className = "",
  disabled = false,
  ...props
}) => {
  const { displayValue, rawValue, handleChange, setValue } = useIndonesianNumberInput(value);

  // Update parent component when raw value changes
  useEffect(() => {
    if (onChange && rawValue !== value.toString()) {
      onChange(rawValue);
    }
  }, [rawValue, onChange, value]);

  // Update display when external value changes
  useEffect(() => {
    if (value.toString() !== rawValue) {
      setValue(value);
    }
  }, [value, rawValue, setValue]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm font-medium">
          Rp
        </span>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-smooth disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
      </div>
      {displayValue && (
        <p className="text-xs text-muted-foreground">
          Nilai: {formatCurrency(parseFloat(rawValue) || 0)}
        </p>
      )}
    </div>
  );
};