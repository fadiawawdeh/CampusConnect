import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMyBookings, cancelReservation } from '../controllers/reservationController.js';

const router = express.Router();

router.get('/my-bookings', protect, getMyBookings);
router.put('/:id/cancel', protect, cancelReservation);

export default router;
