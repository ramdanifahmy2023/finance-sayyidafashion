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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <CardTitle>Riwayat Penjualan</CardTitle>
          <CardDescription>
            Menampilkan {currentSales.length} dari {sales.length} transaksi
          </CardDescription>
        </div>
        <Button 
          onClick={() => navigate('/transactions')} 
          variant="outline" 
          size="sm"
          className="gap-2 w-fit"
        >
          <ExternalLink className="h-4 w-4" />
          Lihat Semua
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tampilkan:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-md z-50">
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="40">40</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">data</span>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                  <TableHead className="whitespace-nowrap">Pelanggan</TableHead>
                  <TableHead className="whitespace-nowrap">Produk</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Harga Beli</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Harga Jual</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Biaya Marketplace</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Margin Kotor</TableHead>
                  <TableHead className="whitespace-nowrap">Pembayaran</TableHead>
                  <TableHead className="whitespace-nowrap text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {new Date(sale.transaction_date).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="font-medium">{sale.customer_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatProductType(sale.product_type)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.purchase_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.selling_price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.marketplace_fee)}</TableCell>
                    <TableCell className="text-right">
                      <span className={sale.gross_margin >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {formatCurrency(sale.gross_margin)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{formatPaymentMethod(sale.payment_method)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => onEdit(sale)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => onDelete(sale.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={
                      currentPage === 1 
                        ? 'pointer-events-none opacity-50' 
                        : 'cursor-pointer hover:bg-muted'
                    }
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer hover:bg-muted"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={
                      currentPage === totalPages 
                        ? 'pointer-events-none opacity-50' 
                        : 'cursor-pointer hover:bg-muted'
                    }
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