import { 
  type User, 
  type InsertUser, 
  type Vendor, 
  type InsertVendor,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type Cart,
  type InsertCart,
  type Review,
  type InsertReview,
  type Coupon,
  type InsertCoupon,
  type Category,
  type OrderItem,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { PasswordCrypto } from "./crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Vendor methods
  getVendor(id: string): Promise<Vendor | undefined>;
  getVendorByUserId(userId: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | undefined>;
  getAllVendors(): Promise<Vendor[]>;
  approveVendor(id: string): Promise<boolean>;

  // Product methods
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByVendor(vendorId: string): Promise<Product[]>;
  getAllProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;

  // Cart methods
  getCartByUser(userId: string): Promise<Cart[]>;
  addToCart(cart: InsertCart): Promise<Cart>;
  updateCartItem(id: string, quantity: number): Promise<Cart | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;

  // Order methods
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByUser(userId: string): Promise<Order[]>;
  getOrdersByVendor(vendorId: string): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  getOrderItemsByOrder(orderId: string): Promise<OrderItem[]>;

  // Review methods
  getReviewsByProduct(productId: string): Promise<Review[]>;
  getReviewsByUser(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Coupon methods
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  getCouponsByVendor(vendorId: string): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | undefined>;

  // Category methods
  getAllCategories(): Promise<Category[]>;
  createCategory(name: string, description?: string): Promise<Category>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private vendors: Map<string, Vendor> = new Map();
  private products: Map<string, Product> = new Map();
  private carts: Map<string, Cart> = new Map();
  private orders: Map<string, Order> = new Map();
  private reviews: Map<string, Review> = new Map();
  private coupons: Map<string, Coupon> = new Map();
  private categories: Map<string, Category> = new Map();
  private orderItems: Map<string, OrderItem> = new Map();

  constructor() {
    this.initializeData().catch(console.error);
  }

  private async initializeData() {
    // Create default admin user with hashed password
    const adminId = randomUUID();
    const hashedPassword = await PasswordCrypto.hashPassword("admin123");
    const admin: User = {
      id: adminId,
      username: "admin",
      email: "admin@localhost",
      password: hashedPassword,
      role: "admin",
      firstName: "Admin",
      lastName: "User",
      phone: null,
      address: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);

    // Create default categories
    const categories = [
      { name: "Electronics", description: "Electronic devices and gadgets" },
      { name: "Fashion", description: "Clothing and accessories" },
      { name: "Home & Garden", description: "Home improvement and gardening items" },
      { name: "Sports & Outdoors", description: "Sports equipment and outdoor gear" },
    ];

    categories.forEach(cat => {
      const id = randomUUID();
      this.categories.set(id, {
        id,
        name: cat.name,
        description: cat.description,
        isActive: true,
      });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      id,
      role: insertUser.role || "user",
      isActive: insertUser.isActive !== undefined ? insertUser.isActive : true,
      address: insertUser.address as any || null,
      phone: insertUser.phone || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Vendor methods
  async getVendor(id: string): Promise<Vendor | undefined> {
    return this.vendors.get(id);
  }

  async getVendorByUserId(userId: string): Promise<Vendor | undefined> {
    return Array.from(this.vendors.values()).find(vendor => vendor.userId === userId);
  }

  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const id = randomUUID();
    const vendor: Vendor = {
      ...insertVendor,
      id,
      storeDescription: insertVendor.storeDescription || null,
      businessLicense: insertVendor.businessLicense || null,
      isApproved: insertVendor.isApproved !== undefined ? insertVendor.isApproved : true,
      rating: "0",
      totalSales: "0",
      createdAt: new Date(),
    };
    this.vendors.set(id, vendor);
    return vendor;
  }

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | undefined> {
    const vendor = this.vendors.get(id);
    if (!vendor) return undefined;
    
    const updatedVendor = { ...vendor, ...updates };
    this.vendors.set(id, updatedVendor);
    return updatedVendor;
  }

  async getAllVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values());
  }

  async approveVendor(id: string): Promise<boolean> {
    const vendor = this.vendors.get(id);
    if (!vendor) return false;
    
    vendor.isApproved = true;
    this.vendors.set(id, vendor);
    return true;
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.vendorId === vendorId);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.isActive);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      categoryId: insertProduct.categoryId || null,
      discountPrice: insertProduct.discountPrice || null,
      stock: insertProduct.stock !== undefined ? insertProduct.stock : 0,
      images: insertProduct.images || [],
      isActive: insertProduct.isActive !== undefined ? insertProduct.isActive : true,
      allowsCoupons: insertProduct.allowsCoupons !== undefined ? insertProduct.allowsCoupons : true,
      rating: "0",
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { 
      ...product, 
      ...updates,
      updatedAt: new Date(),
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.products.values()).filter(product => 
      product.isActive && (
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      )
    );
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.categoryId === categoryId && product.isActive
    );
  }

  // Cart methods
  async getCartByUser(userId: string): Promise<Cart[]> {
    return Array.from(this.carts.values()).filter(cart => cart.userId === userId);
  }

  async addToCart(insertCart: InsertCart): Promise<Cart> {
    // Check if item already exists in cart
    const existingCart = Array.from(this.carts.values()).find(
      cart => cart.userId === insertCart.userId && cart.productId === insertCart.productId
    );

    if (existingCart) {
      existingCart.quantity += (insertCart.quantity || 1);
      this.carts.set(existingCart.id, existingCart);
      return existingCart;
    }

    const id = randomUUID();
    const cart: Cart = {
      ...insertCart,
      id,
      quantity: insertCart.quantity || 1,
      createdAt: new Date(),
    };
    this.carts.set(id, cart);
    return cart;
  }

  async updateCartItem(id: string, quantity: number): Promise<Cart | undefined> {
    const cart = this.carts.get(id);
    if (!cart) return undefined;
    
    cart.quantity = quantity;
    this.carts.set(id, cart);
    return cart;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.carts.delete(id);
  }

  async clearCart(userId: string): Promise<boolean> {
    const userCarts = Array.from(this.carts.entries()).filter(
      ([, cart]) => cart.userId === userId
    );
    
    userCarts.forEach(([id]) => this.carts.delete(id));
    return true;
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async getOrdersByVendor(vendorId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.vendorId === vendorId);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      status: insertOrder.status || "pending",
      paymentMethod: insertOrder.paymentMethod || "cash",
      couponCode: insertOrder.couponCode || null,
      discount: insertOrder.discount || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    order.status = status;
    order.updatedAt = new Date();
    this.orders.set(id, order);
    return order;
  }

  async getOrderItemsByOrder(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  // Review methods
  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.productId === productId);
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.userId === userId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      comment: insertReview.comment || null,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  // Coupon methods
  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return Array.from(this.coupons.values()).find(coupon => coupon.code === code && coupon.isActive);
  }

  async getCouponsByVendor(vendorId: string): Promise<Coupon[]> {
    return Array.from(this.coupons.values()).filter(coupon => coupon.vendorId === vendorId);
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const id = randomUUID();
    const coupon: Coupon = {
      ...insertCoupon,
      id,
      isActive: insertCoupon.isActive !== undefined ? insertCoupon.isActive : true,
      minOrderAmount: insertCoupon.minOrderAmount || null,
      maxDiscount: insertCoupon.maxDiscount || null,
      expiryDate: insertCoupon.expiryDate || null,
      usageLimit: insertCoupon.usageLimit || null,
      usedCount: 0,
      createdAt: new Date(),
    };
    this.coupons.set(id, coupon);
    return coupon;
  }

  async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon | undefined> {
    const coupon = this.coupons.get(id);
    if (!coupon) return undefined;
    
    const updatedCoupon = { ...coupon, ...updates };
    this.coupons.set(id, updatedCoupon);
    return updatedCoupon;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(category => category.isActive);
  }

  async createCategory(name: string, description?: string): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      id,
      name,
      description: description || null,
      isActive: true,
    };
    this.categories.set(id, category);
    return category;
  }
}

export const storage = new MemStorage();
