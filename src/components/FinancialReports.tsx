import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialReport } from '@/hooks/useFinancialReport';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { MonthYearSelector } from './ui/month-year-selector';
import { formatCurrency } from '@/utils/currencyFormatter';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, Sector } from 'recharts';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, HandCoins, Goal, Scale, Receipt, ShieldX, Wallet, Coins } from 'lucide-react';
import { useState } from 'react';

// Card untuk menampilkan metrik individual
const MetricCard = ({ title, value, icon: Icon, colorClass, description }: { title: string, value: string, icon: React.ElementType, colorClass: string, description?: string }) => (
  <Card className="shadow-soft border-border bg-gradient-card">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className={`h-5 w-5 ${colorClass}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

// Diagram komposisi profit bersih
const ProfitCompositionPieChart = ({ data }: { data: any }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const chartData = [
    { name: 'Gross Margin', value: data?.grossMargin || 0 },
    { name: 'Pengeluaran', value: data?.pengeluaran || 0 },
    { name: 'Kerugian', value: data?.kerugian || 0 },
  ];
  const COLORS = ['hsl(var(--success))', 'hsl(var(--secondary))', 'hsl(var(--warning))'];
  
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    return (
      <g>
        <text x={cx} y={cy} dy={-5} textAnchor="middle" fill={fill} className="text-lg font-bold">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={15} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-xs">
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={chartData.filter(d => d.value > 0)}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={90}
          fill="#8884d8"
          dataKey="value"
          onMouseEnter={(_, index) => setActiveIndex(index)}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};


export function FinancialReports() {
  const { reportData, monthlyTrend, loading } = useFinancialReport();
  const { selectedDate, setSelectedDate, formatDisplayMonth } = useDateFilter();

  if (loading) {
    return <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Laporan Keuangan</h1>
          <p className="text-muted-foreground mt-1">
            Ringkasan performa finansial untuk periode {formatDisplayMonth(selectedDate)}
          </p>
        </div>
        <MonthYearSelector selectedDate={selectedDate} onDateChange={setSelectedDate} className="w-52" />
      </div>

      {!reportData ? (
        <Card className="py-12">
            <CardContent className="text-center">
                <p className="text-muted-foreground">Tidak ada data untuk ditampilkan pada periode ini.</p>
            </CardContent>
        </Card>
      ) : (
        <>
          {/* Main Financial Summary */}
          <Card className="p-4 md:p-6 bg-gradient-to-br from-card to-card/90">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="col-span-2 md:col-span-4 p-4 rounded-lg bg-background/50 border-l-4 border-success">
                <p className="text-sm text-muted-foreground">Profit Bersih (Setelah Infaq)</p>
                <h3 className="text-3xl md:text-4xl font-bold text-success">{formatCurrency(reportData.profitBersih)}</h3>
              </div>
              <MetricCard title="Total Omset" value={formatCurrency(reportData.omset)} icon={TrendingUp} colorClass="text-primary" />
              <MetricCard title="Total Modal" value={formatCurrency(reportData.modal)} icon={ArrowDown} colorClass="text-destructive" description="Harga beli & biaya marketplace" />
              <MetricCard title="Gross Margin" value={formatCurrency(reportData.grossMargin)} icon={Scale} colorClass="text-info" description="Omset - Modal" />
              <MetricCard title="Infaq (2.5%)" value={formatCurrency(reportData.infaq)} icon={HandCoins} colorClass="text-teal-500" description="Dari profit sebelum infaq" />
            </div>
          </Card>
          
          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <Card className="xl:col-span-3">
              <CardHeader>
                <CardTitle>Tren Profit & Omset (6 Bulan)</CardTitle>
                <CardDescription>Perbandingan profit bersih dan omset selama 6 bulan terakhir.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${formatCurrency(v / 1000000)}Jt`} />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--success))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${formatCurrency(v / 1000000)}Jt`} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} formatter={(value: number) => formatCurrency(value)} />
                        <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                        <Bar yAxisId="left" dataKey="omset" name="Omset" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="profit" name="Profit Bersih" stroke="hsl(var(--success))" strokeWidth={2} />
                    </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Komposisi Profit</CardTitle>
                <CardDescription>Bagaimana Gross Margin digunakan.</CardDescription>
              </CardHeader>
              <CardContent>
                <ProfitCompositionPieChart data={reportData} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
