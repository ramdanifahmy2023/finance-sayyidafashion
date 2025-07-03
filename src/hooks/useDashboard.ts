import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface DashboardMetrics {
  totalRevenue: number;
  totalCapital: number;
  totalExpenses: number;
  totalLosses: number;
  grossMargin: number;
  netProfit: number;
  totalTransactions: number;
  marketplaceFees: number;
  monthlyGrowth: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export function useDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDashboardMetrics = async (userId: string) => {
    try {
      // Get current month date range
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Get previous month date range
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch current month data
      const [currentSalesResult, currentExpensesResult, currentLossesResult] = await Promise.all([
        supabase
          .from('sales')
          .select('*')
          .eq('user_id', userId)
          .gte('transaction_date', firstDay.toISOString().split('T')[0])
          .lte('transaction_date', lastDay.toISOString().split('T')[0]),
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', userId)
          .gte('transaction_date', firstDay.toISOString().split('T')[0])
          .lte('transaction_date', lastDay.toISOString().split('T')[0]),
        supabase
          .from('losses')
          .select('*')
          .eq('user_id', userId)
          .gte('transaction_date', firstDay.toISOString().split('T')[0])
          .lte('transaction_date', lastDay.toISOString().split('T')[0])
      ]);

      // Fetch previous month data
      const [prevSalesResult, prevExpensesResult, prevLossesResult] = await Promise.all([
        supabase
          .from('sales')
          .select('*')
          .eq('user_id', userId)
          .gte('transaction_date', prevMonth.toISOString().split('T')[0])
          .lte('transaction_date', prevMonthEnd.toISOString().split('T')[0]),
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', userId)
          .gte('transaction_date', prevMonth.toISOString().split('T')[0])
          .lte('transaction_date', prevMonthEnd.toISOString().split('T')[0]),
        supabase
          .from('losses')
          .select('*')
          .eq('user_id', userId)
          .gte('transaction_date', prevMonth.toISOString().split('T')[0])
          .lte('transaction_date', prevMonthEnd.toISOString().split('T')[0])
      ]);

      if (currentSalesResult.error) throw currentSalesResult.error;
      if (currentExpensesResult.error) throw currentExpensesResult.error;
      if (currentLossesResult.error) throw currentLossesResult.error;

      const currentSales = currentSalesResult.data || [];
      const currentExpenses = currentExpensesResult.data || [];
      const currentLosses = currentLossesResult.data || [];
      const prevSales = prevSalesResult.data || [];
      const prevExpenses = prevExpensesResult.data || [];
      const prevLosses = prevLossesResult.data || [];

      // Calculate current month metrics
      const totalRevenue = currentSales.reduce((sum, sale) => sum + Number(sale.selling_price), 0);
      const totalCapital = currentSales.reduce((sum, sale) => sum + Number(sale.purchase_price), 0);
      const totalExpenses = currentExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const totalLosses = currentLosses.reduce((sum, loss) => sum + Number(loss.amount), 0);
      const marketplaceFees = currentSales.reduce((sum, sale) => sum + Number(sale.marketplace_fee || 0), 0);
      const grossMargin = totalRevenue - totalCapital - marketplaceFees;
      const netProfit = grossMargin - totalExpenses - totalLosses;

      // Calculate previous month metrics
      const prevRevenue = prevSales.reduce((sum, sale) => sum + Number(sale.selling_price), 0);
      const prevExpensesTotal = prevExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const prevLossesTotal = prevLosses.reduce((sum, loss) => sum + Number(loss.amount), 0);
      const prevCapital = prevSales.reduce((sum, sale) => sum + Number(sale.purchase_price), 0);
      const prevMarketplaceFees = prevSales.reduce((sum, sale) => sum + Number(sale.marketplace_fee || 0), 0);
      const prevGrossMargin = prevRevenue - prevCapital - prevMarketplaceFees;
      const prevNetProfit = prevGrossMargin - prevExpensesTotal - prevLossesTotal;

      // Calculate growth percentages
      const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
      const expenseGrowth = prevExpensesTotal > 0 ? ((totalExpenses - prevExpensesTotal) / prevExpensesTotal) * 100 : 0;
      const profitGrowth = prevNetProfit > 0 ? ((netProfit - prevNetProfit) / prevNetProfit) * 100 : 0;

      // Calculate top products
      const productSales = currentSales.reduce((acc, sale) => {
        const productType = sale.product_type;
        if (!acc[productType]) {
          acc[productType] = { sales: 0, revenue: 0 };
        }
        acc[productType].sales += 1;
        acc[productType].revenue += Number(sale.selling_price);
        return acc;
      }, {} as Record<string, { sales: number; revenue: number }>);

      const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);

      return {
        totalRevenue,
        totalCapital,
        totalExpenses,
        totalLosses,
        grossMargin,
        netProfit,
        totalTransactions: currentSales.length,
        marketplaceFees,
        monthlyGrowth: {
          revenue: revenueGrowth,
          expenses: expenseGrowth,
          profit: profitGrowth
        },
        topProducts
      };

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  };

  const loadDashboard = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const dashboardMetrics = await fetchDashboardMetrics(user.id);
      setMetrics(dashboardMetrics);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sales' },
        () => {
          console.log('Sales data changed, refreshing dashboard');
          loadDashboard();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          console.log('Expenses data changed, refreshing dashboard');
          loadDashboard();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'losses' },
        () => {
          console.log('Losses data changed, refreshing dashboard');
          loadDashboard();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    metrics,
    loading,
    loadDashboard
  };
}