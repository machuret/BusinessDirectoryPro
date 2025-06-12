import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

async function createServicesTables() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  console.log('Creating services tables...');

  try {
    // Create services table
    await pool.query(`
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
    `);

    // Create business_services junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS business_services (
        id SERIAL PRIMARY KEY,
        business_id VARCHAR(255) NOT NULL REFERENCES businesses(placeid) ON DELETE CASCADE,
        service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(business_id, service_id)
      );
    `);

    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
      CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
      CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
      CREATE INDEX IF NOT EXISTS idx_business_services_business_id ON business_services(business_id);
      CREATE INDEX IF NOT EXISTS idx_business_services_service_id ON business_services(service_id);
    `);

    console.log('Services tables created successfully!');

    // Insert some initial dental services
    const initialServices = [
      {
        name: 'General Dentistry',
        slug: 'general-dentistry',
        description: 'Comprehensive dental care including cleanings, exams, and preventive treatments.',
        category: 'General',
        seo_title: 'General Dentistry Services - Comprehensive Dental Care',
        seo_description: 'Professional general dentistry services including routine cleanings, dental exams, fillings, and preventive care to maintain optimal oral health.',
        content: 'Our general dentistry services provide comprehensive oral healthcare to patients of all ages. We focus on preventive care to help you maintain healthy teeth and gums for life.',
        is_active: true
      },
      {
        name: 'Cosmetic Dentistry',
        slug: 'cosmetic-dentistry',
        description: 'Enhance your smile with professional cosmetic dental treatments.',
        category: 'Cosmetic',
        seo_title: 'Cosmetic Dentistry - Professional Smile Enhancement',
        seo_description: 'Transform your smile with our cosmetic dentistry services including teeth whitening, veneers, and smile makeovers by experienced dental professionals.',
        content: 'Our cosmetic dentistry services are designed to enhance the beauty of your smile while maintaining optimal oral health. We use the latest techniques and materials.',
        is_active: true
      },
      {
        name: 'Dental Implants',
        slug: 'dental-implants',
        description: 'Permanent tooth replacement solutions with dental implants.',
        category: 'Restorative',
        seo_title: 'Dental Implants - Permanent Tooth Replacement Solutions',
        seo_description: 'Replace missing teeth with natural-looking dental implants. Our experienced team provides comprehensive implant dentistry services.',
        content: 'Dental implants provide a permanent solution for missing teeth, offering the look, feel, and function of natural teeth with long-lasting results.',
        is_active: true
      },
      {
        name: 'Orthodontics',
        slug: 'orthodontics',
        description: 'Straighten your teeth with braces and clear aligners.',
        category: 'Orthodontic',
        seo_title: 'Orthodontics - Braces and Clear Aligners',
        seo_description: 'Achieve a straighter smile with our orthodontic treatments including traditional braces, clear aligners, and Invisalign.',
        content: 'Our orthodontic services help patients of all ages achieve straighter, healthier smiles through various treatment options tailored to individual needs.',
        is_active: true
      },
      {
        name: 'Root Canal Therapy',
        slug: 'root-canal-therapy',
        description: 'Save your natural teeth with professional root canal treatment.',
        category: 'Endodontic',
        seo_title: 'Root Canal Therapy - Save Your Natural Teeth',
        seo_description: 'Professional root canal therapy to save infected or damaged teeth. Our gentle approach ensures comfortable treatment and successful outcomes.',
        content: 'Root canal therapy allows us to save natural teeth that have become infected or severely damaged, providing pain relief and preserving your smile.',
        is_active: true
      },
      {
        name: 'Teeth Whitening',
        slug: 'teeth-whitening',
        description: 'Professional teeth whitening for a brighter, whiter smile.',
        category: 'Cosmetic',
        seo_title: 'Professional Teeth Whitening - Brighter Smile',
        seo_description: 'Achieve a brighter, whiter smile with our professional teeth whitening treatments. Safe, effective, and long-lasting results.',
        content: 'Our professional teeth whitening treatments can safely and effectively brighten your smile, removing stains and discoloration for dramatic results.',
        is_active: true
      }
    ];

    for (const service of initialServices) {
      await pool.query(`
        INSERT INTO services (name, slug, description, category, seo_title, seo_description, content, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (slug) DO NOTHING
      `, [
        service.name,
        service.slug,
        service.description,
        service.category,
        service.seo_title,
        service.seo_description,
        service.content,
        service.is_active
      ]);
    }

    console.log('Initial services data inserted successfully!');

  } catch (error) {
    console.error('Error creating services tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

createServicesTables().catch(console.error);