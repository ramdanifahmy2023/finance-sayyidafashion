import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useLosses } from '@/hooks/useLosses';
import { LossForm } from '@/components/losses/LossForm';
import { Plus, Edit, Trash2, ShieldX, Search } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';
import { Loss } from '@/types/loss';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { MonthYearSelector } from './ui/month-year-selector';

export function LossesManagement() {
  const { losses, loading, deleteLoss } = useLosses();
  const [editingLoss, setEditingLoss] = useState<Loss | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { selectedDate, setSelectedDate, formatDisplayMonth } = useDateFilter();

  const resetForm = () => {
    setEditingLoss(null);
    setShowForm(false);
  };

  const handleEdit = (loss: Loss) => {
    setEditingLoss(loss);
    setShowForm(true);
  };

  const filteredLosses = useMemo(() => {
    if (!Array.isArray(losses)) {
      return [];
    }
    return losses.filter(loss => {
      const searchLower = searchTerm.toLowerCase();
      const lossTypeText = (loss.loss_type || '').replace('_', ' ').toLowerCase();
      const descriptionText = (loss.description || '').toLowerCase();
      
      return descriptionText.includes(searchLower) || lossTypeText.includes(searchLower);
    });
  }, [losses, searchTerm]);

  const totalLosses = useMemo(() => {
    return filteredLosses.reduce((sum, loss) => sum + (loss.amount || 0), 0);
  }, [filteredLosses]);

  const formatLossType = (lossType: string | null | undefined) => {
    if (!lossType) {
      return 'Tanpa Kategori';
    }
    return lossType.replace('_', ' ');
  };

  if (loading && (!losses || losses.length === 0)) {
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
          <h1 className="text-3xl font-display font-bold text-foreground">Manajemen Kerugian</h1>
          <p className="text-muted-foreground mt-1">
            Kelola kerugian bisnis Anda untuk periode {formatDisplayMonth(selectedDate)}
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
        <LossForm
          editingLoss={editingLoss}
          onSuccess={resetForm}
          onCancel={resetForm}
        />
      )}

      {/* Summary & Search Card */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-warning-light rounded-lg">
              <ShieldX className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Kerugian ({formatDisplayMonth(selectedDate)})</p>
              <p className="text-2xl font-bold text-warning">{formatCurrency(totalLosses)}</p>
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
          <CardTitle>Riwayat Kerugian</CardTitle>
          <CardDescription>
            Menampilkan {filteredLosses.length} dari {losses.length || 0} data kerugian untuk periode ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                {filteredLosses.length > 0 ? (
                  filteredLosses.map(loss => (
                    <TableRow key={loss.id}>
                      <TableCell>{new Date(loss.transaction_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell>
                        <Badge variant="destructive" className="capitalize">
                          {formatLossType(loss.loss_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-warning text-right">
                        {formatCurrency(loss.amount)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {loss.description || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(loss)} className="h-8 w-8 text-sky-700">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteLoss(loss.id)} className="h-8 w-8 text-rose-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {searchTerm 
                        ? 'Tidak ada kerugian yang cocok dengan pencarian Anda.' 
                        : 'Belum ada kerugian yang tercatat untuk periode ini.'
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
