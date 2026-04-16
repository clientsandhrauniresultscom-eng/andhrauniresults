-- Fix RLS policies for results table
DROP POLICY IF EXISTS "Allow public read access" ON results;
DROP POLICY IF EXISTS "Allow admin write access" ON results;

-- Allow anyone to read results
CREATE POLICY "Public read access" ON results
    FOR SELECT USING (true);

-- Allow anyone to insert/update results (for admin operations)
CREATE POLICY "Public write access" ON results
    FOR ALL USING (true);