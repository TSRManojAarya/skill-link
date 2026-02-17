import express from 'express';
import { createReview, getReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/:providerId', getReviews);

export default router;
