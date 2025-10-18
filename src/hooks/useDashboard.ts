import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDateFilter } from '@/contexts/DateFilterContext';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedDate, getMonthRange } = useDateFilter();

  const fetchDashboardMetrics = useCallback(async () => {
    if (!user) return null;

    try {
      const currentMonthRange = getMonthRange(selectedDate);
      const prevMonthDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
      const prevMonthRange = getMonthRange(prevMonthDate);

      const [currentMetricsResult, prevMetricsResult, topProductsResult] = await Promise.all([
        supabase.rpc('get_dashboard_metrics', {
          user_id_param: user.id,
          start_date: currentMonthRange.startDate,
          end_date: currentMonthRange.endDate
        }),
        supabase.rpc('get_dashboard_metrics', {
          user_id_param: user.id,
          start_date: prevMonthRange.startDate,
          end_date: prevMonthRange.endDate
        }),
        supabase.rpc('get_top_products', {
          user_id_param: user.id,
          start_date: currentMonthRange.startDate,
          end_date: currentMonthRange.endDate,
          limit_count: 4
        })
      ]);

      if (currentMetricsResult.error) throw currentMetricsResult.error;
      if (prevMetricsResult.error) throw prevMetricsResult.error;
      if (topProductsResult.error) throw topProductsResult.error;

      const currentMetrics = currentMetricsResult.data?.[0] || {
        total_revenue: 0, total_capital: 0, total_expenses: 0, total_losses: 0,
        gross_margin: 0, net_profit: 0, transaction_count: 0, marketplace_fees: 0
      };

      const prevMetrics = prevMetricsResult.data?.[0] || {
        total_revenue: 0, total_expenses: 0, net_profit: 0
      };

      const topProducts = (topProductsResult.data || []).map((product: any) => ({
        name: product.product_name,
        sales: product.sales_count,
        revenue: Number(product.total_revenue)
      }));

      const revenueGrowth = prevMetrics.total_revenue > 0 
        ? ((Number(currentMetrics.total_revenue) - Number(prevMetrics.total_revenue)) / Number(prevMetrics.total_revenue)) * 100 
        : (Number(currentMetrics.total_revenue) > 0 ? 100 : 0);
      const expenseGrowth = prevMetrics.total_expenses > 0 
        ? ((Number(currentMetrics.total_expenses) - Number(prevMetrics.total_expenses)) / Number(prevMetrics.total_expenses)) * 100 
        : (Number(currentMetrics.total_expenses) > 0 ? 100 : 0);
      const profitGrowth = Math.abs(prevMetrics.net_profit) > 0
        ? ((Number(currentMetrics.net_profit) - Number(prevMetrics.net_profit)) / Math.abs(prevMetrics.net_profit)) * 100
        : (Number(currentMetrics.net_profit) > 0 ? 100 : 0);

      return {
        totalRevenue: Number(currentMetrics.total_revenue),
        totalCapital: Number(currentMetrics.total_capital),
        totalExpenses: Number(currentMetrics.total_expenses),
        totalLosses: Number(currentMetrics.total_losses),
        grossMargin: Number(currentMetrics.gross_margin),
        netProfit: Number(currentMetrics.net_profit),
        totalTransactions: Number(currentMetrics.transaction_count),
        marketplaceFees: Number(currentMetrics.marketplace_fees),
        monthlyGrowth: { revenue: revenueGrowth, expenses: expenseGrowth, profit: profitGrowth },
        topProducts
      };

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data dashboard",
        variant: "destructive"
      });
      // useQuery akan menangani error ini
      throw error;
    }
  }, [user, selectedDate, getMonthRange, toast]);

  const { data: metrics, isLoading: loading, refetch: loadDashboard } = useQuery<DashboardMetrics | null>({
    queryKey: ['dashboardMetrics', user?.id, selectedDate.toISOString().slice(0, 7)],
    queryFn: fetchDashboardMetrics,
    enabled: !!user, // Hanya jalankan query jika user sudah login
    staleTime: 5 * 60 * 1000, // Cache data selama 5 menit
  });

  return {
    metrics,
    loading,
    loadDashboard
  };
}
