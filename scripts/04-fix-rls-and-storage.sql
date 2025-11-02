-- Add INSERT and UPDATE policies for all tables to allow admin operations
CREATE POLICY "Allow authenticated users to insert hospitals" ON hospitals 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update hospitals" ON hospitals 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete hospitals" ON hospitals 
  FOR DELETE 
  USING (true);

-- Add policies for doctors
CREATE POLICY "Allow authenticated users to insert doctors" ON doctors 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update doctors" ON doctors 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete doctors" ON doctors 
  FOR DELETE 
  USING (true);

-- Add policies for procedures
CREATE POLICY "Allow authenticated users to insert procedures" ON procedures 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update procedures" ON procedures 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete procedures" ON procedures 
  FOR DELETE 
  USING (true);

-- Add policies for testimonials
CREATE POLICY "Allow authenticated users to insert testimonials" ON testimonials 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update testimonials" ON testimonials 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete testimonials" ON testimonials 
  FOR DELETE 
  USING (true);

-- Add policies for banners
CREATE POLICY "Allow authenticated users to insert banners" ON banners 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update banners" ON banners 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete banners" ON banners 
  FOR DELETE 
  USING (true);
