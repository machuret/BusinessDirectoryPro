import { Router } from "express";
import multer from "multer";
import { csvImportService } from "../csv-import";
import { azureBlobService } from "../azure-blob";

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept CSV files for any field name
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// Configure multer for image uploads
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// CSV Import functionality - Preview
router.post('/admin/import-csv-preview', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const preview = await csvImportService.previewImport(req.file.buffer, 10);
    res.json(preview);
  } catch (error) {
    console.error('Error previewing CSV:', error);
    res.status(500).json({ message: 'Failed to preview CSV data' });
  }
});

// CSV Import functionality - Validate only
router.post('/admin/import-csv-validate', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const csvData = await csvImportService.parseCSV(req.file.buffer);
    const result = await csvImportService.importBusinesses(csvData, {
      validateOnly: true,
      updateDuplicates: false,
      skipDuplicates: true,
      batchSize: 50
    });
    
    res.json({
      ...result,
      message: `Validation completed. ${result.success} valid rows, ${result.errors.length} errors found.`
    });
  } catch (error) {
    console.error('Error validating CSV:', error);
    res.status(500).json({ message: 'Failed to validate CSV data' });
  }
});

// CSV Import functionality - Full import
router.post('/admin/import-csv', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const { updateDuplicates = false, skipDuplicates = true, batchSize = 50 } = req.body;
    
    const csvData = await csvImportService.parseCSV(req.file.buffer);
    const result = await csvImportService.importBusinesses(csvData, {
      validateOnly: false,
      updateDuplicates: updateDuplicates === 'true',
      skipDuplicates: skipDuplicates === 'true',
      batchSize: parseInt(batchSize) || 50
    });

    res.json({
      ...result,
      message: `Import completed. ${result.created} created, ${result.updated} updated, ${result.duplicatesSkipped} duplicates skipped, ${result.errors.length} errors.`
    });
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ message: 'Failed to import CSV data' });
  }
});

// Azure Blob Storage upload endpoint
router.post('/admin/upload-image', uploadImage.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { type } = req.body;
    
    if (!type || !['logo', 'background'].includes(type)) {
      return res.status(400).json({ message: 'Invalid upload type. Must be "logo" or "background"' });
    }

    // Generate unique filename
    const fileName = azureBlobService.generateFileName(req.file.originalname, type as 'logo' | 'background');
    
    // Upload to Azure Blob Storage
    const url = await azureBlobService.uploadFile(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );

    res.json({
      success: true,
      url,
      fileName,
      type,
      originalName: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Failed to upload file',
      success: false 
    });
  }
});

export default router;