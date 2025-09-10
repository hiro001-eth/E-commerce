import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Store, ShoppingBag, Award, Shield, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-6">
              About Dokan Marketplace
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Empowering entrepreneurs and connecting customers worldwide through our comprehensive multi-vendor e-commerce platform.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Dokan is a comprehensive multi-vendor e-commerce platform designed to bring together buyers, sellers, and administrators in one seamless ecosystem. Our platform empowers entrepreneurs to start their online stores while providing customers with access to a diverse range of products from verified vendors.
              </p>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                With advanced features like real-time inventory management, secure payment processing, and comprehensive analytics, Dokan ensures a smooth experience for all stakeholders in the e-commerce journey.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="text-vendor-count">1000+</div>
                  <div className="text-sm text-muted-foreground">Active Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="text-customer-count">50K+</div>
                  <div className="text-sm text-muted-foreground">Happy Customers</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Team collaboration"
                className="rounded-xl shadow-lg w-full h-auto"
                data-testid="img-team-collaboration"
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Why Choose Dokan?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-lg smooth-transition">
                <CardContent className="p-6">
                  <div className="bg-chart-1 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Secure & Reliable</h3>
                  <p className="text-muted-foreground">
                    Built with security at its core, featuring encrypted data transfer, secure payment processing, and comprehensive user verification systems.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg smooth-transition">
                <CardContent className="p-6">
                  <div className="bg-chart-2 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Lightning Fast</h3>
                  <p className="text-muted-foreground">
                    Optimized performance ensures quick load times, smooth navigation, and real-time updates across all platform features.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg smooth-transition">
                <CardContent className="p-6">
                  <div className="bg-chart-3 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Award Winning</h3>
                  <p className="text-muted-foreground">
                    Recognized for excellence in e-commerce innovation, user experience design, and customer satisfaction across the industry.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">Our Core Values</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <Badge className="mr-4 mt-1">01</Badge>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Customer First</h3>
                    <p className="text-muted-foreground text-sm">
                      Every decision we make puts our customers' needs and satisfaction at the forefront, ensuring exceptional shopping experiences.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Badge className="mr-4 mt-1">02</Badge>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Innovation</h3>
                    <p className="text-muted-foreground text-sm">
                      We continuously evolve our platform with cutting-edge technology and features to stay ahead of market demands.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Badge className="mr-4 mt-1">03</Badge>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Transparency</h3>
                    <p className="text-muted-foreground text-sm">
                      We believe in open communication, clear policies, and honest business practices with all our stakeholders.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Badge className="mr-4 mt-1">04</Badge>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Empowerment</h3>
                    <p className="text-muted-foreground text-sm">
                      We provide tools and resources that enable vendors to grow their businesses and achieve their entrepreneurial dreams.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Badge className="mr-4 mt-1">05</Badge>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Community</h3>
                    <p className="text-muted-foreground text-sm">
                      Building strong relationships between buyers, sellers, and our platform creates a thriving marketplace ecosystem.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Badge className="mr-4 mt-1">06</Badge>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Quality</h3>
                    <p className="text-muted-foreground text-sm">
                      We maintain high standards for products, services, and user experiences across every aspect of our platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-card rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">Platform Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <Users className="w-8 h-8 text-chart-1 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground" data-testid="text-total-users">12,543</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center">
                <Store className="w-8 h-8 text-chart-2 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground" data-testid="text-active-stores">1,247</div>
                <div className="text-sm text-muted-foreground">Active Stores</div>
              </div>
              <div className="text-center">
                <ShoppingBag className="w-8 h-8 text-chart-3 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground" data-testid="text-products-listed">45,692</div>
                <div className="text-sm text-muted-foreground">Products Listed</div>
              </div>
              <div className="text-center">
                <Award className="w-8 h-8 text-chart-4 mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground" data-testid="text-satisfaction-rate">98%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
