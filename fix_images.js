import fs from 'fs';
import csv from 'csv-parser';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://repplit_owner:npg_qtLveA26UxGP@ep-proud-mountain-a85015ts-pooler.eastus2.azure.neon.tech/repplit?sslmode=require'
});

async function extractImageFromReviews(reviewsData) {
  if (!reviewsData) return null;
  
  try {
    const reviews = JSON.parse(reviewsData);
    if (Array.isArray(reviews)) {
      for (const review of reviews) {
        if (review.reviewImageUrls && Array.isArray(review.reviewImageUrls) && review.reviewImageUrls.length > 0) {
          return review.reviewImageUrls[0];
        }
      }
    }
  } catch (e) {
    // Skip invalid JSON
  }
  return null;
}

async function fixBusinessImages() {
  const businesses = [];
  
  // Read CSV file
  return new Promise((resolve, reject) => {
    fs.createReadStream('attached_assets/businesses_export_2025-06-09 (1)_1749564399413.csv')
      .pipe(csv())
      .on('data', (row) => {
        const imageUrl = extractImageFromReviews(row.reviews);
        if (imageUrl && row.placeid) {
          businesses.push({
            placeid: row.placeid.replace(/"/g, ''),
            imageUrl: imageUrl
          });
        }
      })
      .on('end', async () => {
        console.log(`Found ${businesses.length} businesses with images`);
        
        // Update database
        for (const business of businesses) {
          try {
            await pool.query(
              'UPDATE businesses SET imageurl = $1 WHERE placeid = $2',
              [business.imageUrl, business.placeid]
            );
            console.log(`Updated ${business.placeid} with image`);
          } catch (error) {
            console.error(`Error updating ${business.placeid}:`, error.message);
          }
        }
        
        await pool.end();
        resolve();
      })
      .on('error', reject);
  });
}

fixBusinessImages().then(() => {
  console.log('Image update complete');
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});