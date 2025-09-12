import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import Stripe from "stripe";
import OpenAI from "openai";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertProductSchema, 
  insertCategorySchema,
  insertOrderSchema,
  insertReviewSchema,
  insertWishlistSchema,
  type User, 
  type Product,
  type Review,
  type CartItemDTO,
  type Order,
  type OrderItem
} from "../shared/schema";

const router = express.Router();

// Session configuration
import MemoryStoreFactory from 'memorystore';
const MemoryStore = MemoryStoreFactory(session);
const sessionStore = new MemoryStore({
  checkPeriod: 86400000, // prune expired entries every 24h
});

// Initialize Stripe conditionally
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

// Multer configuration for file uploads
const storage_multer = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// OpenAI configuration (optional)
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } else {
    console.log("OpenAI API key not found or invalid - chatbot will use fallback responses");
  }
} catch (error) {
  console.log("OpenAI initialization failed - chatbot will use fallback responses");
}

// Authentication middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
};

// Admin middleware
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user as User).role === 'admin') {
    return next();
  }
  res.status(403).json({ message: "Admin access required" });
};

// Vendor middleware
const requireVendor = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.isAuthenticated() && req.user && ['vendor', 'admin'].includes((req.user as User).role)) {
    return next();
  }
  res.status(403).json({ message: "Vendor access required" });
};

// Passport configuration
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email: string, password: string, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Auth routes
router.post("/api/auth/register", async (req, res) => {
  try {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: fromZodError(result.error).details
      });
    }

    const { name, email, password, role = 'customer' } = result.data;

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await storage.createUser({
      name,
      email,
      password: hashedPassword,
      role: role as 'customer' | 'vendor' | 'admin'
    });

    req.login(newUser, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }
      const userResponse = { ...newUser };
      delete (userResponse as any).password;
      res.json({ user: userResponse });
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/api/auth/login", (req, res, next) => {
  passport.authenticate('local', (err: any, user: User | false, info: any) => {
    if (err) {
      return res.status(500).json({ message: "Authentication error" });
    }
    if (!user) {
      return res.status(401).json({ message: info?.message || "Invalid credentials" });
    }

    req.login(user, (loginErr) => {
      if (loginErr) {
        return res.status(500).json({ message: "Login failed" });
      }
      const userResponse = { ...user };
      delete (userResponse as any).password;
      res.json({ user: userResponse });
    });
  })(req, res, next);
});

router.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

router.get("/api/auth/me", (req, res) => {
  if (req.isAuthenticated() && req.user) {
    const userResponse = { ...req.user as User };
    delete (userResponse as any).password;
    res.json({ user: userResponse });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// Profile update route
router.put("/api/profile", requireAuth, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ 
        message: "First name and last name are required" 
      });
    }
    
    // Prepare update data
    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone ? phone.trim() : null,
    };
    
    const userId = (req.user as User).id;
    const updatedUser = await storage.updateUser(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return updated user without password
    const { password, ...userResponse } = updatedUser;
    res.json(userResponse);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Product routes
router.get("/api/products", async (req, res) => {
  try {
    const { search, category, vendor } = req.query;
    let products = await storage.getAllProducts();

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }

    if (category && category !== 'all') {
      products = products.filter(product => product.categoryId === category);
    }

    if (vendor) {
      products = products.filter(product => product.vendorId === vendor);
    }

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Get vendor's own products
router.get("/api/products/vendor", requireVendor, async (req, res) => {
  try {
    const user = req.user as User;
    const products = await storage.getVendorProducts(user.id);
    res.json(products);
  } catch (error) {
    console.error("Error fetching vendor products:", error);
    res.status(500).json({ message: "Failed to fetch vendor products" });
  }
});

router.get("/api/products/:id", async (req, res) => {
  try {
    const product = await storage.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

router.post("/api/products", requireVendor, upload.array('images', 5), async (req, res) => {
  try {
    // Check if vendor is approved
    const user = req.user as User;
    if (user.role === 'vendor') {
      const vendor = await storage.getVendorByUserId(user.id);
      if (!vendor || !vendor.isApproved) {
        return res.status(403).json({ 
          message: "Vendor account is pending approval. Please wait for admin approval before listing products." 
        });
      }
    }

    const productData = {
      ...req.body,
      colors: req.body.colors ? JSON.parse(req.body.colors) : [],
      sizes: req.body.sizes ? JSON.parse(req.body.sizes) : [],
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      images: (req.files as Express.Multer.File[])?.map(file => `/uploads/${file.filename}`) || []
    };

    const result = insertProductSchema.safeParse({
      ...productData,
      vendorId: vendor.id  // Use vendor.id instead of user.id
    });

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: fromZodError(result.error).details
      });
    }

    const newProduct = await storage.createProduct(result.data);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

router.put("/api/products/:id", requireVendor, upload.array('images', 5), async (req, res) => {
  try {
    // Check if vendor is approved (if user is vendor)
    const user = req.user as User;
    let vendor = null;
    if (user.role === 'vendor') {
      vendor = await storage.getVendorByUserId(user.id);
      if (!vendor || !vendor.isApproved) {
        return res.status(403).json({ 
          message: "Vendor account is pending approval. Please wait for admin approval before managing products." 
        });
      }
    }

    const existingProduct = await storage.getProductById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check authorization using vendor.id for vendors, user.id for admins
    const isAuthorized = user.role === 'admin' || 
      (vendor && existingProduct.vendorId === vendor.id);
    
    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized to edit this product" });
    }

    const productData = {
      ...req.body,
      colors: req.body.colors ? JSON.parse(req.body.colors) : existingProduct.colors,
      sizes: req.body.sizes ? JSON.parse(req.body.sizes) : existingProduct.sizes,
      tags: req.body.tags ? JSON.parse(req.body.tags) : existingProduct.tags,
    };

    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      productData.images = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
    }

    const result = insertProductSchema.partial().safeParse(productData);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: fromZodError(result.error).details
      });
    }

    const updatedProduct = await storage.updateProduct(req.params.id, result.data);
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

router.delete("/api/products/:id", requireVendor, async (req, res) => {
  try {
    // Check if vendor is approved (if user is vendor)
    const user = req.user as User;
    let vendor = null;
    if (user.role === 'vendor') {
      vendor = await storage.getVendorByUserId(user.id);
      if (!vendor || !vendor.isApproved) {
        return res.status(403).json({ 
          message: "Vendor account is pending approval. Please wait for admin approval before managing products." 
        });
      }
    }

    const existingProduct = await storage.getProductById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check authorization using vendor.id for vendors, user.id for admins  
    const isAuthorized = user.role === 'admin' || 
      (vendor && existingProduct.vendorId === vendor.id);
    
    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await storage.deleteProduct(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// Category routes
router.get("/api/categories", async (req, res) => {
  try {
    const categories = await storage.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

router.post("/api/categories", requireAdmin, async (req, res) => {
  try {
    const result = insertCategorySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: fromZodError(result.error).details
      });
    }

    const newCategory = await storage.createCategory(result.data);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
});

// Admin vendor approval routes
router.get("/api/admin/vendors/pending", requireAdmin, async (req, res) => {
  try {
    const pendingVendors = await storage.getPendingVendors();
    res.json(pendingVendors);
  } catch (error) {
    console.error("Error fetching pending vendors:", error);
    res.status(500).json({ message: "Failed to fetch pending vendors" });
  }
});

router.patch("/api/admin/vendors/:id/approve", requireAdmin, async (req, res) => {
  try {
    const success = await storage.approveVendor(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({ message: "Vendor approved successfully" });
  } catch (error) {
    console.error("Error approving vendor:", error);
    res.status(500).json({ message: "Failed to approve vendor" });
  }
});

router.patch("/api/admin/vendors/:id/reject", requireAdmin, async (req, res) => {
  try {
    const success = await storage.rejectVendor(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.json({ message: "Vendor rejected successfully" });
  } catch (error) {
    console.error("Error rejecting vendor:", error);
    res.status(500).json({ message: "Failed to reject vendor" });
  }
});

// Cart routes
router.get("/api/cart", requireAuth, async (req, res) => {
  try {
    const cartItems = await storage.getCartItems((req.user as User).id);
    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

router.post("/api/cart", requireAuth, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId || quantity < 1) {
      return res.status(400).json({ message: "Invalid product or quantity" });
    }

    const product = await storage.getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const cartItem = await storage.addToCart({
      userId: (req.user as User).id,
      productId,
      quantity
    });

    res.status(201).json(cartItem);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

router.put("/api/cart/:id", requireAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const cartItem = await storage.updateCartItem(req.params.id, quantity);
    res.json(cartItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Failed to update cart item" });
  }
});

router.delete("/api/cart/:id", requireAuth, async (req, res) => {
  try {
    await storage.removeFromCart(req.params.id);
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ message: "Failed to remove from cart" });
  }
});

// Wishlist routes
router.get("/api/wishlist", requireAuth, async (req, res) => {
  try {
    const wishlistItems = await storage.getWishlistItems((req.user as User).id);
    res.json(wishlistItems);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
});

router.post("/api/wishlist", requireAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await storage.getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const wishlistItem = await storage.addToWishlist({
      userId: (req.user as User).id,
      productId
    });

    res.status(201).json(wishlistItem);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
});

router.delete("/api/wishlist/:productId", requireAuth, async (req, res) => {
  try {
    await storage.removeFromWishlist((req.user as User).id, req.params.productId);
    res.json({ message: "Item removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ message: "Failed to remove from wishlist" });
  }
});

// Review routes
router.get("/api/products/:productId/reviews", async (req, res) => {
  try {
    const reviews = await storage.getProductReviews(req.params.productId);
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

router.get("/api/reviews/recent", async (req, res) => {
  try {
    const reviews = await storage.getRecentReviews();
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching recent reviews:", error);
    res.status(500).json({ message: "Failed to fetch recent reviews" });
  }
});

router.post("/api/reviews", requireAuth, async (req, res) => {
  try {
    const result = insertReviewSchema.safeParse({
      ...req.body,
      userId: (req.user as User).id
    });

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: fromZodError(result.error).details
      });
    }

    const review = await storage.createReview(result.data);
    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Failed to create review" });
  }
});

// Order routes
router.get("/api/orders", requireAuth, async (req, res) => {
  try {
    const orders = await storage.getUserOrders((req.user as User).id);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.post("/api/orders", requireAuth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    // Calculate total
    let totalAmount = 0;
    for (const item of items) {
      const product = await storage.getProductById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      const price = parseFloat(product.discountPrice || product.price);
      totalAmount += price * item.quantity;
    }

    const order = await storage.createOrder({
      userId: (req.user as User).id,
      items,
      totalAmount: totalAmount.toString(),
      status: 'pending',
      shippingAddress,
      paymentMethod
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// Stripe payment routes
router.post("/api/create-payment-intent", requireAuth, async (req, res) => {
  try {
    const { amount, currency = "npr", orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        userId: (req.user as User).id,
        orderId: orderId || '',
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Stripe payment intent error:", error);
    res.status(500).json({ message: "Payment processing failed" });
  }
});

router.post("/api/confirm-payment", requireAuth, async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent ID is required" });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order status
      if (orderId) {
        await storage.updateOrderStatus(orderId, 'paid');
      }
      
      res.json({ success: true, status: paymentIntent.status });
    } else {
      res.status(400).json({ message: "Payment not completed", status: paymentIntent.status });
    }
  } catch (error) {
    console.error("Payment confirmation error:", error);
    res.status(500).json({ message: "Payment confirmation failed" });
  }
});

// Vendor settings routes
router.get("/api/vendor/settings", requireVendor, async (req, res) => {
  try {
    const settings = await storage.getVendorSettings((req.user as User).id);
    res.json(settings || {});
  } catch (error) {
    console.error("Error fetching vendor settings:", error);
    res.status(500).json({ message: "Failed to fetch vendor settings" });
  }
});

const vendorSettingsUpdateSchema = z.object({
  storeName: z.string().min(1).max(100).optional(),
  storeDescription: z.string().max(1000).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional(),
  logo: z.string().optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  orderNotifications: z.boolean().optional(),
  reviewNotifications: z.boolean().optional(),
  promotionalEmails: z.boolean().optional(),
  paypalEmail: z.string().email().optional(),
  bankAccountNumber: z.string().optional(),
  bankRoutingNumber: z.string().optional(),
  stripeAccountId: z.string().optional(),
});

router.put("/api/vendor/settings", requireVendor, async (req, res) => {
  try {
    const result = vendorSettingsUpdateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: fromZodError(result.error).details
      });
    }
    
    const settings = await storage.updateVendorSettings((req.user as User).id, result.data);
    res.json(settings);
  } catch (error) {
    console.error("Error updating vendor settings:", error);
    res.status(500).json({ message: "Failed to update vendor settings" });
  }
});

router.put("/api/vendor/notifications", requireVendor, async (req, res) => {
  try {
    const notificationSchema = z.object({
      emailNotifications: z.boolean().optional(),
      smsNotifications: z.boolean().optional(),
      orderNotifications: z.boolean().optional(),
      reviewNotifications: z.boolean().optional(),
      promotionalEmails: z.boolean().optional(),
    });
    
    const result = notificationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: fromZodError(result.error).details
      });
    }
    
    const settings = await storage.updateVendorSettings((req.user as User).id, result.data);
    res.json(settings);
  } catch (error) {
    console.error("Error updating notification settings:", error);
    res.status(500).json({ message: "Failed to update notification settings" });
  }
});

router.put("/api/vendor/payment", requireVendor, async (req, res) => {
  try {
    const paymentSchema = z.object({
      paypalEmail: z.string().email().optional(),
      bankAccountNumber: z.string().optional(),
      bankRoutingNumber: z.string().optional(),
      stripeAccountId: z.string().optional(),
    });
    
    const result = paymentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: fromZodError(result.error).details
      });
    }
    
    const settings = await storage.updateVendorSettings((req.user as User).id, result.data);
    res.json(settings);
  } catch (error) {
    console.error("Error updating payment settings:", error);
    res.status(500).json({ message: "Failed to update payment settings" });
  }
});

// Upload routes
router.post("/api/upload/review-image", requireAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    res.json({ imagePath: `/uploads/${req.file.filename}` });
  } catch (error) {
    console.error("Review image upload error:", error);
    res.status(500).json({ message: "Image upload failed" });
  }
});

router.post("/api/upload/store-logo", requireVendor, upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No logo uploaded" });
    }
    res.json({ logoPath: `/uploads/${req.file.filename}` });
  } catch (error) {
    console.error("Store logo upload error:", error);
    res.status(500).json({ message: "Logo upload failed" });
  }
});

router.delete("/api/upload/review-image", requireAuth, async (req, res) => {
  try {
    const { imagePath } = req.body;
    if (imagePath && imagePath.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'uploads', path.basename(imagePath));
      await fs.unlink(filePath);
    }
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Image deletion error:", error);
    res.status(500).json({ message: "Failed to delete image" });
  }
});

// Statistics route
router.get("/api/stats", async (req, res) => {
  try {
    const stats = await storage.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// Serve uploaded files
router.use('/uploads', express.static('uploads'));

export async function registerRoutes(app: express.Application) {
  // Session middleware
  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Use our routes
  app.use(router);

  // Return HTTP server
  const { createServer } = await import('node:http');
  return createServer(app);
}

export default router;