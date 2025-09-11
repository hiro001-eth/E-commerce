import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Code, Database, Shield, Zap, Users, GitBranch, ExternalLink } from "lucide-react";

export default function TechnicalDocs() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Technical Documentation
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Platform overview and general information for users and businesses
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">System Architecture</h2>
            <p className="text-xl text-muted-foreground">Modern, scalable multi-vendor e-commerce platform</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Code className="w-12 h-12 text-chart-1 mb-4" />
                <h3 className="font-semibold text-foreground mb-3">Frontend Stack</h3>
                <div className="space-y-2 text-sm">
                  <Badge variant="secondary">React 18</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Vite</Badge>
                  <Badge variant="secondary">TailwindCSS</Badge>
                  <Badge variant="secondary">Shadcn/ui</Badge>
                  <Badge variant="secondary">React Hook Form</Badge>
                  <Badge variant="secondary">TanStack Query</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Database className="w-12 h-12 text-chart-2 mb-4" />
                <h3 className="font-semibold text-foreground mb-3">Backend Stack</h3>
                <div className="space-y-2 text-sm">
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">Express</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Drizzle ORM</Badge>
                  <Badge variant="secondary">PostgreSQL</Badge>
                  <Badge variant="secondary">Multer</Badge>
                  <Badge variant="secondary">Express Session</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Shield className="w-12 h-12 text-chart-3 mb-4" />
                <h3 className="font-semibold text-foreground mb-3">Security & Tools</h3>
                <div className="space-y-2 text-sm">
                  <Badge variant="secondary">BCrypt</Badge>
                  <Badge variant="secondary">CORS</Badge>
                  <Badge variant="secondary">Helmet</Badge>
                  <Badge variant="secondary">Rate Limiting</Badge>
                  <Badge variant="secondary">Input Validation</Badge>
                  <Badge variant="secondary">File Upload Security</Badge>
                  <Badge variant="secondary">Session Management</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Platform Features</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p>• Secure user registration and authentication</p>
                  <p>• Role-based access control (Customer, Vendor, Admin)</p>
                  <p>• Profile management and settings</p>
                  <p>• Password security and account protection</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2 text-primary" />
                  Product Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p>• Comprehensive product catalog</p>
                  <p>• Category-based organization</p>
                  <p>• Advanced search and filtering</p>
                  <p>• Inventory management for vendors</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GitBranch className="w-5 h-5 mr-2 text-primary" />
                  Order Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p>• Streamlined checkout process</p>
                  <p>• Order tracking and management</p>
                  <p>• Payment processing integration</p>
                  <p>• Delivery coordination</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-primary" />
                  Customer Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p>• Shopping cart and wishlist functionality</p>
                  <p>• Product reviews and ratings</p>
                  <p>• Personalized recommendations</p>
                  <p>• Customer support integration</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Technical Support?</h2>
          <p className="text-xl opacity-90 mb-8">
            Our development team is here to help with technical questions and integration issues
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <a href="/contact" data-testid="button-contact-tech-support">
                Contact Technical Support <ExternalLink className="ml-2 w-4 h-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/faq" data-testid="button-view-faq">
                View FAQ
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}