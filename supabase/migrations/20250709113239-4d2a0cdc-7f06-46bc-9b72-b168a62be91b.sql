-- Enable realtime for expenses table
ALTER TABLE public.expenses REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;

-- Enable realtime for losses table  
ALTER TABLE public.losses REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.losses;