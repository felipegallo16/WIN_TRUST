import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const ip = req.ip || 'unknown';
  const now = Date.now();

  // Clean up old entries
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });

  // Initialize or get current rate limit for IP
  if (!store[ip]) {
    store[ip] = {
      count: 0,
      resetTime: now + WINDOW_MS,
    };
  }

  // Check if rate limit exceeded
  if (store[ip].count >= MAX_REQUESTS) {
    res.status(429).json({
      error: 'Demasiadas solicitudes. Por favor, intente nuevamente en un minuto.',
    });
    return;
  }

  // Increment counter
  store[ip].count++;

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
  res.setHeader('X-RateLimit-Remaining', MAX_REQUESTS - store[ip].count);
  res.setHeader('X-RateLimit-Reset', store[ip].resetTime);

  next();
};