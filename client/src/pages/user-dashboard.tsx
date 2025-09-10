import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, ShoppingBag, Heart, Settings, DollarSign, Star, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ReviewForm from "@/components/review-form";
import ReviewPopup from "@/components/review-popup";
import type { UserDTO as UserType, OrderDTO as Order, ProductDTO, OrderItemDTO } from "@shared/schema";

export default function UserDashboard() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [reviewingProduct, setReviewingProduct] = useState<{
    orderId: string;
    product: ProductDTO;
  } | null>(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [currentUnreviewedOrder, setCurrentUnreviewedOrder] = useState<{
    order: Order;
    products: ProductDTO[];
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authData } = useQuery<{ user: UserType }>({
    queryKey: ["/api/auth/me"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const user = authData?.user;

  const { data: unreviewedOrders = [] } = useQuery<{ order: Order; products: ProductDTO[] }[]>({
    queryKey: ["/api/orders/unreviewed"],
    queryFn: async () => {
      const response = await fetch("/api/orders/unreviewed", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch unreviewed orders");
      return response.json();
    },
    enabled: !!user,
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Show review popup for unreviewed delivered orders
  useEffect(() => {
    if (unreviewedOrders.length > 0 && !showReviewPopup) {
      const firstUnreviewed = unreviewedOrders[0];
      setCurrentUnreviewedOrder(firstUnreviewed);
      setShowReviewPopup(true);
    }
  }, [unreviewedOrders, showReviewPopup]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; phone: string }) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const { data: orderItems = {} } = useQuery<Record<string, OrderItemDTO[]>>({
    queryKey: ["/api/order-items", Array.from(expandedOrders).sort()],
    queryFn: async () => {
      const expandedOrderIds = Array.from(expandedOrders);
      if (expandedOrderIds.length === 0) return {};
      
      const results: Record<string, OrderItemDTO[]> = {};
      for (const orderId of expandedOrderIds) {
        try {
          const response = await fetch(`/api/orders/${orderId}/items`, { credentials: "include" });
          if (response.ok) {
            results[orderId] = await response.json();
          }
        } catch (error) {
          console.error(`Failed to fetch items for order ${orderId}:`, error);
        }
      }
      return results;
    },
    enabled: expandedOrders.size > 0,
  });

  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum: number, order: Order) => sum + parseFloat(order.total), 0),
    pendingOrders: orders.filter((order: Order) => order.status === "pending").length,
    deliveredOrders: orders.filter((order: Order) => order.status === "delivered").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-chart-1 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold" data-testid="text-user-name">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-user-email">
                    {user.email}
                  </p>
                  <Badge variant="secondary" className="mt-2">Customer</Badge>
                </div>
              </CardContent>
            </Card>

            <nav className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-primary/10 text-primary"
                onClick={() => {
                  const ordersTab = document.querySelector('[data-testid="tab-orders"]') as HTMLElement;
                  if (ordersTab) ordersTab.click();
                }}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Orders
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  toast({
                    title: "Wishlist Feature",
                    description: "Wishlist functionality will be available soon. You can add products to your wishlist from the shop page.",
                  });
                }}
              >
                <Heart className="w-4 h-4 mr-2" />
                Wishlist
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => {
                  const profileTab = document.querySelector('[data-testid="tab-profile"]') as HTMLElement;
                  if (profileTab) profileTab.click();
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-muted-foreground">Here's what's happening with your account</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Orders</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-total-orders">
                        {stats.totalOrders}
                      </p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-chart-1" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Spent</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-total-spent">
                        ${stats.totalSpent.toFixed(2)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-chart-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Pending Orders</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-pending-orders">
                        {stats.pendingOrders}
                      </p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-chart-3" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Delivered</p>
                      <p className="text-2xl font-bold text-foreground" data-testid="text-delivered-orders">
                        {stats.deliveredOrders}
                      </p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-chart-4" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Management */}
            <Tabs defaultValue="orders" className="space-y-4">
              <TabsList>
                <TabsTrigger value="orders" data-testid="tab-orders">Recent Orders</TabsTrigger>
                <TabsTrigger value="wishlist" data-testid="tab-wishlist">Wishlist</TabsTrigger>
                <TabsTrigger value="profile" data-testid="tab-profile">Profile Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 bg-muted rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No orders yet</p>
                        <p className="text-sm text-muted-foreground">Start shopping to see your orders here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order: Order) => {
                          const isExpanded = expandedOrders.has(order.id);
                          const items = orderItems[order.id] || [];
                          
                          return (
                            <div
                              key={order.id}
                              className="border border-border rounded-lg"
                              data-testid={`order-item-${order.id}`}
                            >
                              <div className="flex items-center justify-between p-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <p className="font-medium text-foreground" data-testid={`text-order-id-${order.id}`}>
                                        Order #{order.id.slice(0, 8)}
                                      </p>
                                      <p className="text-sm text-muted-foreground" data-testid={`text-order-date-${order.id}`}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <Badge 
                                      className={`${getStatusColor(order.status)} text-white`}
                                      data-testid={`badge-status-${order.id}`}
                                    >
                                      {getStatusText(order.status)}
                                    </Badge>
                                  </div>
                                  <div className="mt-2">
                                    <p className="text-sm text-muted-foreground">
                                      Delivery: {order.deliveryAddress.street}, {order.deliveryAddress.city}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                  <div>
                                    <p className="font-medium text-foreground" data-testid={`text-order-total-${order.id}`}>
                                      ${parseFloat(order.total).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {order.paymentMethod.toUpperCase()}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleOrderExpansion(order.id)}
                                    className="p-2"
                                  >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </Button>
                                </div>
                              </div>
                              
                              {isExpanded && (
                                <div className="border-t border-border p-4">
                                  {items.length > 0 ? (
                                    <div className="space-y-3">
                                      <h4 className="font-medium text-foreground">Order Items</h4>
                                      {items.map((item: OrderItemDTO) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                          <div className="flex-1">
                                            <p className="font-medium text-foreground">{item.product?.name || 'Product Name'}</p>
                                            <p className="text-sm text-muted-foreground">
                                              Quantity: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <p className="font-medium">${parseFloat(item.total).toFixed(2)}</p>
                                            {order.status === 'delivered' && item.product && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setReviewingProduct({ orderId: order.id, product: item.product! })}
                                                className="ml-2"
                                              >
                                                <Star className="w-4 h-4 mr-1" />
                                                Write Review
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-muted-foreground text-center py-4">Loading order items...</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wishlist">
                <Card>
                  <CardHeader>
                    <CardTitle>My Wishlist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Your wishlist is empty</p>
                      <p className="text-sm text-muted-foreground mb-4">Add products you love to keep track of them</p>
                      <Button asChild>
                        <a href="/shop">Browse Products</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              data-testid="input-first-name"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              data-testid="input-last-name"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            data-testid="input-phone"
                            placeholder="Your phone number"
                          />
                        </div>
                        
                        <div className="flex gap-2 pt-4">
                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                            data-testid="button-save-profile"
                          >
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setIsEditing(false);
                              if (user) {
                                setFormData({
                                  firstName: user.firstName || "",
                                  lastName: user.lastName || "",
                                  phone: user.phone || "",
                                });
                              }
                            }}
                            data-testid="button-cancel-edit"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-foreground">First Name</label>
                            <p className="text-muted-foreground" data-testid="text-profile-first-name">
                              {user.firstName}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground">Last Name</label>
                            <p className="text-muted-foreground" data-testid="text-profile-last-name">
                              {user.lastName}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-foreground">Email</label>
                          <p className="text-muted-foreground" data-testid="text-profile-email">
                            {user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-foreground">Username</label>
                          <p className="text-muted-foreground" data-testid="text-profile-username">
                            {user.username}
                          </p>
                          <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-foreground">Phone</label>
                          <p className="text-muted-foreground" data-testid="text-profile-phone">
                            {user.phone || "Not provided"}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-foreground">Account Status</label>
                          <Badge variant={user.isActive ? "default" : "destructive"} className="ml-2">
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <div className="pt-4">
                          <Button 
                            onClick={() => setIsEditing(true)}
                            data-testid="button-edit-profile"
                          >
                            Edit Profile
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Review Form Overlay */}
      {reviewingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ReviewForm
            product={reviewingProduct.product}
            orderId={reviewingProduct.orderId}
            onClose={() => setReviewingProduct(null)}
            onSuccess={() => {
              toast({
                title: "Review Submitted",
                description: "Thank you for your feedback!",
              });
            }}
          />
        </div>
      )}

      {/* Review Popup for Delivered Orders */}
      {showReviewPopup && currentUnreviewedOrder && (
        <ReviewPopup
          isOpen={showReviewPopup}
          onClose={() => {
            setShowReviewPopup(false);
            setCurrentUnreviewedOrder(null);
            queryClient.invalidateQueries({ queryKey: ["/api/orders/unreviewed"] });
          }}
          order={currentUnreviewedOrder.order}
          products={currentUnreviewedOrder.products}
        />
      )}
    </div>
  );
}
