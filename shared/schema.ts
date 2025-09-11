import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // user, vendor, admin
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  address: jsonb("address").$type<{
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  }>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  storeName: text("store_name").notNull(),
  storeDescription: text("store_description"),
  businessLicense: text("business_license"),
  storeLocation: jsonb("store_location").$type<{
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }>(),
  deliveryAreas: text("delivery_areas").array().default([]), // Array of cities/areas they deliver to
  deliveryRadius: integer("delivery_radius").default(10), // Delivery radius in km
  deliveryFee: decimal("delivery_fee", { precision: 8, scale: 2 }).default("0"),
  freeDeliveryThreshold: decimal("free_delivery_threshold", { precision: 8, scale: 2 }).default("50"),
  isApproved: boolean("is_approved").notNull().default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalSales: decimal("total_sales", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  categoryId: varchar("category_id").references(() => categories.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountPrice: decimal("discount_price", { precision: 10, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  images: text("images").array().default([]),
  sku: text("sku").notNull().unique(),
  availableInAreas: text("available_in_areas").array().default([]), // Areas where this product is available
  requiresShipping: boolean("requires_shipping").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  allowsCoupons: boolean("allows_coupons").notNull().default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const carts = pgTable("carts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, shipped, delivered, cancelled
  paymentMethod: text("payment_method").notNull().default("cod"),
  deliveryAddress: jsonb("delivery_address").$type<{
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>().notNull(),
  couponCode: text("coupon_code"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(), // percentage, fixed
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").notNull().default(true),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  rating: true,
  totalSales: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  reviewCount: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCartSchema = createInsertSchema(carts).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
  usedCount: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

// Location-based query schemas  
export const locationFilterSchema = z.object({
  city: z.string().optional(),
  state: z.string().optional(), 
  zipCode: z.string().optional(),
  radius: z.number().min(1).max(100).default(25), // km radius
});

export const userLocationSchema = z.object({
  street: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().default("United States"),
});

export type LocationFilter = z.infer<typeof locationFilterSchema>;
export type UserLocation = z.infer<typeof userLocationSchema>;

// Vendor location and delivery validation schemas
export const vendorLocationSchema = z.object({
  street: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().default("United States"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const vendorDeliverySchema = z.object({
  deliveryAreas: z.array(z.string().min(1)).optional(),
  deliveryRadius: z.number().min(1).max(100).optional(),
  deliveryFee: z.number().min(0).optional(),
  freeDeliveryThreshold: z.number().min(0).optional(),
});

export type VendorLocation = z.infer<typeof vendorLocationSchema>;
export type VendorDelivery = z.infer<typeof vendorDeliverySchema>;

// Vendor settings update schema
export const vendorSettingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeDescription: z.string().optional(),
  businessLicense: z.string().optional(),
});

// Password change schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Email change schema
export const changeEmailSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required to change email"),
});

export type VendorSettings = z.infer<typeof vendorSettingsSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type ChangeEmail = z.infer<typeof changeEmailSchema>;

// API DTOs - These represent the JSON-serialized versions sent over HTTP
// All Date fields become strings, nullable fields are properly typed

export interface UserDTO {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  } | null;
  isActive: boolean;
  createdAt: string;
}

export interface VendorDTO {
  id: string;
  userId: string;
  storeName: string;
  storeDescription: string | null;
  businessLicense: string | null;
  storeLocation: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  } | null;
  deliveryAreas: string[];
  deliveryRadius: number;
  deliveryFee: string;
  freeDeliveryThreshold: string;
  isApproved: boolean;
  rating: string;
  totalSales: string;
  createdAt: string;
}

export interface ProductDTO {
  id: string;
  vendorId: string;
  categoryId: string | null;
  name: string;
  description: string;
  price: string;
  discountPrice: string | null;
  stock: number;
  images: string[];
  sku: string;
  availableInAreas: string[];
  requiresShipping: boolean;
  isActive: boolean;
  allowsCoupons: boolean;
  rating: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  // Optional vendor information when joined
  vendor?: {
    storeName: string;
    deliveryFee: string;
    freeDeliveryThreshold: string;
    deliveryRadius: number;
    deliveryAreas: string[];
  };
}

export interface CartItemDTO {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  product?: ProductDTO;
}

export interface OrderDTO {
  id: string;
  userId: string;
  vendorId: string;
  total: string;
  status: string;
  paymentMethod: string;
  deliveryAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  couponCode: string | null;
  discount: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemDTO {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
  total: string;
  product?: ProductDTO;
}

export interface ReviewDTO {
  id: string;
  userId: string;
  productId: string;
  vendorId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface CouponDTO {
  id: string;
  vendorId: string;
  code: string;
  discountType: string;
  discountValue: string;
  minOrderAmount: string | null;
  maxDiscount: string | null;
  expiryDate: string | null;
  isActive: boolean;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}
