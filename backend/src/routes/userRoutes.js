import express from 'express';
import { updateUserProfile, getProviders, getUserById, verifyProvider, getUsers } from '../controllers/userController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.put('/profile', protect, updateUserProfile);
router.get('/providers', getProviders);
router.post('/:id/verify', protect, verifyProvider); // Should probably be admin only, but reusing protect for MVP
router.get('/:id', getUserById);

export default router;
