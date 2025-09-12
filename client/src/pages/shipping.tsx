import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { Truck, MapPin, Clock, DollarSign, Globe, Phone } from "lucide-react";

export default function Shipping() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Truck className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-4">Shipping Policy</h1>
          <p className="text-xl text-muted-foreground">
            Fast, reliable shipping to get your orders to you quickly and safely.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Orders are processed by our vendors according to these timeframes:
              </p>
              <div className="grid gap-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Standard Items</span>
                  <span className="text-primary">1-2 business days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Custom Orders</span>
                  <span className="text-primary">3-7 business days</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Pre-orders</span>
                  <span className="text-primary">As specified</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-primary" />
                Shipping Costs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Shipping costs are calculated based on destination and method:
              </p>
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Standard Shipping</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Free on orders over {formatCurrency(5000)}</li>
                    <li>• {formatCurrency(500)} for orders under {formatCurrency(5000)}</li>
                    <li>• 5-7 business days delivery</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Express Shipping</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {formatCurrency(1000)} for all orders</li>
                    <li>• 2-3 business days delivery</li>
                    <li>• Available for most locations</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Overnight Shipping</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {formatCurrency(2000)} for all orders</li>
                    <li>• Next business day delivery</li>
                    <li>• Limited to major cities</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2 text-primary" />
                Delivery Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We currently ship to the following locations:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Domestic Shipping</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• All 50 US states</li>
                    <li>• Washington DC</li>
                    <li>• Puerto Rico</li>
                    <li>• US Virgin Islands</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">International</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Canada</li>
                    <li>• Mexico</li>
                    <li>• EU countries</li>
                    <li>• Additional fees apply</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary" />
                Order Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Stay updated on your order status:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Tracking information sent via email once shipped</li>
                <li>Real-time tracking available in your account</li>
                <li>SMS notifications for delivery updates (optional)</li>
                <li>Delivery confirmation required for orders over {formatCurrency(10000)}</li>
                <li>Safe drop-off available for trusted locations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-primary" />
                Shipping Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Need help with your shipping? Contact our logistics team:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">Shipping Support</p>
                <p className="text-muted-foreground">Email: shipping@localhost</p>
                <p className="text-muted-foreground">Phone: +1 (555) 123-4567</p>
                <p className="text-muted-foreground">Hours: Mon-Sat 8AM-8PM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}