import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useDateFilter } from '@/contexts/DateFilterContext'; // Import DateFilter

interface Loss {
  id: string;
  transaction_date: string;
  category: string;
  amount: number;
  description?: string;
  created_at: string;
}

export function useLosses() {
  const [losses, setLosses] = useState<Loss[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { selectedDate, getMonthRange } = useDateFilter(); // Gunakan date context

  const fetchLosses = useCallback(async () => {
    if (!user) return [];

    try {
      const { startDate, endDate } = getMonthRange(selectedDate);
      const { data, error } = await supabase
        .from('losses')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching losses:', error);
      return [];
    }
  }, [user, selectedDate, getMonthRange]);

  const loadLosses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLosses();
      setLosses(data || []);
    } catch (error) {
      console.error('Error loading losses:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data kerugian",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [fetchLosses, toast]);

  const deleteLoss = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data kerugian ini?')) return;

    try {
      const { error } = await supabase
        .from('losses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Data kerugian berhasil dihapus"
      });
      // Data will refresh automatically via real-time subscription
    } catch (error: any) {
      console.error('Error deleting loss:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus data kerugian",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadLosses();
    }
  }, [user, loadLosses]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('losses-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'losses', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Loss change received!', payload);
          loadLosses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadLosses]);

  return {
    losses,
    loading,
    loadLosses,
    deleteLoss
  };
}
