import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin } from "../auth";

export function setupLeadRoutes(app: Express) {
  // Public endpoint for submitting leads (contact form submissions)
  app.post('/api/leads', async (req, res) => {
    try {
      const { businessId, senderName, senderEmail, senderPhone, message } = req.body;

      // Validate required fields
      if (!businessId || !senderName || !senderEmail || !message) {
        return res.status(400).json({ 
          message: 'Missing required fields: businessId, senderName, senderEmail, message' 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(senderEmail)) {
        return res.status(400).json({ 
          message: 'Invalid email format' 
        });
      }

      // Create the lead
      const lead = await storage.createLead({
        businessId,
        senderName,
        senderEmail,
        senderPhone: senderPhone || null,
        message,
        status: 'new'
      });

      res.status(201).json({ 
        message: 'Lead submitted successfully',
        leadId: lead.id 
      });
    } catch (error) {
      console.error('Error creating lead:', error);
      res.status(500).json({ message: 'Failed to submit lead' });
    }
  });

  // Get leads for authenticated users (admin gets unclaimed business leads, owners get their business leads)
  app.get('/api/leads', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      let leads;

      if (user.role === 'admin') {
        // Admin sees leads from unclaimed businesses
        leads = await storage.getAdminLeads();
      } else {
        // Business owners see leads from their claimed businesses
        leads = await storage.getOwnerLeads(user.id);
      }

      res.json(leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      res.status(500).json({ message: 'Failed to fetch leads' });
    }
  });

  // Get specific lead by ID (with ownership validation)
  app.get('/api/leads/:id', isAuthenticated, async (req: any, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const user = req.user;

      const lead = await storage.getLead(leadId);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      // Check if user has access to this lead
      const { isClaimed, ownerId } = await storage.isBusinessClaimed(lead.businessId);
      
      let hasAccess = false;
      if (user.role === 'admin' && !isClaimed) {
        // Admin can access leads from unclaimed businesses
        hasAccess = true;
      } else if (isClaimed && ownerId === user.id) {
        // Business owner can access leads from their claimed businesses
        hasAccess = true;
      }

      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(lead);
    } catch (error) {
      console.error('Error fetching lead:', error);
      res.status(500).json({ message: 'Failed to fetch lead' });
    }
  });

  // Update lead status (admin only for unclaimed businesses, owners for their businesses)
  app.patch('/api/leads/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const { status } = req.body;
      const user = req.user;

      if (!status || !['new', 'contacted', 'qualified', 'converted', 'closed'].includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid status. Must be one of: new, contacted, qualified, converted, closed' 
        });
      }

      const lead = await storage.getLead(leadId);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      // Check if user has access to this lead
      const { isClaimed, ownerId } = await storage.isBusinessClaimed(lead.businessId);
      
      let hasAccess = false;
      if (user.role === 'admin' && !isClaimed) {
        // Admin can update leads from unclaimed businesses
        hasAccess = true;
      } else if (isClaimed && ownerId === user.id) {
        // Business owner can update leads from their claimed businesses
        hasAccess = true;
      }

      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedLead = await storage.updateLeadStatus(leadId, status);
      res.json(updatedLead);
    } catch (error) {
      console.error('Error updating lead status:', error);
      res.status(500).json({ message: 'Failed to update lead status' });
    }
  });

  // Delete lead (admin only for unclaimed businesses, owners for their businesses)
  app.delete('/api/leads/:id', isAuthenticated, async (req: any, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const user = req.user;

      const lead = await storage.getLead(leadId);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      // Check if user has access to this lead
      const { isClaimed, ownerId } = await storage.isBusinessClaimed(lead.businessId);
      
      let hasAccess = false;
      if (user.role === 'admin' && !isClaimed) {
        // Admin can delete leads from unclaimed businesses
        hasAccess = true;
      } else if (isClaimed && ownerId === user.id) {
        // Business owner can delete leads from their claimed businesses
        hasAccess = true;
      }

      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await storage.deleteLead(leadId);
      res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
      console.error('Error deleting lead:', error);
      res.status(500).json({ message: 'Failed to delete lead' });
    }
  });

  // Get leads by business ID (for business detail pages - public read access)
  app.get('/api/businesses/:businessId/leads', isAuthenticated, async (req: any, res) => {
    try {
      const businessId = req.params.businessId;
      const user = req.user;

      // Check if user has access to this business's leads
      const { isClaimed, ownerId } = await storage.isBusinessClaimed(businessId);
      
      let hasAccess = false;
      if (user.role === 'admin' && !isClaimed) {
        // Admin can access leads from unclaimed businesses
        hasAccess = true;
      } else if (isClaimed && ownerId === user.id) {
        // Business owner can access leads from their claimed businesses
        hasAccess = true;
      }

      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const leads = await storage.getLeadsByBusiness(businessId);
      res.json(leads);
    } catch (error) {
      console.error('Error fetching business leads:', error);
      res.status(500).json({ message: 'Failed to fetch business leads' });
    }
  });
}