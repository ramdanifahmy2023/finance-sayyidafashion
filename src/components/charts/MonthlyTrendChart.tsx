import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface MonthlyTrendData {
  month: string;
  omset: number;
  pengeluaran: number;
  kerugian: number;
  grossMargin: number;
  labaBersih: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyTrendData[];
  loading?: boolean;
}

export function MonthlyTrendChart({ data, loading }: MonthlyTrendChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-medium p-3">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const legendPayload = [
    { value: 'Omset', color: 'hsl(var(--primary))' },
    { value: 'Gross Margin', color: 'hsl(var(--info))' },
    { value: 'Laba Bersih', color: 'hsl(var(--success))' },
    { value: 'Pengeluaran', color: 'hsl(var(--secondary))' },
    { value: 'Kerugian', color: 'hsl(var(--warning))' },
  ];

  const CustomLegend = () => (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {legendPayload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
  
  if (loading) {
    return (
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Tren Bulanan (6 Bulan Terakhir)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Tren Keuangan Bulanan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}Jt`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Line type="monotone" dataKey="omset" name="Omset" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="grossMargin" name="Gross Margin" stroke="hsl(var(--info))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="labaBersih" name="Laba Bersih" stroke="hsl(var(--success))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="hsl(var(--secondary))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="kerugian" name="Kerugian" stroke="hsl(var(--warning))" strokeDasharray="5 5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
