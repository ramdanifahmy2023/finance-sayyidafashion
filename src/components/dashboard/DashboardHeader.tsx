import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MonthYearSelector } from '@/components/ui/month-year-selector';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { useDashboard } from '@/hooks/useDashboard';
import { exportDashboardToPDF } from '@/utils/pdfExport';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PieChart, Sparkles, FileDown } from 'lucide-react';
export function DashboardHeader() {
  const [generatingInsights, setGeneratingInsights] = useState(false);
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
  const { user } = useAuth();
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

  const handleGenerateAIInsights = async () => {
    if (!metrics || !user) {
      toast({
        title: "Error",
        description: "Data dashboard belum tersedia untuk analisis AI",
        variant: "destructive"
      });
      return;
    }

    setGeneratingInsights(true);
    try {
      // Load additional data for comprehensive analysis
      const [salesData, expensesData, lossesData, assetsData] = await Promise.all([
        supabase.from('sales').select('*').eq('user_id', user.id),
        supabase.from('expenses').select('*').eq('user_id', user.id),
        supabase.from('losses').select('*').eq('user_id', user.id),
        supabase.from('assets').select('*').eq('user_id', user.id)
      ]);

      // Process expense data for chart
      const expenseByCategory = expensesData.data?.reduce((acc: any, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {}) || {};
      const expenseData = Object.entries(expenseByCategory).map(([category, amount]) => ({
        name: category,
        value: amount as number
      }));

      // Process product data for chart
      const productSales = salesData.data?.reduce((acc: any, sale) => {
        acc[sale.product_type] = (acc[sale.product_type] || 0) + 1;
        return acc;
      }, {}) || {};
      const productData = Object.entries(productSales).map(([product, count]) => ({
        name: product,
        value: count as number
      }));

      // Process monthly data
      const monthlyRevenue = salesData.data?.reduce((acc: any, sale) => {
        const month = new Date(sale.transaction_date).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + sale.selling_price;
        return acc;
      }, {}) || {};
      const monthlyExpense = expensesData.data?.reduce((acc: any, expense) => {
        const month = new Date(expense.transaction_date).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + expense.amount;
        return acc;
      }, {}) || {};
      const monthlyData = Object.keys({ ...monthlyRevenue, ...monthlyExpense }).map(month => ({
        month,
        revenue: monthlyRevenue[month] || 0,
        expenses: monthlyExpense[month] || 0,
        profit: (monthlyRevenue[month] || 0) - (monthlyExpense[month] || 0)
      }));

      const summary = {
        totalRevenue: metrics.totalRevenue,
        totalExpenses: metrics.totalExpenses,
        totalLosses: metrics.totalLosses,
        totalAssets: assetsData.data?.filter(a => a.type === 'asset').reduce((sum, asset) => sum + asset.current_value, 0) || 0,
        totalLiabilities: assetsData.data?.filter(a => a.type === 'liability').reduce((sum, asset) => sum + asset.current_value, 0) || 0,
        netProfit: metrics.netProfit,
        netWorth: (assetsData.data?.filter(a => a.type === 'asset').reduce((sum, asset) => sum + asset.current_value, 0) || 0) - 
                  (assetsData.data?.filter(a => a.type === 'liability').reduce((sum, asset) => sum + asset.current_value, 0) || 0)
      };

      const { data, error } = await supabase.functions.invoke('financial-ai-insights', {
        body: {
          summary,
          expenseData,
          productData,
          monthlyData
        }
      });

      if (error) throw error;

      // Show AI insights in a new window or redirect to reports
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>AI Financial Insights - Sayyida Fashion</title>
              <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
                h1 { color: #db2777; border-bottom: 2px solid #db2777; padding-bottom: 10px; }
                .insights { background: #f8fafc; padding: 20px; border-radius: 8px; white-space: pre-wrap; }
              </style>
            </head>
            <body>
              <h1>🤖 AI Financial Insights & Recommendations</h1>
              <div class="insights">${data.insights}</div>
            </body>
          </html>
        `);
        newWindow.document.close();
      }

      toast({
        title: "AI Insights Generated",
        description: "Wawasan AI telah dibuka di tab baru"
      });

    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast({
        title: "Error",
        description: "Gagal menghasilkan wawasan AI",
        variant: "destructive"
      });
    } finally {
      setGeneratingInsights(false);
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
        <Button variant="gradient" size="sm" onClick={handleGenerateAIInsights} disabled={loading || !metrics || generatingInsights}>
          <Sparkles className="h-4 w-4 mr-2" />
          {generatingInsights ? 'Membuat...' : 'Wawasan AI'}
        </Button>
      </div>
    </div>;
}