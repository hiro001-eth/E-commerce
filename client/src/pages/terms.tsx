import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, ShoppingCart, AlertTriangle, Scale, Phone } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-xl text-muted-foreground">
            Please read these terms carefully before using our marketplace platform.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Account Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                By creating an account on our platform, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not use the service for illegal or unauthorized purposes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-primary" />
                Marketplace Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our platform facilitates transactions between buyers and vendors:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Vendors are responsible for their product listings and descriptions</li>
                <li>We do not guarantee the quality or availability of products</li>
                <li>Payment processing is handled securely through our partners</li>
                <li>Disputes should be resolved between buyers and vendors first</li>
                <li>We reserve the right to remove inappropriate content</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
                Prohibited Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The following activities are strictly prohibited:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Selling counterfeit, illegal, or harmful products</li>
                <li>Fraudulent transactions or payment manipulation</li>
                <li>Harassment or abuse of other users</li>
                <li>Violating intellectual property rights</li>
                <li>Attempting to circumvent security measures</li>
                <li>Creating multiple accounts to manipulate reviews</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Scale className="w-5 h-5 mr-2 text-primary" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Our platform is provided "as is" and we make no warranties:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>We are not liable for vendor actions or product quality</li>
                <li>Service availability is not guaranteed</li>
                <li>Users assume risk for their transactions</li>
                <li>Our liability is limited to the maximum extent allowed by law</li>
                <li>We are not responsible for third-party content or links</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="w-5 h-5 mr-2 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium">Legal Team</p>
                <p className="text-muted-foreground">Email: legal@localhost</p>
                <p className="text-muted-foreground">Phone: +1 (555) 123-4567</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}