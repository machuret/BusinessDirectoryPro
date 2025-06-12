const fs = require('fs');
const csv = require('csv-parser');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function importBusinesses() {
  const businesses = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('./attached_assets/business-data-complete-2025-06-11 (1)_1749617911745.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Generate slug from title
        const slug = row.title ? row.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-') : '';

        const business = {
          placeid: row.placeid || '',
          slug: slug,
          title: row.title || null,
          subtitle: row.subtitle || null,
          description: row.description || null,
          categoryname: row.categoryname || null,
          categories: row.categories ? JSON.parse(row.categories) : null,
          price: row.price || null,
          website: row.website || null,
          phone: row.phone || null,
          phoneunformatted: row.phoneunformatted || null,
          menu: row.menu || null,
          address: row.address || null,
          neighborhood: row.neighborhood || null,
          street: row.street || null,
          city: row.city || null,
          postalcode: row.postalcode || null,
          state: row.state || null,
          countrycode: row.countrycode || null,
          lat: row.lat ? parseFloat(row.lat) : null,
          lng: row.lng ? parseFloat(row.lng) : null,
          pluscode: row.pluscode || null,
          locatedin: row.locatedin || null,
          fid: row.fid || null,
          cid: row.cid || null,
          kgmid: row.kgmid || null,
          url: row.url || null,
          searchpageurl: row.searchpageurl || null,
          googlefoodurl: row.googlefoodurl || null,
          claimthisbusiness: row.claimthisbusiness || null,
          permanentlyclosed: row.permanentlyclosed === 'true' ? true : (row.permanentlyclosed === 'false' ? false : null),
          temporarilyclosed: row.temporarilyclosed === 'true' ? true : (row.temporarilyclosed === 'false' ? false : null),
          isadvertisement: row.isadvertisement === 'true' ? true : (row.isadvertisement === 'false' ? false : null),
          featured: row.featured === 'true' ? true : (row.featured === 'false' ? false : null),
          totalscore: row.totalscore ? parseFloat(row.totalscore) : null,
          reviewscount: row.reviewscount ? parseInt(row.reviewscount) : null,
          reviewsdistribution: row.reviewsdistribution ? JSON.parse(row.reviewsdistribution) : null,
          reviewstags: row.reviewstags ? JSON.parse(row.reviewstags) : null,
          reviews: row.reviews ? JSON.parse(row.reviews) : null,
          imageurl: row.imageurl || null,
          imagescount: row.imagescount ? parseInt(row.imagescount) : null,
          imagecategories: row.imagecategories ? JSON.parse(row.imagecategories) : null,
          imageurls: row.imageurls ? JSON.parse(row.imageurls) : null,
          images: row.images || null,
          logo: row.logo || null,
          openinghours: row.openinghours ? JSON.parse(row.openinghours) : null,
          additionalopeninghours: row.additionalopeninghours || null,
          openinghoursbusinessconfirmationtext: row.openinghoursbusinessconfirmationtext || null,
          additionalinfo: row.additionalinfo || null,
          amenities: row.amenities ? JSON.parse(row.amenities) : null,
          accessibility: row.accessibility || null,
          planning: row.planning || null,
          reservetableurl: row.reservetableurl || null,
          tablereservationlinks: row.tablereservationlinks ? JSON.parse(row.tablereservationlinks) : null,
          bookinglinks: row.bookinglinks ? JSON.parse(row.bookinglinks) : null,
          orderby: row.orderby ? JSON.parse(row.orderby) : null,
          restaurantdata: row.restaurantdata || null,
          hotelads: row.hotelads || null,
          hotelstars: row.hotelstars || null,
          hoteldescription: row.hoteldescription || null,
          checkindate: row.checkindate || null,
          checkoutdate: row.checkoutdate || null,
          similarhotelsnearby: row.similarhotelsnearby || null,
          hotelreviewsummary: row.hotelreviewsummary || null,
          peoplealsosearch: row.peoplealsosearch ? JSON.parse(row.peoplealsosearch) : null,
          placestags: row.placestags ? JSON.parse(row.placestags) : null,
          gasprices: row.gasprices || null,
          questionsandanswers: row.questionsandanswers || null,
          updatesfromcustomers: row.updatesfromcustomers || null,
          ownerupdates: row.ownerupdates ? JSON.parse(row.ownerupdates) : null,
          webresults: row.webresults || null,
          leadsenrichment: row.leadsenrichment || null,
          userplacenote: row.userplacenote || null,
          scrapedat: row.scrapedat || null,
          searchstring: row.searchstring || null,
          language: row.language || null,
          rank: row.rank ? parseInt(row.rank) : null,
          ownerid: row.ownerid || null,
          seotitle: row.seotitle || null,
          seodescription: row.seodescription || null,
          createdat: new Date(),
          updatedat: new Date(),
          faq: row.faq ? JSON.parse(row.faq) : null
        };
        
        businesses.push(business);
      })
      .on('end', async () => {
        console.log(`Parsed ${businesses.length} businesses from CSV`);
        
        try {
          const client = await pool.connect();
          
          for (const business of businesses) {
            const insertQuery = `
              INSERT INTO businesses (
                placeid, slug, title, subtitle, description, categoryname, categories, price, website, phone, phoneunformatted, 
                menu, address, neighborhood, street, city, postalcode, state, countrycode, lat, lng, pluscode, locatedin, 
                fid, cid, kgmid, url, searchpageurl, googlefoodurl, claimthisbusiness, permanentlyclosed, temporarilyclosed, 
                isadvertisement, featured, totalscore, reviewscount, reviewsdistribution, reviewstags, reviews, imageurl, 
                imagescount, imagecategories, imageurls, images, logo, openinghours, additionalopeninghours, 
                openinghoursbusinessconfirmationtext, additionalinfo, amenities, accessibility, planning, reservetableurl, 
                tablereservationlinks, bookinglinks, orderby, restaurantdata, hotelads, hotelstars, hoteldescription, 
                checkindate, checkoutdate, similarhotelsnearby, hotelreviewsummary, peoplealsosearch, placestags, gasprices, 
                questionsandanswers, updatesfromcustomers, ownerupdates, webresults, leadsenrichment, userplacenote, 
                scrapedat, searchstring, language, rank, ownerid, seotitle, seodescription, createdat, updatedat, faq
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, 
                $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, 
                $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, 
                $68, $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, $79, $80, $81, $82, $83
              ) ON CONFLICT (placeid) DO NOTHING
            `;
            
            const values = [
              business.placeid, business.slug, business.title, business.subtitle, business.description, business.categoryname, 
              business.categories, business.price, business.website, business.phone, business.phoneunformatted, business.menu, 
              business.address, business.neighborhood, business.street, business.city, business.postalcode, business.state, 
              business.countrycode, business.lat, business.lng, business.pluscode, business.locatedin, business.fid, 
              business.cid, business.kgmid, business.url, business.searchpageurl, business.googlefoodurl, business.claimthisbusiness, 
              business.permanentlyclosed, business.temporarilyclosed, business.isadvertisement, business.featured, business.totalscore, 
              business.reviewscount, business.reviewsdistribution, business.reviewstags, business.reviews, business.imageurl, 
              business.imagescount, business.imagecategories, business.imageurls, business.images, business.logo, business.openinghours, 
              business.additionalopeninghours, business.openinghoursbusinessconfirmationtext, business.additionalinfo, business.amenities, 
              business.accessibility, business.planning, business.reservetableurl, business.tablereservationlinks, business.bookinglinks, 
              business.orderby, business.restaurantdata, business.hotelads, business.hotelstars, business.hoteldescription, 
              business.checkindate, business.checkoutdate, business.similarhotelsnearby, business.hotelreviewsummary, business.peoplealsosearch, 
              business.placestags, business.gasprices, business.questionsandanswers, business.updatesfromcustomers, business.ownerupdates, 
              business.webresults, business.leadsenrichment, business.userplacenote, business.scrapedat, business.searchstring, 
              business.language, business.rank, business.ownerid, business.seotitle, business.seodescription, business.createdat, 
              business.updatedat, business.faq
            ];
            
            await client.query(insertQuery, values);
          }
          
          client.release();
          console.log(`Successfully imported ${businesses.length} businesses`);
          resolve(businesses.length);
        } catch (error) {
          console.error('Error importing businesses:', error);
          reject(error);
        }
      })
      .on('error', reject);
  });
}

importBusinesses()
  .then(count => {
    console.log(`Import completed: ${count} businesses`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  });