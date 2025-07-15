import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Calendar, Edit, Trash2, ExternalLink } from 'lucide-react';
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
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Calculate pagination
  const totalPages = Math.ceil(sales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = sales.slice(startIndex, endIndex);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Riwayat Penjualan</CardTitle>
          <CardDescription>Menampilkan {currentSales.length} dari {sales.length} transaksi</CardDescription>
        </div>
        <Button onClick={() => navigate('/transactions')} variant="outline" className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Lihat Semua
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tampilkan:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
              {currentSales.map(sale => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}