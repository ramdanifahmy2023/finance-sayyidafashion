import { useDashboard } from '@/hooks/useDashboard';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { DashboardInsights } from '@/components/dashboard/DashboardInsights';
import { DashboardActivity } from '@/components/dashboard/DashboardActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { useEffect } from 'react';

export function Dashboard() {
  const { metrics, loading, loadDashboard } = useDashboard();
  const { selectedDate, formatDisplayMonth, isCurrentMonth } = useDateFilter();

  // Reload dashboard when date changes
  useEffect(() => {
    loadDashboard(selectedDate);
  }, [selectedDate, loadDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const grossMarginPercentage = metrics?.totalRevenue && metrics.totalRevenue > 0 
    ? ((metrics.grossMargin / metrics.totalRevenue) * 100).toFixed(1) 
    : '0.0';

  const topProducts = metrics?.topProducts || [];

  return (
    <div className="space-y-6">
      <DashboardHeader />
      
      {/* Period Indicator */}
      <Card className="bg-info-light border-info">
        <CardContent className="p-4">
          <div className="flex items-center">
            <Info className="w-5 h-5 text-info mr-2" />
            <span className="text-info-foreground">
              Menampilkan data untuk periode: <strong>{formatDisplayMonth(selectedDate)}</strong>
              {!isCurrentMonth() && (
                <span className="ml-2 text-sm">(Data Historis)</span>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      <DashboardMetrics metrics={metrics} loading={loading} />
      <DashboardCharts />
      <DashboardInsights topProducts={topProducts} grossMarginPercentage={grossMarginPercentage} />
      <DashboardActivity />
    </div>
  );
}