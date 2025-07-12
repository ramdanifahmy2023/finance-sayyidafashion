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
      // Load comprehensive data for enhanced AI analysis
      const targetDate = selectedDate || new Date();
      const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      
      // Get previous month for comparison
      const prevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, 1);
      const prevMonthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);

      const [
        allSalesData, 
        allExpensesData, 
        allLossesData, 
        allAssetsData,
        currentSalesData,
        currentExpensesData,
        currentLossesData,
        prevSalesData,
        prevExpensesData
      ] = await Promise.all([
        // All historical data
        supabase.from('sales').select('*').eq('user_id', user.id).order('transaction_date', { ascending: false }),
        supabase.from('expenses').select('*').eq('user_id', user.id).order('transaction_date', { ascending: false }),
        supabase.from('losses').select('*').eq('user_id', user.id).order('transaction_date', { ascending: false }),
        supabase.from('assets').select('*').eq('user_id', user.id),
        
        // Current month data
        supabase.from('sales').select('*').eq('user_id', user.id)
          .gte('transaction_date', firstDay.toISOString().split('T')[0])
          .lte('transaction_date', lastDay.toISOString().split('T')[0])
          .order('transaction_date', { ascending: false }),
        supabase.from('expenses').select('*').eq('user_id', user.id)
          .gte('transaction_date', firstDay.toISOString().split('T')[0])
          .lte('transaction_date', lastDay.toISOString().split('T')[0])
          .order('transaction_date', { ascending: false }),
        supabase.from('losses').select('*').eq('user_id', user.id)
          .gte('transaction_date', firstDay.toISOString().split('T')[0])
          .lte('transaction_date', lastDay.toISOString().split('T')[0])
          .order('transaction_date', { ascending: false }),
          
        // Previous month data for comparison
        supabase.from('sales').select('*').eq('user_id', user.id)
          .gte('transaction_date', prevMonth.toISOString().split('T')[0])
          .lte('transaction_date', prevMonthEnd.toISOString().split('T')[0]),
        supabase.from('expenses').select('*').eq('user_id', user.id)
          .gte('transaction_date', prevMonth.toISOString().split('T')[0])
          .lte('transaction_date', prevMonthEnd.toISOString().split('T')[0])
      ]);

      // Enhanced data processing for comprehensive AI analysis
      
      // 1. Process expense data for chart
      const expenseByCategory = currentExpensesData.data?.reduce((acc: any, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {}) || {};
      const expenseData = Object.entries(expenseByCategory).map(([category, amount]) => ({
        name: category,
        value: amount as number
      }));

      // 2. Process product data for chart  
      const productSales = currentSalesData.data?.reduce((acc: any, sale) => {
        acc[sale.product_type] = (acc[sale.product_type] || 0) + 1;
        return acc;
      }, {}) || {};
      const productData = Object.entries(productSales).map(([product, count]) => ({
        name: product,
        value: count as number
      }));

      // 3. Process enhanced monthly data with 12-month history
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleString('id-ID', { month: 'short', year: '2-digit' }),
          monthIndex: date.getMonth(),
          year: date.getFullYear()
        };
      }).reverse();

      const monthlyData = last12Months.map(({ month, monthIndex, year }) => {
        const monthRevenue = allSalesData.data?.filter(sale => {
          const saleDate = new Date(sale.transaction_date);
          return saleDate.getMonth() === monthIndex && saleDate.getFullYear() === year;
        }).reduce((sum, sale) => sum + sale.selling_price, 0) || 0;

        const monthExpenses = allExpensesData.data?.filter(expense => {
          const expenseDate = new Date(expense.transaction_date);
          return expenseDate.getMonth() === monthIndex && expenseDate.getFullYear() === year;
        }).reduce((sum, expense) => sum + expense.amount, 0) || 0;

        return {
          month,
          revenue: monthRevenue,
          expenses: monthExpenses,
          profit: monthRevenue - monthExpenses
        };
      });

      // 4. Enhanced customer analysis
      const customerData = currentSalesData.data?.reduce((acc: any, sale) => {
        if (!acc[sale.customer_name]) {
          acc[sale.customer_name] = {
            name: sale.customer_name,
            totalPurchases: 0,
            totalSpent: 0,
            lastPurchase: sale.transaction_date
          };
        }
        acc[sale.customer_name].totalPurchases += 1;
        acc[sale.customer_name].totalSpent += sale.selling_price;
        if (sale.transaction_date > acc[sale.customer_name].lastPurchase) {
          acc[sale.customer_name].lastPurchase = sale.transaction_date;
        }
        return acc;
      }, {}) || {};

      const allCustomerData = allSalesData.data?.reduce((acc: any, sale) => {
        if (!acc[sale.customer_name]) {
          acc[sale.customer_name] = {
            name: sale.customer_name,
            totalPurchases: 0,
            totalSpent: 0,
            firstPurchase: sale.transaction_date,
            lastPurchase: sale.transaction_date
          };
        }
        acc[sale.customer_name].totalPurchases += 1;
        acc[sale.customer_name].totalSpent += sale.selling_price;
        if (sale.transaction_date < acc[sale.customer_name].firstPurchase) {
          acc[sale.customer_name].firstPurchase = sale.transaction_date;
        }
        if (sale.transaction_date > acc[sale.customer_name].lastPurchase) {
          acc[sale.customer_name].lastPurchase = sale.transaction_date;
        }
        return acc;
      }, {}) || {};

      const customers = Object.values(customerData) as any[];
      const allCustomers = Object.values(allCustomerData) as any[];
      const totalCustomers = Object.keys(customerData).length;
      const repeatCustomers = customers.filter((c: any) => c.totalPurchases > 1).length;
      const avgRevenuePerCustomer = customers.length > 0 ? 
        customers.reduce((sum: number, c: any) => sum + Number(c.totalSpent || 0), 0) / customers.length : 0;
      const topCustomerSpending = customers.length > 0 ? Math.max(...customers.map((c: any) => Number(c.totalSpent || 0))) : 0;
      const retentionRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

      const customerAnalysis = {
        totalCustomers,
        repeatCustomers,
        avgRevenuePerCustomer,
        topCustomerSpending,
        retentionRate,
        topCustomers: customers
          .sort((a: any, b: any) => b.totalSpent - a.totalSpent)
          .slice(0, 5)
      };

      // 5. Period comparison calculations
      const currentRevenue = currentSalesData.data?.reduce((sum, sale) => sum + sale.selling_price, 0) || 0;
      const currentExpenses = currentExpensesData.data?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      const currentProfit = currentRevenue - currentExpenses;
      const currentTransactions = currentSalesData.data?.length || 0;

      const previousRevenue = prevSalesData.data?.reduce((sum, sale) => sum + sale.selling_price, 0) || 0;
      const previousExpenses = prevExpensesData.data?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      const previousProfit = previousRevenue - previousExpenses;
      const previousTransactions = prevSalesData.data?.length || 0;

      const periodComparison = {
        revenueGrowth: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
        expenseGrowth: previousExpenses > 0 ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0,
        profitGrowth: previousProfit > 0 ? ((currentProfit - previousProfit) / previousProfit) * 100 : 0,
        transactionGrowth: previousTransactions > 0 ? ((currentTransactions - previousTransactions) / previousTransactions) * 100 : 0,
        currentRevenue,
        previousRevenue,
        currentExpenses,
        previousExpenses,
        currentProfit,
        previousProfit
      };

      // 6. Enhanced business KPIs
      const totalCapital = currentSalesData.data?.reduce((sum, sale) => sum + sale.purchase_price, 0) || 0;
      const totalMarketplaceFees = currentSalesData.data?.reduce((sum, sale) => sum + (sale.marketplace_fee || 0), 0) || 0;
      const grossMargin = currentRevenue - totalCapital - totalMarketplaceFees;

      const businessKPIs = {
        averageOrderValue: currentTransactions > 0 ? currentRevenue / currentTransactions : 0,
        grossMarginPercent: currentRevenue > 0 ? (grossMargin / currentRevenue) * 100 : 0,
        netProfitMargin: currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0,
        marketplaceFeeRatio: currentRevenue > 0 ? (totalMarketplaceFees / currentRevenue) * 100 : 0,
        revenuePerTransaction: currentTransactions > 0 ? currentRevenue / currentTransactions : 0,
        monthlyGrowthRate: periodComparison.revenueGrowth
      };

      // 7. Enhanced summary with comprehensive metrics
      const summary = {
        totalRevenue: metrics.totalRevenue,
        totalCapital: totalCapital,
        totalExpenses: metrics.totalExpenses,
        totalLosses: metrics.totalLosses,
        grossMargin: grossMargin,
        netProfit: metrics.netProfit,
        totalTransactions: currentTransactions,
        marketplaceFees: totalMarketplaceFees,
        totalAssets: allAssetsData.data?.filter(a => a.type === 'asset').reduce((sum, asset) => sum + asset.current_value, 0) || 0,
        totalLiabilities: allAssetsData.data?.filter(a => a.type === 'liability').reduce((sum, asset) => sum + asset.current_value, 0) || 0,
        netWorth: (allAssetsData.data?.filter(a => a.type === 'asset').reduce((sum, asset) => sum + asset.current_value, 0) || 0) - 
                  (allAssetsData.data?.filter(a => a.type === 'liability').reduce((sum, asset) => sum + asset.current_value, 0) || 0)
      };

      // Send comprehensive data to AI for enhanced analysis
      const { data, error } = await supabase.functions.invoke('financial-ai-insights', {
        body: {
          summary,
          expenseData,
          productData,
          monthlyData,
          detailedSales: currentSalesData.data || [],
          detailedExpenses: currentExpensesData.data || [],
          detailedLosses: currentLossesData.data || [],
          customerAnalysis,
          periodComparison,
          businessKPIs
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