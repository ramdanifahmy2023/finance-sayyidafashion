import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IDRInput } from '@/components/ui/idr-input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface Expense {
  id: string;
  transaction_date: string;
  category: string;
  amount: number;
  description?: string;
}

interface ExpenseFormProps {
  editingExpense: Expense | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const EXPENSE_CATEGORIES = ['lakban', 'plastik_packing', 'operasional', 'gaji', 'transportasi', 'dll'];

const formatCategory = (category: string) => {
  switch (category) {
    case 'lakban': return 'Lakban';
    case 'plastik_packing': return 'Plastik Packing';
    case 'operasional': return 'Operasional';
    case 'gaji': return 'Gaji';
    case 'transportasi': return 'Transportasi';
    case 'dll': return 'Lainnya';
    default: return category;
  }
};

export function ExpenseForm({ editingExpense, onSuccess, onCancel }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    transaction_date: editingExpense?.transaction_date || new Date().toISOString().split('T')[0],
    category: editingExpense?.category || '',
    amount: editingExpense?.amount.toString() || '',
    description: editingExpense?.description || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const expenseData = {
        transaction_date: formData.transaction_date,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description || null,
        user_id: user.id
      };

      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', editingExpense.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Expense updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([expenseData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Expense added successfully"
        });
      }

      // Reset form for new entries
      if (!editingExpense) {
        setFormData({
          transaction_date: new Date().toISOString().split('T')[0],
          category: '',
          amount: '',
          description: ''
        });
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving expense:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save expense",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</CardTitle>
        <CardDescription>
          {editingExpense ? 'Update expense information' : 'Enter expense details below'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_date">Transaction Date</Label>
              <Input
                id="transaction_date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select expense category" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg z-50">
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {formatCategory(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <IDRInput
              label="Amount (IDR)"
              value={formData.amount}
              onChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
              placeholder="Enter expense amount"
              required
            />

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional notes about this expense..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Add Expense')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}