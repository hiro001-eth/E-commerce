/**
 * Comprehensive Security Configuration for Dokan Multi-Vendor Platform
 * Implements CSRF protection, security headers, rate limiting, and CORS
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import cors from 'cors';
import crypto from 'crypto';
import type { Application, Request, Response, NextFunction } from 'express';

/**
 * Security Headers Configuration with Helmet
 */
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https:", "wss:", process.env.NODE_ENV === 'development' ? "ws:" : ""].filter(Boolean),
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  
  // Security headers
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // Referrer policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

/**
 * CORS Configuration
 */
export const corsOptions = cors({
  origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    // Allow development origins and production domain
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Check exact matches first
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    
    // Secure Replit domain validation
    const url = new URL(origin);
    if (url.protocol === 'https:' && (
        url.hostname.endsWith('.replit.app') || 
        url.hostname.endsWith('.replit.dev')
    )) {
      callback(null, true);
      return;
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  // allowedHeaders removed to automatically reflect request headers
});

/**
 * Rate Limiting Configuration
 */
export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests to static assets
  skip: (req) => {
    return req.url.startsWith('/assets/') || 
           req.url.startsWith('/images/') || 
           req.url.endsWith('.css') || 
           req.url.endsWith('.js');
  }
});

/**
 * Strict Rate Limiting for Authentication Endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
  // Skip removed - middleware mounting handles scoping
});

/**
 * API Rate Limiting
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 API calls per window
  message: {
    error: 'API rate limit exceeded, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
  // Skip removed - middleware mounting handles scoping
});

/**
 * Slow Down Middleware for Additional Protection
 */
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per window without delay
  delayMs: () => 100, // Add 100ms delay per request after delayAfter
  maxDelayMs: 5000, // Maximum delay of 5 seconds
});

/**
 * Modern CSRF Protection using Double-Submit Cookie Pattern
 * Since the deprecated csurf package is no longer maintained
 */
export class CSRFProtection {
  private static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Set CSRF token in cookie and make it available for client
   */
  static setToken(req: Request, res: Response): string {
    const token = this.generateToken();
    
    // Set secure HTTP-only cookie for CSRF token
    res.cookie('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    
    // Also set a readable cookie for client JavaScript
    res.cookie('csrf-token-client', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    
    return token;
  }

  /**
   * Middleware to verify CSRF token
   */
  static verify(req: Request, res: Response, next: NextFunction): void {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    const cookieToken = req.cookies['csrf-token'];
    const headerToken = req.headers['x-csrf-token'] as string;
    
    if (!cookieToken || !headerToken) {
      res.status(403).json({ 
        error: 'CSRF token missing',
        message: 'CSRF protection requires valid token'
      });
      return;
    }

    if (cookieToken !== headerToken) {
      res.status(403).json({ 
        error: 'CSRF token mismatch',
        message: 'Invalid CSRF token provided'
      });
      return;
    }

    next();
  }

  /**
   * Endpoint to get CSRF token for client
   */
  static getToken(req: Request, res: Response): Response {
    const token = this.setToken(req, res);
    return res.json({ csrfToken: token });
  }
}

/**
 * Selective Input Sanitization for HTML content only
 * Only sanitize fields that are meant to be displayed as HTML
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  // Only sanitize specific fields that may contain HTML
  if (req.body && typeof req.body === 'object') {
    const htmlFields = ['description', 'bio', 'content', 'storeDescription'];
    
    for (const field of htmlFields) {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = sanitizeHtml(req.body[field]);
      }
    }
  }
  next();
};

function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * Security Configuration Setup
 */
export function configureSecurity(app: Application): void {
  // Apply security headers
  app.use(securityHeaders);
  
  // Configure CORS
  app.use(corsOptions);
  
  // Apply rate limiting
  app.use(globalRateLimit);
  app.use('/api/auth/', authRateLimit);
  app.use('/api/', apiRateLimit);
  app.use(speedLimiter);
  
  // Apply selective input sanitization
  app.use(sanitizeInput);
  
  // CSRF token endpoint (before CSRF verification)
  app.get('/api/csrf-token', CSRFProtection.getToken);
  
  // Apply CSRF protection to state-changing requests
  app.use('/api/', (req, res, next) => {
    // Skip CSRF for certain endpoints that handle their own security
    // Note: req.path excludes the mount point, so use relative paths
    const skipCsrfPaths = [
      '/auth/login',
      '/auth/logout', 
      '/csrf-token'
    ];
    
    if (skipCsrfPaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    CSRFProtection.verify(req, res, next);
  });
  
  // Production security checks
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.ADMIN_PASSWORD) {
      console.error('🚨 CRITICAL: ADMIN_PASSWORD must be set in production!');
      process.exit(1);
    }
  }
  
  console.log('🔒 Security hardening configured successfully');
}

/**
 * Security headers for production
 */
export const productionSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'production') {
    // Force HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Additional security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  next();
};