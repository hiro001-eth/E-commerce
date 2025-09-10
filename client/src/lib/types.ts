export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  vendorId: string;
  categoryId?: string;
  name: string;
  description: string;
  price: string;
  discountPrice?: string;
  stock: number;
  images: string[];
  sku: string;
  isActive: boolean;
  allowsCoupons: boolean;
  rating: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  vendor?: {
    storeName: string;
    deliveryFee: string;
    freeDeliveryThreshold: string;
    deliveryRadius: number;
    deliveryAreas: string[];
  };
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product?: Product;
  createdAt: string;
}

export interface Order {
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
  couponCode?: string;
  discount: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  userId: string;
  storeName: string;
  storeDescription?: string;
  businessLicense?: string;
  storeLocation?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  };
  deliveryAreas: string[];
  deliveryRadius: number;
  deliveryFee: string;
  freeDeliveryThreshold: string;
  isApproved: boolean;
  rating: string;
  totalSales: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}
