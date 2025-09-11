import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Store, Package, BarChart3, Settings, Plus, Edit, Trash2, Banknote, Upload, X, Eye, EyeOff } from "lucide-react";
import type { User as UserType, Product, Order, Vendor, Category } from "@shared/schema";
import { vendorSettingsSchema, changePasswordSchema, changeEmailSchema } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  discountPrice: z.string().optional(),
  stock: z.number().min(0, "Stock cannot be negative"),
  sku: z.string().min(1, "SKU is required"),
  categoryId: z.string().optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean(),
  allowsCoupons: z.boolean(),
});

// Using schemas from shared/schema.ts for consistency

type ProductForm = z.infer<typeof productSchema>;
type VendorSettingsForm = z.infer<typeof vendorSettingsSchema>;
type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
type ChangeEmailForm = z.infer<typeof changeEmailSchema>;

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSettings, setEditingSettings] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authData } = useQuery<{ user: UserType }>({
    queryKey: ["/api/auth/me"],
  });

  const { data: vendor, error: vendorError, isLoading: vendorLoading } = useQuery<Vendor>({
    queryKey: ["/api/vendors/me"],
    enabled: !!authData?.user,
  });

  const { data: products = [], isLoading: productsLoading, error: productsError } = useQuery<Product[]>({
    queryKey: ["/api/products/vendor"],
    enabled: !!authData?.user,
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!authData?.user,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const user = authData?.user as UserType;

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const productForm = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      discountPrice: "",
      stock: 0,
      sku: "",
      categoryId: "",
      images: [],
      isActive: true,
      allowsCoupons: true,
    },
  });

  const vendorSettingsForm = useForm<VendorSettingsForm>({
    resolver: zodResolver(vendorSettingsSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
      businessLicense: "",
    },
  });

  const changePasswordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changeEmailForm = useForm<ChangeEmailForm>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
      password: "",
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (data: ProductForm) =>
      apiRequest("POST", "/api/products", { 
        ...data, 
        stock: Number(data.stock),
        categoryId: data.categoryId === "no-category" ? null : data.categoryId,
        images: imageUrls
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/vendor"] });
      toast({ title: "Product created successfully" });
      productForm.reset();
      setActiveTab("products");
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductForm }) =>
      apiRequest("PUT", `/api/products/${id}`, { 
        ...data, 
        stock: Number(data.stock),
        categoryId: data.categoryId === "no-category" ? null : data.categoryId,
        images: imageUrls
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/vendor"] });
      toast({ title: "Product updated successfully" });
      setEditingProduct(null);
      productForm.reset();
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/vendor"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PUT", `/api/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order status updated" });
    },
  });

  const updateVendorSettingsMutation = useMutation({
    mutationFn: (data: VendorSettingsForm) =>
      apiRequest("PUT", "/api/vendor/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendors/me"] });
      toast({ title: "Store settings updated successfully" });
      setEditingSettings(false);
      vendorSettingsForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update settings", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordForm) =>
      apiRequest("PUT", "/api/auth/change-password", data),
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setEditingProfile(false);
      changePasswordForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to change password", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    },
  });

  const changeEmailMutation = useMutation({
    mutationFn: (data: ChangeEmailForm) =>
      apiRequest("PUT", "/api/auth/change-email", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Email changed successfully" });
      setEditingProfile(false);
      changeEmailForm.reset();
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to change email", 
        description: error.message || "Please try again",
        variant: "destructive" 
      });
    },
  });

  const stats = {
    totalProducts: products.length,
    totalSales: orders.reduce((sum: number, order: Order) => sum + parseFloat(order.total), 0),
    totalOrders: orders.length,
    pendingOrders: orders.filter((order: Order) => order.status === "pending").length,
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages = [...imageUrls];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload/product-image', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          newImages.push(data.imagePath);
        } else {
          const errorData = await response.json();
          toast({
            title: "Upload failed",
            description: errorData.message || "Failed to upload image",
            variant: "destructive"
          });
        }
      }

      setImageUrls(newImages);
      productForm.setValue("images", newImages);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading images",
        variant: "destructive"
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = async (index: number) => {
    const imagePath = imageUrls[index];
    
    try {
      // Delete from server if it's an uploaded image
      if (imagePath.startsWith('/uploads/')) {
        await fetch('/api/upload/product-image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imagePath }),
          credentials: 'include',
        });
      }
    } catch (error) {
      console.error('Failed to delete image from server:', error);
    }

    const newImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImages);
    productForm.setValue("images", newImages);
  };

  const onSubmitProduct = (data: ProductForm) => {
    const submitData = { ...data, images: imageUrls };
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: submitData });
    } else {
      createProductMutation.mutate(submitData);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setImageUrls(product.images || []);
    productForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || "",
      stock: product.stock,
      sku: product.sku,
      categoryId: product.categoryId || "",
      images: product.images || [],
      isActive: product.isActive,
      allowsCoupons: product.allowsCoupons,
    });
    setActiveTab("add-product");
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleEditSettings = () => {
    setEditingSettings(true);
    // Pre-fill form with current vendor data
    vendorSettingsForm.reset({
      storeName: vendor?.storeName || "",
      storeDescription: vendor?.storeDescription || "",
      businessLicense: vendor?.businessLicense || "",
    });
  };

  // Auto-fill vendor settings form when vendor data loads
  useEffect(() => {
    if (vendor && editingSettings) {
      vendorSettingsForm.reset({
        storeName: vendor.storeName,
        storeDescription: vendor.storeDescription || "",
        businessLicense: vendor.businessLicense || "",
      });
    }
  }, [vendor, editingSettings, vendorSettingsForm]);

  const handleEditProfile = () => {
    setEditingProfile(true);
    changeEmailForm.reset({
      newEmail: user?.email || "",
      password: "",
    });
  };

  const onSubmitVendorSettings = (data: VendorSettingsForm) => {
    updateVendorSettingsMutation.mutate(data);
  };

  const onSubmitChangePassword = (data: ChangePasswordForm) => {
    changePasswordMutation.mutate(data);
  };

  const onSubmitChangeEmail = (data: ChangeEmailForm) => {
    changeEmailMutation.mutate(data);
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
                  <div className="w-16 h-16 bg-chart-2 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold" data-testid="text-store-name">
                    {vendor?.storeName || "Your Store"}
                  </h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-vendor-email">
                    {user.email}
                  </p>
                  <Badge variant="secondary" className="mt-2">
                    {vendor?.isApproved ? "Approved Vendor" : "Pending Approval"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <nav className="space-y-2">
              <Button
                variant={activeTab === "analytics" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("analytics")}
                data-testid="nav-analytics"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button
                variant={activeTab === "products" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("products")}
                data-testid="nav-products"
              >
                <Package className="w-4 h-4 mr-2" />
                Products
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
                variant={activeTab === "add-product" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("add-product");
                  setEditingProduct(null);
                  productForm.reset();
                }}
                data-testid="nav-add-product"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
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
                Vendor Dashboard
              </h1>
              <p className="text-muted-foreground">Manage your store and track performance</p>
            </div>

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">Total Products</p>
                          <p className="text-2xl font-bold text-foreground" data-testid="text-total-products">
                            {stats.totalProducts}
                          </p>
                        </div>
                        <Package className="w-8 h-8 text-chart-1" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">Total Sales</p>
                          <p className="text-2xl font-bold text-foreground" data-testid="text-total-sales">
                            {formatCurrency(stats.totalSales)}
                          </p>
                        </div>
                        <Banknote className="w-8 h-8 text-chart-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-muted-foreground text-sm">Total Orders</p>
                          <p className="text-2xl font-bold text-foreground" data-testid="text-total-orders">
                            {stats.totalOrders}
                          </p>
                        </div>
                        <Package className="w-8 h-8 text-chart-3" />
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
                        <Package className="w-8 h-8 text-chart-4" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {!vendor?.isApproved && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-yellow-800 mb-2">Vendor Approval Pending</h3>
                      <p className="text-yellow-700 text-sm">
                        Your vendor application is being reviewed. You'll be able to add products once approved.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse h-16 bg-muted rounded"></div>
                      ))}
                    </div>
                  ) : productsError ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-destructive mx-auto mb-4" />
                      <p className="text-destructive font-medium mb-2">Unable to load products</p>
                      <p className="text-muted-foreground text-sm mb-4">
                        {productsError.message.includes('403') || productsError.message.includes('Vendor not found') 
                          ? 'Your vendor account needs to be set up. Please contact support or try logging out and back in.'
                          : productsError.message.includes('401') || productsError.message.includes('Authentication') 
                          ? 'Please log in again to access your products.'
                          : 'There was an error loading your products. Please try refreshing the page.'}
                      </p>
                      <Button
                        onClick={() => {
                          queryClient.invalidateQueries({ queryKey: ["/api/products/vendor"] });
                          queryClient.invalidateQueries({ queryKey: ["/api/vendors/me"] });
                        }}
                        variant="outline"
                        data-testid="button-retry-products"
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No products yet</p>
                      <Button
                        onClick={() => setActiveTab("add-product")}
                        className="mt-4"
                        data-testid="button-add-first-product"
                      >
                        Add Your First Product
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-border">
                          <tr className="text-left">
                            <th className="pb-3 text-muted-foreground">Product</th>
                            <th className="pb-3 text-muted-foreground">Price</th>
                            <th className="pb-3 text-muted-foreground">Stock</th>
                            <th className="pb-3 text-muted-foreground">Status</th>
                            <th className="pb-3 text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {products.map((product: Product) => (
                            <tr key={product.id} data-testid={`product-row-${product.id}`}>
                              <td className="py-4">
                                <div>
                                  <p className="font-medium" data-testid={`text-product-name-${product.id}`}>
                                    {product.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    SKU: {product.sku}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4" data-testid={`text-product-price-${product.id}`}>
                                ${parseFloat(product.price).toFixed(2)}
                              </td>
                              <td className="py-4" data-testid={`text-product-stock-${product.id}`}>
                                {product.stock}
                              </td>
                              <td className="py-4">
                                <Badge variant={product.isActive ? "default" : "secondary"}>
                                  {product.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="py-4">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditProduct(product)}
                                    data-testid={`button-edit-${product.id}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="text-destructive hover:text-destructive/70"
                                    data-testid={`button-delete-${product.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
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
                      <p className="text-muted-foreground">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order: Order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg"
                          data-testid={`order-item-${order.id}`}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              Order #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.deliveryAddress.firstName} {order.deliveryAddress.lastName}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">${parseFloat(order.total).toFixed(2)}</p>
                              <Select
                                value={order.status}
                                onValueChange={(status) =>
                                  updateOrderStatusMutation.mutate({ id: order.id, status })
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Add/Edit Product Tab */}
            {activeTab === "add-product" && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          {...productForm.register("name")}
                          data-testid="input-product-name"
                        />
                        {productForm.formState.errors.name && (
                          <p className="text-sm text-destructive mt-1">
                            {productForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          {...productForm.register("sku")}
                          data-testid="input-product-sku"
                        />
                        {productForm.formState.errors.sku && (
                          <p className="text-sm text-destructive mt-1">
                            {productForm.formState.errors.sku.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        rows={4}
                        {...productForm.register("description")}
                        data-testid="textarea-product-description"
                      />
                      {productForm.formState.errors.description && (
                        <p className="text-sm text-destructive mt-1">
                          {productForm.formState.errors.description.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          {...productForm.register("price")}
                          data-testid="input-product-price"
                        />
                        {productForm.formState.errors.price && (
                          <p className="text-sm text-destructive mt-1">
                            {productForm.formState.errors.price.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="discountPrice">Discount Price ($)</Label>
                        <Input
                          id="discountPrice"
                          type="number"
                          step="0.01"
                          {...productForm.register("discountPrice")}
                          data-testid="input-product-discount-price"
                        />
                      </div>

                      <div>
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          {...productForm.register("stock", { valueAsNumber: true })}
                          data-testid="input-product-stock"
                        />
                        {productForm.formState.errors.stock && (
                          <p className="text-sm text-destructive mt-1">
                            {productForm.formState.errors.stock.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="categoryId">Category</Label>
                      <Select
                        value={productForm.watch("categoryId")}
                        onValueChange={(value) => productForm.setValue("categoryId", value)}
                      >
                        <SelectTrigger data-testid="select-product-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-category">No Category</SelectItem>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Image Management */}
                    <div className="space-y-4">
                      <Label>Product Images</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files)}
                          className="hidden"
                          id="image-upload"
                          disabled={uploadingImages}
                          data-testid="input-image-upload"
                        />
                        <label 
                          htmlFor="image-upload" 
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <Upload className="w-8 h-8 text-gray-400" />
                          <div className="text-sm text-gray-600">
                            {uploadingImages ? (
                              <span>Uploading images...</span>
                            ) : (
                              <span>
                                <strong>Click to upload</strong> or drag and drop
                                <br />
                                PNG, JPG, GIF up to 5MB each
                              </span>
                            )}
                          </div>
                        </label>
                        {uploadingImages && (
                          <div className="mt-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                          </div>
                        )}
                      </div>
                      {imageUrls.length > 0 && (
                        <div className="grid grid-cols-2 gap-4">
                          {imageUrls.map((url, index) => (
                            <div key={index} className="relative border rounded-lg p-2">
                              <img
                                src={url}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/150x100?text=Invalid+Image";
                                }}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1"
                                onClick={() => removeImage(index)}
                                data-testid={`button-remove-image-${index}`}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                              <p className="text-xs text-muted-foreground mt-1 truncate" title={url}>
                                {url}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Availability and Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          {...productForm.register("isActive")}
                          data-testid="checkbox-is-active"
                        />
                        <Label htmlFor="isActive" className="flex items-center gap-2">
                          {productForm.watch("isActive") ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-red-600" />
                          )}
                          {productForm.watch("isActive") ? "Active (Visible)" : "Inactive (Hidden)"}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="allowsCoupons"
                          {...productForm.register("allowsCoupons")}
                          data-testid="checkbox-allows-coupons"
                        />
                        <Label htmlFor="allowsCoupons">Allow coupon discounts</Label>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={createProductMutation.isPending || updateProductMutation.isPending}
                        data-testid="button-save-product"
                      >
                        {editingProduct ? "Update Product" : "Create Product"}
                      </Button>
                      {editingProduct && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingProduct(null);
                            productForm.reset();
                            setActiveTab("products");
                          }}
                          data-testid="button-cancel-edit"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                {/* Store Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Store Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!editingSettings ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Store Name</Label>
                          <p className="text-muted-foreground" data-testid="text-settings-store-name">
                            {vendor?.storeName || "Not set"}
                          </p>
                        </div>
                        
                        <div>
                          <Label>Store Description</Label>
                          <p className="text-muted-foreground" data-testid="text-settings-store-description">
                            {vendor?.storeDescription || "No description provided"}
                          </p>
                        </div>
                        
                        <div>
                          <Label>Business License</Label>
                          <p className="text-muted-foreground" data-testid="text-settings-business-license">
                            {vendor?.businessLicense || "Not provided"}
                          </p>
                        </div>
                        
                        <div>
                          <Label>Approval Status</Label>
                          <Badge variant={vendor?.isApproved ? "default" : "secondary"} className="ml-2">
                            {vendor?.isApproved ? "Approved" : "Pending Approval"}
                          </Badge>
                        </div>
                        
                        <div className="pt-4">
                          <Button onClick={handleEditSettings} data-testid="button-edit-store-settings">
                            Edit Store Settings
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={vendorSettingsForm.handleSubmit(onSubmitVendorSettings)} className="space-y-4">
                        <div>
                          <Label htmlFor="storeName">Store Name</Label>
                          <Input
                            id="storeName"
                            {...vendorSettingsForm.register("storeName")}
                            data-testid="input-store-name"
                          />
                          {vendorSettingsForm.formState.errors.storeName && (
                            <p className="text-sm text-destructive mt-1">
                              {vendorSettingsForm.formState.errors.storeName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="storeDescription">Store Description</Label>
                          <Textarea
                            id="storeDescription"
                            {...vendorSettingsForm.register("storeDescription")}
                            data-testid="textarea-store-description"
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="businessLicense">Business License</Label>
                          <Input
                            id="businessLicense"
                            {...vendorSettingsForm.register("businessLicense")}
                            data-testid="input-business-license"
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            disabled={updateVendorSettingsMutation.isPending}
                            data-testid="button-save-store-settings"
                          >
                            {updateVendorSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditingSettings(false);
                              vendorSettingsForm.reset();
                            }}
                            data-testid="button-cancel-store-settings"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>

                {/* Profile Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!editingProfile ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Name</Label>
                          <p className="text-muted-foreground">
                            {user?.firstName} {user?.lastName}
                          </p>
                        </div>
                        
                        <div>
                          <Label>Email</Label>
                          <p className="text-muted-foreground" data-testid="text-profile-email">
                            {user?.email}
                          </p>
                        </div>
                        
                        <div>
                          <Label>Phone</Label>
                          <p className="text-muted-foreground">
                            {user?.phone || "Not provided"}
                          </p>
                        </div>
                        
                        <div className="pt-4 space-x-3">
                          <Button onClick={handleEditProfile} data-testid="button-edit-profile">
                            Change Email
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setEditingProfile(true);
                              changePasswordForm.reset();
                            }}
                            data-testid="button-change-password"
                          >
                            Change Password
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Tabs defaultValue="email" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="email">Change Email</TabsTrigger>
                          <TabsTrigger value="password">Change Password</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="email" className="space-y-4">
                          <form onSubmit={changeEmailForm.handleSubmit(onSubmitChangeEmail)} className="space-y-4">
                            <div>
                              <Label htmlFor="newEmail">New Email</Label>
                              <Input
                                id="newEmail"
                                type="email"
                                {...changeEmailForm.register("newEmail")}
                                data-testid="input-new-email"
                              />
                              {changeEmailForm.formState.errors.newEmail && (
                                <p className="text-sm text-destructive mt-1">
                                  {changeEmailForm.formState.errors.newEmail.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="emailPassword">Current Password</Label>
                              <Input
                                id="emailPassword"
                                type="password"
                                {...changeEmailForm.register("password")}
                                data-testid="input-email-password"
                              />
                              {changeEmailForm.formState.errors.password && (
                                <p className="text-sm text-destructive mt-1">
                                  {changeEmailForm.formState.errors.password.message}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-3">
                              <Button
                                type="submit"
                                disabled={changeEmailMutation.isPending}
                                data-testid="button-save-email"
                              >
                                {changeEmailMutation.isPending ? "Changing..." : "Change Email"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setEditingProfile(false);
                                  changeEmailForm.reset();
                                }}
                                data-testid="button-cancel-email"
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </TabsContent>
                        
                        <TabsContent value="password" className="space-y-4">
                          <form onSubmit={changePasswordForm.handleSubmit(onSubmitChangePassword)} className="space-y-4">
                            <div>
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <Input
                                id="currentPassword"
                                type="password"
                                {...changePasswordForm.register("currentPassword")}
                                data-testid="input-current-password"
                              />
                              {changePasswordForm.formState.errors.currentPassword && (
                                <p className="text-sm text-destructive mt-1">
                                  {changePasswordForm.formState.errors.currentPassword.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input
                                id="newPassword"
                                type="password"
                                {...changePasswordForm.register("newPassword")}
                                data-testid="input-new-password"
                              />
                              {changePasswordForm.formState.errors.newPassword && (
                                <p className="text-sm text-destructive mt-1">
                                  {changePasswordForm.formState.errors.newPassword.message}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="confirmPassword">Confirm New Password</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                {...changePasswordForm.register("confirmPassword")}
                                data-testid="input-confirm-password"
                              />
                              {changePasswordForm.formState.errors.confirmPassword && (
                                <p className="text-sm text-destructive mt-1">
                                  {changePasswordForm.formState.errors.confirmPassword.message}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-3">
                              <Button
                                type="submit"
                                disabled={changePasswordMutation.isPending}
                                data-testid="button-save-password"
                              >
                                {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setEditingProfile(false);
                                  changePasswordForm.reset();
                                }}
                                data-testid="button-cancel-password"
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </TabsContent>
                      </Tabs>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
