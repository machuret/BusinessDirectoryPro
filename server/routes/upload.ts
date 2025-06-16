import { Router } from 'express';
import multer from 'multer';
import { azureBlobService } from '../azure-blob';

const router = Router();

// Configure multer for file uploads
const upload = multer({
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

// Upload image endpoint
router.post('/upload-image', upload.single('file'), async (req, res) => {
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