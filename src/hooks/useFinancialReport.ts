// src/hooks/useFinancialReport.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { toast } from '@/hooks/use-toast';
import { Sale } from '@/types/sales';
import { Expense } from '@/types/expense';
import { Loss } from '@/types/loss';

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
  const [detailedSales, setDetailedSales] = useState<Sale[]>([]);
  const [detailedExpenses, setDetailedExpenses] = useState<Expense[]>([]);
  const [detailedLosses, setDetailedLosses] = useState<Loss[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { selectedDate, getMonthRange } = useDateFilter();

  const loadReportData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { startDate, endDate } = getMonthRange(selectedDate);
      
      const [
        salesResult, 
        expensesResult, 
        lossesResult
      ] = await Promise.all([
        supabase.from('sales').select('*').eq('user_id', user.id).gte('transaction_date', startDate).lte('transaction_date', endDate),
        supabase.from('expenses').select('*').eq('user_id', user.id).gte('transaction_date', startDate).lte('transaction_date', endDate),
        supabase.from('losses').select('*').eq('user_id', user.id).gte('transaction_date', startDate).lte('transaction_date', endDate)
      ]);
      
      if (salesResult.error) throw salesResult.error;
      if (expensesResult.error) throw expensesResult.error;
      if (lossesResult.error) throw lossesResult.error;

      const sales = salesResult.data || [];
      const expenses = expensesResult.data || [];
      const losses = lossesResult.data || [];
      
      const omset = sales.reduce((sum, s) => sum + Number(s.selling_price), 0);
      const modal = sales.reduce((sum, s) => sum + Number(s.purchase_price) + Number(s.marketplace_fee || 0), 0);
      const pengeluaran = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const kerugian = losses.reduce((sum, l) => sum + Number(l.amount), 0);
      
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

      setDetailedSales(sales);
      setDetailedExpenses(expenses);
      setDetailedLosses(losses);

      // Calculate 6-month trend from current data
      const monthlyMap = new Map<string, { omset: number; modal: number; pengeluaran: number; kerugian: number }>();
      
      sales.forEach(s => {
        const month = s.transaction_date.substring(0, 7);
        const existing = monthlyMap.get(month) || { omset: 0, modal: 0, pengeluaran: 0, kerugian: 0 };
        existing.omset += Number(s.selling_price);
        existing.modal += Number(s.purchase_price) + Number(s.marketplace_fee || 0);
        monthlyMap.set(month, existing);
      });
      
      expenses.forEach(e => {
        const month = e.transaction_date.substring(0, 7);
        const existing = monthlyMap.get(month) || { omset: 0, modal: 0, pengeluaran: 0, kerugian: 0 };
        existing.pengeluaran += Number(e.amount);
        monthlyMap.set(month, existing);
      });
      
      losses.forEach(l => {
        const month = l.transaction_date.substring(0, 7);
        const existing = monthlyMap.get(month) || { omset: 0, modal: 0, pengeluaran: 0, kerugian: 0 };
        existing.kerugian += Number(l.amount);
        monthlyMap.set(month, existing);
      });
      
      const trend = Array.from(monthlyMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6)
        .map(([month, data]) => ({
          month: new Date(`${month}-02`).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
          profit: data.omset - data.modal - data.pengeluaran - data.kerugian,
          omset: data.omset
        }));
      
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

  return { reportData, monthlyTrend, detailedSales, detailedExpenses, detailedLosses, loading };
}
