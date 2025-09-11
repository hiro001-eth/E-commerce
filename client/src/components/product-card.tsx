import { Star, ShoppingCart, Truck, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ProductDTO as Product } from "@shared/schema";
import { formatCurrency } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: (productId: string) =>
      apiRequest("POST", "/api/cart", { productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    addToCartMutation.mutate(product.id);
  };

  const price = parseFloat(product.price);
  const discountPrice = product.discountPrice ? parseFloat(product.discountPrice) : null;
  const hasDiscount = discountPrice && discountPrice < price;

  return (
    <Card className="overflow-hidden hover:shadow-xl smooth-transition group" data-testid={`card-product-${product.id}`}>
      <div className="relative">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 smooth-transition"
          />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
        
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
            {Math.round(((price - discountPrice!) / price) * 100)}% OFF
          </Badge>
        )}
        
        {product.stock === 0 && (
          <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">
            Out of Stock
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground mb-2" data-testid={`text-product-title-${product.id}`}>
          {product.name}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2" data-testid={`text-description-${product.id}`}>
          {product.description}
        </p>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-xl font-bold text-primary" data-testid={`text-discount-price-${product.id}`}>
                  {formatCurrency(discountPrice!)}
                </span>
                <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${product.id}`}>
                  {formatCurrency(price)}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-primary" data-testid={`text-price-${product.id}`}>
                {formatCurrency(price)}
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-muted-foreground ml-1" data-testid={`text-rating-${product.id}`}>
              {parseFloat(product.rating).toFixed(1)} ({product.reviewCount})
            </span>
          </div>
        </div>
        
        {/* Delivery Information */}
        {product.vendor && (
          <div className="mb-3 p-2 bg-muted/50 rounded-md" data-testid={`delivery-info-${product.id}`}>
            <div className="flex items-center gap-1 mb-1">
              <Truck className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Delivery by {product.vendor.storeName}</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span>Delivery fee:</span>
                <span className="font-medium" data-testid={`delivery-fee-${product.id}`}>
                  {parseFloat(product.vendor.deliveryFee) === 0 ? "Free" : formatCurrency(parseFloat(product.vendor.deliveryFee))}
                </span>
              </div>
              {parseFloat(product.vendor.freeDeliveryThreshold) > 0 && parseFloat(product.vendor.deliveryFee) > 0 && (
                <div className="flex items-center justify-between">
                  <span>Free delivery over:</span>
                  <span className="font-medium text-green-600" data-testid={`free-delivery-threshold-${product.id}`}>
                    {formatCurrency(parseFloat(product.vendor.freeDeliveryThreshold))}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>Delivers within {product.vendor.deliveryRadius}km</span>
              </div>
            </div>
          </div>
        )}
        
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0 || addToCartMutation.isPending}
          className="w-full"
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
        </Button>
        
        {product.stock > 0 && product.stock <= 10 && (
          <p className="text-xs text-destructive mt-2 text-center" data-testid={`text-stock-warning-${product.id}`}>
            Only {product.stock} left in stock!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
