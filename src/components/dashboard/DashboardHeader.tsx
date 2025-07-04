import { Button } from '@/components/ui/button';
import { MonthYearSelector } from '@/components/ui/month-year-selector';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { PieChart, Sparkles } from 'lucide-react';

export function DashboardHeader() {
  const { selectedDate, setSelectedDate } = useDateFilter();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Selamat datang kembali! Ini ringkasan bisnis Anda.</p>
      </div>
      <div className="flex items-center gap-2">
        <MonthYearSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          className="w-64"
        />
        <Button variant="outline" size="sm">
          <PieChart className="h-4 w-4 mr-2" />
          Ekspor PDF
        </Button>
        <Button variant="gradient" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Wawasan AI
        </Button>
      </div>
    </div>
  );
}