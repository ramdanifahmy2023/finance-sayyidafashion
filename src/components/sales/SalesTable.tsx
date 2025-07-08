import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { Sale } from '@/types/sales';
import { formatCurrency, formatProductType, formatPaymentMethod } from '@/utils/salesFormatters';
interface SalesTableProps {
  sales: Sale[];
  onEdit: (sale: Sale) => void;
  onDelete: (id: string) => void;
  onAddFirst: () => void;
}
export function SalesTable({
  sales,
  onEdit,
  onDelete,
  onAddFirst
}: SalesTableProps) {
  if (sales.length === 0) {
    return <Card>
        <CardHeader>
          <CardTitle>Riwayat Penjualan</CardTitle>
          <CardDescription>Semua transaksi penjualan yang tercatat</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Belum ada penjualan yang tercatat</p>
            <Button onClick={onAddFirst} variant="outline" className="mt-4">
              Tambah Penjualan Pertama
            </Button>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <CardTitle>Riwayat Penjualan</CardTitle>
        <CardDescription>Semua transaksi penjualan yang tercatat</CardDescription>
      </CardHeader>
      <CardContent>
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
              {sales.map(sale => <TableRow key={sale.id}>
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
                    <Badge variant="secondary" className="font-medium">{formatPaymentMethod(sale.payment_method)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => onEdit(sale)} className="text-sky-700">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onDelete(sale.id)} className="text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>;
}