import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, CreditCard, Target, ArrowUp, ArrowDown } from 'lucide-react';

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

export function DashboardMetrics({
  metrics,
  loading
}: DashboardMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatGrowth = (percentage: number) => {
    const isPositive = percentage >= 0;
    return <div className={`flex items-center gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
        {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        <span className="text-xs font-medium">{Math.abs(percentage).toFixed(1)}% vs bulan lalu</span>
      </div>;
  };

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({
        length: 6
      }).map((_, i) => <Card key={i} className="bg-gradient-card border-border shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>)}
      </div>;
  }

  if (!metrics) {
    return <div className="text-center py-12">
        <p className="text-muted-foreground">Tidak ada data tersedia untuk periode ini.</p>
      </div>;
  }

  const grossMarginPercentage = metrics.totalRevenue > 0 ? (metrics.grossMargin / metrics.totalRevenue * 100).toFixed(1) : '0.0';

  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* Total Revenue */}
      <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Total Omset</CardTitle>
          <DollarSign className="h-4 w-4 text-revenue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics.totalRevenue)}</div>
          {formatGrowth(metrics.monthlyGrowth.revenue)}
        </CardContent>
      </Card>

      {/* Total Capital */}
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

      {/* Total Expenses */}
      <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Total Pengeluaran</CardTitle>
          <CreditCard className="h-4 w-4 text-expense" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics.totalExpenses)}</div>
          {formatGrowth(metrics.monthlyGrowth.expenses)}
        </CardContent>
      </Card>

      {/* Total Losses */}
      <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Total Kerugian</CardTitle>
          <TrendingDown className="h-4 w-4 text-loss" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics.totalLosses)}</div>
          <p className="text-xs text-muted-foreground mt-1">Minimalkan kerugian tak terduga</p>
        </CardContent>
      </Card>

      {/* Gross Margin */}
      <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-muted-foreground text-sm">Gross Margin</CardTitle>
          <Target className="h-4 w-4 text-profit" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(metrics.grossMargin)}</div>
          <Badge variant="secondary" className="text-xs bg-success-light text-success-foreground">
            {grossMarginPercentage}% dari Omset
          </Badge>
        </CardContent>
      </Card>

      {/* Net Profit */}
      <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-muted-foreground font-medium text-sm">Margin Kotor</CardTitle>
          <TrendingUp className="h-4 w-4 text-profit" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-profit">{formatCurrency(metrics.netProfit)}</div>
          {formatGrowth(metrics.monthlyGrowth.profit)}
        </CardContent>
      </Card>
    </div>;
}
