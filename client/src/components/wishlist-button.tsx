import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { WishlistDTO, User } from "@shared/schema";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "default" | "lg";
}

export default function WishlistButton({ 
  productId, 
  className = "", 
  size = "default" 
}: WishlistButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication status
  const { data: authData } = useQuery<{ user: User }>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Get wishlist items
  const { data: wishlistItems = [] } = useQuery<WishlistDTO[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!authData?.user,
  });

  const isInWishlist = wishlistItems.some(item => item.productId === productId);

  const addToWishlistMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/wishlist", { productId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to wishlist",
        description: "Product saved to your wishlist!",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add to wishlist",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/wishlist/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Product removed from your wishlist.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to remove from wishlist",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleToggleWishlist = () => {
    if (!authData?.user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to use wishlist.",
        variant: "destructive",
      });
      return;
    }

    if (isInWishlist) {
      removeFromWishlistMutation.mutate();
    } else {
      addToWishlistMutation.mutate();
    }
  };

  const isPending = addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;

  return (
    <Button
      variant={isInWishlist ? "default" : "outline"}
      size={size}
      onClick={handleToggleWishlist}
      disabled={isPending}
      className={className}
      data-testid={`button-wishlist-${productId}`}
    >
      <Heart 
        className={`w-4 h-4 mr-2 ${isInWishlist ? "fill-current" : ""}`} 
      />
      {isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
    </Button>
  );
}