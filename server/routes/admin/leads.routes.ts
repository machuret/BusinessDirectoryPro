import { Router } from "express";
import { storage } from "../../storage";

const router = Router();

// Leads Management Routes
// Get all leads with optional filtering
router.get("/", async (req, res) => {
  try {
    const { status, businessId } = req.query;
    const filters: any = {};
    
    if (status) filters.status = status as string;
    if (businessId) filters.businessId = businessId as string;
    
    const leads = await storage.getLeads(filters);
    res.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Failed to fetch leads" });
  }
});

// Update lead status
router.patch("/:leadId/status", async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'contacted', 'converted', 'closed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const lead = await storage.updateLead(parseInt(leadId), { status });
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    
    res.json(lead);
  } catch (error) {
    console.error("Error updating lead status:", error);
    res.status(500).json({ message: "Failed to update lead status" });
  }
});

// Delete lead
router.delete("/:leadId", async (req, res) => {
  try {
    const leadId = parseInt(req.params.leadId);
    await storage.deleteLead(leadId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ message: "Failed to delete lead" });
  }
});

// Bulk delete leads
router.delete("/bulk", async (req, res) => {
  try {
    const { leadIds } = req.body;
    
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: "leadIds array is required" });
    }

    let deletedCount = 0;
    for (const leadId of leadIds) {
      try {
        await storage.deleteLead(leadId);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting lead ${leadId}:`, error);
      }
    }

    res.json({ 
      message: `${deletedCount} leads deleted successfully`,
      deletedCount 
    });
  } catch (error) {
    console.error("Error bulk deleting leads:", error);
    res.status(500).json({ message: "Failed to bulk delete leads" });
  }
});

// Mass update lead status
router.patch("/mass-status", async (req, res) => {
  try {
    const { leadIds, status } = req.body;
    
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: "Lead IDs array is required" });
    }

    if (!['pending', 'contacted', 'converted', 'closed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    for (const leadId of leadIds) {
      try {
        await storage.updateLead(leadId, { status });
      } catch (error) {
        console.error(`Error updating lead ${leadId}:`, error);
      }
    }

    res.json({ message: `${leadIds.length} leads updated successfully` });
  } catch (error) {
    console.error("Error mass updating lead status:", error);
    res.status(500).json({ message: "Failed to mass update lead status" });
  }
});

export default router;