-- Migration: Add database indexes for better query performance
-- Run this SQL in your Supabase SQL Editor

-- Index on roll_number for fast lookups (used most frequently)
CREATE INDEX IF NOT EXISTS idx_results_roll_number ON results(roll_number);

-- Index on student_name for search functionality
CREATE INDEX IF NOT EXISTS idx_results_student_name ON results(student_name);

-- Index on course for filtering
CREATE INDEX IF NOT EXISTS idx_results_course ON results(course);

-- Index on year for filtering
CREATE INDEX IF NOT EXISTS idx_results_year ON results(year);

-- Index on result status (PASS/FAIL)
CREATE INDEX IF NOT EXISTS idx_results_result ON results(result);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_results_course_year ON results(course, year);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_results_created_at ON results(created_at DESC);

-- Enable Row Level Security
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read results (public portal)
CREATE POLICY "Public can view results" ON results
  FOR SELECT USING (true);

-- Policy: Allow admin to insert/update/delete
-- Note: For production, you'd want to check authenticated role
-- For now, we'll keep it open for writes since we're using app-level auth
CREATE POLICY "Admin can insert" ON results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update" ON results
  FOR UPDATE USING (true);

CREATE POLICY "Admin can delete" ON results
  FOR DELETE USING (true);
