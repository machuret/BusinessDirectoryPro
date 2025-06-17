import { Express } from "express";
import { storage } from "../storage";

export function setupBusinessRoutes(app: Express) {
  // Business submission endpoint
  app.post("/api/submit-business", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Must be logged in to submit a business" });
      }

      const { title, description, address, city, phone, email, website, hours, categoryId } = req.body;

      // Basic validation
      if (!title || !description || !address || !city || !categoryId) {
        return res.status(400).json({ 
          message: "Business name, description, address, city, and category are required" 
        });
      }

      // Create business with basic info
      const placeid = `user_submitted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate slug from title
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      const businessData = {
        placeid,
        title,
        description,
        address,
        city,
        phone: phone || null,
        email: email || null,
        website: website || null,
        hours: hours || null,
        categoryId: parseInt(categoryId),
        slug,
        submittedBy: userId,
        status: 'pending',
        approved: false,
        featured: false
      };

      const business = await storage.createBusiness(businessData);
      
      res.status(201).json({
        message: "Business submitted successfully and is pending approval",
        business: business
      });
    } catch (error: any) {
      console.error("Business submission error:", error);
      res.status(500).json({ message: "Failed to submit business" });
    }
  });
}