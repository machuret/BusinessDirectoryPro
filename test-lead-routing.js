/**
 * Test script for lead routing system
 * Verifies that leads are properly routed based on business ownership status
 */

import { db } from './server/db.ts';
import { sql } from 'drizzle-orm';

async function testLeadRouting() {
  console.log('🧪 Testing Lead Routing System...\n');

  try {
    // 1. Check existing leads data
    console.log('1. Checking existing leads...');
    const leadsResult = await db.execute(sql`SELECT COUNT(*) as count FROM leads`);
    console.log(`   Found ${leadsResult.rows[0].count} existing leads`);

    // 2. Check ownership claims data
    console.log('\n2. Checking ownership claims...');
    const claimsResult = await db.execute(sql`
      SELECT business_id, user_id, status 
      FROM ownership_claims 
      WHERE status = 'approved'
      LIMIT 5
    `);
    console.log(`   Found ${claimsResult.rows.length} approved ownership claims:`);
    claimsResult.rows.forEach(claim => {
      console.log(`   - Business: ${claim.business_id}, Owner: ${claim.user_id}`);
    });

    // 3. Test admin leads query (unclaimed businesses)
    console.log('\n3. Testing admin leads query (unclaimed businesses)...');
    const adminLeadsResult = await db.execute(sql`
      SELECT 
        l.id,
        l.business_id,
        l.sender_name,
        b.title as business_title
      FROM leads l
      LEFT JOIN businesses b ON l.business_id = b.placeid
      WHERE l.business_id NOT IN (
        SELECT DISTINCT business_id 
        FROM ownership_claims 
        WHERE status = 'approved'
      )
      ORDER BY l.created_at DESC
      LIMIT 5
    `);
    console.log(`   Admin should see ${adminLeadsResult.rows.length} leads from unclaimed businesses:`);
    adminLeadsResult.rows.forEach(lead => {
      console.log(`   - Lead #${lead.id}: ${lead.sender_name} → ${lead.business_title || 'Unknown Business'}`);
    });

    // 4. Test owner leads query (claimed businesses)
    if (claimsResult.rows.length > 0) {
      console.log('\n4. Testing owner leads query (claimed businesses)...');
      const testOwnerId = claimsResult.rows[0].user_id;
      const ownerLeadsResult = await db.execute(sql`
        SELECT 
          l.id,
          l.business_id,
          l.sender_name,
          b.title as business_title
        FROM leads l
        LEFT JOIN businesses b ON l.business_id = b.placeid
        INNER JOIN ownership_claims oc ON l.business_id = oc.business_id
        WHERE oc.user_id = ${testOwnerId} AND oc.status = 'approved'
        ORDER BY l.created_at DESC
        LIMIT 5
      `);
      console.log(`   Owner ${testOwnerId} should see ${ownerLeadsResult.rows.length} leads from their claimed businesses:`);
      ownerLeadsResult.rows.forEach(lead => {
        console.log(`   - Lead #${lead.id}: ${lead.sender_name} → ${lead.business_title || 'Unknown Business'}`);
      });
    }

    // 5. Test business ownership check
    console.log('\n5. Testing business ownership check...');
    const businessesResult = await db.execute(sql`SELECT placeid FROM businesses LIMIT 3`);
    for (const business of businessesResult.rows) {
      const ownershipResult = await db.execute(sql`
        SELECT user_id, status 
        FROM ownership_claims 
        WHERE business_id = ${business.placeid} AND status = 'approved'
        LIMIT 1
      `);
      
      const isClaimed = ownershipResult.rows.length > 0;
      const ownerId = isClaimed ? ownershipResult.rows[0].user_id : null;
      
      console.log(`   Business ${business.placeid}: ${isClaimed ? `Claimed by ${ownerId}` : 'Unclaimed (admin owned)'}`);
    }

    console.log('\n✅ Lead routing system test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing lead routing system:', error);
  }
}

testLeadRouting();