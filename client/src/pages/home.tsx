import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Store, ShoppingBag, User, Settings, MapPin, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ProductCard from "@/components/product-card";
import RecentReviews from "@/components/recent-reviews";
import type { Product, User as UserType, LocationFilter } from "@shared/schema";

export default function Home() {
  const [locationFilter, setLocationFilter] = useState<LocationFilter>({
    city: "",
    state: "",
    zipCode: "",
    radius: 25
  });
  const [showLocationFilter, setShowLocationFilter] = useState(false);

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products", locationFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (locationFilter.city) params.append('city', locationFilter.city);
      if (locationFilter.state) params.append('state', locationFilter.state);
      if (locationFilter.zipCode) params.append('zipCode', locationFilter.zipCode);
      if (locationFilter.radius !== 25) params.append('radius', locationFilter.radius.toString());
      
      const url = `/api/products${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const { data: authData } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: stats = { totalUsers: 0, activeStores: 0, productsListed: 0 } } = useQuery<{
    totalUsers: number;
    activeStores: number;
    productsListed: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const featuredProducts = (products as Product[]).slice(0, 4);

  return (
    <main>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Location Filter Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-foreground">Products Near You</h2>
              <Button
                variant="outline"
                onClick={() => setShowLocationFilter(!showLocationFilter)}
                data-testid="button-toggle-location-filter"
              >
                <MapPin className="w-4 h-4 mr-2" />
                {showLocationFilter ? 'Hide Filters' : 'Set Location'}
              </Button>
            </div>
            
            {showLocationFilter && (
              <Card className="p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="filter-city">City</Label>
                    <Input
                      id="filter-city"
                      placeholder="Enter city"
                      value={locationFilter.city}
                      onChange={(e) => setLocationFilter(prev => ({ ...prev, city: e.target.value }))}
                      data-testid="input-filter-city"
                    />
                  </div>
                  <div>
                    <Label htmlFor="filter-state">State</Label>
                    <Input
                      id="filter-state"
                      placeholder="Enter state"
                      value={locationFilter.state}
                      onChange={(e) => setLocationFilter(prev => ({ ...prev, state: e.target.value }))}
                      data-testid="input-filter-state"
                    />
                  </div>
                  <div>
                    <Label htmlFor="filter-zip">ZIP Code</Label>
                    <Input
                      id="filter-zip"
                      placeholder="Enter ZIP code"
                      value={locationFilter.zipCode}
                      onChange={(e) => setLocationFilter(prev => ({ ...prev, zipCode: e.target.value }))}
                      data-testid="input-filter-zip"
                    />
                  </div>
                  <div>
                    <Label htmlFor="filter-radius">Radius (km)</Label>
                    <Input
                      id="filter-radius"
                      type="number"
                      min="1"
                      max="100"
                      value={locationFilter.radius}
                      onChange={(e) => setLocationFilter(prev => ({ ...prev, radius: parseInt(e.target.value) || 25 }))}
                      data-testid="input-filter-radius"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setLocationFilter({ city: '', state: '', zipCode: '', radius: 25 })}
                    data-testid="button-clear-location"
                  >
                    Clear Filters
                  </Button>
                  {(locationFilter.city || locationFilter.state || locationFilter.zipCode) && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      Location filters active
                    </Badge>
                  )}
                </div>
              </Card>
            )}
          </div>
          
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
                    <p className="text-2xl font-bold" data-testid="stat-total-users">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="bg-chart-2 rounded-lg p-4 text-white">
                    <Store className="w-8 h-8 mb-2" />
                    <p className="text-sm opacity-90">Active Stores</p>
                    <p className="text-2xl font-bold" data-testid="stat-active-stores">{stats.activeStores.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-chart-3 rounded-lg p-4 text-white">
                  <ShoppingBag className="w-8 h-8 mb-2" />
                  <p className="text-sm opacity-90">Products Listed</p>
                  <p className="text-2xl font-bold" data-testid="stat-products-listed">{stats.productsListed.toLocaleString()}</p>
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
            <p className="text-muted-foreground text-lg">Real feedback from verified customers</p>
          </div>

          <RecentReviews />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                <li><Link href="/vendor-guide" className="text-muted-foreground hover:text-primary smooth-transition">Vendor Application Guide</Link></li>
                <li><Link href="/faq" className="text-muted-foreground hover:text-primary smooth-transition">User Manual & FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="text-muted-foreground hover:text-primary smooth-transition">Technical Documentation</Link></li>
                <li><Link href="/community" className="text-muted-foreground hover:text-primary smooth-transition">Community Forum</Link></li>
                <li><Link href="/blog" className="text-muted-foreground hover:text-primary smooth-transition">Blog & Updates</Link></li>
                <li><Link href="/status" className="text-muted-foreground hover:text-primary smooth-transition">Service Status</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Legal & Policies</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary smooth-transition">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary smooth-transition">Terms of Service</Link></li>
                <li><Link href="/return-policy" className="text-muted-foreground hover:text-primary smooth-transition">Return & Refund Policy</Link></li>
                <li><Link href="/shipping" className="text-muted-foreground hover:text-primary smooth-transition">Shipping Policy</Link></li>
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
