import { Router } from "express";
import { storage } from "../../storage";

const router = Router();

// Services Management Routes
// Get all services
router.get('/', async (req, res) => {
  try {
    const services = await storage.getServices();
    res.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Failed to fetch services" });
  }
});

// Create new service
router.post('/', async (req, res) => {
  try {
    const serviceData = {
      ...req.body,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    };
    const service = await storage.createService(serviceData);
    res.status(201).json(service);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Failed to create service" });
  }
});

// Update service
router.put('/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const service = await storage.updateService(serviceId, req.body);
    
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    
    res.json(service);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Failed to update service" });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    await storage.deleteService(serviceId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Failed to delete service" });
  }
});

// Generate services using AI
router.post('/generate', async (req, res) => {
  try {
    const result = await storage.generateServices();
    res.json(result);
  } catch (error) {
    console.error("Error generating services:", error);
    res.status(500).json({ message: "Failed to generate services" });
  }
});

export default router;