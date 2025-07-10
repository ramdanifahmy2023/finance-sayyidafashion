export interface Expense {
  id: string;
  transaction_date: string;
  category: string;
  amount: number;
  description?: string;
}