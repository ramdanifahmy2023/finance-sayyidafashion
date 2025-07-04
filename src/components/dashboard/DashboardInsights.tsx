import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Sparkles } from 'lucide-react';
import { formatProductType } from '@/utils/salesFormatters';

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

interface DashboardInsightsProps {
  topProducts: TopProduct[];
  grossMarginPercentage: string;
}

export function DashboardInsights({ topProducts, grossMarginPercentage }: DashboardInsightsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
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
            {topProducts && topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{formatProductType(product.name)}</p>
                      <p className="text-xs text-muted-foreground">{product.sales} penjualan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(product.revenue)}</p>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-primary rounded-full"
                        style={{ 
                          width: `${topProducts[0] ? (product.revenue / topProducts[0].revenue) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Belum ada penjualan periode ini
              </p>
            )}
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
                Pertimbangkan menambah stok kategori dengan penjualan terbaik.
              </p>
            </div>
            
            <div className="p-3 bg-warning-light rounded-lg border-l-4 border-warning">
              <p className="text-sm font-medium text-warning-foreground">Manajemen Biaya</p>
              <p className="text-xs text-muted-foreground mt-1">
                Monitor pengeluaran operasional untuk meningkatkan profitabilitas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}