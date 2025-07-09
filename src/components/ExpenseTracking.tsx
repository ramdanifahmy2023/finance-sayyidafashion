import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useExpenses } from '@/hooks/useExpenses';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { Plus, Edit, Trash2, Receipt } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';
interface Expense {
  id: string;
  transaction_date: string;
  category: string;
  amount: number;
  description?: string;
}

export function ExpenseTracking() {
  const { expenses, loading, deleteExpense } = useExpenses();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showForm, setShowForm] = useState(false);
  const resetForm = () => {
    setEditingExpense(null);
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    if (editingExpense) {
      resetForm();
    } else {
      // Keep form open for adding more expenses
      setShowForm(true);
    }
  };
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };
  const formatCategory = (category: string) => {
    switch (category) {
      case 'lakban':
        return 'Lakban';
      case 'plastik_packing':
        return 'Plastik Packing';
      case 'operasional':
        return 'Operasional';
      case 'gaji':
        return 'Gaji';
      case 'transportasi':
        return 'Transportasi';
      case 'dll':
        return 'Lainnya';
      default:
        return category;
    }
  };
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lakban':
        return 'bg-blue-100 text-blue-800';
      case 'plastik_packing':
        return 'bg-green-100 text-green-800';
      case 'operasional':
        return 'bg-orange-100 text-orange-800';
      case 'gaji':
        return 'bg-purple-100 text-purple-800';
      case 'transportasi':
        return 'bg-yellow-100 text-yellow-800';
      case 'dll':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  if (loading) {
    return <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Expense Tracking</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your business expenses</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary-dark">
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-destructive-light rounded-lg">
              <Receipt className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses This Month</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <ExpenseForm
          editingExpense={editingExpense}
          onSuccess={handleFormSuccess}
          onCancel={resetForm}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Expense History</CardTitle>
          <CardDescription>All your recorded business expenses</CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No expenses recorded yet</p>
              <Button onClick={() => setShowForm(true)} variant="outline" className="mt-4">
                Add Your First Expense
              </Button>
            </div> : <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map(expense => <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.transaction_date).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(expense.category)}>
                          {formatCategory(expense.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-destructive">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {expense.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(expense)} className="text-sky-700">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteExpense(expense.id)} className="text-rose-600">
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