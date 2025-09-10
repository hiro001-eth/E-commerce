import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, Clock, CreditCard, Package, AlertCircle, Headphones } from "lucide-react";

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <RotateCcw className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-4">Return & Refund Policy</h1>
          <p className="text-xl text-muted-foreground">
            We want you to be completely satisfied with your purchase. Here's our return and refund policy.
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
                Return Timeframe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You may return most items within 30 days of delivery for a full refund:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Items must be in original condition and packaging</li>
                <li>Return process must be initiated within 30 days</li>
                <li>Some items may have different return periods (see exclusions)</li>
                <li>Custom or personalized items may not be returnable</li>
                <li>Digital products are generally non-returnable</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-primary" />
                Return Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                To return an item, follow these simple steps:
              </p>
              <div className="grid gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">Initiate Return</p>
                    <p className="text-muted-foreground text-sm">Contact the vendor or use your account dashboard to start the return process.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">Pack Securely</p>
                    <p className="text-muted-foreground text-sm">Pack the item in its original packaging with all accessories and documentation.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">Ship Back</p>
                    <p className="text-muted-foreground text-sm">Use the provided return label and ship back to the vendor's address.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-primary" />
                Refund Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Once your return is received and inspected:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Refunds are processed within 3-5 business days</li>
                <li>Refunds are issued to the original payment method</li>
                <li>Shipping costs are non-refundable unless item was defective</li>
                <li>Return shipping may be deducted from refund amount</li>
                <li>Credit card refunds may take 5-10 business days to appear</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-primary" />
                Exclusions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Some items cannot be returned for health and safety reasons:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Perishable goods (food, flowers, plants)</li>
                <li>Personal care items (cosmetics, underwear)</li>
                <li>Custom or personalized products</li>
                <li>Digital downloads and software</li>
                <li>Gift cards and vouchers</li>
                <li>Items damaged by misuse or normal wear</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Headphones className="w-5 h-5 mr-2 text-primary" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you have questions about returns or refunds, our support team is here to help:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">Customer Support</p>
                <p className="text-muted-foreground">Email: returns@localhost</p>
                <p className="text-muted-foreground">Phone: +1 (555) 123-4567</p>
                <p className="text-muted-foreground">Hours: Mon-Fri 9AM-6PM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}