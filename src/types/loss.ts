export interface Loss {
  id: string;
  transaction_date: string;
  loss_type: string;
  amount: number;
  description?: string;
}