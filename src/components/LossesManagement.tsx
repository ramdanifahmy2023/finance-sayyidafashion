import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { IDRInput } from '@/components/ui/idr-input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, Trash2, TrendingDown, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';

interface Loss {
  id: string;
  transaction_date: string;
  loss_type: string;
  amount: number;
  description: string;
}

export function LossesManagement() {
  const [losses, setLosses] = useState<Loss[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLoss, setEditingLoss] = useState<Loss | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    loss_type: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      loadLosses();
    }
  }, [user]);

  const loadLosses = async () => {
    try {
      const { data, error } = await supabase
        .from('losses')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setLosses(data || []);
    } catch (error) {
      console.error('Error loading losses:', error);
      toast({
        title: "Error",
        description: "Failed to load losses data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      transaction_date: new Date().toISOString().split('T')[0],
      loss_type: '',
      amount: '',
      description: ''
    });
    setEditingLoss(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const lossData = {
        transaction_date: formData.transaction_date,
        loss_type: formData.loss_type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        user_id: user.id
      };

      if (editingLoss) {
        const { error } = await supabase
          .from('losses')
          .update(lossData)
          .eq('id', editingLoss.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Loss updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('losses')
          .insert([lossData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Loss recorded successfully"
        });
      }

      resetForm();
      loadLosses();
    } catch (error: any) {
      console.error('Error saving loss:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save loss",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (loss: Loss) => {
    setFormData({
      transaction_date: loss.transaction_date,
      loss_type: loss.loss_type,
      amount: loss.amount.toString(),
      description: loss.description
    });
    setEditingLoss(loss);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this loss record?')) return;

    try {
      const { error } = await supabase
        .from('losses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Loss deleted successfully"
      });
      
      loadLosses();
    } catch (error: any) {
      console.error('Error deleting loss:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete loss",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calculate total losses
  const totalLosses = losses.reduce((sum, loss) => sum + loss.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Loss Management</h1>
          <p className="text-muted-foreground mt-1">Track and record business losses</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="bg-primary hover:bg-primary-dark"
        >
          <Plus className="mr-2 h-4 w-4" />
          Record Loss
        </Button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-destructive-light rounded-lg">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Losses This Month</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(totalLosses)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingLoss ? 'Edit Loss Record' : 'Record New Loss'}</CardTitle>
            <CardDescription>
              {editingLoss ? 'Update loss information' : 'Enter loss details below'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction_date">Date</Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loss_type">Loss Type</Label>
                  <Input
                    id="loss_type"
                    value={formData.loss_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, loss_type: e.target.value }))}
                    placeholder="e.g., Damaged goods, Theft, Return"
                    required
                  />
                </div>

                <IDRInput
                  label="Nilai Kerugian (IDR)"
                  value={formData.amount}
                  onChange={(value) => setFormData(prev => ({ ...prev, amount: value }))}
                  placeholder="Masukkan nilai kerugian"
                  required
                />

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the loss incident..."
                    rows={3}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingLoss ? 'Update Loss' : 'Record Loss')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Loss History</CardTitle>
          <CardDescription>All recorded business losses</CardDescription>
        </CardHeader>
        <CardContent>
          {losses.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No losses recorded yet</p>
              <p className="text-sm text-muted-foreground mt-2">Hopefully it stays that way!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Loss Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {losses.map((loss) => (
                    <TableRow key={loss.id}>
                      <TableCell>{new Date(loss.transaction_date).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="font-medium">{loss.loss_type}</TableCell>
                      <TableCell className="font-medium text-destructive">
                        {formatCurrency(loss.amount)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {loss.description}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(loss)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(loss.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}