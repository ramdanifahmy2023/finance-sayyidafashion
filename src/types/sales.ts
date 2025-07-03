export interface Sale {
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

export interface SaleFormData {
  transaction_date: string;
  customer_name: string;
  product_type: string;
  purchase_price: string;
  selling_price: string;
  marketplace_fee: string;
  payment_method: string;
  description: string;
}

export const PRODUCT_TYPES = [
  'rajut', 'celana', 'kaos', 'hoodie', 'dress', 'rok', 'jeans', 
  'jaket', 'sweater', 'kemeja', 'kulot', 'vest', 'pl_pribadi', 'set', 'lainnya'
];

export const PAYMENT_METHODS = [
  'full_payment', 'bayar_ongkir_di_tempat', 'split_payment_shopee', 
  'offline', 'cod', 'cash'
];