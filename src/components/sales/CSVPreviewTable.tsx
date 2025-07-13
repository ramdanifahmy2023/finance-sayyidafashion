import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatProductType, formatPaymentMethod } from '@/utils/salesFormatters';
import { type CSVRow, type ValidationResult } from '@/utils/csvSalesUtils';

interface CSVPreviewTableProps {
  data: CSVRow[];
  validations: ValidationResult[];
}

export function CSVPreviewTable({ data, validations }: CSVPreviewTableProps) {
  const getStatusIcon = (validation: ValidationResult) => {
    if (validation.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = (validation: ValidationResult) => {
    if (validation.isValid) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Valid</Badge>;
    }
    return <Badge variant="destructive">Invalid</Badge>;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Status</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Pelanggan</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Harga Beli</TableHead>
            <TableHead>Harga Jual</TableHead>
            <TableHead>Fee</TableHead>
            <TableHead>Pembayaran</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Errors</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            const validation = validations[index];
            return (
              <TableRow key={index} className={validation?.isValid ? '' : 'bg-red-50'}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(validation)}
                    {getStatusBadge(validation)}
                  </div>
                </TableCell>
                <TableCell>
                  {row.transaction_date ? new Date(row.transaction_date).toLocaleDateString('id-ID') : '-'}
                </TableCell>
                <TableCell className="max-w-32 truncate">
                  {row.customer_name || '-'}
                </TableCell>
                <TableCell>
                  {row.product_type ? formatProductType(row.product_type) : '-'}
                </TableCell>
                <TableCell>
                  {row.purchase_price ? formatCurrency(parseFloat(row.purchase_price)) : '-'}
                </TableCell>
                <TableCell>
                  {row.selling_price ? formatCurrency(parseFloat(row.selling_price)) : '-'}
                </TableCell>
                <TableCell>
                  {row.marketplace_fee ? formatCurrency(parseFloat(row.marketplace_fee)) : '0'}
                </TableCell>
                <TableCell>
                  {row.payment_method ? formatPaymentMethod(row.payment_method) : '-'}
                </TableCell>
                <TableCell className="max-w-32 truncate">
                  {row.description || '-'}
                </TableCell>
                <TableCell>
                  {validation?.errors && validation.errors.length > 0 && (
                    <div className="space-y-1">
                      {validation.errors.map((error, errorIndex) => (
                        <div key={errorIndex} className="flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span>{error}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}