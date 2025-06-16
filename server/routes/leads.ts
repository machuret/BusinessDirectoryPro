import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, isAdmin } from "../auth";
import { canUserAccessLead, getLeadsForUser, validateLeadData, isValidLeadStatus } from "../services/lead.service";

export function setupLeadRoutes(app: Express) {
  // Public endpoint for submitting leads (contact form submissions)
  app.post('/api/leads', async (req, res) => {
    try {
      const { businessId, senderName, senderEmail, senderPhone, message } = req.body;

      // Validate lead data using service
      const validation = validateLeadData(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ message: validation.error });
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

  // Admin route to get ALL leads regardless of ownership status
  app.get('/api/admin/leads', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      // Admin sees ALL leads from all businesses
      const leads = await storage.getAllLeads();
      res.json(leads);
    } catch (error) {
      console.error('Error fetching admin leads:', error);
      res.status(500).json({ message: 'Failed to fetch admin leads' });
    }
  });

  // Get leads for authenticated users (admin gets unclaimed business leads, owners get their business leads)
  app.get('/api/leads', isAuthenticated, async (req: any, res) => {
    try {
      const session = req.session as any;
      const userId = session?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Use service to get leads based on user role and permissions
      const leads = await getLeadsForUser(userId);
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
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Check access permission using service
      const hasAccess = await canUserAccessLead(userId, leadId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const lead = await storage.getLead(leadId);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
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
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Validate status using service
      if (!status || !isValidLeadStatus(status)) {
        return res.status(400).json({ 
          message: 'Invalid status. Must be one of: new, contacted, qualified, converted, closed' 
        });
      }

      // Check access permission using service
      const hasAccess = await canUserAccessLead(userId, leadId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedLead = await storage.updateLeadStatus(leadId, status);
      if (!updatedLead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

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
      const userId = req.session?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Check access permission using service
      const hasAccess = await canUserAccessLead(userId, leadId);
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