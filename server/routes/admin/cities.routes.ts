import { Router } from "express";
import { storage } from "../../storage";

const router = Router();

// City Management Routes
// Create new city
router.post("/", async (req, res) => {
  try {
    const city = await storage.createCity(req.body);
    res.status(201).json(city);
  } catch (error) {
    console.error("Error creating city:", error);
    res.status(500).json({ message: "Failed to create city" });
  }
});

// Update city
router.put("/:id", async (req, res) => {
  try {
    const cityId = parseInt(req.params.id);
    const city = await storage.updateCity(cityId, req.body);
    
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }
    
    res.json(city);
  } catch (error) {
    console.error("Error updating city:", error);
    res.status(500).json({ message: "Failed to update city" });
  }
});

// Delete city
router.delete("/:id", async (req, res) => {
  try {
    const cityId = parseInt(req.params.id);
    await storage.deleteCity(cityId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting city:", error);
    res.status(500).json({ message: "Failed to delete city" });
  }
});

export default router;