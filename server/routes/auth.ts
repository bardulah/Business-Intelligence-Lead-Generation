import { Router } from 'express';
import authService from '../services/authService';
import { authLimiter } from '../middleware/rateLimiter';
import { validateSchema, LoginSchema, RegisterSchema } from '../utils/validation';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

// Register new user
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const data = validateSchema(RegisterSchema, req.body);
    const result = await authService.register(data);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const data = validateSchema(LoginSchema, req.body);
    const result = await authService.login(data);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
