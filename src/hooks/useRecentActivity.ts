
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDateFilter } from '@/contexts/DateFilterContext';

interface RecentActivity {
  id: string;
  type: 'sale' | 'expense' | 'loss';
  description: string;
  amount: number;
  timestamp: string;
  category?: string;
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { selectedDate, getMonthRange } = useDateFilter();

  const fetchRecentActivity = useCallback(async () => {
    if (!user) return;

    try {
      const range = getMonthRange(selectedDate);
      
      // Fetch recent sales, expenses, and losses
      const [salesResult, expensesResult, lossesResult] = await Promise.all([
        supabase
          .from('sales')
          .select('id, customer_name, product_type, selling_price, transaction_date, created_at')
          .eq('user_id', user.id)
          .gte('transaction_date', range.startDate)
          .lte('transaction_date', range.endDate)
          .order('created_at', { ascending: false })
          .limit(3),

        supabase
          .from('expenses')
          .select('id, description, category, amount, transaction_date, created_at')
          .eq('user_id', user.id)
          .gte('transaction_date', range.startDate)
          .lte('transaction_date', range.endDate)
          .order('created_at', { ascending: false })
          .limit(2),

        supabase
          .from('losses')
          .select('id, description, loss_type, amount, transaction_date, created_at')
          .eq('user_id', user.id)
          .gte('transaction_date', range.startDate)
          .lte('transaction_date', range.endDate)
          .order('created_at', { ascending: false })
          .limit(2)
      ]);

      const recentActivities: RecentActivity[] = [];

      // Process sales
      salesResult.data?.forEach(sale => {
        recentActivities.push({
          id: sale.id,
          type: 'sale',
          description: `Penjualan: ${sale.product_type} - ${sale.customer_name}`,
          amount: sale.selling_price,
          timestamp: sale.created_at || sale.transaction_date
        });
      });

      // Process expenses
      expensesResult.data?.forEach(expense => {
        recentActivities.push({
          id: expense.id,
          type: 'expense',
          description: `Pengeluaran: ${expense.description}`,
          amount: expense.amount,
          timestamp: expense.created_at || expense.transaction_date,
          category: expense.category
        });
      });

      // Process losses
      lossesResult.data?.forEach(loss => {
        recentActivities.push({
          id: loss.id,
          type: 'loss',
          description: `Kerugian: ${loss.description}`,
          amount: loss.amount,
          timestamp: loss.created_at || loss.transaction_date,
          category: loss.loss_type
        });
      });

      // Sort by timestamp and take top 5
      const sortedActivities = recentActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedDate, getMonthRange]);

  useEffect(() => {
    fetchRecentActivity();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchRecentActivity, 30000);
    
    return () => clearInterval(interval);
  }, [fetchRecentActivity]);

  // Real-time updates
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('recent-activity-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sales' },
        () => {
          console.log('Sales data changed, refreshing activity');
          fetchRecentActivity();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          console.log('Expenses data changed, refreshing activity');
          fetchRecentActivity();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'losses' },
        () => {
          console.log('Losses data changed, refreshing activity');
          fetchRecentActivity();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, fetchRecentActivity]);

  return {
    activities,
    loading,
    refreshActivity: fetchRecentActivity
  };
}
