import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ProductDTO, OrderDTO } from "@shared/schema";

interface ReviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDTO;
  products: ProductDTO[];
}

export default function ReviewPopup({ isOpen, onClose, order, products }: ReviewPopupProps) {
  const [reviews, setReviews] = useState<Record<string, { rating: number; comment: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: { productId: string; vendorId: string; rating: number; comment: string }) =>
      apiRequest("POST", "/api/reviews", reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/recent"] });
    },
  });

  const handleRatingChange = (productId: string, rating: number) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        rating
      }
    }));
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setReviews(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        comment
      }
    }));
  };

  const handleSubmitReviews = async () => {
    setSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const product of products) {
        const review = reviews[product.id];
        if (review && review.rating > 0) {
          try {
            await submitReviewMutation.mutateAsync({
              productId: product.id,
              vendorId: product.vendorId,
              rating: review.rating,
              comment: review.comment || ""
            });
            successCount++;
          } catch (error) {
            errorCount++;
            console.error(`Failed to submit review for product ${product.id}:`, error);
          }
        }
      }

      if (successCount > 0) {
        toast({
          title: "Thank you for your feedback!",
          description: `${successCount} review${successCount > 1 ? 's' : ''} submitted successfully.`,
        });
      }

      if (errorCount > 0) {
        toast({
          title: "Some reviews failed",
          description: `${errorCount} review${errorCount > 1 ? 's' : ''} could not be submitted.`,
          variant: "destructive"
        });
      }

      if (successCount > 0) {
        onClose();
      }
    } catch (error) {
      toast({
        title: "Failed to submit reviews",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (productId: string, currentRating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(productId, star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-5 h-5 ${
                star <= currentRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-400"
              } transition-colors`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {currentRating > 0 ? `${currentRating}/5` : "Rate this product"}
        </span>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Rate Your Purchase</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Your order has been delivered! Please take a moment to rate the products you received.
            Your feedback helps other customers make informed decisions.
          </div>

          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{product.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  <p className="text-sm font-medium text-primary">${product.price}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                {renderStarRating(product.id, reviews[product.id]?.rating || 0)}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Comments (optional)</label>
                <Textarea
                  placeholder="Share your experience with this product..."
                  value={reviews[product.id]?.comment || ""}
                  onChange={(e) => handleCommentChange(product.id, e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Skip for Now
            </Button>
            <Button 
              onClick={handleSubmitReviews} 
              disabled={submitting || Object.keys(reviews).length === 0 || !Object.values(reviews).some(r => r.rating > 0)}
            >
              {submitting ? "Submitting..." : "Submit Reviews"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}