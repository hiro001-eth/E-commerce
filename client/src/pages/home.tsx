import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Store, ShoppingBag, User, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/product-card";
import type { Product } from "@/lib/types";

export default function Home() {
  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: authData } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const featuredProducts = products.slice(0, 4);

  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-6">
                Your Gateway to <span className="text-primary">Multi-Vendor</span> Excellence
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Discover thousands of products from verified vendors, manage your store, or oversee the entire platform. Dokan brings everyone together in one powerful marketplace.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg" data-testid="button-start-shopping">
                  <Link href="/shop">Start Shopping</Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg"
                  asChild
                  data-testid="button-become-vendor"
                >
                  <Link href="/auth">Become a Vendor</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="p-6 shadow-lg">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-chart-1 rounded-lg p-4 text-white">
                    <Users className="w-8 h-8 mb-2" />
                    <p className="text-sm opacity-90">Total Users</p>
                    <p className="text-2xl font-bold">12,543</p>
                  </div>
                  <div className="bg-chart-2 rounded-lg p-4 text-white">
                    <Store className="w-8 h-8 mb-2" />
                    <p className="text-sm opacity-90">Active Stores</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                </div>
                <div className="bg-chart-3 rounded-lg p-4 text-white">
                  <ShoppingBag className="w-8 h-8 mb-2" />
                  <p className="text-sm opacity-90">Products Listed</p>
                  <p className="text-2xl font-bold">45,692</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground text-lg">Real feedback from our satisfied customers and vendors</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Customer Review 1 */}
            <Card className="hover:shadow-xl smooth-transition">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-chart-1 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    S
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Sarah Johnson</h4>
                    <p className="text-sm text-muted-foreground">Verified Customer</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">
                  "Amazing platform! The variety of products is incredible and the ordering process is so smooth. I've been shopping here for months and never had any issues."
                </p>
              </CardContent>
            </Card>

            {/* Vendor Review */}
            <Card className="hover:shadow-xl smooth-transition">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-chart-2 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    M
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Mike Chen</h4>
                    <p className="text-sm text-muted-foreground">Store Owner</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">
                  "As a vendor, Dokan has helped me reach customers I never could have reached before. The management tools are intuitive and the support is excellent."
                </p>
              </CardContent>
            </Card>

            {/* Customer Review 2 */}
            <Card className="hover:shadow-xl smooth-transition">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-chart-3 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    A
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Anna Rodriguez</h4>
                    <p className="text-sm text-muted-foreground">Regular Shopper</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">★</span>
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">
                  "Love the quality of products and fast shipping! The customer service team is always helpful and responsive. Highly recommend this marketplace."
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="bg-card rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-foreground mb-4">Join Thousands of Satisfied Users</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">4.8/5</div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">25,000+</div>
                  <p className="text-sm text-muted-foreground">Happy Customers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">99.2%</div>
                  <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
              <p className="text-muted-foreground mt-2">Discover amazing products from our verified vendors</p>
            </div>
            <Button asChild variant="outline" data-testid="button-view-all-products">
              <Link href="/shop">View All Products</Link>
            </Button>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Store className="text-2xl text-primary mr-3" />
                <span className="text-2xl font-bold text-primary">DOKAN</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Your trusted multi-vendor e-commerce platform connecting buyers and sellers worldwide.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-muted-foreground hover:text-primary smooth-transition">Home</Link></li>
                <li><Link href="/shop" className="text-muted-foreground hover:text-primary smooth-transition">Shop</Link></li>
                <li><Link href="/about" className="text-muted-foreground hover:text-primary smooth-transition">About</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary smooth-transition">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-primary smooth-transition">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary smooth-transition">Terms of Service</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary smooth-transition">Cookie Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary smooth-transition">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Newsletter</h3>
              <p className="text-muted-foreground text-sm mb-4">Subscribe to get updates on new features and offers.</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 bg-input text-foreground px-3 py-2 rounded-l-lg border border-border focus:ring-2 focus:ring-ring text-sm"
                  data-testid="input-newsletter-email"
                />
                <Button className="rounded-l-none" data-testid="button-subscribe">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © 2024 Dokan Marketplace. All rights reserved. Built with ❤️ for the e-commerce community.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
