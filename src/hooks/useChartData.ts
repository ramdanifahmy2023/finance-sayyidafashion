import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDateFilter } from '@/contexts/DateFilterContext';

interface SalesChartData {
  name: string;
  value: number;
  fill: string;
}

interface DailySalesData {
  date: string;
  sales: number;
  formatted_date: string;
}

interface MonthlyTrendData {
  month: string;
  omset: number;
  pengeluaran: number;
  kerugian: number;
  grossMargin: number;
  labaBersih: number;
}

interface ExpenseChartData {
  category: string;
  amount: number;
  percentage: number;
  fill: string;
}

export function useChartData() {
  const [salesByCategory, setSalesByCategory] = useState<SalesChartData[]>([]);
  const [dailySales, setDailySales] = useState<DailySalesData[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendData[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<ExpenseChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedDate, getMonthRange } = useDateFilter();

  const categoryColors = [ 'hsl(340 82% 52%)', 'hsl(280 89% 48%)', 'hsl(165 45% 65%)', 'hsl(15 85% 68%)', 'hsl(340 45% 70%)', 'hsl(280 35% 68%)' ];
  const expenseColors = [ 'hsl(280 89% 48%)', 'hsl(340 82% 52%)', 'hsl(165 45% 65%)', 'hsl(15 85% 68%)', 'hsl(280 35% 68%)', 'hsl(340 45% 70%)' ];

  const fetchAllChartData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { startDate, endDate } = getMonthRange(selectedDate);

      const [ salesCategoryData, dailySalesData, monthlyTrendResult, expenseBreakdownData ] = await Promise.all([
        supabase.from('sales').select('product_type, selling_price').eq('user_id', user.id).gte('transaction_date', startDate).lte('transaction_date', endDate),
        supabase.from('sales').select('transaction_date, selling_price').eq('user_id', user.id).gte('transaction_date', startDate).lte('transaction_date', endDate),
        supabase.rpc('get_monthly_trend_data', { user_id_param: user.id, end_date_param: endDate }),
        supabase.from('expenses').select('category, amount').eq('user_id', user.id).gte('transaction_date', startDate).lte('transaction_date', endDate),
      ]);

      if (salesCategoryData.error) throw salesCategoryData.error;
      if (dailySalesData.error) throw dailySalesData.error;
      if (monthlyTrendResult.error) throw monthlyTrendResult.error;
      if (expenseBreakdownData.error) throw expenseBreakdownData.error;

      // 1. Process Sales by Category
      const categoryTotals = (salesCategoryData.data || []).reduce((acc: Record<string, number>, sale) => {
        acc[sale.product_type] = (acc[sale.product_type] || 0) + Number(sale.selling_price);
        return acc;
      }, {});
      setSalesByCategory(Object.entries(categoryTotals).map(([name, value], index) => ({ name, value, fill: categoryColors[index % categoryColors.length] })).sort((a, b) => b.value - a.value));

      // 2. Process Daily Sales
      const dailyTotals = (dailySalesData.data || []).reduce((acc: Record<string, number>, sale) => {
        acc[sale.transaction_date] = (acc[sale.transaction_date] || 0) + Number(sale.selling_price);
        return acc;
      }, {});
      const dailySalesChartData: DailySalesData[] = [];
      const currentDate = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        dailySalesChartData.push({ date: dateStr, sales: dailyTotals[dateStr] || 0, formatted_date: currentDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setDailySales(dailySalesChartData);
      
      // 3. Process Monthly Trend
      const monthlyTrendChartData = (monthlyTrendResult.data || []).map(d => {
          const grossMargin = d.revenue - d.capital - d.marketplace_fees;
          const netProfit = grossMargin - d.expenses - d.losses;
          return {
              month: new Date(`${d.month}-02`).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
              omset: d.revenue,
              pengeluaran: d.expenses,
              kerugian: d.losses,
              grossMargin: grossMargin,
              labaBersih: netProfit,
          }
      });
      setMonthlyTrend(monthlyTrendChartData);

      // 4. Process Expense Breakdown
      const expenseCategoryTotals = (expenseBreakdownData.data || []).reduce((acc: Record<string, number>, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
        return acc;
      }, {});
      const totalExpenses = Object.values(expenseCategoryTotals).reduce((sum, amount) => sum + amount, 0);
      setExpenseBreakdown(Object.entries(expenseCategoryTotals).map(([category, amount], index) => ({ category, amount, percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0, fill: expenseColors[index % expenseColors.length] })).sort((a, b) => b.amount - a.amount));

    } catch (error) {
      console.error('Error fetching chart data:', error);
      toast({ title: "Error", description: "Gagal memuat data grafik", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user, selectedDate, getMonthRange, toast]);

  useEffect(() => {
    if (user) fetchAllChartData();
  }, [user, selectedDate, fetchAllChartData]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('chart-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => fetchAllChartData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => fetchAllChartData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'losses' }, () => fetchAllChartData())
      .subscribe();
    return () => { supabase.removeChannel(channel) };
  }, [user, fetchAllChartData]);

  return { salesByCategory, dailySales, monthlyTrend, expenseBreakdown, loading, refetch: fetchAllChartData };
}
