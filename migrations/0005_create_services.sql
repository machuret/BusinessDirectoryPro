-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
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
  business_id VARCHAR(255) NOT NULL REFERENCES businesses(placeid) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(business_id, service_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_business_services_business_id ON business_services(business_id);
CREATE INDEX IF NOT EXISTS idx_business_services_service_id ON business_services(service_id);

-- Insert initial dental services
INSERT INTO services (name, slug, description, category, seo_title, seo_description, content, is_active)
VALUES 
  ('General Dentistry', 'general-dentistry', 'Comprehensive dental care including cleanings, exams, and preventive treatments.', 'General', 'General Dentistry Services - Comprehensive Dental Care', 'Professional general dentistry services including routine cleanings, dental exams, fillings, and preventive care to maintain optimal oral health.', 'Our general dentistry services provide comprehensive oral healthcare to patients of all ages. We focus on preventive care to help you maintain healthy teeth and gums for life.', true),
  ('Cosmetic Dentistry', 'cosmetic-dentistry', 'Enhance your smile with professional cosmetic dental treatments.', 'Cosmetic', 'Cosmetic Dentistry - Professional Smile Enhancement', 'Transform your smile with our cosmetic dentistry services including teeth whitening, veneers, and smile makeovers by experienced dental professionals.', 'Our cosmetic dentistry services are designed to enhance the beauty of your smile while maintaining optimal oral health. We use the latest techniques and materials.', true),
  ('Dental Implants', 'dental-implants', 'Permanent tooth replacement solutions with dental implants.', 'Restorative', 'Dental Implants - Permanent Tooth Replacement Solutions', 'Replace missing teeth with natural-looking dental implants. Our experienced team provides comprehensive implant dentistry services.', 'Dental implants provide a permanent solution for missing teeth, offering the look, feel, and function of natural teeth with long-lasting results.', true),
  ('Orthodontics', 'orthodontics', 'Straighten your teeth with braces and clear aligners.', 'Orthodontic', 'Orthodontics - Braces and Clear Aligners', 'Achieve a straighter smile with our orthodontic treatments including traditional braces, clear aligners, and Invisalign.', 'Our orthodontic services help patients of all ages achieve straighter, healthier smiles through various treatment options tailored to individual needs.', true),
  ('Root Canal Therapy', 'root-canal-therapy', 'Save your natural teeth with professional root canal treatment.', 'Endodontic', 'Root Canal Therapy - Save Your Natural Teeth', 'Professional root canal therapy to save infected or damaged teeth. Our gentle approach ensures comfortable treatment and successful outcomes.', 'Root canal therapy allows us to save natural teeth that have become infected or severely damaged, providing pain relief and preserving your smile.', true),
  ('Teeth Whitening', 'teeth-whitening', 'Professional teeth whitening for a brighter, whiter smile.', 'Cosmetic', 'Professional Teeth Whitening - Brighter Smile', 'Achieve a brighter, whiter smile with our professional teeth whitening treatments. Safe, effective, and long-lasting results.', 'Our professional teeth whitening treatments can safely and effectively brighten your smile, removing stains and discoloration for dramatic results.', true)
ON CONFLICT (slug) DO NOTHING;