import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';

// Configuration
const SALT_ROUNDS = 12;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secure-encryption-key-2024-dokan-marketplace';

/**
 * Password hashing utilities using bcrypt
 */
export class PasswordCrypto {
  /**
   * Hash a password with a random salt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      return hashedPassword;
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare a plain password with a hashed password
   */
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      throw new Error('Failed to compare password');
    }
  }
}

/**
 * Data encryption utilities using AES encryption
 */
export class DataCrypto {
  /**
   * Encrypt sensitive data
   */
  static encrypt(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
      return encrypted;
    } catch (error) {
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        throw new Error('Invalid encrypted data');
      }
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash sensitive IDs and tokens for secure storage
   */
  static hashSensitiveId(id: string): string {
    try {
      const hash = CryptoJS.SHA256(id + ENCRYPTION_KEY).toString();
      return hash;
    } catch (error) {
      throw new Error('Failed to hash sensitive ID');
    }
  }
}

/**
 * Session security utilities
 */
export class SessionCrypto {
  /**
   * Generate a secure session token
   */
  static generateSessionToken(): string {
    const randomBytes = CryptoJS.lib.WordArray.random(32);
    return CryptoJS.SHA256(randomBytes.toString() + Date.now()).toString();
  }

  /**
   * Sanitize user data for session storage (remove sensitive fields)
   */
  static sanitizeUserForSession(user: any) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

/**
 * Input validation and sanitization
 */
export class InputSecurity {
  /**
   * Sanitize HTML input to prevent XSS attacks
   */
  static sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Rate limiting helper to prevent brute force attacks
   */
  static rateLimitKey(ip: string, action: string): string {
    return `rate_limit_${action}_${ip}`;
  }
}

/**
 * Audit logging for security events
 */
export class SecurityAudit {
  /**
   * Log security events for monitoring
   */
  static logSecurityEvent(event: {
    type: 'login' | 'registration' | 'password_change' | 'admin_action' | 'failed_login';
    userId?: string;
    ip?: string;
    userAgent?: string;
    details?: any;
  }) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      ...event,
      encrypted: true
    };
    
    // In production, this should be sent to a secure logging service
    console.log(`[SECURITY_AUDIT] ${timestamp}:`, JSON.stringify(logEntry));
  }
}