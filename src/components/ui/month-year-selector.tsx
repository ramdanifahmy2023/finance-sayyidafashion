import { useState, useMemo } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MonthYearSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

export function MonthYearSelector({ selectedDate, onDateChange, className }: MonthYearSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempYear, setTempYear] = useState(selectedDate.getFullYear());
  const [tempMonth, setTempMonth] = useState(selectedDate.getMonth());

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  }, []);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handleApply = () => {
    const newDate = new Date(tempYear, tempMonth, 1);
    onDateChange(newDate);
    setIsOpen(false);
  };

  const handleQuickSelect = (monthsBack: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsBack);
    onDateChange(date);
    setIsOpen(false);
  };

  const formatDisplayDate = (date: Date) => {
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-card border-border hover:bg-accent"
      >
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-muted-foreground mr-2" />
          <span className="text-sm font-medium text-foreground">
            {formatDisplayDate(selectedDate)}
          </span>
        </div>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-elegant z-50">
            <div className="p-4">
              {/* Quick Navigation */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Navigasi Cepat</label>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleQuickSelect(0)}>
                    Bulan Ini
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleQuickSelect(1)}>
                    Bulan Lalu
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleQuickSelect(3)}>
                    3 Bulan Lalu
                  </Button>
                </div>
              </div>

              {/* Year Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Tahun</label>
                <select
                  value={tempYear}
                  onChange={(e) => setTempYear(parseInt(e.target.value))}
                  className="w-full p-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Month Grid */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">Bulan</label>
                <div className="grid grid-cols-3 gap-2">
                  {monthNames.map((month, index) => (
                    <Button
                      key={index}
                      variant={tempMonth === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTempMonth(index)}
                      className="text-xs"
                    >
                      {month.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  Batal
                </Button>
                <Button size="sm" onClick={handleApply}>
                  Terapkan
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}