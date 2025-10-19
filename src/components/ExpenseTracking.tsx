import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { Plus, Edit, Trash2, Receipt, Search } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';
import { Expense } from '@/types/expense';
import { formatCategory, getCategoryColor } from '@/utils/expenseUtils';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { MonthYearSelector } from './ui/month-year-selector';

export function ExpenseTracking() {
  const { expenses, loading, deleteExpense } = useExpenses();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { selectedDate, setSelectedDate, formatDisplayMonth } = useDateFilter();

  const resetForm = () => {
    setEditingExpense(null);
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    if (editingExpense) {
      resetForm();
    }
    // Data will refresh automatically from the hook
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const filteredExpenses = useMemo(() => {
    if (!searchTerm) {
      return expenses;
    }
    const searchLower = searchTerm.toLowerCase();
    return expenses.filter(expense =>
      expense.description?.toLowerCase().includes(searchLower) ||
      formatCategory(expense.category).toLowerCase().includes(searchLower)
    );
  }, [expenses, searchTerm]);

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading && expenses.length === 0) {
    return <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }

  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Lacak Pengeluaran</h1>
          <p className="text-muted-foreground mt-1">
            Kelola pengeluaran bisnis Anda untuk periode {formatDisplayMonth(selectedDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MonthYearSelector selectedDate={selectedDate} onDateChange={setSelectedDate} className="w-52" />
          <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary-dark">
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>
      </div>
      
      {showForm && (
        <ExpenseForm
          editingExpense={editingExpense}
          onSuccess={handleFormSuccess}
          onCancel={resetForm}
        />
      )}

      {/* Summary & Search Card */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-destructive-light rounded-lg">
                <Receipt className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pengeluaran ({formatDisplayMonth(selectedDate)})</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan deskripsi atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pengeluaran</CardTitle>
          <CardDescription>
            Menampilkan {filteredExpenses.length} dari {expenses.length} data pengeluaran untuk periode ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Tidak ada pengeluaran yang cocok dengan pencarian Anda.' : 'Belum ada pengeluaran yang tercatat untuk periode ini.'}
              </p>
              <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4">
                Tambah Pengeluaran Pertama
              </Button>
            </div> : <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map(expense => <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.transaction_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(expense.category)}>
                          {formatCategory(expense.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-destructive text-right">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {expense.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(expense)} className="h-8 w-8 text-sky-700">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteExpense(expense.id)} className="h-8 w-8 text-rose-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>}
        </CardContent>
      </Card>
    </div>;
}
