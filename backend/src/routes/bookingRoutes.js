import express from 'express';
import { createBooking, getBookings, updateBookingStatus } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All routes protected

router.route('/')
    .post(createBooking)
    .get(getBookings);

router.put('/:id/status', updateBookingStatus);

export default router;
