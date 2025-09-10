import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HelpCircle, Search, ChevronDown, ChevronUp, Users, ShoppingCart, CreditCard, Truck, RefreshCw } from "lucide-react";

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: React.ComponentType<{ className?: string }>;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    category: "Getting Started",
    question: "How do I create an account on Dokan?",
    answer: "Creating an account is simple! Click the 'Sign Up' button in the top navigation, fill in your details including email, username, and password. You'll receive a confirmation email to verify your account. Once verified, you can start shopping or apply to become a vendor.",
    icon: Users
  },
  {
    id: "2", 
    category: "Getting Started",
    question: "What's the difference between customer and vendor accounts?",
    answer: "Customer accounts are for shopping and purchasing products from vendors. Vendor accounts allow you to sell your own products on the platform. You can apply for vendor status through your account dashboard after creating a customer account.",
    icon: Users
  },
  {
    id: "3",
    category: "Shopping",
    question: "How do I search for products?",
    answer: "Use the search bar on the homepage or shop page to find products by name, category, or keyword. You can also filter by category, price range, and sort by rating, price, or newest items to find exactly what you're looking for.",
    icon: ShoppingCart
  },
  {
    id: "4",
    category: "Shopping", 
    question: "Can I track my orders?",
    answer: "Yes! Once your order is shipped, you'll receive tracking information via email. You can also view order status and tracking details in your account dashboard under 'My Orders'. You'll get notifications at each stage of the delivery process.",
    icon: Truck
  },
  {
    id: "5",
    category: "Shopping",
    question: "How do I write product reviews?",
    answer: "After receiving and confirming delivery of your order, you can write reviews for the products you purchased. A review popup will appear automatically, or you can access it through your order history in your dashboard.",
    icon: ShoppingCart
  },
  {
    id: "6",
    category: "Payments",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment gateway to ensure your financial information is protected.",
    icon: CreditCard
  },
  {
    id: "7",
    category: "Payments",
    question: "When will I be charged for my order?",
    answer: "Payment is processed immediately when you place your order. Your card will be charged once the order is confirmed. If there's an issue with payment processing, you'll be notified immediately to update your payment method.",
    icon: CreditCard
  },
  {
    id: "8",
    category: "Shipping",
    question: "How much does shipping cost?",
    answer: "Standard shipping is free for orders over $50. For orders under $50, standard shipping costs $4.99. Express shipping is $9.99 and overnight shipping is $19.99. International shipping rates vary by destination.",
    icon: Truck
  },
  {
    id: "9",
    category: "Shipping",
    question: "How long does delivery take?",
    answer: "Standard shipping takes 5-7 business days, Express shipping takes 2-3 business days, and overnight shipping delivers the next business day. Processing time is typically 1-2 business days before shipping.",
    icon: Truck
  },
  {
    id: "10",
    category: "Returns",
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for most items. Items must be in original condition and packaging. To start a return, contact the vendor or use your account dashboard. Refunds are processed within 3-5 business days after we receive the returned item.",
    icon: RefreshCw
  },
  {
    id: "11",
    category: "Returns",
    question: "Who pays for return shipping?",
    answer: "Return shipping costs depend on the reason for return. If the item is defective or not as described, we'll provide a prepaid return label. For other returns (size, color, changed mind), return shipping is the customer's responsibility.",
    icon: RefreshCw
  },
  {
    id: "12",
    category: "Vendor",
    question: "How do I become a vendor?",
    answer: "To become a vendor, create a customer account first, then apply for vendor status in your dashboard. You'll need to provide business information, tax details, and agree to our vendor terms. The approval process typically takes 3-5 business days.",
    icon: Users
  },
  {
    id: "13",
    category: "Vendor",
    question: "What fees do vendors pay?",
    answer: "Vendors pay a small commission on each sale (typically 5-10% depending on category) plus payment processing fees. There are no upfront costs or monthly fees to maintain your vendor account.",
    icon: CreditCard
  },
  {
    id: "14",
    category: "Vendor",
    question: "How do I add products to my store?",
    answer: "Once approved as a vendor, go to your Vendor Dashboard and click 'Add Product'. Fill in product details, upload images from your computer, set pricing, and choose categories. Products go live immediately after submission.",
    icon: ShoppingCart
  },
  {
    id: "15",
    category: "Technical",
    question: "Why can't I log in to my account?",
    answer: "If you're having login issues, first check that you're using the correct email and password. Try resetting your password if needed. Clear your browser cache and cookies, or try a different browser. Contact support if problems persist.",
    icon: HelpCircle
  },
];

const categories = ["All", "Getting Started", "Shopping", "Payments", "Shipping", "Returns", "Vendor", "Technical"];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find quick answers to common questions about using the Dokan marketplace platform
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-faq"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`button-category-${category.toLowerCase().replace(' ', '-')}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">No FAQs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or selecting a different category
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => {
                const isExpanded = expandedItems.has(faq.id);
                const IconComponent = faq.icon;
                
                return (
                  <Card key={faq.id} className="hover:shadow-md transition-shadow">
                    <CardHeader 
                      className="cursor-pointer"
                      onClick={() => toggleExpanded(faq.id)}
                      data-testid={`faq-question-${faq.id}`}
                    >
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <IconComponent className="w-5 h-5 text-primary mr-3" />
                          <div>
                            <div className="text-left">{faq.question}</div>
                            <div className="text-sm font-normal text-muted-foreground mt-1">
                              {faq.category}
                            </div>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="pt-0">
                        <p className="text-muted-foreground leading-relaxed" data-testid={`faq-answer-${faq.id}`}>
                          {faq.answer}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Contact Support */}
          <Card className="mt-12 bg-primary/5">
            <CardContent className="p-8 text-center">
              <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Still need help?
              </h3>
              <p className="text-muted-foreground mb-4">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <Button asChild>
                <a href="/contact" data-testid="link-contact-support">
                  Contact Support
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}