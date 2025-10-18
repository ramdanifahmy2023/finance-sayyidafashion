-- Drop attendance table first
DROP TABLE IF EXISTS public.attendance CASCADE;

-- Drop existing RLS policies that depend on role column
DROP POLICY IF EXISTS "Admins and Managers can access all sales data" ON public.sales;
DROP POLICY IF EXISTS "Admins and Managers can access all expenses data" ON public.expenses;
DROP POLICY IF EXISTS "Admins and Managers can access all losses data" ON public.losses;

-- Now we can safely drop the role column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role CASCADE;

-- Drop the user_role enum type
DROP TYPE IF EXISTS user_role CASCADE;

-- Create new simplified RLS policies (all authenticated users are managers)
CREATE POLICY "Managers can access all sales data" 
ON public.sales 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can access all expenses data" 
ON public.expenses 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can access all losses data" 
ON public.losses 
FOR ALL 
USING (auth.uid() IS NOT NULL);