import { PRODUCT_TYPES, PAYMENT_METHODS } from '@/types/sales';

export interface CSVRow {
  transaction_date: string;
  customer_name: string;
  product_type: string;
  purchase_price: string;
  selling_price: string;
  marketplace_fee: string;
  payment_method: string;
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function parseCSVData(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Expected headers
  const expectedHeaders = [
    'transaction_date',
    'customer_name', 
    'product_type',
    'purchase_price',
    'selling_price',
    'marketplace_fee',
    'payment_method',
    'description'
  ];

  // Validate headers
  const headerMap: Record<string, number> = {};
  expectedHeaders.forEach(header => {
    const index = headers.findIndex(h => h.toLowerCase() === header.toLowerCase());
    if (index !== -1) {
      headerMap[header] = index;
    }
  });

  const data: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    
    const row: CSVRow = {
      transaction_date: values[headerMap.transaction_date] || '',
      customer_name: values[headerMap.customer_name] || '',
      product_type: values[headerMap.product_type] || '',
      purchase_price: values[headerMap.purchase_price] || '',
      selling_price: values[headerMap.selling_price] || '',
      marketplace_fee: values[headerMap.marketplace_fee] || '0',
      payment_method: values[headerMap.payment_method] || '',
      description: values[headerMap.description] || ''
    };
    
    data.push(row);
  }
  
  return data;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export function validateCSVData(data: CSVRow[]): ValidationResult[] {
  return data.map(row => validateRow(row));
}

function validateRow(row: CSVRow): ValidationResult {
  const errors: string[] = [];

  // Validate transaction_date
  if (!row.transaction_date) {
    errors.push('Tanggal transaksi wajib diisi');
  } else {
    const date = new Date(row.transaction_date);
    if (isNaN(date.getTime())) {
      errors.push('Format tanggal tidak valid (gunakan YYYY-MM-DD)');
    }
  }

  // Validate customer_name
  if (!row.customer_name.trim()) {
    errors.push('Nama pelanggan wajib diisi');
  }

  // Validate product_type
  if (!row.product_type) {
    errors.push('Jenis produk wajib diisi');
  } else if (!PRODUCT_TYPES.includes(row.product_type)) {
    errors.push(`Jenis produk tidak valid. Pilihan: ${PRODUCT_TYPES.join(', ')}`);
  }

  // Validate purchase_price
  if (!row.purchase_price) {
    errors.push('Harga beli wajib diisi');
  } else {
    const price = parseFloat(row.purchase_price);
    if (isNaN(price) || price < 0) {
      errors.push('Harga beli harus berupa angka positif');
    }
  }

  // Validate selling_price
  if (!row.selling_price) {
    errors.push('Harga jual wajib diisi');
  } else {
    const price = parseFloat(row.selling_price);
    if (isNaN(price) || price < 0) {
      errors.push('Harga jual harus berupa angka positif');
    }
  }

  // Validate marketplace_fee (optional)
  if (row.marketplace_fee) {
    const fee = parseFloat(row.marketplace_fee);
    if (isNaN(fee) || fee < 0) {
      errors.push('Biaya marketplace harus berupa angka positif');
    }
  }

  // Validate payment_method
  if (!row.payment_method) {
    errors.push('Metode pembayaran wajib diisi');
  } else if (!PAYMENT_METHODS.includes(row.payment_method)) {
    errors.push(`Metode pembayaran tidak valid. Pilihan: ${PAYMENT_METHODS.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}