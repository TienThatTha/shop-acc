DROP POLICY IF EXISTS "Enable insert for all users" ON public."users";
CREATE POLICY "Enable insert for all users" ON public."users" FOR INSERT TO public WITH CHECK (true);
