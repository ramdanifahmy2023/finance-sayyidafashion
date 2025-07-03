-- Create sales table
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transaction_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('rajut', 'celana', 'kaos', 'hoodie', 'dress', 'rok', 'jeans', 'jaket', 'sweater', 'kemeja', 'kulot', 'vest', 'pl_pribadi', 'set', 'lainnya')),
  purchase_price DECIMAL(12,2) NOT NULL,
  selling_price DECIMAL(12,2) NOT NULL,
  marketplace_fee DECIMAL(12,2) DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('full_payment', 'bayar_ongkir_di_tempat', 'split_payment_shopee', 'offline', 'cod', 'cash')),
  description TEXT,
  gross_margin DECIMAL(12,2) GENERATED ALWAYS AS (selling_price - purchase_price - marketplace_fee) STORED,
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transaction_date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('lakban', 'plastik_packing', 'operasional', 'gaji', 'transportasi', 'dll')),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Create losses table
CREATE TABLE public.losses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transaction_date DATE NOT NULL,
  loss_type TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Create assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('asset', 'liability')),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  current_value DECIMAL(12,2) NOT NULL,
  initial_price DECIMAL(12,2) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.losses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sales
CREATE POLICY "Users can view their own sales" ON public.sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sales" ON public.sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sales" ON public.sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sales" ON public.sales FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for expenses
CREATE POLICY "Users can view their own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for losses
CREATE POLICY "Users can view their own losses" ON public.losses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own losses" ON public.losses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own losses" ON public.losses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own losses" ON public.losses FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for assets
CREATE POLICY "Users can view their own assets" ON public.assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own assets" ON public.assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assets" ON public.assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own assets" ON public.assets FOR DELETE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;