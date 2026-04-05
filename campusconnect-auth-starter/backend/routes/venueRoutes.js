import express from 'express';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import { createVenue, getVenues } from '../controllers/venueController.js';

const router = express.Router();

router.get('/', protect, getVenues);
// Only admin can create venues as per user story
router.post('/', protect, allowRoles('admin'), createVenue);

export default router;
