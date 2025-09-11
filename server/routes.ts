import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { 
  loginSchema, 
  registerSchema,
  insertProductSchema,
  insertOrderSchema,
  insertReviewSchema,
  insertCouponSchema,
  insertWishlistSchema,
  locationFilterSchema,
  insertVendorSchema,
  vendorLocationSchema,
  vendorDeliverySchema,
  vendorSettingsSchema,
  changePasswordSchema,
  changeEmailSchema,
  type User,
  type Product,
  type Vendor,
  type Order,
  type Cart,
  type Review,
  type Coupon,
  type Category,
  type Wishlist,
  type UserDTO,
  type ProductDTO,
  type VendorDTO,
  type OrderDTO,
  type CartItemDTO,
  type ReviewDTO,
  type CouponDTO,
  type CategoryDTO,
  type WishlistDTO
} from "@shared/schema";
import { z } from "zod";
import { PasswordCrypto, DataCrypto, SessionCrypto, InputSecurity, SecurityAudit } from "./crypto";
import { getChatResponse, type ChatRequest } from "./openai";

const MemStore = MemoryStore(session);

// Multer configuration for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'products');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WEBP) are allowed'));
    }
  }
});

// Entity to DTO mapping functions
function mapUserToDTO(user: User): UserDTO {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    address: user.address,
    isActive: user.isActive,
    createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

function mapVendorToDTO(vendor: Vendor): VendorDTO {
  return {
    id: vendor.id,
    userId: vendor.userId,
    storeName: vendor.storeName,
    storeDescription: vendor.storeDescription,
    businessLicense: vendor.businessLicense,
    storeLocation: vendor.storeLocation,
    deliveryAreas: vendor.deliveryAreas ?? [],
    deliveryRadius: vendor.deliveryRadius ?? 10,
    deliveryFee: vendor.deliveryFee ?? "0",
    freeDeliveryThreshold: vendor.freeDeliveryThreshold ?? "50",
    isApproved: vendor.isApproved,
    rating: vendor.rating ?? "0",
    totalSales: vendor.totalSales ?? "0",
    createdAt: vendor.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

function mapProductToDTO(product: Product, vendor?: Vendor): ProductDTO {
  return {
    id: product.id,
    vendorId: product.vendorId,
    categoryId: product.categoryId,
    name: product.name,
    description: product.description,
    price: product.price,
    discountPrice: product.discountPrice,
    stock: product.stock,
    images: product.images || [],
    sku: product.sku,
    availableInAreas: product.availableInAreas || [],
    requiresShipping: product.requiresShipping,
    isActive: product.isActive,
    allowsCoupons: product.allowsCoupons,
    rating: product.rating || "0",
    reviewCount: product.reviewCount || 0,
    createdAt: product.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: product.updatedAt?.toISOString() ?? new Date().toISOString(),
    ...(vendor && {
      vendor: {
        storeName: vendor.storeName,
        deliveryFee: vendor.deliveryFee ?? "0",
        freeDeliveryThreshold: vendor.freeDeliveryThreshold ?? "50",
        deliveryRadius: vendor.deliveryRadius ?? 10,
        deliveryAreas: vendor.deliveryAreas || [],
      }
    })
  };
}

function mapOrderToDTO(order: Order): OrderDTO {
  return {
    id: order.id,
    userId: order.userId,
    vendorId: order.vendorId,
    total: order.total,
    status: order.status,
    paymentMethod: order.paymentMethod,
    deliveryAddress: order.deliveryAddress,
    couponCode: order.couponCode,
    discount: order.discount ?? "0",
    createdAt: order.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: order.updatedAt?.toISOString() ?? new Date().toISOString(),
  };
}

function mapCartToDTO(cart: Cart, product?: Product, vendor?: Vendor): CartItemDTO {
  return {
    id: cart.id,
    userId: cart.userId,
    productId: cart.productId,
    quantity: cart.quantity,
    createdAt: cart.createdAt?.toISOString() ?? new Date().toISOString(),
    ...(product && { product: mapProductToDTO(product, vendor) })
  };
}

function mapWishlistToDTO(wishlist: Wishlist, product?: Product, vendor?: Vendor): WishlistDTO {
  return {
    id: wishlist.id,
    userId: wishlist.userId,
    productId: wishlist.productId,
    createdAt: wishlist.createdAt?.toISOString() ?? new Date().toISOString(),
    ...(product && { product: mapProductToDTO(product, vendor) })
  };
}

function mapReviewToDTO(review: Review): ReviewDTO {
  return {
    id: review.id,
    userId: review.userId,
    productId: review.productId,
    vendorId: review.vendorId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

function mapCouponToDTO(coupon: Coupon): CouponDTO {
  return {
    id: coupon.id,
    vendorId: coupon.vendorId,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minOrderAmount: coupon.minOrderAmount,
    maxDiscount: coupon.maxDiscount,
    expiryDate: coupon.expiryDate?.toISOString() || null,
    isActive: coupon.isActive,
    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount ?? 0,
    createdAt: coupon.createdAt?.toISOString() ?? new Date().toISOString(),
  };
}

function mapCategoryToDTO(category: Category): CategoryDTO {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    isActive: category.isActive,
  };
}

declare module "express-session" {
  interface SessionData {
    user?: User;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Session middleware
  app.use(
    session({
      store: new MemStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || "dokan-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax", // Important for cross-origin requests
      },
    })
  );

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireRole = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Validate password strength
      const passwordValidation = InputSecurity.validatePasswordStrength(data.password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ 
          message: "Password does not meet security requirements", 
          errors: passwordValidation.errors 
        });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Hash password before storing
      const { confirmPassword, password, ...userData } = data;
      const hashedPassword = await PasswordCrypto.hashPassword(password);
      
      // Create user with hashed password
      const user = await storage.createUser({ 
        ...userData, 
        password: hashedPassword 
      });
      
      // If user is registering as vendor, create vendor record
      if (data.role === "vendor") {
        await storage.createVendor({
          userId: user.id,
          storeName: `${user.firstName} ${user.lastName}'s Store`,
          isApproved: true, // Automatic activation - no manual approval required
        });
      }
      
      // Set session with sanitized user data
      req.session.user = SessionCrypto.sanitizeUserForSession(user);
      
      // Log security event
      SecurityAudit.logSecurityEvent({
        type: 'registration',
        userId: user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({ user: mapUserToDTO(user) });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        // Log failed login attempt
        SecurityAudit.logSecurityEvent({
          type: 'failed_login',
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          details: { email: data.email, reason: 'user_not_found' }
        });
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare password with hashed version
      const isPasswordValid = await PasswordCrypto.comparePassword(data.password, user.password);
      if (!isPasswordValid) {
        // Log failed login attempt
        SecurityAudit.logSecurityEvent({
          type: 'failed_login',
          userId: user.id,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          details: { email: data.email, reason: 'invalid_password' }
        });
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        SecurityAudit.logSecurityEvent({
          type: 'failed_login',
          userId: user.id,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          details: { email: data.email, reason: 'account_disabled' }
        });
        return res.status(401).json({ message: "Account is disabled" });
      }

      // Set session with sanitized user data
      req.session.user = SessionCrypto.sanitizeUserForSession(user);
      
      // Log successful login
      SecurityAudit.logSecurityEvent({
        type: 'login',
        userId: user.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({ user: mapUserToDTO(user) });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (req.session.user) {
      const fullUser = await storage.getUser(req.session.user.id);
      if (fullUser) {
        res.json({ user: mapUserToDTO(fullUser) });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Default admin login route
  app.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check for default admin credentials
      if (username === "admin" && password === "admin123") {
        // Check if admin user exists, create if not
        let adminUser = await storage.getUserByEmail("admin@dokan.com");
        
        if (!adminUser) {
          // Create default admin user
          const hashedPassword = await PasswordCrypto.hashPassword("admin123");
          adminUser = await storage.createUser({
            username: "admin",
            email: "admin@dokan.com",
            password: hashedPassword,
            role: "admin",
            firstName: "System",
            lastName: "Administrator",
            isActive: true,
          });
        }

        // Set session
        req.session.user = SessionCrypto.sanitizeUserForSession(adminUser);
        
        // Log security event
        SecurityAudit.logSecurityEvent({
          type: 'login',
          userId: adminUser.id,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        res.json({ user: mapUserToDTO(adminUser) });
      } else {
        res.status(401).json({ message: "Invalid admin credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Profile update route
  app.put("/api/profile", requireAuth, async (req, res) => {
    try {
      const allowedFields = ['firstName', 'lastName', 'phone'];
      const updates = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: Record<string, unknown>, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {} as Record<string, unknown>);

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const updatedUser = await storage.updateUser(req.session.user!.id, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update session
      req.session.user = updatedUser;

      res.json({ user: mapUserToDTO(updatedUser) });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Vendor application
  app.post("/api/vendor/apply", requireAuth, async (req, res) => {
    try {
      const { storeName, storeDescription, businessLicense } = req.body;
      
      if (!storeName) {
        return res.status(400).json({ message: "Store name is required" });
      }

      // Check if user already has a vendor application
      const existingVendor = await storage.getVendorByUserId(req.session.user!.id);
      if (existingVendor) {
        return res.status(400).json({ message: "Vendor application already exists" });
      }

      const vendor = await storage.createVendor({
        userId: req.session.user!.id,
        storeName,
        storeDescription: storeDescription || null,
        businessLicense: businessLicense || null,
        isApproved: true, // Automatic activation - no manual approval required
      });

      res.json(mapVendorToDTO(vendor));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current vendor information with auto-creation for vendor-role users
  app.get("/api/vendors/me", requireAuth, async (req, res) => {
    try {
      let vendor = await storage.getVendorByUserId(req.session.user!.id);
      
      // Auto-create vendor record if user has vendor role but no vendor record (legacy users)
      if (!vendor && req.session.user!.role === "vendor") {
        const user = await storage.getUser(req.session.user!.id);
        if (user && user.role === "vendor") {
          vendor = await storage.createVendor({
            userId: user.id,
            storeName: `${user.firstName} ${user.lastName}'s Store`,
            isApproved: true,
          });
        }
      }
      
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(mapVendorToDTO(vendor));
    } catch (error) {
      console.error("Vendor lookup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update vendor store location
  app.put("/api/vendor/location", requireAuth, requireRole(["vendor"]), async (req, res) => {
    try {
      const vendor = await storage.getVendorByUserId(req.session.user!.id);
      if (!vendor) {
        return res.status(403).json({ message: "Vendor not found" });
      }

      // Validate request body
      const validatedData = vendorLocationSchema.parse(req.body);
      
      const storeLocation = {
        street: validatedData.street,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        country: validatedData.country || "United States",
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
      };

      const updatedVendor = await storage.updateVendor(vendor.id, { storeLocation });
      if (!updatedVendor) {
        return res.status(500).json({ message: "Failed to update location" });
      }

      res.json(mapVendorToDTO(updatedVendor));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Location update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update vendor settings
  app.put("/api/vendor/settings", requireAuth, requireRole(["vendor"]), async (req, res) => {
    try {
      const vendor = await storage.getVendorByUserId(req.session.user!.id);
      if (!vendor) {
        return res.status(403).json({ message: "Vendor not found" });
      }

      const validatedData = vendorSettingsSchema.parse(req.body);
      
      const updatedVendor = await storage.updateVendor(vendor.id, validatedData);
      if (!updatedVendor) {
        return res.status(500).json({ message: "Failed to update vendor settings" });
      }

      res.json(mapVendorToDTO(updatedVendor));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Vendor settings update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Change user password
  app.put("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      
      const user = await storage.getUser(req.session.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isCurrentPasswordValid = await PasswordCrypto.verifyPassword(validatedData.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await PasswordCrypto.hashPassword(validatedData.newPassword);
      
      const updatedUser = await storage.updateUser(user.id, { password: hashedNewPassword });
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Password change error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Change user email
  app.put("/api/auth/change-email", requireAuth, async (req, res) => {
    try {
      const validatedData = changeEmailSchema.parse(req.body);
      
      const user = await storage.getUser(req.session.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify password before allowing email change
      const isPasswordValid = await PasswordCrypto.verifyPassword(validatedData.password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Password is incorrect" });
      }

      // Check if email is already taken
      const existingUser = await storage.getUserByEmail(validatedData.newEmail);
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({ message: "Email is already taken" });
      }

      const updatedUser = await storage.updateUser(user.id, { email: validatedData.newEmail });
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update email" });
      }

      // Update session
      req.session.user = updatedUser;

      res.json({ message: "Email updated successfully", user: mapUserToDTO(updatedUser) });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Email change error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update vendor delivery settings
  app.put("/api/vendor/delivery", requireAuth, requireRole(["vendor"]), async (req, res) => {
    try {
      const vendor = await storage.getVendorByUserId(req.session.user!.id);
      if (!vendor) {
        return res.status(403).json({ message: "Vendor not found" });
      }

      // Validate request body
      const validatedData = vendorDeliverySchema.parse(req.body);

      const updates: Partial<{
        deliveryAreas: string[];
        deliveryRadius: number;
        deliveryFee: string;
        freeDeliveryThreshold: string;
      }> = {};
      if (validatedData.deliveryAreas !== undefined) updates.deliveryAreas = validatedData.deliveryAreas;
      if (validatedData.deliveryRadius !== undefined) updates.deliveryRadius = validatedData.deliveryRadius;
      if (validatedData.deliveryFee !== undefined) updates.deliveryFee = validatedData.deliveryFee.toString();
      if (validatedData.freeDeliveryThreshold !== undefined) updates.freeDeliveryThreshold = validatedData.freeDeliveryThreshold.toString();

      const updatedVendor = await storage.updateVendor(vendor.id, updates);
      if (!updatedVendor) {
        return res.status(500).json({ message: "Failed to update delivery settings" });
      }

      res.json(mapVendorToDTO(updatedVendor));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Delivery settings update error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { search, category, city, state, zipCode, radius } = req.query;
      
      let products;
      
      // Handle location-based filtering
      if (city || state || zipCode) {
        try {
          const locationFilter = locationFilterSchema.parse({
            city: city as string,
            state: state as string,
            zipCode: zipCode as string,
            radius: radius ? parseInt(radius as string) : undefined,
          });
          
          products = await storage.getProductsByLocation(locationFilter);
          
          // Apply additional filters if present
          if (search) {
            const searchTerm = search.toString().toLowerCase();
            products = products.filter(product => 
              product.name.toLowerCase().includes(searchTerm) ||
              product.description.toLowerCase().includes(searchTerm)
            );
          }
          
          if (category) {
            products = products.filter(product => product.categoryId === category);
          }
          
        } catch (validationError) {
          return res.status(400).json({ 
            message: "Invalid location parameters",
            errors: validationError instanceof z.ZodError ? validationError.errors : []
          });
        }
      } else {
        // Original filtering logic when no location specified
        if (search) {
          products = await storage.searchProducts(search as string);
        } else if (category) {
          products = await storage.getProductsByCategory(category as string);
        } else {
          products = await storage.getAllProducts();
        }
      }

      // Enhance products with vendor delivery information and convert to DTOs
      const productsWithVendorInfo = await Promise.all(
        products.map(async (product) => {
          const vendor = await storage.getVendor(product.vendorId);
          return mapProductToDTO(product, vendor || undefined);
        })
      );

      res.json(productsWithVendorInfo);
    } catch (error) {
      console.error("Products API error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get products for authenticated vendor (must come BEFORE /api/products/:id)
  app.get("/api/products/vendor", requireAuth, requireRole(["vendor"]), async (req, res) => {
    try {
      const vendor = await storage.getVendorByUserId(req.session.user!.id);
      if (!vendor) {
        return res.status(403).json({ message: "Vendor not found" });
      }

      const products = await storage.getProductsByVendor(vendor.id);
      const productDTOs = products.map(product => mapProductToDTO(product));
      res.json(productDTOs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const vendor = await storage.getVendor(product.vendorId);
      res.json(mapProductToDTO(product, vendor || undefined));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/products", requireAuth, requireRole(["vendor"]), async (req, res) => {
    try {
      const vendor = await storage.getVendorByUserId(req.session.user!.id);
      if (!vendor || !vendor.isApproved) {
        return res.status(403).json({ message: "Vendor not approved" });
      }

      const data = insertProductSchema.parse({
        ...req.body,
        vendorId: vendor.id,
      });

      const product = await storage.createProduct(data);
      res.status(201).json(mapProductToDTO(product));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/products/:id", requireAuth, requireRole(["vendor"]), async (req, res) => {
    try {
      const vendor = await storage.getVendorByUserId(req.session.user!.id);
      if (!vendor) {
        return res.status(403).json({ message: "Vendor access required" });
      }

      const product = await storage.getProduct(req.params.id);
      if (!product || product.vendorId !== vendor.id) {
        return res.status(404).json({ message: "Product not found" });
      }

      const updatedProduct = await storage.updateProduct(req.params.id, req.body);
      if (!updatedProduct) {
        return res.status(500).json({ message: "Failed to update product" });
      }
      const vendorData = await storage.getVendor(updatedProduct.vendorId);
      res.json(mapProductToDTO(updatedProduct, vendorData || undefined));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/products/:id", requireAuth, requireRole(["vendor"]), async (req, res) => {
    try {
      const vendor = await storage.getVendorByUserId(req.session.user!.id);
      if (!vendor) {
        return res.status(403).json({ message: "Vendor access required" });
      }

      const product = await storage.getProduct(req.params.id);
      if (!product || product.vendorId !== vendor.id) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Delete associated image files if they exist
      if (product.images && product.images.length > 0) {
        product.images.forEach(imagePath => {
          if (imagePath.startsWith('/uploads/')) {
            const fullPath = path.join(process.cwd(), imagePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          }
        });
      }

      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // File upload route for product images
  app.post("/api/upload/product-image", requireAuth, requireRole(["vendor"]), upload.single('image'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Return the image path relative to the public directory
      const imagePath = `/uploads/products/${req.file.filename}`;
      
      res.json({ 
        message: "Image uploaded successfully",
        imagePath,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      res.status(500).json({ message: "File upload failed" });
    }
  });

  // Delete uploaded image route
  app.delete("/api/upload/product-image", requireAuth, requireRole(["vendor"]), async (req, res) => {
    try {
      const { imagePath } = req.body;
      
      if (!imagePath || !imagePath.startsWith('/uploads/')) {
        return res.status(400).json({ message: "Invalid image path" });
      }

      const fullPath = path.join(process.cwd(), imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        res.json({ message: "Image deleted successfully" });
      } else {
        res.status(404).json({ message: "Image not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  // Cart routes
  app.get("/api/cart", requireAuth, async (req, res) => {
    try {
      const cartItems = await storage.getCartByUser(req.session.user!.id);
      
      // Fetch product details for each cart item and convert to DTOs
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          const vendor = product ? await storage.getVendor(product.vendorId) : undefined;
          return mapCartToDTO(item, product || undefined, vendor || undefined);
        })
      );

      res.json(cartWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/cart", requireAuth, async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const cartItem = await storage.addToCart({
        userId: req.session.user!.id,
        productId,
        quantity,
      });

      res.status(201).json(mapCartToDTO(cartItem));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/cart/:id", requireAuth, async (req, res) => {
    try {
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Valid quantity is required" });
      }

      const updatedItem = await storage.updateCartItem(req.params.id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      res.json(mapCartToDTO(updatedItem));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/cart/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.removeFromCart(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const wishlistItems = await storage.getWishlistByUser(req.session.user!.id);
      
      // Fetch product details for each wishlist item and convert to DTOs
      const wishlistWithProducts = await Promise.all(
        wishlistItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          const vendor = product ? await storage.getVendor(product.vendorId) : undefined;
          return mapWishlistToDTO(item, product || undefined, vendor || undefined);
        })
      );

      res.json(wishlistWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const wishlistItem = await storage.addToWishlist({
        userId: req.session.user!.id,
        productId,
      });

      res.status(201).json(mapWishlistToDTO(wishlistItem));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/wishlist/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.removeFromWishlist(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }
      res.json({ message: "Item removed from wishlist" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Product reviews endpoint
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByProduct(req.params.id);
      const reviewDTOs = reviews.map(review => mapReviewToDTO(review));
      res.json(reviewDTOs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Order routes
  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      let orders;
      
      if (req.session.user!.role === "admin") {
        orders = await storage.getAllOrders();
      } else if (req.session.user!.role === "vendor") {
        const vendor = await storage.getVendorByUserId(req.session.user!.id);
        if (!vendor) {
          return res.status(403).json({ message: "Vendor not found" });
        }
        orders = await storage.getOrdersByVendor(vendor.id);
      } else {
        orders = await storage.getOrdersByUser(req.session.user!.id);
      }

      const orderDTOs = orders.map(order => mapOrderToDTO(order));
      res.json(orderDTOs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId: req.session.user!.id,
      });

      const order = await storage.createOrder(orderData);
      
      // Clear cart after successful order
      await storage.clearCart(req.session.user!.id);
      
      res.status(201).json(mapOrderToDTO(order));
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/orders/:id/status", requireAuth, requireRole(["vendor", "admin"]), async (req, res) => {
    try {
      const { status } = req.body;
      
      const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedOrder = await storage.updateOrderStatus(req.params.id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(mapOrderToDTO(updatedOrder));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/orders/:id/items", requireAuth, async (req, res) => {
    try {
      const { id: orderId } = req.params;
      const userId = req.session.user!.id;
      
      // First verify the order belongs to the user or user is admin/vendor
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check authorization
      if (req.session.user!.role !== "admin") {
        if (req.session.user!.role === "vendor") {
          const vendor = await storage.getVendorByUserId(userId);
          if (!vendor || order.vendorId !== vendor.id) {
            return res.status(403).json({ message: "Access denied" });
          }
        } else if (order.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      // Get order items with product details
      const orderItems = await storage.getOrderItemsByOrder(orderId);
      const orderItemDTOs = [];
      
      for (const item of orderItems) {
        const product = await storage.getProduct(item.productId);
        const orderItemDTO = {
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          product: product ? mapProductToDTO(product) : undefined,
        };
        orderItemDTOs.push(orderItemDTO);
      }
      
      res.json(orderItemDTOs);
    } catch (error) {
      console.error("Error fetching order items:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      const categoryDTOs = categories.map(category => mapCategoryToDTO(category));
      res.json(categoryDTOs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const userDTOs = users.map(user => mapUserToDTO(user));
      res.json(userDTOs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/vendors", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const vendors = await storage.getAllVendors();
      const vendorDTOs = vendors.map(vendor => mapVendorToDTO(vendor));
      res.json(vendorDTOs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/vendors/:id/approve", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const approved = await storage.approveVendor(req.params.id);
      if (!approved) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json({ message: "Vendor approved successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/users/:id/status", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "isActive must be a boolean" });
      }

      const updatedUser = await storage.updateUser(req.params.id, { isActive });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User status updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/users/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reviews endpoints
  app.get("/api/reviews/recent", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allProducts = await storage.getAllProducts();
      const allReviews: (ReviewDTO & { user: { id: string; firstName: string; lastName: string }; product: { id: string; name: string } })[] = [];

      // Get all reviews from all users
      for (const user of allUsers) {
        const userReviews = await storage.getReviewsByUser(user.id);
        const reviewsWithDetails = userReviews.map(review => ({
          ...mapReviewToDTO(review),
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          product: allProducts.find(p => p.id === review.productId) || { id: review.productId, name: 'Unknown Product' }
        }));
        allReviews.push(...reviewsWithDetails);
      }

      // Sort by creation date (newest first) and limit to recent reviews
      const recentReviews = allReviews
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20);

      // Convert to DTOs but keep the enhanced structure for recent reviews
      const reviewDTOs = recentReviews.map(review => ({
        ...review,
        user: review.user,
        product: review.product
      }));

      res.json(reviewDTOs);
    } catch (error) {
      console.error("Error fetching recent reviews:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/product/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const reviews = await storage.getReviewsByProduct(productId);
      const reviewDTOs = reviews.map(review => mapReviewToDTO(review));
      res.json(reviewDTOs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const reviews = await storage.getReviewsByUser(userId);
      const reviewDTOs = reviews.map(review => mapReviewToDTO(review));
      res.json(reviewDTOs);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get unreviewed delivered orders for the current user
  app.get("/api/orders/unreviewed", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      
      // Get all delivered orders for the user
      const deliveredOrders = await storage.getOrdersByUser(userId);
      const deliveredOnly = deliveredOrders.filter(order => order.status === "delivered");
      
      // Get user's reviews to check which products they've already reviewed
      const userReviews = await storage.getReviewsByUser(userId);
      const reviewedProductIds = new Set(userReviews.map(review => review.productId));
      
      // Filter orders that contain unreviewed products
      const unreviewed = [];
      
      for (const order of deliveredOnly) {
        const orderItems = await storage.getOrderItemsByOrder(order.id);
        const unreviewedProducts = [];
        
        for (const item of orderItems) {
          if (!reviewedProductIds.has(item.productId)) {
            const product = await storage.getProduct(item.productId);
            if (product) {
              const vendor = await storage.getVendor(product.vendorId);
              unreviewedProducts.push(mapProductToDTO(product, vendor || undefined));
            }
          }
        }
        
        if (unreviewedProducts.length > 0) {
          unreviewed.push({
            order: mapOrderToDTO(order),
            products: unreviewedProducts
          });
        }
      }
      
      res.json(unreviewed);
    } catch (error) {
      console.error("Error fetching unreviewed orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const userId = req.session.user!.id;
      
      // Use Zod schema for validation
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId
      });

      // Additional rating validation
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      // Check if user has already reviewed this product
      const existingReviews = await storage.getReviewsByUser(userId);
      const hasAlreadyReviewed = existingReviews.some(r => r.productId === reviewData.productId);
      
      if (hasAlreadyReviewed) {
        return res.status(409).json({ 
          message: "You have already reviewed this product" 
        });
      }

      // CRITICAL FIX: Check if user has completed a delivered order containing this SPECIFIC product
      const userOrders = await storage.getOrdersByUser(userId);
      let hasVerifiedPurchase = false;

      for (const order of userOrders) {
        if (order.status === "delivered") {
          // Get order items for this specific order
          const orderItems = await storage.getOrderItemsByOrder(order.id);
          const purchasedThisProduct = orderItems.some((item: { productId: string }) => item.productId === reviewData.productId);
          
          if (purchasedThisProduct) {
            hasVerifiedPurchase = true;
            break;
          }
        }
      }

      if (!hasVerifiedPurchase) {
        return res.status(403).json({ 
          message: "You can only review products you have purchased and received through completed deliveries" 
        });
      }

      const review = await storage.createReview(reviewData);

      res.status(201).json(mapReviewToDTO(review));
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid review data", 
          errors: error.errors 
        });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public stats endpoint for homepage
  app.get("/api/stats", async (req, res) => {
    try {
      // Get real data from database
      const users = await storage.getAllUsers();
      const vendors = await storage.getAllVendors();
      const products = await storage.getAllProducts();
      
      const stats = {
        totalUsers: users.length, // Total users including customers and vendors
        activeStores: vendors.filter(v => v.isApproved).length, // Active approved stores
        productsListed: products.filter(p => p.isActive).length, // Active products only
      };

      res.json(stats);
    } catch (error) {
      console.error("Stats endpoint error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/stats", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const vendors = await storage.getAllVendors();
      const products = await storage.getAllProducts();
      const orders = await storage.getAllOrders();

      const stats = {
        totalUsers: users.filter(u => u.role === "user").length,
        totalVendors: vendors.length, // All vendors are automatically approved
        totalProducts: products.length,
        totalOrders: orders.length,
        revenue: orders.reduce((sum, order) => sum + parseFloat(order.total), 0),
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // AI Chat endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ message: "Message is required" });
      }

      if (message.length > 1000) {
        return res.status(400).json({ message: "Message too long" });
      }

      const chatRequest: ChatRequest = {
        message: message.trim(),
        history: Array.isArray(history) ? history.slice(-5) : []
      };

      const response = await getChatResponse(chatRequest);
      res.json(response);
    } catch (error) {
      console.error("AI Chat error:", error);
      res.status(500).json({ 
        message: "AI service temporarily unavailable", 
        suggestedLinks: [
          { text: "Contact Support", url: "/contact", description: "Get help from our team" },
          { text: "FAQ", url: "/faq", description: "Find quick answers" }
        ]
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
