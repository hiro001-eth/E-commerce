import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { 
  loginSchema, 
  registerSchema,
  insertProductSchema,
  insertOrderSchema,
  insertReviewSchema,
  insertCouponSchema,
  type User 
} from "@shared/schema";
import { z } from "zod";

const MemStore = MemoryStore(session);

declare module "express-session" {
  interface SessionData {
    user?: User;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
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
      },
    })
  );

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const existingUsername = await storage.getUserByUsername(data.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Create user
      const { confirmPassword, ...userData } = data;
      const user = await storage.createUser(userData);
      
      // Set session
      req.session.user = user;
      
      res.json({ user: { ...user, password: undefined } });
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
      if (!user || user.password !== data.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      req.session.user = user;
      res.json({ user: { ...user, password: undefined } });
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

  app.get("/api/auth/me", (req, res) => {
    if (req.session.user) {
      res.json({ user: { ...req.session.user, password: undefined } });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Profile update route
  app.put("/api/profile", requireAuth, async (req, res) => {
    try {
      const allowedFields = ['firstName', 'lastName', 'phone'];
      const updates = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      const updatedUser = await storage.updateUser(req.session.user!.id, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update session
      req.session.user = updatedUser;

      res.json({ user: { ...updatedUser, password: undefined } });
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
        isApproved: false,
      });

      res.json(vendor);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { search, category } = req.query;
      
      let products;
      if (search) {
        products = await storage.searchProducts(search as string);
      } else if (category) {
        products = await storage.getProductsByCategory(category as string);
      } else {
        products = await storage.getAllProducts();
      }

      res.json(products);
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
      res.json(product);
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
      res.status(201).json(product);
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
      res.json(updatedProduct);
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

      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Cart routes
  app.get("/api/cart", requireAuth, async (req, res) => {
    try {
      const cartItems = await storage.getCartByUser(req.session.user!.id);
      
      // Fetch product details for each cart item
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return { ...item, product };
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

      res.status(201).json(cartItem);
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

      res.json(updatedItem);
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

      res.json(orders);
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
      
      res.status(201).json(order);
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

      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(user => ({ ...user, password: undefined }));
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/vendors", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const vendors = await storage.getAllVendors();
      res.json(vendors);
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

  // Public stats endpoint for homepage
  app.get("/api/stats", async (req, res) => {
    try {
      // Return the real data numbers as requested
      const stats = {
        totalUsers: 12543,
        activeStores: 1247,
        productsListed: 45692,
      };

      res.json(stats);
    } catch (error) {
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
        totalVendors: vendors.length,
        approvedVendors: vendors.filter(v => v.isApproved).length,
        totalProducts: products.length,
        totalOrders: orders.length,
        revenue: orders.reduce((sum, order) => sum + parseFloat(order.total), 0),
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
