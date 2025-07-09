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
import { Sale, SaleFormData, PRODUCT_TYPES, PAYMENT_METHODS } from '@/types/sales';
import { formatProductType, formatPaymentMethod } from '@/utils/salesFormatters';
import { validateAmount } from '@/utils/currencyFormatter';

interface SalesFormProps {
  editingSale: Sale | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SalesForm({ editingSale, onSuccess, onCancel }: SalesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState<SaleFormData>({
    transaction_date: editingSale?.transaction_date || new Date().toISOString().split('T')[0],
    customer_name: editingSale?.customer_name || '',
    product_type: editingSale?.product_type || '',
    purchase_price: editingSale?.purchase_price.toString() || '',
    selling_price: editingSale?.selling_price.toString() || '',
    marketplace_fee: editingSale?.marketplace_fee.toString() || '0',
    payment_method: editingSale?.payment_method || '',
    description: editingSale?.description || ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form validation function
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      errors.customer_name = 'Nama pelanggan wajib diisi';
    }

    if (!formData.product_type) {
      errors.product_type = 'Jenis produk wajib dipilih';
    }

    if (!formData.payment_method) {
      errors.payment_method = 'Metode pembayaran wajib dipilih';
    }

    const purchasePriceError = validateAmount(formData.purchase_price, 'Harga beli');
    if (purchasePriceError) {
      errors.purchase_price = purchasePriceError;
    }

    const sellingPriceError = validateAmount(formData.selling_price, 'Harga jual');
    if (sellingPriceError) {
      errors.selling_price = sellingPriceError;
    }

    if (formData.marketplace_fee) {
      const marketplaceFeeError = validateAmount(formData.marketplace_fee, 'Biaya marketplace');
      if (marketplaceFeeError) {
        errors.marketplace_fee = marketplaceFeeError;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

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
          title: "Berhasil",
          description: "Penjualan berhasil diperbarui"
        });
      } else {
        const { error } = await supabase
          .from('sales')
          .insert([saleData]);

        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Penjualan berhasil ditambahkan"
        });
      }

      // Reset form for new entries but keep it open
      if (!editingSale) {
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
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving sale:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan penjualan",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingSale ? 'Edit Penjualan' : 'Tambah Penjualan Baru'}</CardTitle>
        <CardDescription>
          {editingSale ? 'Perbarui informasi penjualan' : 'Masukkan detail penjualan di bawah'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                className={formErrors.customer_name ? 'border-destructive' : ''}
              />
              {formErrors.customer_name && (
                <p className="text-sm text-destructive">{formErrors.customer_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_type">Jenis Produk</Label>
              <Select 
                value={formData.product_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, product_type: value }))}
              >
                <SelectTrigger className={formErrors.product_type ? 'border-destructive' : ''}>
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
              {formErrors.product_type && (
                <p className="text-sm text-destructive">{formErrors.product_type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Metode Pembayaran</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
              >
                <SelectTrigger className={formErrors.payment_method ? 'border-destructive' : ''}>
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
              {formErrors.payment_method && (
                <p className="text-sm text-destructive">{formErrors.payment_method}</p>
              )}
            </div>

            <IDRInput
              label="Harga Beli (IDR)"
              value={formData.purchase_price}
              onChange={(value) => setFormData(prev => ({ ...prev, purchase_price: value }))}
              placeholder="Masukkan harga beli"
              required
              error={formErrors.purchase_price}
            />

            <IDRInput
              label="Harga Jual (IDR)"
              value={formData.selling_price}
              onChange={(value) => setFormData(prev => ({ ...prev, selling_price: value }))}
              placeholder="Masukkan harga jual"
              required
              error={formErrors.selling_price}
            />

            <IDRInput
              label="Biaya Marketplace (IDR)"
              value={formData.marketplace_fee}
              onChange={(value) => setFormData(prev => ({ ...prev, marketplace_fee: value }))}
              placeholder="0"
              error={formErrors.marketplace_fee}
            />

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
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Menyimpan...' : (editingSale ? 'Perbarui Penjualan' : 'Tambah Penjualan')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}