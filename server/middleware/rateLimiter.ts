import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../utils/errors';

export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res) => {
    throw new RateLimitError();
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true,
});

export const analysisLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 analysis requests per minute
  message: 'Too many analysis requests, please try again later',
});

export const exportLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 export requests per minute
  message: 'Too many export requests, please try again later',
});
