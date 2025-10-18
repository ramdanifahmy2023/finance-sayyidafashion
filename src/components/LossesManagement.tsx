import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLosses } from '@/hooks/useLosses';
import { LossForm } from '@/components/losses/LossForm';
import { Plus, Edit, Trash2, TrendingDown, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';
import { Loss } from '@/types/loss';

export function LossesManagement() {
  const { losses, loading, deleteLoss } = useLosses();
  const [editingLoss, setEditingLoss] = useState<Loss | null>(null);
  const [showForm, setShowForm] = useState(false);

  const resetForm = () => {
    setEditingLoss(null);
    setShowForm(false);
  };

  const handleFormSuccess = () => {
    if (editingLoss) {
      resetForm();
    } else {
      // Keep form open for adding more losses
      setShowForm(true);
    }
  };

  const handleEdit = (loss: Loss) => {
    setEditingLoss(loss);
    setShowForm(true);
  };

  // Calculate total losses
  const totalLosses = losses.reduce((sum, loss) => sum + loss.amount, 0);
  if (loading) {
    return <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Loss Management</h1>
          <p className="text-muted-foreground mt-1">Track and record business losses</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary-dark">
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
        <LossForm
          editingLoss={editingLoss}
          onSuccess={handleFormSuccess}
          onCancel={resetForm}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Loss History</CardTitle>
          <CardDescription>All recorded business losses</CardDescription>
        </CardHeader>
        <CardContent>
          {losses.length === 0 ? <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No losses recorded yet</p>
              <p className="text-sm text-muted-foreground mt-2">Hopefully it stays that way!</p>
            </div> : <div className="overflow-x-auto">
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
                  {losses.map(loss => <TableRow key={loss.id}>
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
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(loss)} className="text-sky-700">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteLoss(loss.id)} className="text-rose-600">
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