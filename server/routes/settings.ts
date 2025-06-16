import { Router } from 'express';
import { storage } from '../storage/comprehensive-storage';
import { body, validationResult } from 'express-validator';

const router = Router();

// Update site setting
router.put('/site-settings/:key', [
  body('value').notEmpty().withMessage('Value is required'),
  body('description').optional().isString(),
  body('category').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { key } = req.params;
    const { value, description, category } = req.body;

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

export default router;