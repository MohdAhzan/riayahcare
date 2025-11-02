-- Add image_url column to all tables for Supabase Storage paths
-- Banners table already has image_url, just ensuring consistency
-- Hospitals, Doctors, Procedures tables will use image_url for storage paths
ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE procedures ADD COLUMN IF NOT EXISTS image_url TEXT;
