import { Express } from "express";
import { storage } from "../storage";

export function setupSettingsRoutes(app: Express) {
  // Get all site settings (public)
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settingsArray = await storage.getSiteSettings();
      const settings = settingsArray.reduce((acc: any, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Get specific site setting (admin only)
  app.get("/api/admin/site-settings/:key", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await storage.getSiteSetting(key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching site setting:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  // Update site setting (admin only)
  app.patch("/api/admin/site-settings/:key", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { key } = req.params;
      const { value, description, category } = req.body;
      
      const setting = await storage.updateSiteSetting(key, value, description, category);
      res.json(setting);
    } catch (error) {
      console.error("Error updating site setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Get all settings for admin interface
  app.get("/api/admin/site-settings", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching admin site settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Menu management
  app.get("/api/admin/menu-items", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { position } = req.query;
      const menuItems = await storage.getMenuItems(position as string);
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post("/api/admin/menu-items", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const menuItem = await storage.createMenuItem(req.body);
      res.status(201).json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put("/api/admin/menu-items/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const menuItem = await storage.updateMenuItem(id, req.body);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete("/api/admin/menu-items/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMenuItem(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Page management (CMS)
  app.get("/api/pages", async (req, res) => {
    try {
      const pages = await storage.getPages("published");
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getPageBySlug(slug);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  app.get("/api/admin/pages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const pages = await storage.getPages(status as string);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching admin pages:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.post("/api/admin/pages", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const pageData = { ...req.body, authorId: req.session.userId };
      const page = await storage.createPage(pageData);
      res.status(201).json(page);
    } catch (error) {
      console.error("Error creating page:", error);
      res.status(500).json({ message: "Failed to create page" });
    }
  });

  app.put("/api/admin/pages/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const page = await storage.updatePage(id, req.body);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error updating page:", error);
      res.status(500).json({ message: "Failed to update page" });
    }
  });

  app.delete("/api/admin/pages/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePage(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ message: "Failed to delete page" });
    }
  });

  app.patch("/api/admin/pages/:id/publish", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const page = await storage.publishPage(id, req.session.userId);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error publishing page:", error);
      res.status(500).json({ message: "Failed to publish page" });
    }
  });

  // Website FAQ management
  app.get("/api/website-faqs", async (req, res) => {
    try {
      const { category } = req.query;
      const faqs = await storage.getWebsiteFaqs(category as string);
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching website FAQs:", error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  app.get("/api/admin/website-faqs", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { category } = req.query;
      const faqs = await storage.getWebsiteFaqs(category as string);
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching admin website FAQs:", error);
      res.status(500).json({ message: "Failed to fetch FAQs" });
    }
  });

  app.post("/api/admin/website-faqs", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const faq = await storage.createWebsiteFaq(req.body);
      res.status(201).json(faq);
    } catch (error) {
      console.error("Error creating website FAQ:", error);
      res.status(500).json({ message: "Failed to create FAQ" });
    }
  });

  app.put("/api/admin/website-faqs/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const faq = await storage.updateWebsiteFaq(id, req.body);
      
      if (!faq) {
        return res.status(404).json({ message: "FAQ not found" });
      }
      
      res.json(faq);
    } catch (error) {
      console.error("Error updating website FAQ:", error);
      res.status(500).json({ message: "Failed to update FAQ" });
    }
  });

  app.delete("/api/admin/website-faqs/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteWebsiteFaq(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting website FAQ:", error);
      res.status(500).json({ message: "Failed to delete FAQ" });
    }
  });

  app.patch("/api/admin/website-faqs/reorder", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { faqIds } = req.body;
      await storage.reorderWebsiteFaqs(faqIds);
      res.json({ message: "FAQs reordered successfully" });
    } catch (error) {
      console.error("Error reordering website FAQs:", error);
      res.status(500).json({ message: "Failed to reorder FAQs" });
    }
  });

  // Contact messages
  app.post("/api/contact", async (req, res) => {
    try {
      const message = await storage.createContactMessage(req.body);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to send contact message" });
    }
  });

  app.get("/api/admin/contact-messages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.patch("/api/admin/contact-messages/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, adminNotes } = req.body;
      
      const message = await storage.updateContactMessageStatus(id, status, adminNotes);
      if (!message) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error updating contact message:", error);
      res.status(500).json({ message: "Failed to update contact message" });
    }
  });

  app.delete("/api/admin/contact-messages/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContactMessage(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ message: "Failed to delete contact message" });
    }
  });

  // Leads management
  app.get("/api/admin/leads", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const lead = await storage.createLead(req.body);
      res.status(201).json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.patch("/api/admin/leads/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const lead = await storage.updateLeadStatus(id, status);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/admin/leads/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteLead(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  app.get("/api/businesses/:businessId/leads", isAuthenticated, async (req: any, res) => {
    try {
      const { businessId } = req.params;
      const userId = req.session.userId;
      
      // Check if user owns the business or is admin
      const business = await storage.getBusinessById(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      if (business.ownerid !== userId) {
        const user = await storage.getUser(userId);
        if (!user || user.role !== 'admin') {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const leads = await storage.getLeadsByBusiness(businessId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching business leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // Business update and delete routes
  app.patch("/api/admin/businesses/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const business = await storage.updateBusiness(id, req.body);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      console.error("Error updating business:", error);
      res.status(500).json({ message: "Failed to update business" });
    }
  });

  app.delete("/api/admin/businesses/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBusiness(id);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting business:", error);
      res.status(500).json({ message: "Failed to delete business" });
    }
  });
}