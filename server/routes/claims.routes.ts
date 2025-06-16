import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Ownership claim routes
router.get('/admin/ownership-claims', async (req, res) => {
  try {
    const claims = await storage.getOwnershipClaims();
    res.json(claims);
  } catch (error) {
    console.error("Error fetching ownership claims:", error);
    res.status(500).json({ message: "Failed to fetch ownership claims" });
  }
});

router.post('/ownership-claims', async (req: any, res) => {
  try {
    // For now, use a demo user ID - in production this would come from authentication
    const userId = req.user?.id || 'demo-user-1';
    
    const claimData = { 
      ...req.body, 
      userId, 
      status: 'pending' 
    };
    
    console.log('Creating ownership claim:', claimData);
    const claim = await storage.createOwnershipClaim(claimData);
    res.status(201).json(claim);
  } catch (error) {
    console.error("Error creating ownership claim:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to create ownership claim",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.patch('/admin/ownership-claims/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { status, adminMessage } = req.body;
    const reviewedBy = req.user?.id || 'demo-admin';
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'pending', 'approved', or 'rejected'" });
    }
    
    console.log(`Admin ${reviewedBy} updating ownership claim ${id} to status: ${status}`);
    const claim = await storage.updateOwnershipClaim(parseInt(id), status, adminMessage, reviewedBy);
    
    if (!claim) {
      return res.status(404).json({ message: "Ownership claim not found" });
    }
    
    res.json(claim);
  } catch (error) {
    console.error("Error updating ownership claim:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to update ownership claim",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get('/my-ownership-claims', async (req: any, res) => {
  try {
    const userId = req.user?.id || 'demo-user-1';
    console.log(`Fetching ownership claims for user: ${userId}`);
    const claims = await storage.getOwnershipClaimsByUser(userId);
    res.json(claims);
  } catch (error) {
    console.error("Error fetching user ownership claims:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to fetch ownership claims",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get('/ownership-claims/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const claims = await storage.getOwnershipClaimsByUser(userId);
    res.json(claims);
  } catch (error) {
    console.error("Error fetching user ownership claims:", error);
    res.status(500).json({ 
      message: "Failed to fetch user ownership claims",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.put('/admin/ownership-claims/:id', async (req, res) => {
  try {
    const claimId = parseInt(req.params.id);
    const { status, adminMessage } = req.body;
    
    // Get reviewer ID from session or use demo-admin as fallback
    const session = req.session as any;
    const reviewedBy = session?.userId || 'demo-admin';
    
    const updatedClaim = await storage.updateOwnershipClaim(claimId, status, adminMessage, reviewedBy);
    res.json(updatedClaim);
  } catch (error) {
    console.error("Error updating ownership claim:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to update ownership claim"
    });
  }
});

router.delete('/admin/ownership-claims/:id', async (req, res) => {
  try {
    const claimId = parseInt(req.params.id);
    
    await storage.deleteOwnershipClaim(claimId);
    res.json({ success: true, message: "Ownership claim deleted successfully" });
  } catch (error) {
    console.error("Error deleting ownership claim:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to delete ownership claim"
    });
  }
});

// Revert ownership claim (admin functionality)
router.put('/admin/ownership-claims/:id/revert', async (req, res) => {
  try {
    const claimId = parseInt(req.params.id);
    const { adminMessage } = req.body;
    
    // Get reviewer ID from session or use demo-admin as fallback
    const session = req.session as any;
    const reviewedBy = session?.userId || 'demo-admin';
    
    // Update claim status to 'rejected' and remove business ownership
    const updatedClaim = await storage.updateOwnershipClaim(claimId, 'rejected', adminMessage || 'Ownership reverted by admin', reviewedBy);
    
    if (updatedClaim) {
      // Remove business ownership if it was previously approved
      // Note: This method may need to be implemented in storage
      // await storage.removeBusinessOwnership(updatedClaim.businessId);
    }
    
    res.json({ 
      success: true, 
      message: "Ownership claim reverted successfully",
      claim: updatedClaim 
    });
  } catch (error) {
    console.error("Error reverting ownership claim:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to revert ownership claim"
    });
  }
});

// Create ownership claim with validation
router.post('/ownership-claims', async (req: any, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { businessId, message } = req.body;

    if (!userId || !businessId || !message) {
      return res.status(400).json({ 
        message: "User ID, business ID, and message are required" 
      });
    }

    if (message.trim().length < 50) {
      return res.status(400).json({ 
        message: "Message must be at least 50 characters long" 
      });
    }

    const claimData = {
      userId,
      businessId,
      message: message.trim(),
      status: 'pending'
    };

    const newClaim = await storage.createOwnershipClaim(claimData);
    res.status(201).json(newClaim);
  } catch (error) {
    console.error("Error creating ownership claim:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to create ownership claim"
    });
  }
});

export default router;