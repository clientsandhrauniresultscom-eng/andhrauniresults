-- Run this SQL in your Supabase SQL Editor to create the results table

-- Create results table
CREATE TABLE IF NOT EXISTS results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_name TEXT NOT NULL,
    roll_number TEXT NOT NULL UNIQUE,
    register_number TEXT,
    course TEXT NOT NULL,
    branch TEXT,
    semester TEXT NOT NULL,
    year TEXT NOT NULL,
    result_id TEXT,
    college TEXT,
    subjects JSONB DEFAULT '[]'::jsonb,
    total_marks INTEGER,
    obtained_marks INTEGER,
    percentage DECIMAL(5,2),
    passing_marks INTEGER,
    minimum_marks INTEGER,
    sgpa DECIMAL(4,2),
    cgpa DECIMAL(4,2),
    total_credits INTEGER,
    total_grade_points INTEGER,
    grade TEXT,
    result TEXT DEFAULT 'PASS',
    verification_code TEXT,
    exam_date TEXT,
    place TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON results
    FOR SELECT USING (true);

-- Create policy to allow admin write access
CREATE POLICY "Allow admin write access" ON results
    FOR ALL USING (true);

-- Create index on roll_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_results_roll_number ON results(roll_number);

-- Create index on student_name for search
CREATE INDEX IF NOT EXISTS idx_results_student_name ON results(student_name);

-- Create index on year for filtering
CREATE INDEX IF NOT EXISTS idx_results_year ON results(year);

-- Enable realtime for results table
ALTER PUBLICATION supabase_realtime ADD TABLE results;
