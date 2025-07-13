
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'sale' | 'expense' | 'loss';
  date: string;
  description: string;
  amount: number;
  category?: string;
}

interface TransactionListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionListModal({ isOpen, onClose }: TransactionListModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const { selectedDate, getMonthRange } = useDateFilter();

  const itemsPerPage = 15;

  const fetchTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const range = getMonthRange(selectedDate);
      
      // Fetch all transaction types
      const [salesResult, expensesResult, lossesResult] = await Promise.all([
        supabase
          .from('sales')
          .select('id, customer_name, product_type, selling_price, transaction_date, description')
          .eq('user_id', user.id)
          .gte('transaction_date', range.startDate)
          .lte('transaction_date', range.endDate),

        supabase
          .from('expenses')
          .select('id, description, category, amount, transaction_date')
          .eq('user_id', user.id)
          .gte('transaction_date', range.startDate)
          .lte('transaction_date', range.endDate),

        supabase
          .from('losses')
          .select('id, description, loss_type, amount, transaction_date')
          .eq('user_id', user.id)
          .gte('transaction_date', range.startDate)
          .lte('transaction_date', range.endDate)
      ]);

      const allTransactions: Transaction[] = [];

      // Process sales
      salesResult.data?.forEach(sale => {
        allTransactions.push({
          id: sale.id,
          type: 'sale',
          date: sale.transaction_date,
          description: `${sale.product_type} - ${sale.customer_name}`,
          amount: sale.selling_price,
        });
      });

      // Process expenses
      expensesResult.data?.forEach(expense => {
        allTransactions.push({
          id: expense.id,
          type: 'expense',
          date: expense.transaction_date,
          description: expense.description || 'Pengeluaran',
          amount: expense.amount,
          category: expense.category
        });
      });

      // Process losses
      lossesResult.data?.forEach(loss => {
        allTransactions.push({
          id: loss.id,
          type: 'loss',
          date: loss.transaction_date,
          description: loss.description,
          amount: loss.amount,
          category: loss.loss_type
        });
      });

      // Apply filters
      let filteredTransactions = allTransactions;

      if (typeFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
      }

      if (searchTerm) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply sorting
      filteredTransactions.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'oldest':
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case 'amount-high':
            return b.amount - a.amount;
          case 'amount-low':
            return a.amount - b.amount;
          default:
            return 0;
        }
      });

      // Calculate pagination
      const totalItems = filteredTransactions.length;
      const pages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(pages);

      // Get current page items
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageTransactions = filteredTransactions.slice(startIndex, endIndex);

      setTransactions(pageTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen, user, selectedDate, searchTerm, typeFilter, sortBy, currentPage]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'sale':
        return <Badge variant="default" className="bg-success text-success-foreground">Penjualan</Badge>;
      case 'expense':
        return <Badge variant="destructive">Pengeluaran</Badge>;
      case 'loss':
        return <Badge variant="secondary" className="bg-warning text-warning-foreground">Kerugian</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Semua Transaksi</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 min-h-0 flex-1">
          {/* Filters */}
          <div className="flex gap-4 items-center flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="sale">Penjualan</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
                <SelectItem value="loss">Kerugian</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
                <SelectItem value="amount-high">Jumlah Tertinggi</SelectItem>
                <SelectItem value="amount-low">Jumlah Terendah</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transaction list - Scrollable Area */}
          <div className="border rounded-lg overflow-hidden flex-1 min-h-0">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Memuat transaksi...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Tidak ada transaksi ditemukan
              </div>
            ) : (
              <div className="max-h-full overflow-y-auto">
                <div className="divide-y">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                      <div className="flex items-center space-x-4">
                        {getTransactionBadge(transaction.type)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString('id-ID')}
                            {transaction.category && (
                              <span className="ml-2 px-2 py-1 bg-muted rounded text-xs">
                                {transaction.category}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        transaction.type === 'sale' ? 'text-success' : 'text-destructive'
                      }`}>
                        {transaction.type === 'sale' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between flex-shrink-0 pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
