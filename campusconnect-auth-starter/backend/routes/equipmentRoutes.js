import express from 'express';
import { createEquipmentRequest } from '../controllers/equipmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// The user must be logged in (protected) to request equipment
router.post('/', protect, createEquipmentRequest);

export default router;
