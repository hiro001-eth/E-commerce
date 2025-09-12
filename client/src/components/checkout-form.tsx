import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Truck, MapPin } from "lucide-react";
import type { CartItemDTO as CartItem } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";

const checkoutSchema = z.object({
  deliveryAddress: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().min(10, "Phone number is required"),
    street: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "ZIP code is required"),
    country: z.string().min(2, "Country is required"),
  }),
  paymentMethod: z.string().min(1, "Payment method is required"),
  couponCode: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  cartItems: CartItem[];
  onBack: () => void;
  onSuccess: () => void;
}

export default function CheckoutForm({ cartItems, onBack, onSuccess }: CheckoutFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: {
        firstName: "",
        lastName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
      },
      paymentMethod: "cod",
      couponCode: "",
    },
  });

  const total = cartItems.reduce((sum: number, item: CartItem) => {
    const price = parseFloat(item.product?.discountPrice || item.product?.price || "0");
    return sum + (price * item.quantity);
  }, 0);

  const createOrderMutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      // Group cart items by vendor
      const ordersByVendor = new Map<string, CartItem[]>();
      
      cartItems.forEach(item => {
        const vendorId = item.product?.vendorId;
        if (vendorId) {
          if (!ordersByVendor.has(vendorId)) {
            ordersByVendor.set(vendorId, []);
          }
          ordersByVendor.get(vendorId)!.push(item);
        }
      });

      // Create separate orders for each vendor
      const orders = [];
      for (const [vendorId, items] of Array.from(ordersByVendor.entries())) {
        const vendorTotal = items.reduce((sum: number, item: CartItem) => {
          const price = parseFloat(item.product?.discountPrice || item.product?.price || "0");
          return sum + (price * item.quantity);
        }, 0);

        const orderData = {
          vendorId,
          total: vendorTotal.toFixed(2),
          deliveryAddress: data.deliveryAddress,
          paymentMethod: data.paymentMethod,
          couponCode: data.couponCode || null,
          discount: "0", // TODO: Calculate coupon discount
        };

        const order = await apiRequest("POST", "/api/orders", orderData);
        orders.push(order);
      }

      return orders;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order placed successfully!",
        description: "Your order has been confirmed and will be processed soon.",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to place order",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CheckoutForm) => {
    setIsSubmitting(true);
    try {
      await createOrderMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...form.register("deliveryAddress.firstName")}
                      data-testid="input-first-name"
                    />
                    {form.formState.errors.deliveryAddress?.firstName && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.deliveryAddress.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...form.register("deliveryAddress.lastName")}
                      data-testid="input-last-name"
                    />
                    {form.formState.errors.deliveryAddress?.lastName && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.deliveryAddress.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("deliveryAddress.phone")}
                    data-testid="input-phone"
                  />
                  {form.formState.errors.deliveryAddress?.phone && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.deliveryAddress.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Textarea
                    id="street"
                    rows={2}
                    {...form.register("deliveryAddress.street")}
                    data-testid="textarea-street"
                  />
                  {form.formState.errors.deliveryAddress?.street && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.deliveryAddress.street.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      {...form.register("deliveryAddress.city")}
                      data-testid="input-city"
                    />
                    {form.formState.errors.deliveryAddress?.city && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.deliveryAddress.city.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      {...form.register("deliveryAddress.state")}
                      data-testid="input-state"
                    />
                    {form.formState.errors.deliveryAddress?.state && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.deliveryAddress.state.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      {...form.register("deliveryAddress.zipCode")}
                      data-testid="input-zip-code"
                    />
                    {form.formState.errors.deliveryAddress?.zipCode && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.deliveryAddress.zipCode.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select
                      value={form.watch("deliveryAddress.country")}
                      onValueChange={(value) => form.setValue("deliveryAddress.country", value)}
                    >
                      <SelectTrigger data-testid="select-country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Mexico">Mexico</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={form.watch("paymentMethod")}
                  onValueChange={(value) => form.setValue("paymentMethod", value)}
                >
                  <SelectTrigger data-testid="select-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery (COD)</SelectItem>
                    <SelectItem value="card" disabled>Credit/Debit Card (Coming Soon)</SelectItem>
                    <SelectItem value="paypal" disabled>PayPal (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
                {form.watch("paymentMethod") === "cod" && (
                  <div className="bg-accent/20 border border-accent/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-accent-foreground" />
                      <span className="text-sm font-medium text-accent-foreground">Cash on Delivery</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay with cash when your order is delivered to your doorstep. No advance payment required.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coupon Code */}
            <Card>
              <CardHeader>
                <CardTitle>Coupon Code (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Enter coupon code"
                  {...form.register("couponCode")}
                  data-testid="input-coupon-code"
                />
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
              data-testid="button-place-order"
            >
              {isSubmitting ? "Placing Order..." : `Place Order - ${formatCurrency(total)}`}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product?.name}</h4>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(parseFloat(item.product?.discountPrice || item.product?.price || "0") * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}