import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { toast } from '@/hooks/use-toast';

export interface ReportData {
  omset: number;
  modal: number;
  grossMargin: number;
  pengeluaran: number;
  kerugian: number;
  profitSebelumInfaq: number;
  infaq: number;
  profitBersih: number;
}

export interface MonthlyTrend {
  month: string;
  profit: number;
  omset: number;
}

export function useFinancialReport() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { selectedDate, getMonthRange } = useDateFilter();

  const loadReportData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { startDate, endDate } = getMonthRange(selectedDate);
      
      const [aggregatesResult, trendResult] = await Promise.all([
        (supabase.rpc as any)('get_report_aggregates', {
          user_id_param: user.id,
          start_date_param: startDate,
          end_date_param: endDate
        }),
        (supabase.rpc as any)('get_monthly_trend_data', {
          user_id_param: user.id,
          end_date_param: endDate
        })
      ]);
      
      if (aggregatesResult.error) throw aggregatesResult.error;
      if (trendResult.error) throw trendResult.error;

      const aggregates = aggregatesResult.data[0];
      
      // Calculate metrics based on user's formula
      const omset = aggregates.total_revenue;
      const modal = aggregates.total_capital || 0;
      const pengeluaran = aggregates.total_expenses;
      const kerugian = aggregates.total_losses;
      
      const grossMargin = omset - modal;
      const profitSebelumInfaq = grossMargin - pengeluaran - kerugian;
      const infaq = profitSebelumInfaq > 0 ? profitSebelumInfaq * 0.025 : 0;
      const profitBersih = profitSebelumInfaq - infaq;

      setReportData({
        omset,
        modal,
        grossMargin,
        pengeluaran,
        kerugian,
        profitSebelumInfaq,
        infaq,
        profitBersih,
      });

      // Process trend data
      const trend = trendResult.data.map(d => {
        const gm = d.revenue - d.capital - d.marketplace_fees;
        const profit = gm - d.expenses - d.losses;
        return {
          month: new Date(`${d.month}-02`).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
          profit: profit,
          omset: d.revenue
        };
      });
      setMonthlyTrend(trend);

    } catch (error: any) {
      console.error("Error loading financial report:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data laporan keuangan.",
        variant: "destructive",
      });
      setReportData(null);
      setMonthlyTrend([]);
    } finally {
      setLoading(false);
    }
  }, [user, selectedDate, getMonthRange]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('report-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => loadReportData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => loadReportData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'losses' }, () => loadReportData())
      .subscribe();
    return () => { supabase.removeChannel(channel) };
  }, [user, loadReportData]);

  return { reportData, monthlyTrend, loading };
}
