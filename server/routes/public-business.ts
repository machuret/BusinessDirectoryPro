import type { Express } from "express";
import { storage } from "../storage";
import { nanoid } from "nanoid";

export function registerPublicBusinessRoutes(app: Express) {
  // Public business submission endpoint
  app.post("/api/public/submit-business", async (req, res) => {
    try {
      if (!req.session.userId) {
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
      const placeid = `user_submitted_${nanoid(12)}`;
      
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
        categoryid: categoryId,
        status: "pending", // Pending admin approval
        submittedby: req.session.userId,
        createdat: new Date(),
        updatedat: new Date(),
      };

      const newBusiness = await storage.createBusiness(businessData);
      
      res.status(201).json({ 
        message: "Business submitted successfully! It will be reviewed by our team.",
        business: newBusiness 
      });

    } catch (error) {
      console.error("Business submission error:", error);
      res.status(500).json({ message: "Failed to submit business" });
    }
  });
}