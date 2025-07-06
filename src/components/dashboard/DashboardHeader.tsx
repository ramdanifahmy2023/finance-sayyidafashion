import { Button } from '@/components/ui/button';
import { MonthYearSelector } from '@/components/ui/month-year-selector';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { useDashboard } from '@/hooks/useDashboard';
import { exportDashboardToPDF } from '@/utils/pdfExport';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Sparkles, FileDown } from 'lucide-react';
export function DashboardHeader() {
  const {
    selectedDate,
    setSelectedDate
  } = useDateFilter();
  const {
    metrics,
    loading
  } = useDashboard();
  const {
    toast
  } = useToast();
  const handleExportPDF = () => {
    if (!metrics) {
      toast({
        title: "Error",
        description: "Data dashboard belum tersedia untuk diekspor",
        variant: "destructive"
      });
      return;
    }
    try {
      exportDashboardToPDF(metrics, selectedDate);
      toast({
        title: "Berhasil",
        description: "Dashboard berhasil diekspor ke PDF"
      });
    } catch (error) {
      console.error('Export PDF error:', error);
      toast({
        title: "Error",
        description: "Gagal mengekspor dashboard ke PDF",
        variant: "destructive"
      });
    }
  };
  return <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground text-left">Catat dengan teliti setiap ada pemasukan &amp; pengeluaran ✨</p>
      </div>
      <div className="flex items-center gap-2">
        <MonthYearSelector selectedDate={selectedDate} onDateChange={setSelectedDate} className="w-64" />
        <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={loading || !metrics}>
          <FileDown className="h-4 w-4 mr-2" />
          Ekspor PDF
        </Button>
        <Button variant="gradient" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Wawasan AI
        </Button>
      </div>
    </div>;
}