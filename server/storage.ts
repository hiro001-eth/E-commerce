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
  type InsertOrderItem,
  type Wishlist,
  type InsertWishlist,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { PasswordCrypto } from "./crypto";

// Geographic utility functions
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Basic coordinate lookup for major US cities
const CITY_COORDINATES: Record<string, Coordinates> = {
  'new york': { latitude: 40.7128, longitude: -74.0060 },
  'los angeles': { latitude: 34.0522, longitude: -118.2437 },
  'chicago': { latitude: 41.8781, longitude: -87.6298 },
  'houston': { latitude: 29.7604, longitude: -95.3698 },
  'phoenix': { latitude: 33.4484, longitude: -112.0740 },
  'philadelphia': { latitude: 39.9526, longitude: -75.1652 },
  'san antonio': { latitude: 29.4241, longitude: -98.4936 },
  'san diego': { latitude: 32.7157, longitude: -117.1611 },
  'dallas': { latitude: 32.7767, longitude: -96.7970 },
  'san jose': { latitude: 37.3382, longitude: -121.8863 },
  'austin': { latitude: 30.2672, longitude: -97.7431 },
  'jacksonville': { latitude: 30.3322, longitude: -81.6557 },
  'san francisco': { latitude: 37.7749, longitude: -122.4194 },
  'columbus-oh': { latitude: 39.9612, longitude: -82.9988 },
  'charlotte': { latitude: 35.2271, longitude: -80.8431 },
  'fort worth': { latitude: 32.7555, longitude: -97.3308 },
  'indianapolis': { latitude: 39.7684, longitude: -86.1581 },
  'seattle': { latitude: 47.6062, longitude: -122.3321 },
  'denver': { latitude: 39.7392, longitude: -104.9903 },
  'boston': { latitude: 42.3601, longitude: -71.0589 },
  'el paso': { latitude: 31.7619, longitude: -106.4850 },
  'detroit': { latitude: 42.3314, longitude: -83.0458 },
  'nashville': { latitude: 36.1627, longitude: -86.7816 },
  'memphis': { latitude: 35.1495, longitude: -90.0490 },
  'portland': { latitude: 45.5152, longitude: -122.6784 },
  'oklahoma city': { latitude: 35.4676, longitude: -97.5164 },
  'las vegas': { latitude: 36.1699, longitude: -115.1398 },
  'louisville': { latitude: 38.2527, longitude: -85.7585 },
  'baltimore': { latitude: 39.2904, longitude: -76.6122 },
  'milwaukee': { latitude: 43.0389, longitude: -87.9065 },
  'albuquerque': { latitude: 35.0844, longitude: -106.6504 },
  'tucson': { latitude: 32.2226, longitude: -110.9747 },
  'fresno': { latitude: 36.7378, longitude: -119.7871 },
  'sacramento': { latitude: 38.5816, longitude: -121.4944 },
  'mesa': { latitude: 33.4152, longitude: -111.8315 },
  'kansas city-mo': { latitude: 39.0997, longitude: -94.5786 },
  'atlanta': { latitude: 33.7490, longitude: -84.3880 },
  'colorado springs': { latitude: 38.8339, longitude: -104.8214 },
  'raleigh': { latitude: 35.7796, longitude: -78.6382 },
  'omaha': { latitude: 41.2565, longitude: -95.9345 },
  'miami': { latitude: 25.7617, longitude: -80.1918 },
  'virginia beach': { latitude: 36.8529, longitude: -76.0818 },
  'oakland': { latitude: 37.8044, longitude: -122.2712 },
  'tulsa': { latitude: 36.1540, longitude: -95.9928 },
  'minneapolis': { latitude: 44.9778, longitude: -93.2650 },
  'cleveland': { latitude: 41.4993, longitude: -81.6944 },
  'wichita': { latitude: 37.6872, longitude: -97.3301 },
  'arlington': { latitude: 32.7357, longitude: -97.1081 },
  'new orleans': { latitude: 29.9511, longitude: -90.0715 },
  'bakersfield': { latitude: 35.3733, longitude: -119.0187 },
  'tampa': { latitude: 27.9506, longitude: -82.4572 },
  'honolulu': { latitude: 21.3099, longitude: -157.8581 },
  'anaheim': { latitude: 33.8366, longitude: -117.9143 },
  'aurora-co': { latitude: 39.7294, longitude: -104.8319 },
  'santa ana': { latitude: 33.7455, longitude: -117.8677 },
  'st. louis': { latitude: 38.6270, longitude: -90.1994 },
  'riverside': { latitude: 33.9533, longitude: -117.3962 },
  'corpus christi': { latitude: 27.8006, longitude: -97.3964 },
  'lexington': { latitude: 38.0406, longitude: -84.5037 },
  'pittsburgh': { latitude: 40.4406, longitude: -79.9959 },
  'anchorage': { latitude: 61.2181, longitude: -149.9003 },
  'stockton': { latitude: 37.9577, longitude: -121.2908 },
  'cincinnati': { latitude: 39.1031, longitude: -84.5120 },
  'st. paul': { latitude: 44.9537, longitude: -93.0900 },
  'toledo': { latitude: 41.6528, longitude: -83.5379 },
  'greensboro': { latitude: 36.0726, longitude: -79.7920 },
  'newark': { latitude: 40.7357, longitude: -74.1724 },
  'plano': { latitude: 33.0198, longitude: -96.6989 },
  'henderson': { latitude: 36.0395, longitude: -114.9817 },
  'lincoln': { latitude: 40.8136, longitude: -96.7026 },
  'buffalo': { latitude: 42.8864, longitude: -78.8784 },
  'jersey city': { latitude: 40.7178, longitude: -74.0431 },
  'chula vista': { latitude: 32.6401, longitude: -117.0842 },
  'fort wayne': { latitude: 41.0793, longitude: -85.1394 },
  'orlando': { latitude: 28.5383, longitude: -81.3792 },
  'st. petersburg': { latitude: 27.7676, longitude: -82.6403 },
  'chandler': { latitude: 33.3062, longitude: -111.8413 },
  'laredo': { latitude: 27.5306, longitude: -99.4803 },
  'norfolk': { latitude: 36.8468, longitude: -76.2852 },
  'durham': { latitude: 35.9940, longitude: -78.8986 },
  'madison': { latitude: 43.0731, longitude: -89.4012 },
  'lubbock': { latitude: 33.5779, longitude: -101.8552 },
  'irvine': { latitude: 33.6846, longitude: -117.8265 },
  'winston-salem': { latitude: 36.0999, longitude: -80.2442 },
  'glendale-az': { latitude: 33.5387, longitude: -112.1860 },
  'garland': { latitude: 32.9126, longitude: -96.6389 },
  'hialeah': { latitude: 25.8576, longitude: -80.2781 },
  'reno': { latitude: 39.5296, longitude: -119.8138 },
  'chesapeake': { latitude: 36.8190, longitude: -76.2749 },
  'gilbert': { latitude: 33.3528, longitude: -111.7890 },
  'baton rouge': { latitude: 30.4515, longitude: -91.1871 },
  'irving': { latitude: 32.8140, longitude: -96.9489 },
  'scottsdale': { latitude: 33.4942, longitude: -111.9261 },
  'north las vegas': { latitude: 36.1989, longitude: -115.1175 },
  'fremont': { latitude: 37.5485, longitude: -121.9886 },
  'boise': { latitude: 43.6150, longitude: -116.2023 },
  'richmond': { latitude: 37.5407, longitude: -77.4360 },
  'san bernardino': { latitude: 34.1083, longitude: -117.2898 },
  'birmingham': { latitude: 33.5207, longitude: -86.8025 },
  'spokane': { latitude: 47.6587, longitude: -117.4260 },
  'rochester': { latitude: 43.1566, longitude: -77.6088 },
  'des moines': { latitude: 41.5868, longitude: -93.6250 },
  'modesto': { latitude: 37.6391, longitude: -120.9969 },
  'fayetteville': { latitude: 36.0626, longitude: -94.1574 },
  'tacoma': { latitude: 47.2529, longitude: -122.4443 },
  'oxnard': { latitude: 34.1975, longitude: -119.1771 },
  'fontana': { latitude: 34.0922, longitude: -117.4350 },
  'columbus-ga': { latitude: 32.4609, longitude: -84.9877 },
  'montgomery': { latitude: 32.3668, longitude: -86.3000 },
  'moreno valley': { latitude: 33.9425, longitude: -117.2297 },
  'shreveport': { latitude: 32.5252, longitude: -93.7502 },
  'aurora-il': { latitude: 41.7606, longitude: -88.3201 },
  'yonkers': { latitude: 40.9312, longitude: -73.8988 },
  'akron': { latitude: 41.0814, longitude: -81.5190 },
  'huntington beach': { latitude: 33.6603, longitude: -117.9992 },
  'little rock': { latitude: 34.7465, longitude: -92.2896 },
  'augusta': { latitude: 33.4735, longitude: -82.0105 },
  'amarillo': { latitude: 35.2220, longitude: -101.8313 },
  'glendale-ca': { latitude: 34.1425, longitude: -118.2551 },
  'mobile': { latitude: 30.6954, longitude: -88.0399 },
  'grand rapids': { latitude: 42.9634, longitude: -85.6681 },
  'salt lake city': { latitude: 40.7608, longitude: -111.8910 },
  'tallahassee': { latitude: 30.4518, longitude: -84.2807 },
  'huntsville': { latitude: 34.7304, longitude: -86.5861 },
  'grand prairie': { latitude: 32.7460, longitude: -96.9978 },
  'knoxville': { latitude: 35.9606, longitude: -83.9207 },
  'worcester': { latitude: 42.2626, longitude: -71.8023 },
  'newport news': { latitude: 37.0871, longitude: -76.4730 },
  'brownsville': { latitude: 25.9018, longitude: -97.4975 },
  'overland park': { latitude: 38.9822, longitude: -94.6708 },
  'santa clarita': { latitude: 34.3917, longitude: -118.5426 },
  'providence': { latitude: 41.8240, longitude: -71.4128 },
  'garden grove': { latitude: 33.7739, longitude: -117.9415 },
  'chattanooga': { latitude: 35.0456, longitude: -85.3097 },
  'oceanside': { latitude: 33.1959, longitude: -117.3795 },
  'jackson': { latitude: 32.2988, longitude: -90.1848 },
  'fort lauderdale': { latitude: 26.1224, longitude: -80.1373 },
  'santa rosa': { latitude: 38.4404, longitude: -122.7144 },
  'rancho cucamonga': { latitude: 34.1064, longitude: -117.5931 },
  'port st. lucie': { latitude: 27.2939, longitude: -80.3503 },
  'tempe': { latitude: 33.4255, longitude: -111.9400 },
  'ontario': { latitude: 34.0633, longitude: -117.6509 },
  'vancouver': { latitude: 45.6387, longitude: -122.6615 },
  'cape coral': { latitude: 26.5629, longitude: -81.9495 },
  'sioux falls': { latitude: 43.5446, longitude: -96.7311 },
  'springfield-il': { latitude: 39.7817, longitude: -89.6501 },
  'peoria': { latitude: 40.6936, longitude: -89.5890 },
  'pembroke pines': { latitude: 26.0070, longitude: -80.2962 },
  'elk grove': { latitude: 38.4088, longitude: -121.3716 },
  'rockford': { latitude: 42.2711, longitude: -89.0940 },
  'salem': { latitude: 44.9429, longitude: -123.0351 },
  'lancaster': { latitude: 34.6868, longitude: -118.1542 },
  'corona': { latitude: 33.8753, longitude: -117.5664 },
  'eugene': { latitude: 44.0521, longitude: -123.0868 },
  'palmdale': { latitude: 34.5794, longitude: -118.1165 },
  'salinas': { latitude: 36.6777, longitude: -121.6555 },
  'springfield-mo': { latitude: 37.2153, longitude: -93.2982 },
  'pasadena': { latitude: 34.1478, longitude: -118.1445 },
  'fort collins': { latitude: 40.5853, longitude: -105.0844 },
  'hayward': { latitude: 37.6688, longitude: -122.0808 },
  'pomona': { latitude: 34.0552, longitude: -117.7500 },
  'cary': { latitude: 35.7915, longitude: -78.7811 },
  'rockville': { latitude: 39.0840, longitude: -77.1528 },
  'alexandria': { latitude: 38.8048, longitude: -77.0469 },
  'escondido': { latitude: 33.1192, longitude: -117.0864 },
  'mckinney': { latitude: 33.1972, longitude: -96.6155 },
  'kansas city-ks': { latitude: 39.1142, longitude: -94.6275 },
  'joliet': { latitude: 41.5250, longitude: -88.0817 },
  'sunnyvale': { latitude: 37.3688, longitude: -122.0363 },
  'torrance': { latitude: 33.8358, longitude: -118.3407 },
  'bridgeport': { latitude: 41.1865, longitude: -73.1952 },
  'lakewood': { latitude: 39.7047, longitude: -105.0814 },
  'hollywood': { latitude: 26.0112, longitude: -80.1494 },
  'paterson': { latitude: 40.9168, longitude: -74.1718 },
  'naperville': { latitude: 41.7508, longitude: -88.1535 },
  'syracuse': { latitude: 43.0481, longitude: -76.1474 },
  'mesquite': { latitude: 32.7668, longitude: -96.5991 },
  'dayton': { latitude: 39.7589, longitude: -84.1916 },
  'savannah': { latitude: 32.0835, longitude: -81.0998 },
  'clarksville': { latitude: 36.5298, longitude: -87.3595 },
  'orange': { latitude: 33.7879, longitude: -117.8531 },
  'pasadena-tx': { latitude: 29.6911, longitude: -95.2091 },
  'fullerton': { latitude: 33.8703, longitude: -117.9242 },
  'killeen': { latitude: 31.1171, longitude: -97.7278 },
  'frisco': { latitude: 33.1507, longitude: -96.8236 },
  'hampton': { latitude: 37.0299, longitude: -76.3452 },
  'mcorlando': { latitude: 28.5383, longitude: -81.3792 }
};

/**
 * Calculate the distance between two points using the Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

/**
 * Get coordinates for a location string, checking our city database first
 * @param locationString - Location string in format "city, state" or just "city"
 * @returns Coordinates if found, null otherwise
 */
function getCoordinatesForLocation(locationString: string): Coordinates | null {
  if (!locationString) return null;
  
  const cleanLocation = locationString.toLowerCase().trim();
  
  // Try to find exact match first
  if (CITY_COORDINATES[cleanLocation]) {
    return CITY_COORDINATES[cleanLocation];
  }
  
  // Try to extract city name from various formats
  const cityPart = cleanLocation.split(',')[0].trim();
  if (CITY_COORDINATES[cityPart]) {
    return CITY_COORDINATES[cityPart];
  }
  
  // Try partial matching for major cities
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (city.includes(cityPart) || cityPart.includes(city)) {
      return coords;
    }
  }
  
  return null;
}

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
  getPendingVendors(): Promise<Vendor[]>;
  approveVendor(id: string): Promise<boolean>;
  rejectVendor(id: string): Promise<boolean>;

  // Product methods
  getProduct(id: string): Promise<Product | undefined>;
  getProductById(id: string): Promise<Product | undefined>;
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
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

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

  // Wishlist methods
  getWishlistByUser(userId: string): Promise<Wishlist[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(id: string): Promise<boolean>;
  isInWishlist(userId: string, productId: string): Promise<boolean>;

  // Location-based filtering methods
  getProductsByLocation(filter: { city?: string; state?: string; zipCode?: string; radius?: number }): Promise<Product[]>;
  getVendorsByLocation(filter: { city?: string; state?: string; zipCode?: string; radius?: number }): Promise<Vendor[]>;

  // Image tracking methods
  trackUploadedImage(userId: string, imagePath: string, imageType: 'review' | 'product' | 'logo'): Promise<void>;
  verifyImageOwnership(userId: string, imagePath: string): Promise<boolean>;
  deleteTrackedImage(userId: string, imagePath: string): Promise<boolean>;
  getUserUploadedImages(userId: string, imageType?: 'review' | 'product' | 'logo'): Promise<string[]>;
}

// Image upload tracking interface
interface UploadedImage {
  id: string;
  userId: string;
  imagePath: string;
  imageType: 'review' | 'product' | 'logo';
  uploadedAt: Date;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private vendors: Map<string, Vendor> = new Map();
  private products: Map<string, Product> = new Map();
  private carts: Map<string, Cart> = new Map();
  private orders: Map<string, Order> = new Map();
  private vendorSettings: Map<string, any> = new Map();
  private reviews: Map<string, Review> = new Map();
  private coupons: Map<string, Coupon> = new Map();
  private categories: Map<string, Category> = new Map();
  private orderItems: Map<string, OrderItem> = new Map();
  private uploadedImages: Map<string, UploadedImage> = new Map();

  // Vendor Settings methods
  async getVendorSettings(vendorId: string): Promise<any> {
    return this.vendorSettings.get(vendorId) || {
      storeName: "",
      storeDescription: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      website: "",
      logo: "",
      emailNotifications: true,
      smsNotifications: false,
      orderNotifications: true,
      reviewNotifications: true,
      promotionalEmails: false,
      paypalEmail: "",
      bankAccountNumber: "",
      bankRoutingNumber: "",
      stripeAccountId: "",
    };
  }

  async updateVendorSettings(vendorId: string, settings: any): Promise<any> {
    const existingSettings = await this.getVendorSettings(vendorId);
    const updatedSettings = { ...existingSettings, ...settings };
    this.vendorSettings.set(vendorId, updatedSettings);
    return updatedSettings;
  }

  private wishlists: Map<string, Wishlist> = new Map();

  constructor() {
    this.initializeData().catch(console.error);
  }

  private async createSecureAdminUser() {
    // Check if admin already exists
    const adminEmail = process.env.ADMIN_EMAIL || "admin@dokan.com";
    const existingAdmin = await this.getUserByEmail(adminEmail);
    
    if (existingAdmin) {
      // Admin already exists, skip creation
      console.log("Admin user already exists");
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      // Development fallback with secure warnings
      console.warn("\n⚠️  SECURITY WARNING: No ADMIN_PASSWORD environment variable set!");
      console.warn("⚠️  Using default development password. This is INSECURE for production!");
      console.warn("⚠️  Set ADMIN_PASSWORD environment variable before deploying.");
      console.warn("⚠️  Default credentials: admin@dokan.com / admin123\n");
      
      // Create admin with temporary password that must be changed
      const adminId = randomUUID();
      const hashedPassword = await PasswordCrypto.hashPassword("admin123");
      const admin: User = {
        id: adminId,
        username: "admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        firstName: "Admin",
        lastName: "User",
        phone: null,
        address: null,
        isActive: true,
        mustChangePassword: true, // Force password change
        createdAt: new Date(),
      };
      this.users.set(adminId, admin);
      return;
    }

    // Validate secure password requirements
    if (adminPassword.length < 12) {
      throw new Error("ADMIN_PASSWORD must be at least 12 characters long for security");
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(adminPassword)) {
      throw new Error("ADMIN_PASSWORD must contain at least one uppercase letter, lowercase letter, number, and special character");
    }

    // Create secure admin user
    const adminId = randomUUID();
    const hashedPassword = await PasswordCrypto.hashPassword(adminPassword);
    const admin: User = {
      id: adminId,
      username: "admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      firstName: "Admin",
      lastName: "User", 
      phone: null,
      address: null,
      isActive: true,
      mustChangePassword: false, // Secure password provided
      createdAt: new Date(),
    };
    this.users.set(adminId, admin);
    console.log("✅ Secure admin user created successfully with environment credentials");
  }

  // Add missing methods for stats and recent reviews
  async getStats(): Promise<{
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    activeStores: number;
    productsListed: number;
  }> {
    const totalUsers = this.users.size;
    const totalProducts = this.products.size;
    const totalOrders = this.orders.size;
    
    const totalRevenue = Array.from(this.orders.values())
      .filter(order => order.status === 'completed' || order.status === 'paid')
      .reduce((sum, order) => sum + parseFloat(order.total || "0"), 0);

    const activeStores = Array.from(this.vendors.values())
      .filter(vendor => vendor.isApproved).length;

    const productsListed = totalProducts;

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      activeStores,
      productsListed,
    };
  }

  async getRecentReviews(limit: number = 10): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
      .slice(0, limit);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getVendorProducts(vendorId: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.vendorId === vendorId)
      .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
  }

  private async initializeData() {
    // Create secure admin user with environment-based credentials
    await this.createSecureAdminUser();

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
      mustChangePassword: insertUser.mustChangePassword || false,
      address: insertUser.address as { street?: string; city?: string; state?: string; zipCode?: string; country?: string; } | null ?? null,
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
      storeLocation: insertVendor.storeLocation as { street?: string; city?: string; state?: string; zipCode?: string; country?: string; latitude?: number; longitude?: number; } | null ?? null,
      deliveryAreas: insertVendor.deliveryAreas ?? [],
      deliveryRadius: insertVendor.deliveryRadius ?? 10,
      deliveryFee: insertVendor.deliveryFee ?? "0",
      freeDeliveryThreshold: insertVendor.freeDeliveryThreshold ?? "50",
      isApproved: insertVendor.isApproved !== undefined ? insertVendor.isApproved : false,
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

  async getPendingVendors(): Promise<Vendor[]> {
    return Array.from(this.vendors.values()).filter(vendor => !vendor.isApproved);
  }

  async approveVendor(id: string): Promise<boolean> {
    const vendor = this.vendors.get(id);
    if (!vendor) return false;
    
    vendor.isApproved = true;
    this.vendors.set(id, vendor);
    return true;
  }

  async rejectVendor(id: string): Promise<boolean> {
    const vendor = this.vendors.get(id);
    if (!vendor) return false;
    
    // For now, we'll mark as not approved. In a real app, you might want to delete or mark as rejected
    vendor.isApproved = false;
    this.vendors.set(id, vendor);
    return true;
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductById(id: string): Promise<Product | undefined> {
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
      sizes: insertProduct.sizes || null,
      brand: insertProduct.brand || null,
      discountPrice: insertProduct.discountPrice || null,
      stock: insertProduct.stock !== undefined ? insertProduct.stock : 0,
      minOrderQuantity: insertProduct.minOrderQuantity || 1,
      maxOrderQuantity: insertProduct.maxOrderQuantity || null,
      weight: insertProduct.weight || null,
      dimensions: insertProduct.dimensions ? {
        length: insertProduct.dimensions.length ? Number(insertProduct.dimensions.length) : undefined,
        width: insertProduct.dimensions.width ? Number(insertProduct.dimensions.width) : undefined,
        height: insertProduct.dimensions.height ? Number(insertProduct.dimensions.height) : undefined,
      } : null,
      colors: insertProduct.colors || [],
      tags: insertProduct.tags || [],
      warrantyPeriod: insertProduct.warrantyPeriod || 0,
      isDigitalProduct: insertProduct.isDigitalProduct || false,
      isFeatured: insertProduct.isFeatured || false,
      images: insertProduct.images || [],
      availableInAreas: insertProduct.availableInAreas ?? [],
      requiresShipping: insertProduct.requiresShipping ?? true,
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

  // Wishlist methods
  async getWishlistByUser(userId: string): Promise<Wishlist[]> {
    return Array.from(this.wishlists.values()).filter(wishlist => wishlist.userId === userId);
  }

  async addToWishlist(insertWishlist: InsertWishlist): Promise<Wishlist> {
    // Check if item already exists in wishlist
    const existingWishlist = Array.from(this.wishlists.values()).find(
      wishlist => wishlist.userId === insertWishlist.userId && wishlist.productId === insertWishlist.productId
    );

    if (existingWishlist) {
      return existingWishlist; // Already in wishlist
    }

    const id = randomUUID();
    const wishlist: Wishlist = {
      ...insertWishlist,
      id,
      createdAt: new Date(),
    };
    this.wishlists.set(id, wishlist);
    return wishlist;
  }

  async removeFromWishlist(id: string): Promise<boolean> {
    return this.wishlists.delete(id);
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    return Array.from(this.wishlists.values()).some(
      wishlist => wishlist.userId === userId && wishlist.productId === productId
    );
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

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const orderItem: OrderItem = {
      ...insertOrderItem,
      id,
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
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

  // Location-based filtering methods
  async getVendorsByLocation(filter: { city?: string; state?: string; zipCode?: string; radius?: number }): Promise<Vendor[]> {
    const { city, state, zipCode, radius = 25 } = filter;
    
    // Get coordinates for the search location
    const searchLocationString = [city, state, zipCode].filter(Boolean).join(', ');
    const searchCoords = getCoordinatesForLocation(searchLocationString);
    
    return Array.from(this.vendors.values()).filter(vendor => {
      if (!vendor.isApproved) return false;
      
      // Check if vendor has store location or delivery areas set up
      const hasStoreLocation = vendor.storeLocation && 
        (vendor.storeLocation.city || vendor.storeLocation.state);
      const hasDeliveryAreas = vendor.deliveryAreas && vendor.deliveryAreas.length > 0;
      
      if (!hasStoreLocation && !hasDeliveryAreas) return false;

      // Priority 1: Geographic distance calculation if both locations have coordinates
      if (searchCoords && hasStoreLocation && vendor.storeLocation!.latitude && vendor.storeLocation!.longitude) {
        const vendorCoords = {
          latitude: vendor.storeLocation!.latitude,
          longitude: vendor.storeLocation!.longitude
        };
        
        const distance = calculateHaversineDistance(
          searchCoords.latitude, searchCoords.longitude,
          vendorCoords.latitude, vendorCoords.longitude
        );
        
        // Check if within vendor's delivery radius
        const vendorRadius = vendor.deliveryRadius || 10; // Default 10km if not set
        const effectiveRadius = Math.min(radius, vendorRadius); // Use the smaller radius
        
        if (distance <= effectiveRadius) {
          return true;
        }
      }

      // Priority 2: Check delivery areas for direct text match
      if (hasDeliveryAreas && (city || state || zipCode)) {
        const searchLocation = [city, state, zipCode].filter(Boolean).join(' ').toLowerCase();
        const matchesDeliveryAreas = vendor.deliveryAreas!.some(area => 
          area.toLowerCase().includes(searchLocation) ||
          searchLocation.includes(area.toLowerCase())
        );
        if (matchesDeliveryAreas) return true;
      }

      // Priority 3: Fallback to text-based store location matching
      if (hasStoreLocation) {
        const storeLocation = vendor.storeLocation!;
        
        // If vendor has no coordinates, try coordinate lookup for their location
        if (!storeLocation.latitude || !storeLocation.longitude) {
          const vendorLocationString = [storeLocation.city, storeLocation.state].filter(Boolean).join(', ');
          const vendorCoords = getCoordinatesForLocation(vendorLocationString);
          
          // If we can find coordinates for vendor location, do distance calculation
          if (searchCoords && vendorCoords) {
            const distance = calculateHaversineDistance(
              searchCoords.latitude, searchCoords.longitude,
              vendorCoords.latitude, vendorCoords.longitude
            );
            
            const vendorRadius = vendor.deliveryRadius || 10;
            const effectiveRadius = Math.min(radius, vendorRadius);
            
            if (distance <= effectiveRadius) {
              return true;
            }
          }
        }
        
        // Text-based matching as final fallback
        if (city && storeLocation.city && 
            storeLocation.city.toLowerCase().includes(city.toLowerCase())) {
          return true;
        }
        if (state && storeLocation.state && 
            storeLocation.state.toLowerCase().includes(state.toLowerCase())) {
          return true;
        }
        if (zipCode && storeLocation.zipCode && 
            storeLocation.zipCode.includes(zipCode)) {
          return true;
        }
      }

      return false;
    });
  }

  async getProductsByLocation(filter: { city?: string; state?: string; zipCode?: string; radius?: number }): Promise<Product[]> {
    const { city, state, zipCode } = filter;
    
    // First, get vendors that can deliver to this location
    const availableVendors = await this.getVendorsByLocation(filter);
    const vendorIds = new Set(availableVendors.map(v => v.id));
    
    // Filter products by available vendors
    let locationProducts = Array.from(this.products.values()).filter(product => {
      if (!product.isActive) return false;
      
      // Must be from a vendor that delivers to the location
      if (!vendorIds.has(product.vendorId)) return false;
      
      // Check product-specific available areas
      if (product.availableInAreas && product.availableInAreas.length > 0) {
        const searchLocation = [city, state, zipCode].filter(Boolean).join(' ').toLowerCase();
        const isAvailableInArea = product.availableInAreas.some(area => 
          area.toLowerCase().includes(searchLocation) ||
          searchLocation.includes(area.toLowerCase())
        );
        return isAvailableInArea;
      }
      
      // If product doesn't specify areas, rely on vendor's delivery capability
      return true;
    });

    return locationProducts;
  }

  // Image tracking methods implementation
  async trackUploadedImage(userId: string, imagePath: string, imageType: 'review' | 'product' | 'logo'): Promise<void> {
    const imageId = randomUUID();
    const uploadedImage: UploadedImage = {
      id: imageId,
      userId,
      imagePath,
      imageType,
      uploadedAt: new Date()
    };
    this.uploadedImages.set(imageId, uploadedImage);
  }

  async verifyImageOwnership(userId: string, imagePath: string): Promise<boolean> {
    const uploadedImage = Array.from(this.uploadedImages.values())
      .find(img => img.imagePath === imagePath && img.userId === userId);
    return !!uploadedImage;
  }

  async deleteTrackedImage(userId: string, imagePath: string): Promise<boolean> {
    const imageToDelete = Array.from(this.uploadedImages.entries())
      .find(([_, img]) => img.imagePath === imagePath && img.userId === userId);
    
    if (imageToDelete) {
      this.uploadedImages.delete(imageToDelete[0]);
      return true;
    }
    return false;
  }

  async getUserUploadedImages(userId: string, imageType?: 'review' | 'product' | 'logo'): Promise<string[]> {
    return Array.from(this.uploadedImages.values())
      .filter(img => {
        if (img.userId !== userId) return false;
        if (imageType && img.imageType !== imageType) return false;
        return true;
      })
      .map(img => img.imagePath);
  }
}

export const storage = new MemStorage();
