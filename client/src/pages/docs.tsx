import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, ShoppingCart, HelpCircle, MessageSquare, Globe } from "lucide-react";
import { Link } from "wouter";

export default function TechnicalDocs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Help Center</h1>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about using Dokan marketplace
          </p>
        </div>

        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="buying-guide">Buying Guide</TabsTrigger>
            <TabsTrigger value="selling-guide">Selling Guide</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          {/* Getting Started */}
          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2" />
                  Welcome to Dokan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Dokan is a multi-vendor e-commerce platform connecting buyers and sellers in Nepal. 
                    Here's how to get started:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">For Buyers</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Browse thousands of products from verified vendors</li>
                        <li>• Create an account to track orders and reviews</li>
                        <li>• Add items to cart and wishlist</li>
                        <li>• Pay securely with multiple payment options</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">For Sellers</h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Register as a vendor and set up your store</li>
                        <li>• List your products with detailed descriptions</li>
                        <li>• Manage orders and customer communications</li>
                        <li>• Track your sales and performance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Buying Guide */}
          <TabsContent value="buying-guide" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="mr-2" />
                  How to Buy on Dokan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Step 1: Browse & Search</h3>
                    <p className="text-muted-foreground mb-2">
                      Use our advanced search and filtering system to find exactly what you need:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Filter by category, price range, and ratings</li>
                      <li>• Sort by popularity, price, or newest arrivals</li>
                      <li>• Check product reviews and vendor ratings</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Step 2: Add to Cart</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Select quantity and product variants (if available)</li>
                      <li>• Review product details and shipping information</li>
                      <li>• Add to wishlist for later purchase</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Step 3: Checkout & Payment</h3>
                    <p className="text-muted-foreground mb-2">We accept multiple payment methods:</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">eSewa</Badge>
                      <Badge variant="outline">IME Pay</Badge>
                      <Badge variant="outline">Visa Card</Badge>
                      <Badge variant="outline">Credit Cards</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Selling Guide */}
          <TabsContent value="selling-guide" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2" />
                  How to Sell on Dokan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Getting Started as a Vendor</h3>
                    <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                      <li>• Create your vendor account with business details</li>
                      <li>• Set up your store profile and payment preferences</li>
                      <li>• Upload your business license and verification documents</li>
                      <li>• Wait for approval from our team</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Managing Your Products</h3>
                    <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                      <li>• Upload high-quality product images</li>
                      <li>• Write detailed product descriptions</li>
                      <li>• Set competitive pricing in NPR</li>
                      <li>• Manage inventory and stock levels</li>
                      <li>• Configure product variants (colors, sizes)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Order Management</h3>
                    <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                      <li>• Receive instant notifications for new orders</li>
                      <li>• Update order status and tracking information</li>
                      <li>• Communicate with customers through our platform</li>
                      <li>• Handle returns and refunds professionally</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support */}
          <TabsContent value="support" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="mr-2" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">How do I track my order?</h4>
                      <p className="text-sm text-muted-foreground">
                        Once your order is shipped, you'll receive a tracking number via email and SMS. 
                        You can also check order status in your dashboard.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">What is your return policy?</h4>
                      <p className="text-sm text-muted-foreground">
                        We offer a 7-day return policy for most items. Products must be in original 
                        condition with all packaging and accessories.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">How do I become a verified vendor?</h4>
                      <p className="text-sm text-muted-foreground">
                        Submit your business license, tax registration, and other required documents. 
                        Our team will review and approve your application within 2-3 business days.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2" />
                    Contact Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Need help? Our support team is here to assist you with any questions or issues.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Live Chat</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Get instant help from our AI chatbot, available 24/7 in the bottom-right corner.
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Email Support</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Send us an email and we'll respond within 24 hours.
                      </p>
                      <Link href="/contact" className="text-primary hover:underline text-sm">
                        Contact Form →
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2" />
                    Additional Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/vendor-guide" className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <h4 className="font-medium mb-2">Vendor Guide</h4>
                      <p className="text-sm text-muted-foreground">
                        Complete guide for becoming a successful vendor
                      </p>
                    </Link>
                    <Link href="/terms" className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <h4 className="font-medium mb-2">Terms of Service</h4>
                      <p className="text-sm text-muted-foreground">
                        Our platform terms and conditions
                      </p>
                    </Link>
                    <Link href="/privacy" className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <h4 className="font-medium mb-2">Privacy Policy</h4>
                      <p className="text-sm text-muted-foreground">
                        How we protect your personal information
                      </p>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}