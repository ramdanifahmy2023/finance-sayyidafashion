import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IDRInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string | number;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

export function IDRInput({ 
  value, 
  onChange, 
  placeholder = "0", 
  className, 
  label,
  error,
  required,
  ...props 
}: IDRInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [rawValue, setRawValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Format number with Indonesian standard (dots as thousand separators)
  const formatIDR = (num: string | number) => {
    if (!num || num === '') return '';
    
    // Remove all non-numeric characters
    const cleanedNum = num.toString().replace(/\D/g, '');
    if (!cleanedNum) return '';
    
    // Convert to number and format with dots
    const formatted = parseInt(cleanedNum).toLocaleString('id-ID');
    return formatted;
  };

  // Remove formatting to get raw numeric value
  const unformatIDR = (formatted: string) => {
    if (!formatted) return '';
    return formatted.replace(/\./g, '');
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow only numbers and handle backspace/delete
    if (inputValue === '' || /^\d+$/.test(inputValue.replace(/\./g, ''))) {
      const raw = unformatIDR(inputValue);
      const formatted = formatIDR(raw);
      
      setDisplayValue(formatted);
      setRawValue(raw);
      
      // Send raw numeric value to parent component
      onChange(raw);
    }
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const numericValue = pastedText.replace(/\D/g, '');
    
    if (numericValue) {
      const formatted = formatIDR(numericValue);
      setDisplayValue(formatted);
      setRawValue(numericValue);
      onChange(numericValue);
    }
  };

  // Handle blur to ensure proper formatting
  const handleBlur = () => {
    if (rawValue) {
      const formatted = formatIDR(rawValue);
      setDisplayValue(formatted);
    }
    setIsFocused(false);
  };

  // Update display when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      const valueStr = value.toString();
      setRawValue(valueStr);
      setDisplayValue(formatIDR(valueStr));
    }
  }, [value]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={displayValue}
          onChange={handleInputChange}
          onPaste={handlePaste}
          onBlur={handleBlur}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-12 pr-12 py-3 border rounded-lg text-right transition-all duration-200 bg-background text-foreground",
            isFocused ? "ring-2 ring-primary border-primary" : "border-border",
            error ? "ring-2 ring-destructive border-destructive" : "",
            "hover:border-muted-foreground focus:outline-none",
            className
          )}
          {...props}
        />
        
        {/* Rp prefix */}
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm font-medium">
          Rp
        </span>
        
        {/* Success indicator when valid amount entered */}
        {rawValue && !error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}