import { Router } from "express";
import { storage } from "../storage";
import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';

const router = Router();

// Site Settings API endpoints
router.get("/site-settings", async (req, res) => {
  try {
    const settings = await storage.getSiteSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error fetching site settings:", error);
    res.status(500).json({ message: "Failed to fetch site settings" });
  }
});

router.put("/site-settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const setting = await storage.updateSiteSetting(key, value);
    res.json(setting);
  } catch (error) {
    console.error("Error updating site setting:", error);
    res.status(500).json({ message: "Failed to update site setting" });
  }
});

// Admin Site Settings API endpoints
router.get("/admin/site-settings", async (req, res) => {
  try {
    const settings = await storage.getSiteSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error fetching admin site settings:", error);
    res.status(500).json({ message: "Failed to fetch admin site settings" });
  }
});

router.put("/admin/site-settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description, category } = req.body;

    if (!value) {
      return res.status(400).json({ message: 'Value is required' });
    }

    const updatedSetting = await storage.updateSiteSetting(
      key,
      value,
      description,
      category
    );

    res.json(updatedSetting);
  } catch (error) {
    console.error('Error updating site setting:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to update setting'
    });
  }
});

router.patch("/admin/site-settings/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const setting = await storage.updateSiteSetting(key, value);
    res.json(setting);
  } catch (error) {
    console.error("Error updating admin site setting:", error);
    res.status(500).json({ message: "Failed to update admin site setting" });
  }
});

// Test Azure Blob Storage connection
router.post("/admin/azure-blob/test", async (req, res) => {
  try {
    const settings = await storage.getSiteSettings();
    
    const accountName = settings.find(s => s.key === "azure_blob_account_name")?.value;
    const accountKey = settings.find(s => s.key === "azure_blob_account_key")?.value;
    const containerName = settings.find(s => s.key === "azure_blob_container")?.value || "uploads";
    const connectionString = settings.find(s => s.key === "azure_blob_connection_string")?.value;

    if (!accountName || (!accountKey && !connectionString)) {
      return res.status(400).json({ 
        success: false,
        message: "Azure Blob Storage configuration is incomplete. Please provide account name and either account key or connection string." 
      });
    }

    // Use imported Azure Blob Storage SDK
    
    let blobServiceClient;

    if (connectionString) {
      blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    } else if (accountName && accountKey) {
      const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
      blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        sharedKeyCredential
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid Azure Blob Storage configuration"
      });
    }

    // Test connection by listing containers
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Check if container exists, create if it doesn't
    const exists = await containerClient.exists();
    if (!exists) {
      await containerClient.create({ access: 'blob' });
    }

    // Try to upload a small test file
    const testBlobName = `test-${Date.now()}.txt`;
    const testContent = "Azure Blob Storage test connection successful";
    const blockBlobClient = containerClient.getBlockBlobClient(testBlobName);
    
    await blockBlobClient.upload(testContent, testContent.length);
    
    // Clean up test file
    await blockBlobClient.delete();

    res.json({
      success: true,
      message: "Azure Blob Storage connection test successful",
      details: {
        accountName,
        containerName,
        containerExists: true,
        testFileUploaded: true,
        testFileDeleted: true
      }
    });

  } catch (error) {
    console.error("Azure Blob Storage test failed:", error);
    res.status(500).json({
      success: false,
      message: "Azure Blob Storage connection test failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;