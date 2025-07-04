import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

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
  revenue: number;
  expenses: number;
  profit: number;
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

  // Chart color palettes using design system
  const categoryColors = [
    'hsl(340 82% 52%)',  // primary (pink)
    'hsl(280 89% 48%)',  // secondary (purple)
    'hsl(165 45% 65%)',  // mint variant
    'hsl(15 85% 68%)',   // coral variant
    'hsl(340 45% 70%)',  // rose variant
    'hsl(280 35% 68%)',  // lavender variant
  ];

  const expenseColors = [
    'hsl(280 89% 48%)',  // secondary (purple)
    'hsl(340 82% 52%)',  // primary (pink)
    'hsl(165 45% 65%)',  // mint
    'hsl(15 85% 68%)',   // coral
    'hsl(280 35% 68%)',  // lavender
    'hsl(340 45% 70%)',  // rose
  ];

  const fetchSalesByCategory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('product_type, selling_price')
        .eq('user_id', userId);

      if (error) throw error;

      const categoryTotals = data.reduce((acc: Record<string, number>, sale) => {
        acc[sale.product_type] = (acc[sale.product_type] || 0) + Number(sale.selling_price);
        return acc;
      }, {});

      const chartData = Object.entries(categoryTotals)
        .map(([name, value], index) => ({
          name,
          value: value as number,
          fill: categoryColors[index % categoryColors.length]
        }))
        .sort((a, b) => b.value - a.value);

      setSalesByCategory(chartData);
    } catch (error) {
      console.error('Error fetching sales by category:', error);
    }
  };

  const fetchDailySales = async (userId: string) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const { data, error } = await supabase
        .from('sales')
        .select('transaction_date, selling_price')
        .eq('user_id', userId)
        .gte('transaction_date', startDate.toISOString().split('T')[0])
        .lte('transaction_date', endDate.toISOString().split('T')[0])
        .order('transaction_date');

      if (error) throw error;

      // Group by date
      const dailyTotals = data.reduce((acc: Record<string, number>, sale) => {
        const date = sale.transaction_date;
        acc[date] = (acc[date] || 0) + Number(sale.selling_price);
        return acc;
      }, {});

      // Fill missing dates with 0
      const chartData: DailySalesData[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const formattedDate = currentDate.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short'
        });
        
        chartData.push({
          date: dateStr,
          sales: dailyTotals[dateStr] || 0,
          formatted_date: formattedDate
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setDailySales(chartData);
    } catch (error) {
      console.error('Error fetching daily sales:', error);
    }
  };

  const fetchMonthlyTrend = async (userId: string) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      // Fetch sales, expenses, and losses for the last 6 months
      const [salesResult, expensesResult, lossesResult] = await Promise.all([
        supabase
          .from('sales')
          .select('transaction_date, selling_price, purchase_price, marketplace_fee')
          .eq('user_id', userId)
          .gte('transaction_date', startDate.toISOString().split('T')[0]),
        supabase
          .from('expenses')
          .select('transaction_date, amount')
          .eq('user_id', userId)
          .gte('transaction_date', startDate.toISOString().split('T')[0]),
        supabase
          .from('losses')
          .select('transaction_date, amount')
          .eq('user_id', userId)
          .gte('transaction_date', startDate.toISOString().split('T')[0])
      ]);

      if (salesResult.error) throw salesResult.error;
      if (expensesResult.error) throw expensesResult.error;
      if (lossesResult.error) throw lossesResult.error;

      // Group by month
      const monthlyData: Record<string, { revenue: number; expenses: number; losses: number }> = {};

      // Process sales
      salesResult.data.forEach(sale => {
        const monthKey = new Date(sale.transaction_date).toISOString().slice(0, 7);
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, expenses: 0, losses: 0 };
        }
        monthlyData[monthKey].revenue += Number(sale.selling_price);
      });

      // Process expenses
      expensesResult.data.forEach(expense => {
        const monthKey = new Date(expense.transaction_date).toISOString().slice(0, 7);
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, expenses: 0, losses: 0 };
        }
        monthlyData[monthKey].expenses += Number(expense.amount);
      });

      // Process losses
      lossesResult.data.forEach(loss => {
        const monthKey = new Date(loss.transaction_date).toISOString().slice(0, 7);
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, expenses: 0, losses: 0 };
        }
        monthlyData[monthKey].losses += Number(loss.amount);
      });

      // Convert to chart data
      const chartData = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month: new Date(month + '-01').toLocaleDateString('id-ID', {
            month: 'short',
            year: '2-digit'
          }),
          revenue: data.revenue,
          expenses: data.expenses + data.losses,
          profit: data.revenue - data.expenses - data.losses
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);

      setMonthlyTrend(chartData);
    } catch (error) {
      console.error('Error fetching monthly trend:', error);
    }
  };

  const fetchExpenseBreakdown = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('category, amount')
        .eq('user_id', userId);

      if (error) throw error;

      const categoryTotals = data.reduce((acc: Record<string, number>, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
        return acc;
      }, {});

      const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

      const chartData = Object.entries(categoryTotals)
        .map(([category, amount], index) => ({
          category,
          amount: amount as number,
          percentage: Math.round(((amount as number) / totalExpenses) * 100),
          fill: expenseColors[index % expenseColors.length]
        }))
        .sort((a, b) => b.amount - a.amount);

      setExpenseBreakdown(chartData);
    } catch (error) {
      console.error('Error fetching expense breakdown:', error);
    }
  };

  const loadChartData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await Promise.all([
        fetchSalesByCategory(user.id),
        fetchDailySales(user.id),
        fetchMonthlyTrend(user.id),
        fetchExpenseBreakdown(user.id)
      ]);
    } catch (error) {
      console.error('Error loading chart data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data grafik",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadChartData();
    }
  }, [user]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('chart-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sales' },
        () => {
          fetchSalesByCategory(user.id);
          fetchDailySales(user.id);
          fetchMonthlyTrend(user.id);
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          fetchMonthlyTrend(user.id);
          fetchExpenseBreakdown(user.id);
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'losses' },
        () => {
          fetchMonthlyTrend(user.id);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    salesByCategory,
    dailySales,
    monthlyTrend,
    expenseBreakdown,
    loading,
    refetch: loadChartData
  };
}