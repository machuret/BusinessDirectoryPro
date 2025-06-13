import { Router } from "express";
import { storage } from "../storage";
import { optimizeBusinessDescription, generateBusinessFAQ } from "../openai";
import { isAuthenticated } from "../auth";

const router = Router();

// Optimize business content using AI
router.post("/optimize-businesses", async (req, res) => {
  try {
    const { businessIds, type } = req.body;

    if (!businessIds || !Array.isArray(businessIds) || businessIds.length === 0) {
      return res.status(400).json({ message: "Business IDs are required" });
    }

    if (!type || !['descriptions', 'faqs'].includes(type)) {
      return res.status(400).json({ message: "Type must be 'descriptions' or 'faqs'" });
    }

    const results = [];
    const errors = [];

    for (const businessId of businessIds) {
      try {
        const business = await storage.getBusinessById(businessId);
        if (!business) {
          errors.push({ businessId, error: "Business not found" });
          continue;
        }

        if (type === 'description') {
          const optimizedDescription = await optimizeBusinessDescription(business);
          await storage.updateBusiness(businessId, { description: optimizedDescription });
          results.push({ businessId, type: 'description', result: optimizedDescription });
        } else if (type === 'faq') {
          const generatedFAQ = await generateBusinessFAQ(business);
          await storage.updateBusiness(businessId, { faq: generatedFAQ });
          results.push({ businessId, type: 'faq', result: generatedFAQ });
        }
      } catch (error) {
        console.error(`Error optimizing business ${businessId}:`, error);
        errors.push({ 
          businessId, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    res.status(200).json({
      success: results.length,
      errorCount: errors.length,
      results,
      errors: errors
    });

  } catch (error) {
    console.error("Error in optimize-businesses:", error);
    res.status(500).json({ 
      message: "Failed to optimize businesses", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Optimize single business description
router.post("/optimize-description/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const business = await storage.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const optimizedDescription = await optimizeBusinessDescription(business);
    await storage.updateBusiness(businessId, { description: optimizedDescription });

    res.status(200).json({
      businessId,
      originalDescription: business.description,
      optimizedDescription
    });

  } catch (error) {
    console.error("Error optimizing description:", error);
    res.status(500).json({ 
      message: "Failed to optimize description", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Generate FAQ for single business
router.post("/generate-faq/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const business = await storage.getBusinessById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const generatedFAQ = await generateBusinessFAQ(business);
    await storage.updateBusiness(businessId, { faq: generatedFAQ });

    res.status(200).json({
      businessId,
      generatedFAQ
    });

  } catch (error) {
    console.error("Error generating FAQ:", error);
    res.status(500).json({ 
      message: "Failed to generate FAQ", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

export default router;