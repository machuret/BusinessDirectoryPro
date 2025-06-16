/**
 * Test script to check user dashboard functionality for militardataintelligence@gmail.com
 * Verifies business ownership and dashboard data retrieval
 */

import { storage } from './server/storage/comprehensive-storage.js';

async function testUserDashboard() {
  console.log('Testing user dashboard functionality...\n');
  
  try {
    // Check if user exists
    const user = await storage.getUserByEmail('militardataintelligence@gmail.com');
    console.log('User found:', user ? {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    } : 'Not found');
    
    if (!user) {
      console.log('\n❌ User not found in database');
      return;
    }
    
    // Check owned businesses
    console.log('\n--- Checking owned businesses ---');
    const ownedBusinesses = await storage.getUserBusinesses(user.id);
    console.log('Owned businesses count:', ownedBusinesses.length);
    
    if (ownedBusinesses.length > 0) {
      ownedBusinesses.forEach((business, index) => {
        console.log(`Business ${index + 1}:`, {
          placeid: business.placeid,
          title: business.title,
          city: business.city,
          ownerId: business.ownerId
        });
      });
    } else {
      console.log('No owned businesses found');
      
      // Check if there are businesses without owners that should belong to this user
      console.log('\n--- Checking unclaimed businesses ---');
      const allBusinesses = await storage.getAllBusinesses();
      const unclaimedBusinesses = allBusinesses.filter(b => !b.ownerId);
      console.log('Total unclaimed businesses:', unclaimedBusinesses.length);
      
      if (unclaimedBusinesses.length > 0) {
        console.log('First 5 unclaimed businesses:');
        unclaimedBusinesses.slice(0, 5).forEach((business, index) => {
          console.log(`  ${index + 1}. ${business.title} (${business.city})`);
        });
      }
    }
    
    // Check ownership claims
    console.log('\n--- Checking ownership claims ---');
    const claims = await storage.getOwnershipClaimsByUser(user.id);
    console.log('Ownership claims count:', claims.length);
    
    if (claims.length > 0) {
      claims.forEach((claim, index) => {
        console.log(`Claim ${index + 1}:`, {
          id: claim.id,
          businessId: claim.businessId,
          status: claim.status,
          createdAt: claim.createdAt
        });
      });
    }
    
    // Test API endpoints that dashboard uses
    console.log('\n--- Testing dashboard API endpoints ---');
    
    // Check if we can fetch user businesses via API simulation
    try {
      const userBusinessesData = await storage.getUserBusinesses(user.id);
      console.log('✓ /api/user/businesses endpoint data available:', userBusinessesData.length, 'businesses');
    } catch (error) {
      console.log('❌ Error fetching user businesses:', error.message);
    }
    
    try {
      const userClaimsData = await storage.getOwnershipClaimsByUser(user.id);
      console.log('✓ /api/ownership-claims/user/:id endpoint data available:', userClaimsData.length, 'claims');
    } catch (error) {
      console.log('❌ Error fetching user claims:', error.message);
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

testUserDashboard().then(() => {
  console.log('\nTest completed');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});