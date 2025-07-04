import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function DashboardActivity() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
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
  );
}