import { Pool } from '@neondatabase/serverless';
import ws from 'ws';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  webSocketConstructor: ws
});

async function createServicesTables() {
  try {
    console.log('Creating services tables...');
    
    // Create services table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        slug VARCHAR NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR,
        seo_title VARCHAR,
        seo_description TEXT,
        content TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    // Create business_services junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS business_services (
        id SERIAL PRIMARY KEY,
        business_id TEXT NOT NULL,
        service_id INTEGER NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (business_id) REFERENCES businesses(placeid) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
        UNIQUE(business_id, service_id)
      );
    `);

    console.log('Services tables created successfully');

    // Insert some sample services for testing
    await pool.query(`
      INSERT INTO services (name, slug, description, category, seo_title, seo_description, content)
      VALUES 
        ('Teeth Whitening', 'teeth-whitening', 'Professional teeth whitening services to brighten your smile', 'Cosmetic', 'Professional Teeth Whitening Services', 'Get a brighter, whiter smile with our professional teeth whitening treatments. Safe, effective, and long-lasting results.', 'Professional teeth whitening is one of the most popular cosmetic dental treatments available today.'),
        ('Dental Cleaning', 'dental-cleaning', 'Regular dental cleaning and oral hygiene maintenance', 'Preventive', 'Professional Dental Cleaning Services', 'Maintain optimal oral health with regular professional dental cleanings. Prevent cavities and gum disease.', 'Regular dental cleanings are essential for maintaining good oral health and preventing dental problems.'),
        ('Root Canal Treatment', 'root-canal-treatment', 'Endodontic treatment to save infected or damaged teeth', 'Restorative', 'Root Canal Treatment', 'Save your natural tooth with expert root canal treatment. Pain-free procedures with modern techniques.', 'Root canal treatment is a procedure used to treat infected or severely damaged teeth.'),
        ('Dental Implants', 'dental-implants', 'Permanent tooth replacement with titanium implants', 'Restorative', 'Dental Implant Services', 'Replace missing teeth with permanent dental implants. Natural-looking and long-lasting solution.', 'Dental implants are the gold standard for replacing missing teeth with a permanent solution.'),
        ('Orthodontics', 'orthodontics', 'Teeth straightening and bite correction treatments', 'Orthodontic', 'Orthodontic Treatment', 'Straighten your teeth and correct your bite with modern orthodontic treatments including braces and aligners.', 'Orthodontic treatment helps align teeth and correct bite problems for better oral health and aesthetics.')
      ON CONFLICT (slug) DO NOTHING;
    `);

    console.log('Sample services inserted');
    process.exit(0);
  } catch (error) {
    console.error('Error creating services tables:', error);
    process.exit(1);
  }
}

createServicesTables();