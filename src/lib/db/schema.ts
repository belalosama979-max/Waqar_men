// Supabase SQL Schema
// Run this in Supabase Dashboard → SQL Editor

/*
-- ==========================================
-- نظام إدارة تسميع القرآن الكريم
-- Database Schema for Supabase (PostgreSQL)
-- ==========================================

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  course TEXT NOT NULL DEFAULT 'المساق الحر',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
  teacher_name TEXT,
  course TEXT NOT NULL DEFAULT 'المساق الحر',
  total_points INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 0,
  total_hadiths INTEGER DEFAULT 0,
  last_recitation TEXT,
  last_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recitations table
CREATE TABLE IF NOT EXISTS recitations (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT,
  teacher_id INTEGER,
  teacher_name TEXT,
  course TEXT NOT NULL DEFAULT 'المساق الحر',
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL DEFAULT 'سورة',
  part INTEGER,
  surah INTEGER,
  surah_name TEXT,
  from_page INTEGER,
  to_page INTEGER,
  from_ayah INTEGER,
  to_ayah INTEGER,
  pages_count INTEGER DEFAULT 0,
  hadiths_count INTEGER DEFAULT 0,
  hadiths_details TEXT,
  is_additional BOOLEAN DEFAULT false,
  evaluation TEXT NOT NULL,
  eval_points INTEGER DEFAULT 0,
  extra_points INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SQL Commands to update existing tables (run in Supabase SQL Editor):
-- ALTER TABLE students ADD COLUMN IF NOT EXISTS total_pages INTEGER DEFAULT 0;
-- ALTER TABLE students ADD COLUMN IF NOT EXISTS course TEXT NOT NULL DEFAULT 'المساق الحر';
-- ALTER TABLE students ADD COLUMN IF NOT EXISTS total_hadiths INTEGER DEFAULT 0;
-- ALTER TABLE recitations ADD COLUMN IF NOT EXISTS from_page INTEGER;
-- ALTER TABLE recitations ADD COLUMN IF NOT EXISTS to_page INTEGER;
-- ALTER TABLE recitations ADD COLUMN IF NOT EXISTS from_ayah INTEGER;
-- ALTER TABLE recitations ADD COLUMN IF NOT EXISTS to_ayah INTEGER;
-- ALTER TABLE recitations ADD COLUMN IF NOT EXISTS pages_count INTEGER DEFAULT 0;
-- ALTER TABLE recitations ADD COLUMN IF NOT EXISTS course TEXT NOT NULL DEFAULT 'المساق الحر';
-- ALTER TABLE recitations ADD COLUMN IF NOT EXISTS hadiths_count INTEGER DEFAULT 0;
-- ALTER TABLE recitations ADD COLUMN IF NOT EXISTS hadiths_details TEXT;
-- ALTER TABLE recitations ADD COLUMN IF NOT EXISTS is_additional BOOLEAN DEFAULT false;
-- ALTER TABLE teachers ADD COLUMN IF NOT EXISTS course TEXT NOT NULL DEFAULT 'المساق الحر';
-- ==========================================

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);

-- ==========================================
-- Disable RLS (Row Level Security)
-- We manage access at the application level
-- ==========================================
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE recitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- Seed Data
-- ==========================================

-- Insert admin account
INSERT INTO admins (username, password, name) 
VALUES ('admin', 'admin123', 'المشرف العام')
ON CONFLICT (username) DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
  ('app_name', 'نظام إدارة تسميع القرآن الكريم'),
  ('theme', 'dark'),
  ('eval_ممتاز_جداً', '60'),
  ('eval_ممتاز', '40'),
  ('eval_جيد_جداً', '25'),
  ('eval_جيد', '15'),
  ('eval_لم_يسمع', '0'),
  ('eval_رجع_في_التسميع', '10')
ON CONFLICT (key) DO NOTHING;

-- Insert sample teachers
INSERT INTO teachers (name, username, password) VALUES
  ('محمد أحمد', 'محمد', 'محمد123'),
  ('أحمد علي', 'أحمد', 'أحمد123')
ON CONFLICT (username) DO NOTHING;

-- Insert sample students (adjust teacher IDs based on your data)
INSERT INTO students (name, teacher_id, teacher_name, total_points) 
SELECT 
  s.name, t.id, t.name, s.pts
FROM (VALUES
  ('عبدالله محمد', 'محمد', 120),
  ('عمر خالد', 'محمد', 95),
  ('يوسف إبراهيم', 'محمد', 200),
  ('زيد سعد', 'محمد', 75),
  ('حمزة ناصر', 'محمد', 150),
  ('بلال عمر', 'أحمد', 180),
  ('سلمان فارس', 'أحمد', 60),
  ('طارق منصور', 'أحمد', 230),
  ('كريم جمال', 'أحمد', 45),
  ('أنس ماجد', 'أحمد', 310)
) AS s(name, teacher_username, pts)
JOIN teachers t ON t.username = s.teacher_username
ON CONFLICT DO NOTHING;
*/

export {};
