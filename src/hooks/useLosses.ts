import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Loss {
  id: string;
  transaction_date: string;
  loss_type: string;
  description: string;
  amount: number;
  created_at: string;
}

export function useLosses() {
  const [losses, setLosses] = useState<Loss[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchLosses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('losses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching losses:', error);
      return [];
    }
  }, []);

  const loadLosses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLosses();
      setLosses(data || []);
    } catch (error) {
      console.error('Error loading losses:', error);
      toast({
        title: "Error",
        description: "Failed to load losses data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [fetchLosses, toast]);

  const deleteLoss = async (id: string) => {
    if (!confirm('Are you sure you want to delete this loss?')) return;

    try {
      const { error } = await supabase
        .from('losses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Loss deleted successfully"
      });
      
      await loadLosses();
    } catch (error: any) {
      console.error('Error deleting loss:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete loss",
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

    const subscription = supabase
      .channel('losses-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'losses' },
        (payload) => {
          console.log('Loss change received!', payload);
          loadLosses();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, loadLosses]);

  return {
    losses,
    loading,
    loadLosses,
    deleteLoss
  };
}