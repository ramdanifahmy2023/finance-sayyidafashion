import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { Sale } from '@/types/sales';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedDate, getMonthRange } = useDateFilter();

  const fetchSales = useCallback(async () => {
    if (!user) return [];
    try {
      const range = getMonthRange(selectedDate);
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', range.startDate)
        .lte('transaction_date', range.endDate)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching sales:', error);
      return [];
    }
  }, [user, selectedDate, getMonthRange]);

  const loadSales = useCallback(async () => {
    if (!user) {
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      const data = await fetchSales();
      setSales(data || []);
    } catch (error) {
      console.error('Error loading sales:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data penjualan",
        variant: "destructive"
      });
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [fetchSales, toast, user]);

  const deleteSale = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus penjualan ini?')) return;
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({
        title: "Berhasil",
        description: "Penjualan berhasil dihapus"
      });
    } catch (error: any) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus penjualan",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadSales();
    } else {
        setLoading(false);
    }
  }, [user, loadSales]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('sales-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sales', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Perubahan data penjualan terdeteksi!', payload);
          loadSales();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadSales]);

  return {
    sales,
    loading,
    loadSales,
    deleteSale
  };
}
