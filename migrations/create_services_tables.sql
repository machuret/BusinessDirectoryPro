-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  seo_title VARCHAR(255),
  seo_description TEXT,
  content TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create business_services junction table
CREATE TABLE IF NOT EXISTS business_services (
  id SERIAL PRIMARY KEY,
  business_id VARCHAR(255) NOT NULL,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(business_id, service_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_business_services_business_id ON business_services(business_id);
CREATE INDEX IF NOT EXISTS idx_business_services_service_id ON business_services(service_id);

-- Insert some sample services
INSERT INTO services (name, slug, description, category, seo_title, seo_description, content, is_active) VALUES
('Teeth Cleaning', 'teeth-cleaning', 'Professional dental cleaning and oral hygiene maintenance', 'General Dentistry', 'Professional Teeth Cleaning Services | Dental Care', 'Get professional teeth cleaning services to maintain optimal oral health. Our experienced dental hygienists provide thorough cleanings and preventive care.', '<h2>Professional Teeth Cleaning Services</h2><p>Our comprehensive teeth cleaning services help maintain your oral health...</p>', true),
('Dental Implants', 'dental-implants', 'Permanent tooth replacement solution using titanium implants', 'Oral Surgery', 'Dental Implants | Permanent Tooth Replacement Solutions', 'Replace missing teeth with our advanced dental implant procedures. Get back your confident smile with permanent, natural-looking tooth replacements.', '<h2>Advanced Dental Implant Solutions</h2><p>Dental implants are the gold standard for tooth replacement...</p>', true),
('Orthodontics', 'orthodontics', 'Teeth straightening and bite correction treatments', 'Orthodontics', 'Orthodontic Treatment | Teeth Straightening Services', 'Achieve the perfect smile with our orthodontic treatments including braces, Invisalign, and other teeth straightening solutions.', '<h2>Comprehensive Orthodontic Care</h2><p>Transform your smile with our advanced orthodontic treatments...</p>', true),
('Teeth Whitening', 'teeth-whitening', 'Professional teeth whitening for a brighter smile', 'Cosmetic Dentistry', 'Professional Teeth Whitening | Cosmetic Dental Services', 'Get a brighter, whiter smile with our professional teeth whitening treatments. Safe, effective, and long-lasting results.', '<h2>Professional Teeth Whitening</h2><p>Achieve a radiant smile with our advanced whitening treatments...</p>', true),
('Root Canal Treatment', 'root-canal-treatment', 'Endodontic therapy to save infected or damaged teeth', 'Endodontics', 'Root Canal Treatment | Save Your Natural Teeth', 'Our gentle root canal procedures can save your natural teeth and eliminate pain caused by infected or damaged tooth pulp.', '<h2>Gentle Root Canal Therapy</h2><p>Modern root canal treatment is comfortable and effective...</p>', true)
ON CONFLICT (slug) DO NOTHING;