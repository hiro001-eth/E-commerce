import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import WishlistButton from "@/components/wishlist-button";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  MapPin,
  Minus,
  Plus,
  ArrowLeft,
  Store,
  Shield,
  Package,
} from "lucide-react";
import type { ProductDTO, ReviewDTO, WishlistDTO, User } from "@shared/schema";
import NotFound from "@/pages/not-found";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authData } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: product, isLoading, error } = useQuery<ProductDTO>({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery<ReviewDTO[]>({
    queryKey: [`/api/products/${id}/reviews`],
    enabled: !!id,
  });

  const { data: wishlistItems = [] } = useQuery<WishlistDTO[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!authData?.user,
  });

  const isInWishlist = wishlistItems.some(item => item.productId === id);

  const addToCartMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/cart", {
      productId: id,
      quantity,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${quantity} item(s) added to your cart`,
      });
    },
  });

  const wishlistMutation = useMutation({
    mutationFn: () => {
      if (isInWishlist) {
        const wishlistItem = wishlistItems.find(item => item.productId === id);
        return apiRequest("DELETE", `/api/wishlist/${wishlistItem?.id}`);
      } else {
        return apiRequest("POST", "/api/wishlist", { productId: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
        description: isInWishlist 
          ? "Product removed from your wishlist" 
          : "Product saved to your wishlist",
      });
    },
  });

  const handleAddToCart = () => {
    if (!authData?.user) {
      toast({
        title: "Login required",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }
    addToCartMutation.mutate();
  };

  const handleWishlist = () => {
    if (!authData?.user) {
      toast({
        title: "Login required",
        description: "Please login to add items to wishlist",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }
    wishlistMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <div className="h-96 bg-muted rounded-lg"></div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 w-20 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return <NotFound />;
  }

  const price = parseFloat(product.price);
  const discountPrice = product.discountPrice ? parseFloat(product.discountPrice) : null;
  const hasDiscount = discountPrice && discountPrice < price;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto p-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/shop")}
            className="mb-4"
            data-testid="button-back-to-shop"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Product Info */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={product.images?.[selectedImage] || "/placeholder-product.jpg"}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
                data-testid="image-main-product"
              />
              {hasDiscount && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                  {Math.round(((price - discountPrice!) / price) * 100)}% OFF
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground">
                  Out of Stock
                </Badge>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                      selectedImage === index ? "border-primary" : "border-border"
                    }`}
                    data-testid={`button-image-${index}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-product-name">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-medium" data-testid="text-product-rating">
                    {parseFloat(product.rating).toFixed(1)}
                  </span>
                  <span className="text-muted-foreground ml-1" data-testid="text-review-count">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
                
                <Badge variant="secondary" data-testid="text-product-sku">
                  SKU: {product.sku}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mb-6">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-bold text-primary" data-testid="text-discount-price">
                      {formatCurrency(discountPrice!)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through" data-testid="text-original-price">
                      {formatCurrency(price)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary" data-testid="text-product-price">
                    {formatCurrency(price)}
                  </span>
                )}
              </div>
            </div>

            {/* Vendor Info */}
            {product.vendor && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Store className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-semibold" data-testid="text-vendor-name">
                        {product.vendor.storeName}
                      </h3>
                      <p className="text-sm text-muted-foreground">Verified Vendor</p>
                    </div>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        Delivery fee:
                      </span>
                      <span className="font-medium" data-testid="text-delivery-fee">
                        {parseFloat(product.vendor.deliveryFee) === 0 ? "Free" : formatCurrency(parseFloat(product.vendor.deliveryFee))}
                      </span>
                    </div>
                    
                    {parseFloat(product.vendor.freeDeliveryThreshold) > 0 && parseFloat(product.vendor.deliveryFee) > 0 && (
                      <div className="flex items-center justify-between">
                        <span>Free delivery over:</span>
                        <span className="font-medium text-green-600" data-testid="text-free-delivery-threshold">
                          {formatCurrency(parseFloat(product.vendor.freeDeliveryThreshold))}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>Delivers within {product.vendor.deliveryRadius}km</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              <span className="text-sm">
                {product.stock > 0 ? (
                  <>
                    <span className="text-green-600 font-medium">In Stock</span>
                    {product.stock <= 10 && (
                      <span className="text-destructive ml-2" data-testid="text-low-stock">
                        (Only {product.stock} left!)
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-destructive font-medium">Out of Stock</span>
                )}
              </span>
            </div>

            {/* Quantity and Actions */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      data-testid="button-decrease-quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className="w-20 text-center"
                      min="1"
                      max={product.stock}
                      data-testid="input-quantity"
                    />
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      data-testid="button-increase-quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                    className="flex-1"
                    size="lg"
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleWishlist}
                    disabled={wishlistMutation.isPending}
                    size="lg"
                    data-testid="button-wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist ? "fill-current text-red-500" : ""}`} />
                  </Button>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Secure payment & buyer protection</span>
              </div>
              {product.allowsCoupons && (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center text-xs bg-primary text-primary-foreground rounded">%</span>
                  <span>Coupon codes accepted</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                <div className="prose max-w-none text-foreground">
                  <p className="whitespace-pre-wrap" data-testid="text-product-description">
                    {product.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-foreground mb-3">{review.comment}</p>
                        )}
                        
                        {/* Review Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-3">
                            {review.images.map((image, imageIndex) => (
                              <img
                                key={imageIndex}
                                src={image}
                                alt={`Review image ${imageIndex + 1}`}
                                className="w-20 h-20 object-cover rounded-md border border-border cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                  // Open image in a new tab for larger view
                                  window.open(image, '_blank');
                                }}
                                data-testid={`review-image-${review.id}-${imageIndex}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No reviews yet. Be the first to review this product!
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}