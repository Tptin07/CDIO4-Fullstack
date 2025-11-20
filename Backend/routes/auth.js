import express from 'express';
import { register, login, getCurrentUser, updateProfile, getUserAddresses, saveAddress } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (cần đăng nhập)
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, updateProfile);
router.get('/addresses', authenticateToken, getUserAddresses);
router.post('/addresses', authenticateToken, saveAddress);
router.put('/addresses/:id', authenticateToken, saveAddress);

export default router;

