import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, TrendingDown, DollarSign, FileText, Download, Calendar, BarChart3, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  totalLosses: number;
  totalAssets: number;
  totalLiabilities: number;
  netProfit: number;
  netWorth: number;
}
interface ChartData {
  name: string;
  value: number;
  color?: string;
}
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000'];
export function FinancialReports() {
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpenses: 0,
    totalLosses: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    netProfit: 0,
    netWorth: 0
  });
  const [expenseData, setExpenseData] = useState<ChartData[]>([]);
  const [productData, setProductData] = useState<ChartData[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (user) {
      loadFinancialData();
    }
  }, [user]);
  const loadFinancialData = async () => {
    try {
      // Load sales data
      const {
        data: salesData,
        error: salesError
      } = await supabase.from('sales').select('*');
      if (salesError) throw salesError;

      // Load expenses data
      const {
        data: expensesData,
        error: expensesError
      } = await supabase.from('expenses').select('*');
      if (expensesError) throw expensesError;

      // Load losses data
      const {
        data: lossesData,
        error: lossesError
      } = await supabase.from('losses').select('*');
      if (lossesError) throw lossesError;

      // Load assets data
      const {
        data: assetsData,
        error: assetsError
      } = await supabase.from('assets').select('*');
      if (assetsError) throw assetsError;

      // Calculate summary
      const totalRevenue = salesData?.reduce((sum, sale) => sum + sale.selling_price, 0) || 0;
      const totalExpenses = expensesData?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
      const totalLosses = lossesData?.reduce((sum, loss) => sum + loss.amount, 0) || 0;
      const totalAssets = assetsData?.filter(a => a.type === 'asset').reduce((sum, asset) => sum + asset.current_value, 0) || 0;
      const totalLiabilities = assetsData?.filter(a => a.type === 'liability').reduce((sum, asset) => sum + asset.current_value, 0) || 0;
      const netProfit = totalRevenue - totalExpenses - totalLosses;
      const netWorth = totalAssets - totalLiabilities;
      setSummary({
        totalRevenue,
        totalExpenses,
        totalLosses,
        totalAssets,
        totalLiabilities,
        netProfit,
        netWorth
      });

      // Process expense data for chart
      const expenseByCategory = expensesData?.reduce((acc: any, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {}) || {};
      const expenseChartData = Object.entries(expenseByCategory).map(([category, amount]) => ({
        name: formatCategory(category as string),
        value: amount as number
      }));
      setExpenseData(expenseChartData);

      // Process product data for chart
      const productSales = salesData?.reduce((acc: any, sale) => {
        acc[sale.product_type] = (acc[sale.product_type] || 0) + 1;
        return acc;
      }, {}) || {};
      const productChartData = Object.entries(productSales).map(([product, count]) => ({
        name: formatProductType(product as string),
        value: count as number
      }));
      setProductData(productChartData);

      // Process monthly data
      const monthlyRevenue = salesData?.reduce((acc: any, sale) => {
        const month = new Date(sale.transaction_date).toLocaleString('default', {
          month: 'short'
        });
        acc[month] = (acc[month] || 0) + sale.selling_price;
        return acc;
      }, {}) || {};
      const monthlyExpense = expensesData?.reduce((acc: any, expense) => {
        const month = new Date(expense.transaction_date).toLocaleString('default', {
          month: 'short'
        });
        acc[month] = (acc[month] || 0) + expense.amount;
        return acc;
      }, {}) || {};
      const monthlyChartData = Object.keys({
        ...monthlyRevenue,
        ...monthlyExpense
      }).map(month => ({
        month,
        revenue: monthlyRevenue[month] || 0,
        expenses: monthlyExpense[month] || 0,
        profit: (monthlyRevenue[month] || 0) - (monthlyExpense[month] || 0)
      }));
      setMonthlyData(monthlyChartData);
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast({
        title: "Error",
        description: "Failed to load financial data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  const formatCategory = (category: string) => {
    const categoryMap: {
      [key: string]: string;
    } = {
      'lakban': 'Lakban',
      'plastik_packing': 'Plastik Packing',
      'operasional': 'Operasional',
      'gaji': 'Gaji',
      'transportasi': 'Transportasi',
      'dll': 'Lainnya'
    };
    return categoryMap[category] || category;
  };
  const formatProductType = (type: string) => {
    return type.replace('_', ' ').toUpperCase();
  };
  const exportToPDF = () => {
    try {
      const doc = new (window as any).jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(219, 39, 119);
      doc.text('Laporan Keuangan', 20, 30);
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Sayyida Fashion', 20, 40);
      doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 20, 50);

      // Line separator
      doc.setLineWidth(0.5);
      doc.line(20, 60, 190, 60);

      // Financial metrics
      doc.setFontSize(16);
      doc.setTextColor(219, 39, 119);
      doc.text('Ringkasan Keuangan', 20, 75);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      let yPosition = 90;
      const lineHeight = 15;
      const metricsData = [['Total Pendapatan', formatCurrency(summary.totalRevenue)], ['Total Pengeluaran', formatCurrency(summary.totalExpenses)], ['Total Kerugian', formatCurrency(summary.totalLosses)], ['Total Aset', formatCurrency(summary.totalAssets)], ['Total Kewajiban', formatCurrency(summary.totalLiabilities)], ['Laba Bersih', formatCurrency(summary.netProfit)], ['Kekayaan Bersih', formatCurrency(summary.netWorth)]];
      metricsData.forEach(([label, value]) => {
        doc.text(label + ':', 25, yPosition);
        doc.text(value, 120, yPosition);
        yPosition += lineHeight;
      });

      // Analysis section
      yPosition += 10;
      doc.setFontSize(16);
      doc.setTextColor(219, 39, 119);
      doc.text('Analisis', 20, yPosition);
      yPosition += 20;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const profitMargin = summary.totalRevenue > 0 ? (summary.netProfit / summary.totalRevenue * 100).toFixed(1) : '0.0';
      const analysisText = [`Margin Keuntungan: ${profitMargin}%`, `Status: ${summary.netProfit >= 0 ? 'Profitable' : 'Rugi'}`, `Rasio Aset terhadap Kewajiban: ${summary.totalLiabilities > 0 ? (summary.totalAssets / summary.totalLiabilities).toFixed(2) : 'N/A'}`];
      analysisText.forEach(text => {
        doc.text(text, 25, yPosition);
        yPosition += lineHeight;
      });

      // Footer
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Dibuat pada: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`, 20, 280);
      doc.save(`Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.pdf`);
      toast({
        title: "Berhasil",
        description: "Laporan PDF berhasil diunduh"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Gagal membuat laporan PDF",
        variant: "destructive"
      });
    }
  };
  const exportToCSV = () => {
    try {
      const csvData = [['Metrik', 'Nilai'], ['Total Pendapatan', summary.totalRevenue], ['Total Pengeluaran', summary.totalExpenses], ['Total Kerugian', summary.totalLosses], ['Total Aset', summary.totalAssets], ['Total Kewajiban', summary.totalLiabilities], ['Laba Bersih', summary.netProfit], ['Kekayaan Bersih', summary.netWorth], [''], ['Data Pengeluaran per Kategori'], ['Kategori', 'Jumlah'], ...expenseData.map(item => [item.name, item.value]), [''], ['Data Penjualan per Produk'], ['Produk', 'Jumlah Penjualan'], ...productData.map(item => [item.name, item.value])];
      const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Berhasil",
        description: "Data CSV berhasil diunduh"
      });
    } catch (error) {
      console.error('Error generating CSV:', error);
      toast({
        title: "Error",
        description: "Gagal membuat file CSV",
        variant: "destructive"
      });
    }
  };
  const generateAIInsights = async () => {
    setGeneratingInsights(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('financial-ai-insights', {
        body: {
          summary,
          expenseData,
          productData,
          monthlyData
        }
      });
      if (error) throw error;
      setAiInsights(data.insights);
      toast({
        title: "AI Insights Generated",
        description: "Lihat rekomendasi AI di bawah"
      });
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast({
        title: "Error",
        description: "Gagal menghasilkan insight AI",
        variant: "destructive"
      });
    } finally {
      setGeneratingInsights(false);
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Financial Reports</h1>
          <p className="text-muted-foreground mt-1">Comprehensive business analytics and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateAIInsights} disabled={generatingInsights}>
            <Sparkles className="mr-2 h-4 w-4" />
            {generatingInsights ? 'Generating...' : 'AI Insights'}
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={exportToPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-success-light rounded-lg">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(summary.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-destructive-light rounded-lg">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(summary.totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-light rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(summary.netProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-secondary-light rounded-lg">
                <BarChart3 className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Worth</p>
                <p className={`text-2xl font-bold ${summary.netWorth >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(summary.netWorth)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Distribution of expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseData.length > 0 ? <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" labelLine={false} label={({
                name,
                percent
              }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={value => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer> : <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No expense data available
              </div>}
          </CardContent>
        </Card>

        {/* Product Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Product Sales Distribution</CardTitle>
            <CardDescription>Number of items sold by product type</CardDescription>
          </CardHeader>
          <CardContent>
            {productData.length > 0 ? <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer> : <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No sales data available
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Financial Trends</CardTitle>
          <CardDescription>Revenue, expenses, and profit over time</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={value => formatCurrency(value as number)} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="#ff7300" name="Expenses" />
                <Line type="monotone" dataKey="profit" stroke="#8884d8" name="Profit" />
              </LineChart>
            </ResponsiveContainer> : <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              No monthly data available
            </div>}
        </CardContent>
      </Card>

      {/* Financial Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Health Indicators</CardTitle>
          <CardDescription>Key performance indicators for your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Profit Margin</p>
              <p className="text-xl font-bold">
                {summary.totalRevenue > 0 ? (summary.netProfit / summary.totalRevenue * 100).toFixed(1) : 0}%
              </p>
              <Badge variant={summary.netProfit >= 0 ? "default" : "destructive"}>
                {summary.netProfit >= 0 ? "Profitable" : "Loss Making"}
              </Badge>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Expense Ratio</p>
              <p className="text-xl font-bold">
                {summary.totalRevenue > 0 ? (summary.totalExpenses / summary.totalRevenue * 100).toFixed(1) : 0}%
              </p>
              <Badge variant={summary.totalExpenses / summary.totalRevenue < 0.7 ? "default" : "secondary"}>
                {summary.totalExpenses / summary.totalRevenue < 0.7 ? "Healthy" : "High"}
              </Badge>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Asset Efficiency</p>
              <p className="text-xl font-bold">
                {summary.totalAssets > 0 ? (summary.totalRevenue / summary.totalAssets * 100).toFixed(1) : 0}%
              </p>
              <Badge variant="outline">Revenue to Assets</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {aiInsights && <Card>
          <CardHeader className="bg-fuchsia-500">
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Financial Insights & Recommendations
            </CardTitle>
            <CardDescription className="text-slate-50">AI-generated analysis and suggestions for your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {aiInsights}
              </div>
            </div>
          </CardContent>
        </Card>}
    </div>;
}