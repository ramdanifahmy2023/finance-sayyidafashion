import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MonthYearSelector } from '@/components/ui/month-year-selector';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { Plus } from 'lucide-react';
import { Sale } from '@/types/sales';
import { useSales } from '@/hooks/useSales';
import { SalesForm } from '@/components/sales/SalesForm';
import { SalesTable } from '@/components/sales/SalesTable';

export function SalesManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const { sales, loading, deleteSale } = useSales();
  const { selectedDate, setSelectedDate, formatDisplayMonth } = useDateFilter();

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSale(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSale(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Manajemen Penjualan</h1>
          <p className="text-muted-foreground mt-1">
            Lacak dan kelola penjualan fashion Anda - {formatDisplayMonth(selectedDate)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <MonthYearSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            className="w-64"
          />
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-primary hover:bg-primary-dark"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Penjualan
          </Button>
        </div>
      </div>

      {showForm && (
        <SalesForm
          editingSale={editingSale}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      <SalesTable
        sales={sales}
        onEdit={handleEdit}
        onDelete={deleteSale}
        onAddFirst={() => setShowForm(true)}
      />
    </div>
  );
}