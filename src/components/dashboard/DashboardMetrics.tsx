import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, DollarSign, ShoppingCart, CreditCard, Target, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';
interface MetricsData {
  totalRevenue: number;
  totalCapital: number;
  totalExpenses: number;
  totalLosses: number;
  grossMargin: number;
  netProfit: number;
  monthlyGrowth: {
    revenue: number;
    expenses: number;
    profit: number;
  };
}
interface DashboardMetricsProps {
  metrics: MetricsData | null;
  loading: boolean;
}
const GrowthIndicator = ({
  percentage
}: {
  percentage: number;
}) => {
  const isPositive = percentage >= 0;
  // Untuk pengeluaran, pertumbuhan positif (kenaikan) adalah hal yang kurang baik
  const colorClass = isPositive ? 'text-success' : 'text-destructive';
  return <div className={`flex items-center gap-1 ${colorClass}`}>
      {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      <span className="text-xs font-medium">{Math.abs(percentage).toFixed(1)}% vs bulan lalu</span>
    </div>;
};
export function DashboardMetrics({
  metrics,
  loading
}: DashboardMetricsProps) {
  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({
        length: 5
      }).map((_, i) => <Card key={i} className="bg-gradient-card border-border shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted rounded w-3/4 animate-pulse mb-2" />
              <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
            </CardContent>
          </Card>)}
      </div>;
  }
  if (!metrics) {
    return <div className="text-center py-12">
        <p className="text-muted-foreground">Tidak ada data metrik tersedia untuk periode ini.</p>
      </div>;
  }
  const grossMarginPercentage = metrics.totalRevenue > 0 ? (metrics.grossMargin / metrics.totalRevenue * 100).toFixed(1) : '0.0';
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {/* Total Omset */}
      <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Total Omset</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics.totalRevenue)}</div>
          <GrowthIndicator percentage={metrics.monthlyGrowth.revenue} />
        </CardContent>
      </Card>

      {/* Total Modal */}
      <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-muted-foreground font-medium text-sm">Total Modal</CardTitle>
          <ShoppingCart className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics.totalCapital)}</div>
          <p className="text-xs text-muted-foreground mt-1">Biaya pembelian produk</p>
        </CardContent>
      </Card>

      {/* Laba Kotor (Sebelumnya Gross Margin) */}
      <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Laba Kotor</CardTitle>
          <Target className="h-4 w-4 text-info" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics.grossMargin)}</div>
          <Badge variant="outline" className="text-xs border-info text-info-foreground bg-blue-400">
            {grossMarginPercentage}% dari Omset
          </Badge>
        </CardContent>
      </Card>

      {/* Total Pengeluaran */}
      <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Total Pengeluaran</CardTitle>
          <CreditCard className="h-4 w-4 text-expense" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics.totalExpenses)}</div>
          <GrowthIndicator percentage={metrics.monthlyGrowth.expenses} />
        </CardContent>
      </Card>

      {/* Total Kerugian */}
      <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Total Kerugian</CardTitle>
          <TrendingDown className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics.totalLosses)}</div>
          <p className="text-xs text-muted-foreground mt-1">Stok rusak, hilang, dll.</p>
        </CardContent>
      </Card>
    </div>;
}