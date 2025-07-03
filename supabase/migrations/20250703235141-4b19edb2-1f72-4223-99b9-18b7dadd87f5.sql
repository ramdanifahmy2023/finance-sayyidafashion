-- Create optimized dashboard metrics function
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
  user_id_param UUID,
  start_date DATE,
  end_date DATE
)
RETURNS TABLE(
  total_revenue DECIMAL(15,2),
  total_capital DECIMAL(15,2),
  total_expenses DECIMAL(15,2),
  total_losses DECIMAL(15,2),
  gross_margin DECIMAL(15,2),
  net_profit DECIMAL(15,2),
  transaction_count INTEGER,
  marketplace_fees DECIMAL(15,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH sales_summary AS (
    SELECT 
      COALESCE(SUM(selling_price), 0) as revenue,
      COALESCE(SUM(purchase_price), 0) as capital,
      COALESCE(SUM(marketplace_fee), 0) as fees,
      COUNT(*) as sales_count
    FROM sales 
    WHERE user_id = user_id_param 
      AND transaction_date BETWEEN start_date AND end_date
  ),
  expenses_summary AS (
    SELECT COALESCE(SUM(amount), 0) as expenses
    FROM expenses 
    WHERE user_id = user_id_param 
      AND transaction_date BETWEEN start_date AND end_date
  ),
  losses_summary AS (
    SELECT COALESCE(SUM(amount), 0) as losses
    FROM losses 
    WHERE user_id = user_id_param 
      AND transaction_date BETWEEN start_date AND end_date
  )
  SELECT 
    s.revenue,
    s.capital,
    e.expenses,
    l.losses,
    (s.revenue - s.capital - s.fees) as gross_margin,
    (s.revenue - s.capital - s.fees - e.expenses - l.losses) as net_profit,
    s.sales_count::INTEGER,
    s.fees
  FROM sales_summary s, expenses_summary e, losses_summary l;
END;
$$ LANGUAGE plpgsql;

-- Create function for top products calculation
CREATE OR REPLACE FUNCTION get_top_products(
  user_id_param UUID,
  start_date DATE,
  end_date DATE,
  limit_count INTEGER DEFAULT 4
)
RETURNS TABLE(
  product_name TEXT,
  sales_count INTEGER,
  total_revenue DECIMAL(15,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    product_type,
    COUNT(*)::INTEGER as sales_count,
    SUM(selling_price) as total_revenue
  FROM sales 
  WHERE user_id = user_id_param 
    AND transaction_date BETWEEN start_date AND end_date
  GROUP BY product_type
  ORDER BY total_revenue DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;