-- Enable public access to view recent winners
CREATE POLICY "Allow public select on transactions for spin_win" 
ON public.transactions 
FOR SELECT 
TO public 
USING (type = 'spin_win');
