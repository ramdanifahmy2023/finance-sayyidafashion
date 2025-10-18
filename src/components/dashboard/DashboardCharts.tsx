import { SalesByCategoryChart } from '@/components/charts/SalesByCategoryChart';
import { DailySalesChart } from '@/components/charts/DailySalesChart';
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { ExpenseBreakdownChart } from '@/components/charts/ExpenseBreakdownChart';
import { useChartData } from '@/hooks/useChartData';

export function DashboardCharts() {
  const { salesByCategory, dailySales, monthlyTrend, expenseBreakdown, loading } = useChartData();

  return (
    <div className="space-y-6">
      {/* Sales Analytics Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SalesByCategoryChart data={salesByCategory} loading={loading} />
        <ExpenseBreakdownChart data={expenseBreakdown} loading={loading} />
      </div>

      {/* Performance Trend Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DailySalesChart data={dailySales} loading={loading} />
        <MonthlyTrendChart data={monthlyTrend} loading={loading} />
      </div>
    </div>
  );
}