-- Create doctors table
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  experience_years INT NOT NULL,
  bio TEXT,
  hospital_id UUID,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INT DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create hospitals table
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  specialty TEXT NOT NULL,
  accreditation TEXT,
  beds INT,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INT DEFAULT 0,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create procedures table
CREATE TABLE procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  description TEXT,
  cost_min DECIMAL(10,2),
  cost_max DECIMAL(10,2),
  hospital_id UUID REFERENCES hospitals(id),
  recovery_days INT,
  success_rate DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_country TEXT NOT NULL,
  procedure TEXT NOT NULL,
  hospital_id UUID REFERENCES hospitals(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create quote requests table (patient-initiated)
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  phone TEXT,
  procedure TEXT NOT NULL,
  specialty TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create users table for admin
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraint for doctors
ALTER TABLE doctors ADD CONSTRAINT fk_doctors_hospital FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Allow public read access to hospitals" ON hospitals FOR SELECT USING (true);
CREATE POLICY "Allow public read access to procedures" ON procedures FOR SELECT USING (true);
CREATE POLICY "Allow public read access to testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Allow public read access to doctors" ON doctors FOR SELECT USING (true);

-- RLS Policies for quote requests (anyone can insert)
CREATE POLICY "Allow anyone to submit quote requests" ON quote_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access to quote requests" ON quote_requests FOR SELECT USING (true);
