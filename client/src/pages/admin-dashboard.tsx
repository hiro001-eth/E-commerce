import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Store, 
  Package, 
  Banknote, 
  TrendingUp, 
  Settings, 
  Search,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  BarChart3
} from "lucide-react";
import type { User as UserType, Vendor, Product, Order } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authData } = useQuery<{ user: UserType }>({
    queryKey: ["/api/auth/me"],
  });

  const { data: stats = { totalUsers: 0, totalVendors: 0, totalProducts: 0, revenue: 0 } } = useQuery<{
    totalUsers: number;
    totalVendors: number;
    totalProducts: number;
    revenue: number;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users = [] } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: vendors = [] } = useQuery<Vendor[]>({
    queryKey: ["/api/admin/vendors"],
  });

  const { data: pendingVendors = [] } = useQuery<Vendor[]>({
    queryKey: ["/api/admin/vendors/pending"],
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const approveVendorMutation = useMutation({
    mutationFn: (vendorId: string) =>
      apiRequest("PATCH", `/api/admin/vendors/${vendorId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Vendor approved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to approve vendor", variant: "destructive" });
    },
  });

  const rejectVendorMutation = useMutation({
    mutationFn: (vendorId: string) =>
      apiRequest("PATCH", `/api/admin/vendors/${vendorId}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Vendor application rejected" });
    },
    onError: () => {
      toast({ title: "Failed to reject vendor", variant: "destructive" });
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      apiRequest("PUT", `/api/admin/users/${userId}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "User status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update user status", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest("DELETE", `/api/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "User deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete user", variant: "destructive" });
    },
  });

  const user = authData?.user;

  const filteredUsers = users.filter((u: UserType) =>
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendors = vendors.filter((v: Vendor) =>
    v.storeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Recent vendors that are approved
  const recentVendors = vendors.filter(v => v.isApproved).slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
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
                  <div className="w-16 h-16 bg-chart-3 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold" data-testid="text-admin-title">Admin Panel</h3>
                  <p className="text-sm text-muted-foreground">Platform Management</p>
                  <Badge className="mt-2">Administrator</Badge>
                </div>
              </CardContent>
            </Card>

            <nav className="space-y-2">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("overview")}
                data-testid="nav-overview"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("users")}
                data-testid="nav-users"
              >
                <Users className="w-4 h-4 mr-2" />
                Users
              </Button>
              <Button
                variant={activeTab === "vendors" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("vendors")}
                data-testid="nav-vendors"
              >
                <Store className="w-4 h-4 mr-2" />
                Vendors
              </Button>
              <Button
                variant={activeTab === "pending-vendors" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("pending-vendors")}
                data-testid="nav-pending-vendors"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Pending Vendors
                {pendingVendors.length > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {pendingVendors.length}
                  </Badge>
                )}
              </Button>
              <Button
                variant={activeTab === "orders" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("orders")}
                data-testid="nav-orders"
              >
                <Package className="w-4 h-4 mr-2" />
                Orders
              </Button>
              <Button
                variant={activeTab === "settings" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("settings")}
                data-testid="nav-settings"
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
                Platform Overview
              </h1>
              <p className="text-muted-foreground">Complete control and insights of the Dokan marketplace</p>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Platform Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">Total Users</p>
                          <p className="text-2xl font-bold text-foreground" data-testid="text-total-users-stat">
                            {stats?.totalUsers || users.filter((u: UserType) => u.role === "user").length}
                          </p>
                          <p className="text-xs text-chart-2">+12% from last month</p>
                        </div>
                        <Users className="w-8 h-8 text-chart-1" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">Active Vendors</p>
                          <p className="text-2xl font-bold text-foreground" data-testid="text-active-vendors-stat">
                            {stats?.totalVendors || vendors.length}
                          </p>
                          <p className="text-xs text-chart-2">+8% from last month</p>
                        </div>
                        <Store className="w-8 h-8 text-chart-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">Total Products</p>
                          <p className="text-2xl font-bold text-foreground" data-testid="text-total-products-stat">
                            {stats?.totalProducts || products.length}
                          </p>
                          <p className="text-xs text-chart-2">+15% from last month</p>
                        </div>
                        <Package className="w-8 h-8 text-chart-3" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">Revenue</p>
                          <p className="text-2xl font-bold text-foreground" data-testid="text-revenue-stat">
                            {formatCurrency(stats?.revenue || orders.reduce((sum: number, order: Order) => sum + parseFloat(order.total), 0))}
                          </p>
                          <p className="text-xs text-chart-2">+22% from last month</p>
                        </div>
                        <Banknote className="w-8 h-8 text-chart-4" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Management Overview */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Recent Vendor Registrations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Vendor Registrations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentVendors.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No vendor registrations yet</p>
                      ) : (
                        <div className="space-y-3">
                          {recentVendors.map((vendor: Vendor) => (
                            <div
                              key={vendor.id}
                              className="flex items-center justify-between p-3 border border-border rounded-lg"
                              data-testid={`recent-vendor-${vendor.id}`}
                            >
                              <div>
                                <p className="font-medium text-sm" data-testid={`text-vendor-name-${vendor.id}`}>
                                  {vendor.storeName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Automatically activated • {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'Recently'}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full" />
                                <span className="text-xs text-green-600 font-medium">Active</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Orders */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentOrders.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No recent orders</p>
                      ) : (
                        <div className="space-y-3">
                          {recentOrders.map((order: Order) => (
                            <div
                              key={order.id}
                              className="flex items-center justify-between p-3 border border-border rounded-lg"
                              data-testid={`recent-order-${order.id}`}
                            >
                              <div>
                                <p className="font-medium text-sm">
                                  Order #{order.id.slice(0, 8)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recently'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm">${parseFloat(order.total).toFixed(2)}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {order.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-users"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-border">
                          <tr className="text-left">
                            <th className="pb-3 text-muted-foreground">User</th>
                            <th className="pb-3 text-muted-foreground">Email</th>
                            <th className="pb-3 text-muted-foreground">Role</th>
                            <th className="pb-3 text-muted-foreground">Status</th>
                            <th className="pb-3 text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredUsers.map((user: UserType) => (
                            <tr key={user.id} data-testid={`user-row-${user.id}`}>
                              <td className="py-4">
                                <div>
                                  <p className="font-medium" data-testid={`text-user-name-${user.id}`}>
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                                </div>
                              </td>
                              <td className="py-4" data-testid={`text-user-email-${user.id}`}>
                                {user.email}
                              </td>
                              <td className="py-4">
                                <Badge variant="secondary">{user.role}</Badge>
                              </td>
                              <td className="py-4">
                                <Badge variant={user.isActive ? "default" : "destructive"}>
                                  {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="py-4">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={user.isActive ? "text-destructive" : "text-green-600"}
                                    onClick={() => toggleUserStatusMutation.mutate({ 
                                      userId: user.id, 
                                      isActive: !user.isActive 
                                    })}
                                    disabled={toggleUserStatusMutation.isPending}
                                    data-testid={`button-toggle-user-${user.id}`}
                                  >
                                    {user.isActive ? <UserX className="w-4 h-4 mr-1" /> : <UserCheck className="w-4 h-4 mr-1" />}
                                    {user.isActive ? "Deactivate" : "Activate"}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}?`)) {
                                        deleteUserMutation.mutate(user.id);
                                      }
                                    }}
                                    disabled={deleteUserMutation.isPending}
                                    data-testid={`button-delete-user-${user.id}`}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Vendors Tab */}
            {activeTab === "vendors" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendor Management</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-vendors"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-border">
                          <tr className="text-left">
                            <th className="pb-3 text-muted-foreground">Store</th>
                            <th className="pb-3 text-muted-foreground">Owner</th>
                            <th className="pb-3 text-muted-foreground">Status</th>
                            <th className="pb-3 text-muted-foreground">Sales</th>
                            <th className="pb-3 text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filteredVendors.map((vendor: Vendor) => (
                            <tr key={vendor.id} data-testid={`vendor-row-${vendor.id}`}>
                              <td className="py-4">
                                <div>
                                  <p className="font-medium" data-testid={`text-store-name-${vendor.id}`}>
                                    {vendor.storeName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {vendor.storeDescription?.slice(0, 50) || "No description"}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4" data-testid={`text-vendor-owner-${vendor.id}`}>
                                User ID: {vendor.userId.slice(0, 8)}
                              </td>
                              <td className="py-4">
                                <Badge variant={vendor.isApproved ? "default" : "secondary"}>
                                  {vendor.isApproved ? "Approved" : "Pending"}
                                </Badge>
                              </td>
                              <td className="py-4" data-testid={`text-vendor-sales-${vendor.id}`}>
                                ${parseFloat(vendor.totalSales || '0').toFixed(2)}
                              </td>
                              <td className="py-4">
                                <div className="flex space-x-2">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                                    <span className="text-xs text-green-600 font-medium">Active</span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    data-testid={`button-edit-vendor-${vendor.id}`}
                                  >
                                    <Settings className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Pending Vendors Tab */}
            {activeTab === "pending-vendors" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pending Vendor Applications</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Review and approve new vendor applications
                    </p>
                  </CardHeader>
                  <CardContent>
                    {pendingVendors.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No pending vendor applications</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          All vendor applications have been processed
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingVendors.map((vendor: Vendor) => (
                          <div
                            key={vendor.id}
                            className="border border-border rounded-lg p-6"
                            data-testid={`pending-vendor-${vendor.id}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-lg font-semibold" data-testid={`text-pending-store-name-${vendor.id}`}>
                                    {vendor.storeName}
                                  </h3>
                                  <Badge variant="secondary">Pending Review</Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Store Description</p>
                                    <p className="text-sm" data-testid={`text-pending-description-${vendor.id}`}>
                                      {vendor.storeDescription || "No description provided"}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-muted-foreground">Business License</p>
                                    <p className="text-sm" data-testid={`text-pending-license-${vendor.id}`}>
                                      {vendor.businessLicense || "Not provided"}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-muted-foreground">Delivery Info</p>
                                    <div className="text-sm">
                                      <p>Radius: {vendor.deliveryRadius}km</p>
                                      <p>Fee: {formatCurrency(parseFloat(vendor.deliveryFee || "0"))}</p>
                                      <p>Free delivery over: {formatCurrency(parseFloat(vendor.freeDeliveryThreshold || "0"))}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-muted-foreground">Applied Date</p>
                                    <p className="text-sm">
                                      {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'Recently'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 pt-4 border-t border-border">
                              <Button
                                onClick={() => approveVendorMutation.mutate(vendor.id)}
                                disabled={approveVendorMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                                data-testid={`button-approve-vendor-${vendor.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {approveVendorMutation.isPending ? "Approving..." : "Approve"}
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => rejectVendorMutation.mutate(vendor.id)}
                                disabled={rejectVendorMutation.isPending}
                                data-testid={`button-reject-vendor-${vendor.id}`}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                {rejectVendorMutation.isPending ? "Rejecting..." : "Reject"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No orders found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-border">
                          <tr className="text-left">
                            <th className="pb-3 text-muted-foreground">Order ID</th>
                            <th className="pb-3 text-muted-foreground">Customer</th>
                            <th className="pb-3 text-muted-foreground">Amount</th>
                            <th className="pb-3 text-muted-foreground">Status</th>
                            <th className="pb-3 text-muted-foreground">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {orders.map((order: Order) => (
                            <tr key={order.id} data-testid={`admin-order-row-${order.id}`}>
                              <td className="py-4">
                                <p className="font-mono text-sm">#{order.id.slice(0, 8)}</p>
                              </td>
                              <td className="py-4">
                                <p className="text-sm">
                                  {order.deliveryAddress.firstName} {order.deliveryAddress.lastName}
                                </p>
                              </td>
                              <td className="py-4" data-testid={`text-admin-order-amount-${order.id}`}>
                                ${parseFloat(order.total).toFixed(2)}
                              </td>
                              <td className="py-4">
                                <Badge variant="secondary">{order.status}</Badge>
                              </td>
                              <td className="py-4">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recently'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">General Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">Platform Name</label>
                        <p className="text-muted-foreground">Dokan Marketplace</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Platform Version</label>
                        <p className="text-muted-foreground">v1.0.0</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Total Users</label>
                        <p className="text-muted-foreground" data-testid="text-settings-total-users">
                          {users.length}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Active Vendors</label>
                        <p className="text-muted-foreground" data-testid="text-settings-active-vendors">
                          {vendors.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold text-foreground mb-2">System Actions</h3>
                    <div className="space-y-2">
                      <Button variant="outline" data-testid="button-export-data">
                        Export Platform Data
                      </Button>
                      <Button variant="outline" data-testid="button-backup-system">
                        Backup System
                      </Button>
                      <Button variant="destructive" data-testid="button-maintenance-mode">
                        Enable Maintenance Mode
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
