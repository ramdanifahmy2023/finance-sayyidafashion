import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MonthYearSelector } from '@/components/ui/month-year-selector';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { Plus, Search, X, Calendar, Filter, Upload, Download } from 'lucide-react';
import { Sale } from '@/types/sales';
import { useSales } from '@/hooks/useSales';
import { SalesForm } from '@/components/sales/SalesForm';
import { SalesTable } from '@/components/sales/SalesTable';
import { CSVImportDialog } from '@/components/sales/CSVImportDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatProductType, formatPaymentMethod } from '@/utils/salesFormatters';
export function SalesManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null
  });
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const {
    sales,
    loading,
    deleteSale
  } = useSales();
  const {
    selectedDate,
    setSelectedDate,
    formatDisplayMonth
  } = useDateFilter();

  // Quick filter functions
  const setQuickFilter = (filterType: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    setActiveQuickFilter(filterType);
    switch (filterType) {
      case 'today':
        setDateRange({
          from: today,
          to: today
        });
        break;
      case 'yesterday':
        setDateRange({
          from: yesterday,
          to: yesterday
        });
        break;
      case 'last7days':
        setDateRange({
          from: lastWeek,
          to: today
        });
        break;
      case 'thisMonth':
        setDateRange({
          from: thisMonthStart,
          to: today
        });
        break;
      case 'lastMonth':
        setDateRange({
          from: lastMonthStart,
          to: lastMonthEnd
        });
        break;
      default:
        break;
    }
  };
  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({
      from: null,
      to: null
    });
    setActiveQuickFilter(null);
  };

  // Filter sales based on search and date range
  const filteredSales = useMemo(() => {
    let filtered = [...sales];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(sale => sale.customer_name.toLowerCase().includes(searchLower) || formatProductType(sale.product_type).toLowerCase().includes(searchLower) || formatPaymentMethod(sale.payment_method).toLowerCase().includes(searchLower));
    }

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.transaction_date);
        const from = dateRange.from ? new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate()) : null;
        const to = dateRange.to ? new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate(), 23, 59, 59) : null;
        if (from && saleDate < from) return false;
        if (to && saleDate > to) return false;
        return true;
      });
    }
    return filtered;
  }, [sales, searchTerm, dateRange]);
  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setShowForm(true);
  };
  const handleFormSuccess = () => {
    if (editingSale) {
      setShowForm(false);
      setEditingSale(null);
    } else {
      // Keep form open for adding more sales
      setShowForm(true);
    }
  };
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSale(null);
  };

  const handleCSVImportSuccess = () => {
    setShowCSVImport(false);
    // Data will auto-refresh via real-time subscription in useSales
  };
  if (loading) {
    return <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Manajemen Penjualan</h1>
          <p className="text-muted-foreground mt-1">
            Lacak dan kelola penjualan fashion Anda - {formatDisplayMonth(selectedDate)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <MonthYearSelector selectedDate={selectedDate} onDateChange={setSelectedDate} className="w-64" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCSVImport(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary-dark">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Penjualan
            </Button>
          </div>
        </div>
      </div>

      {showForm && <SalesForm editingSale={editingSale} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />}

      {/* Search and Filter Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Cari berdasarkan pelanggan, produk, atau metode pembayaran..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-10 bg-rose-50" />
                {searchTerm && <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')} className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>}
              </div>
              {(searchTerm || dateRange.from || dateRange.to) && <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Reset Filter
                </Button>}
            </div>

            {/* Quick Date Filters */}
            <div className="flex flex-wrap gap-2">
              <Button variant={activeQuickFilter === 'today' ? 'default' : 'outline'} size="sm" onClick={() => setQuickFilter('today')}>
                Hari Ini
              </Button>
              <Button variant={activeQuickFilter === 'yesterday' ? 'default' : 'outline'} size="sm" onClick={() => setQuickFilter('yesterday')}>
                Kemarin
              </Button>
              <Button variant={activeQuickFilter === 'last7days' ? 'default' : 'outline'} size="sm" onClick={() => setQuickFilter('last7days')}>
                7 Hari Terakhir
              </Button>
              <Button variant={activeQuickFilter === 'thisMonth' ? 'default' : 'outline'} size="sm" onClick={() => setQuickFilter('thisMonth')}>
                Bulan Ini
              </Button>
              <Button variant={activeQuickFilter === 'lastMonth' ? 'default' : 'outline'} size="sm" onClick={() => setQuickFilter('lastMonth')}>
                Bulan Lalu
              </Button>
            </div>

            {/* Active Filters Display */}
            {(searchTerm || dateRange.from || dateRange.to) && <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-sm text-muted-foreground">Filter aktif:</span>
                {searchTerm && <Badge variant="secondary" className="flex items-center gap-1">
                    <Search className="h-3 w-3" />
                    Pencarian: "{searchTerm}"
                    <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')} className="h-auto p-0 ml-1">
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>}
                {(dateRange.from || dateRange.to) && <Badge variant="secondary" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {dateRange.from && dateRange.to && dateRange.from.toDateString() === dateRange.to.toDateString() ? `Tanggal: ${dateRange.from.toLocaleDateString('id-ID')}` : `${dateRange.from?.toLocaleDateString('id-ID') || ''} - ${dateRange.to?.toLocaleDateString('id-ID') || ''}`}
                    <Button variant="ghost" size="sm" onClick={() => {
                setDateRange({
                  from: null,
                  to: null
                });
                setActiveQuickFilter(null);
              }} className="h-auto p-0 ml-1">
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>}
              </div>}

            {/* Results Count */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                Menampilkan {filteredSales.length} dari {sales.length} transaksi
              </span>
              {filteredSales.length === 0 && sales.length > 0 && <span className="text-orange-600">Tidak ada data yang sesuai dengan filter</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      <SalesTable sales={filteredSales} onEdit={handleEdit} onDelete={deleteSale} onAddFirst={() => setShowForm(true)} />
      
      <CSVImportDialog 
        open={showCSVImport}
        onOpenChange={setShowCSVImport}
        onSuccess={handleCSVImportSuccess}
      />
    </div>;
}