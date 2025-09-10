import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, User, Store, CreditCard, Package, BarChart, Headphones, ArrowRight, DollarSign, Shield, Clock } from "lucide-react";

export default function VendorGuide() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Store className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Vendor Application Guide
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know to become a successful vendor on the Dokan marketplace
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <DollarSign className="w-12 h-12 text-chart-1 mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground">0%</div>
              <div className="text-sm text-muted-foreground">Setup Fees</div>
            </div>
            <div>
              <Clock className="w-12 h-12 text-chart-2 mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground">3-5</div>
              <div className="text-sm text-muted-foreground">Days Approval</div>
            </div>
            <div>
              <Shield className="w-12 h-12 text-chart-3 mx-auto mb-4" />
              <div className="text-3xl font-bold text-foreground">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Getting Started</h2>
            <p className="text-xl text-muted-foreground">Follow these simple steps to start selling</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-chart-1 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <Badge className="mb-3">Step 1</Badge>
                <h3 className="font-semibold text-foreground mb-2">Create Account</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up for a customer account first, then apply for vendor status through your dashboard.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-chart-2 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <Badge className="mb-3">Step 2</Badge>
                <h3 className="font-semibold text-foreground mb-2">Complete Application</h3>
                <p className="text-sm text-muted-foreground">
                  Provide business information, tax details, and banking information for payments.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-chart-3 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <Badge className="mb-3">Step 3</Badge>
                <h3 className="font-semibold text-foreground mb-2">Get Approved</h3>
                <p className="text-sm text-muted-foreground">
                  Our team reviews your application within 3-5 business days and sends approval notification.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-chart-4 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <Badge className="mb-3">Step 4</Badge>
                <h3 className="font-semibold text-foreground mb-2">Start Selling</h3>
                <p className="text-sm text-muted-foreground">
                  Add your products with images and descriptions, set prices, and start receiving orders.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Application Requirements</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Valid government-issued ID
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Proof of address (utility bill or bank statement)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Contact information (phone and email)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Business name and description
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-primary" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Tax identification number (if applicable)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Business license (if required)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Bank account for payments
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Product categories you plan to sell
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features & Benefits */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Vendor Benefits</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Store className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-3">Your Own Storefront</h3>
                <p className="text-muted-foreground">
                  Get a dedicated vendor profile with your branding, logo, and product catalog.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <BarChart className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-3">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Track sales, orders, customer reviews, and performance metrics in real-time.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Package className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-3">Easy Product Management</h3>
                <p className="text-muted-foreground">
                  Add products with image uploads, manage inventory, and update pricing easily.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <CreditCard className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-3">Secure Payments</h3>
                <p className="text-muted-foreground">
                  Get paid automatically with secure payment processing and regular payouts.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Headphones className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-3">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Get help when you need it with our dedicated vendor support team.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Shield className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-3">Fraud Protection</h3>
                <p className="text-muted-foreground">
                  Advanced security measures protect you from fraudulent transactions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Fees */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Transparent Pricing</h2>
          
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-primary mb-2">Simple Commission</div>
                <p className="text-muted-foreground">Only pay when you make a sale</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground">5%</div>
                  <div className="text-sm text-muted-foreground">Electronics & Tech</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">7%</div>
                  <div className="text-sm text-muted-foreground">Fashion & Accessories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">10%</div>
                  <div className="text-sm text-muted-foreground">Other Categories</div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center text-green-800 font-medium">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  No setup fees, monthly fees, or listing fees
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of successful vendors on the Dokan marketplace
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <a href="/auth" data-testid="button-apply-now">
                Apply Now <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/contact" data-testid="button-contact-sales">
                Contact Sales
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}