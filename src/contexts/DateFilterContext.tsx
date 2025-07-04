import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateFilterContextType {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  getMonthRange: (date: Date) => DateRange;
  getPreviousMonthRange: (date: Date) => DateRange;
  isCurrentMonth: () => boolean;
  formatDisplayMonth: (date: Date) => string;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

interface DateFilterProviderProps {
  children: ReactNode;
}

export const DateFilterProvider = ({ children }: DateFilterProviderProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getMonthRange = useCallback((date: Date): DateRange => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }, []);

  const getPreviousMonthRange = useCallback((date: Date): DateRange => {
    const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    return getMonthRange(prevMonth);
  }, [getMonthRange]);

  const isCurrentMonth = useCallback(() => {
    const now = new Date();
    return selectedDate.getFullYear() === now.getFullYear() && 
           selectedDate.getMonth() === now.getMonth();
  }, [selectedDate.getFullYear(), selectedDate.getMonth()]);

  const formatDisplayMonth = useCallback((date: Date) => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }, []);

  const value = useMemo(() => ({
    selectedDate,
    setSelectedDate,
    getMonthRange,
    getPreviousMonthRange,
    isCurrentMonth,
    formatDisplayMonth
  }), [selectedDate, setSelectedDate, getMonthRange, getPreviousMonthRange, isCurrentMonth, formatDisplayMonth]);

  return (
    <DateFilterContext.Provider value={value}>
      {children}
    </DateFilterContext.Provider>
  );
};

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error('useDateFilter must be used within DateFilterProvider');
  }
  return context;
};