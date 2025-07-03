import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';

interface Sale {
  id: string;
  transaction_date: string;
  customer_name: string;
  product_type: string;
  purchase_price: number;
  selling_price: number;
  marketplace_fee: number;
  payment_method: string;
  description?: string;
  gross_margin: number;
}

const PRODUCT_TYPES = [
  'rajut', 'celana', 'kaos', 'hoodie', 'dress', 'rok', 'jeans', 
  'jaket', 'sweater', 'kemeja', 'kulot', 'vest', 'pl_pribadi', 'set', 'lainnya'
];

const PAYMENT_METHODS = [
  'full_payment', 'bayar_ongkir_di_tempat', 'split_payment_shopee', 
  'offline', 'cod', 'cash'
];

export function SalesManagement() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    customer_name: '',
    product_type: '',
    purchase_price: '',
    selling_price: '',
    marketplace_fee: '0',
    payment_method: '',
    description: ''
  });

  useEffect(() => {
    if (user) {
      loadSales();
    }
  }, [user]);

  const loadSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setSales(data || []);
    } catch (error) {
      console.error('Error loading sales:', error);
      toast({
        title: "Error",
        description: "Failed to load sales data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      transaction_date: new Date().toISOString().split('T')[0],
      customer_name: '',
      product_type: '',
      purchase_price: '',
      selling_price: '',
      marketplace_fee: '0',
      payment_method: '',
      description: ''
    });
    setEditingSale(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const saleData = {
        transaction_date: formData.transaction_date,
        customer_name: formData.customer_name,
        product_type: formData.product_type,
        purchase_price: parseFloat(formData.purchase_price),
        selling_price: parseFloat(formData.selling_price),
        marketplace_fee: parseFloat(formData.marketplace_fee),
        payment_method: formData.payment_method,
        description: formData.description || null,
        user_id: user.id
      };

      if (editingSale) {
        const { error } = await supabase
          .from('sales')
          .update(saleData)
          .eq('id', editingSale.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Sale updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('sales')
          .insert([saleData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Sale added successfully"
        });
      }

      resetForm();
      loadSales();
    } catch (error: any) {
      console.error('Error saving sale:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save sale",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (sale: Sale) => {
    setFormData({
      transaction_date: sale.transaction_date,
      customer_name: sale.customer_name,
      product_type: sale.product_type,
      purchase_price: sale.purchase_price.toString(),
      selling_price: sale.selling_price.toString(),
      marketplace_fee: sale.marketplace_fee.toString(),
      payment_method: sale.payment_method,
      description: sale.description || ''
    });
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sale deleted successfully"
      });
      
      loadSales();
    } catch (error: any) {
      console.error('Error deleting sale:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete sale",
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

  const formatProductType = (type: string) => {
    return type.replace('_', ' ').toUpperCase();
  };

  const formatPaymentMethod = (method: string) => {
    return method.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Manajemen Penjualan</h1>
          <p className="text-muted-foreground mt-1">Lacak dan kelola penjualan fashion Anda</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="bg-primary hover:bg-primary-dark"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Penjualan
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSale ? 'Edit Penjualan' : 'Tambah Penjualan Baru'}</CardTitle>
            <CardDescription>
              {editingSale ? 'Perbarui informasi penjualan' : 'Masukkan detail penjualan di bawah'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transaction_date">Tanggal Transaksi</Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_name">Nama Pelanggan</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    placeholder="Masukkan nama pelanggan"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_type">Jenis Produk</Label>
                  <Select 
                    value={formData.product_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, product_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis produk" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {formatProductType(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method">Metode Pembayaran</Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih metode pembayaran" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {formatPaymentMethod(method)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchase_price">Harga Beli (IDR)</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: e.target.value }))}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="selling_price">Harga Jual (IDR)</Label>
                  <Input
                    id="selling_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, selling_price: e.target.value }))}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marketplace_fee">Biaya Marketplace (IDR)</Label>
                  <Input
                    id="marketplace_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.marketplace_fee}
                    onChange={(e) => setFormData(prev => ({ ...prev, marketplace_fee: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Deskripsi (Opsional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Catatan tambahan..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : (editingSale ? 'Perbarui Penjualan' : 'Tambah Penjualan')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Penjualan</CardTitle>
          <CardDescription>Semua transaksi penjualan yang tercatat</CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada penjualan yang tercatat</p>
              <Button 
                onClick={() => setShowForm(true)} 
                variant="outline" 
                className="mt-4"
              >
                Tambah Penjualan Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Harga Beli</TableHead>
                    <TableHead>Harga Jual</TableHead>
                    <TableHead>Biaya Marketplace</TableHead>
                    <TableHead>Margin Kotor</TableHead>
                    <TableHead>Pembayaran</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{new Date(sale.transaction_date).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="font-medium">{sale.customer_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{formatProductType(sale.product_type)}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(sale.purchase_price)}</TableCell>
                      <TableCell>{formatCurrency(sale.selling_price)}</TableCell>
                      <TableCell>{formatCurrency(sale.marketplace_fee)}</TableCell>
                      <TableCell>
                        <span className={sale.gross_margin >= 0 ? 'text-success' : 'text-destructive'}>
                          {formatCurrency(sale.gross_margin)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{formatPaymentMethod(sale.payment_method)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(sale)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(sale.id)}
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