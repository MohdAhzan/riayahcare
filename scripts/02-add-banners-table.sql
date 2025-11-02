-- Create banners table for landing page management
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  cta_text TEXT DEFAULT 'Get Quote',
  cta_link TEXT DEFAULT '/hospitals',
  is_active BOOLEAN DEFAULT true,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS policy for banners
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to banners" ON banners FOR SELECT USING (is_active = true);

-- Insert default banner with the provided image
INSERT INTO banners (title, subtitle, image_url, cta_text, is_active, order_index)
VALUES (
  'Welcome to Riayah Care',
  'Compassionate Care & World Class Treatment',
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vecteezy_doctor-icon-virtual-screen-health-care-and-medical-on_12604205-inGwpDRPHTcYwpVYGm8H5Z37xv8z.jpg',
  'Get Quote',
  true,
  0
);
