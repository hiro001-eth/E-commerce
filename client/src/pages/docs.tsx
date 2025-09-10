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
              Complete technical guide for developers, system administrators, and technical users
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

      {/* API Documentation */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">API Reference</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  Authentication & Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">POST /api/auth/login</code>
                    <Badge variant="outline">Public</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">POST /api/auth/register</code>
                    <Badge variant="outline">Public</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">GET /api/auth/me</code>
                    <Badge>Auth Required</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">POST /api/auth/logout</code>
                    <Badge>Auth Required</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">PUT /api/profile</code>
                    <Badge>Auth Required</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2 text-primary" />
                  Products & Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">GET /api/products</code>
                    <Badge variant="outline">Public</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">POST /api/products</code>
                    <Badge>Vendor Required</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">GET /api/categories</code>
                    <Badge variant="outline">Public</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">GET /api/products/:id</code>
                    <Badge variant="outline">Public</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">PUT /api/products/:id</code>
                    <Badge>Vendor Required</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GitBranch className="w-5 h-5 mr-2 text-primary" />
                  Orders & Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">GET /api/orders</code>
                    <Badge>Auth Required</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">POST /api/orders</code>
                    <Badge>Auth Required</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">PUT /api/orders/:id/status</code>
                    <Badge>Vendor/Admin</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">GET /api/orders/unreviewed</code>
                    <Badge>Auth Required</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">GET /api/orders/:id/items</code>
                    <Badge>Auth Required</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-primary" />
                  Reviews & Cart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">GET /api/reviews/recent</code>
                    <Badge variant="outline">Public</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">POST /api/reviews</code>
                    <Badge>Auth Required</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">GET /api/cart</code>
                    <Badge>Auth Required</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">POST /api/cart</code>
                    <Badge>Auth Required</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <code className="bg-muted px-2 py-1 rounded">DELETE /api/cart/:id</code>
                    <Badge>Auth Required</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Database Schema */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Database Schema</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Core Entities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm font-mono">
                  <div>
                    <div className="font-bold text-primary mb-2">users</div>
                    <div className="ml-4 space-y-1 text-muted-foreground">
                      <div>• id (varchar, PK)</div>
                      <div>• email (varchar, unique)</div>
                      <div>• username (varchar, unique)</div>
                      <div>• firstName (varchar)</div>
                      <div>• lastName (varchar)</div>
                      <div>• role (enum: customer, vendor, admin)</div>
                      <div>• createdAt (timestamp)</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-bold text-primary mb-2">products</div>
                    <div className="ml-4 space-y-1 text-muted-foreground">
                      <div>• id (varchar, PK)</div>
                      <div>• name (varchar)</div>
                      <div>• description (text)</div>
                      <div>• price (decimal)</div>
                      <div>• vendorId (varchar, FK)</div>
                      <div>• images (text[])</div>
                      <div>• createdAt (timestamp)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transactional Tables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm font-mono">
                  <div>
                    <div className="font-bold text-primary mb-2">orders</div>
                    <div className="ml-4 space-y-1 text-muted-foreground">
                      <div>• id (varchar, PK)</div>
                      <div>• userId (varchar, FK)</div>
                      <div>• vendorId (varchar, FK)</div>
                      <div>• total (decimal)</div>
                      <div>• status (enum)</div>
                      <div>• deliveryAddress (json)</div>
                      <div>• createdAt (timestamp)</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-bold text-primary mb-2">reviews</div>
                    <div className="ml-4 space-y-1 text-muted-foreground">
                      <div>• id (varchar, PK)</div>
                      <div>• userId (varchar, FK)</div>
                      <div>• productId (varchar, FK)</div>
                      <div>• vendorId (varchar, FK)</div>
                      <div>• rating (integer)</div>
                      <div>• comment (text)</div>
                      <div>• createdAt (timestamp)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Deployment */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Deployment Guide</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Environment Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">Required environment variables:</p>
                  <div className="bg-muted p-4 rounded-lg text-sm font-mono">
                    <div>DATABASE_URL=postgresql://...</div>
                    <div>SESSION_SECRET=your-secret-key</div>
                    <div>NODE_ENV=production</div>
                    <div>PORT=5000</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Build Commands</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg text-sm font-mono space-y-2">
                    <div># Install dependencies</div>
                    <div>npm install</div>
                    <div></div>
                    <div># Database setup</div>
                    <div>npm run db:push</div>
                    <div></div>
                    <div># Build application</div>
                    <div>npm run build</div>
                    <div></div>
                    <div># Start production server</div>
                    <div>npm start</div>
                  </div>
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