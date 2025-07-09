import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Expense {
  id: string;
  transaction_date: string;
  category: string;
  amount: number;
  description?: string;
  created_at: string;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchExpenses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }
  }, []);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchExpenses();
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [fetchExpenses, toast]);

  const deleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense deleted successfully"
      });
      
      await loadExpenses();
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user, loadExpenses]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('expenses-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expenses' },
        (payload) => {
          console.log('Expense change received!', payload);
          loadExpenses();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, loadExpenses]);

  return {
    expenses,
    loading,
    loadExpenses,
    deleteExpense
  };
}