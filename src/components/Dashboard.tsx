import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  CreditCard,
  Target,
  PieChart,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';

interface DashboardData {
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
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
}

// Mock data - replace with real data when Supabase is connected
const mockData: DashboardData = {
  totalRevenue: 15750000,
  totalCapital: 8500000,
  totalExpenses: 2250000,
  totalLosses: 450000,
  grossMargin: 7200000,
  netProfit: 4550000,
  monthlyGrowth: {
    revenue: 12.5,
    expenses: -5.2,
    profit: 18.7
  },
  topProducts: [
    { name: 'Rajut', sales: 45, revenue: 3200000 },
    { name: 'Dress', sales: 32, revenue: 2800000 },
    { name: 'Jeans', sales: 28, revenue: 2100000 },
    { name: 'Hoodie', sales: 22, revenue: 1900000 },
  ]
};

export function Dashboard() {
  const data = mockData;
  const grossMarginPercentage = ((data.grossMargin / data.totalRevenue) * 100).toFixed(1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatGrowth = (percentage: number) => {
    const isPositive = percentage >= 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
        {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        <span className="text-xs font-medium">{Math.abs(percentage)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Selamat datang kembali! Ini ringkasan bisnis Anda.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <PieChart className="h-4 w-4 mr-2" />
            Ekspor PDF
          </Button>
          <Button variant="gradient" size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Wawasan AI
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-revenue" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">{formatCurrency(data.totalRevenue)}</div>
            {formatGrowth(data.monthlyGrowth.revenue)}
          </CardContent>
        </Card>

        {/* Total Capital */}
        <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Modal</CardTitle>
            <ShoppingCart className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">{formatCurrency(data.totalCapital)}</div>
            <p className="text-xs text-muted-foreground mt-1">Biaya pembelian</p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengeluaran</CardTitle>
            <CreditCard className="h-4 w-4 text-expense" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">{formatCurrency(data.totalExpenses)}</div>
            {formatGrowth(data.monthlyGrowth.expenses)}
          </CardContent>
        </Card>

        {/* Total Losses */}
        <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Kerugian</CardTitle>
            <TrendingDown className="h-4 w-4 text-loss" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">{formatCurrency(data.totalLosses)}</div>
            <p className="text-xs text-muted-foreground mt-1">Minimalkan kerugian</p>
          </CardContent>
        </Card>

        {/* Gross Margin */}
        <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Margin Kotor</CardTitle>
            <Target className="h-4 w-4 text-profit" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">{formatCurrency(data.grossMargin)}</div>
            <Badge variant="secondary" className="text-xs bg-success-light text-success-foreground">
              {grossMarginPercentage}%
            </Badge>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="bg-gradient-card border-border shadow-soft hover:shadow-medium transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Laba Bersih</CardTitle>
            <TrendingUp className="h-4 w-4 text-profit" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-profit">{formatCurrency(data.netProfit)}</div>
            {formatGrowth(data.monthlyGrowth.profit)}
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Produk Terlaris
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} penjualan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(product.revenue)}</p>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-primary rounded-full"
                        style={{ 
                          width: `${(product.revenue / data.topProducts[0].revenue) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Financial Insights */}
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Wawasan Keuangan AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-success-light rounded-lg border-l-4 border-success">
                <p className="text-sm font-medium text-success-foreground">Performa Kuat</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Margin kotor Anda sebesar {grossMarginPercentage}% sangat baik untuk industri fashion.
                </p>
              </div>
              
              <div className="p-3 bg-info-light rounded-lg border-l-4 border-info">
                <p className="text-sm font-medium text-info-foreground">Peluang Optimasi</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pertimbangkan menambah stok kategori "Rajut" - ini produk terbaik Anda.
                </p>
              </div>
              
              <div className="p-3 bg-warning-light rounded-lg border-l-4 border-warning">
                <p className="text-sm font-medium text-warning-foreground">Manajemen Biaya</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pantau pengeluaran kemasan - meningkat 8% bulan ini.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Preview */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Penjualan: Produk Rajut</p>
                  <p className="text-xs text-muted-foreground">2 jam lalu</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-success">+{formatCurrency(125000)}</p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-expense rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Pengeluaran: Kemasan</p>
                  <p className="text-xs text-muted-foreground">4 jam lalu</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-expense">-{formatCurrency(25000)}</p>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Penjualan: Produk Dress</p>
                  <p className="text-xs text-muted-foreground">6 jam lalu</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-success">+{formatCurrency(185000)}</p>
            </div>
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            Lihat Semua Transaksi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}