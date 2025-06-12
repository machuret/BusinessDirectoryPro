import { Pool } from '@neondatabase/serverless';

export async function verifyServicesSetup() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Verifying services database setup...");
    
    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('services', 'business_services')
      ORDER BY table_name
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    console.log("Found tables:", tablesResult.rows);
    
    // If services table exists, get count and sample data
    if (tablesResult.rows.some(row => row.table_name === 'services')) {
      const countQuery = 'SELECT COUNT(*) as count FROM services';
      const countResult = await pool.query(countQuery);
      console.log("Services count:", countResult.rows[0].count);
      
      const sampleQuery = 'SELECT id, name, slug FROM services LIMIT 3';
      const sampleResult = await pool.query(sampleQuery);
      console.log("Sample services:", sampleResult.rows);
      
      return {
        success: true,
        tablesExist: true,
        servicesCount: parseInt(countResult.rows[0].count),
        sampleServices: sampleResult.rows
      };
    } else {
      return {
        success: true,
        tablesExist: false,
        message: "Services tables do not exist"
      };
    }
    
  } catch (error) {
    console.error("Error verifying services setup:", error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}