import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, X, Upload, Image as ImageIcon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { ProductDTO } from "@shared/schema";

interface ReviewFormProps {
  product: ProductDTO;
  orderId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewForm({ product, orderId, onClose, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const newImages = [...imageUrls];

    try {
      for (let i = 0; i < files.length && newImages.length < 5; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload/review-image', {
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
      if (imagePath.startsWith('/uploads/')) {
        await fetch('/api/upload/review-image', {
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
  };

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: { productId: string; vendorId: string; rating: number; comment?: string; images?: string[] }) => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(reviewData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit review");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! Your review has been published.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onSuccess?.();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Submit Review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting your review.",
        variant: "destructive",
      });
      return;
    }

    submitReviewMutation.mutate({
      productId: product.id,
      vendorId: product.vendorId,
      rating,
      comment: comment.trim() || undefined,
      images: imageUrls,
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Write a Review</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium text-sm">{product.name}</p>
            <p className="text-xs text-muted-foreground">Order #{orderId.slice(0, 8)}</p>
          </div>

          {/* Rating Stars */}
          <div>
            <Label className="text-sm font-medium">Rating *</Label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 hover:scale-110 transition-transform"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} star{rating !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <Label htmlFor="comment" className="text-sm font-medium">
              Review (Optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              className="mt-2"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Photos (optional)
            </Label>
            <p className="text-xs text-muted-foreground">
              Add up to 5 photos to help others see your experience
            </p>
            
            <div className="flex flex-wrap gap-3">
              {/* Image Preview */}
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img
                    src={url}
                    alt={`Review image ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border-2 border-border transition-all duration-200 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-1 -right-1 p-0.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              {imageUrls.length < 5 && (
                <label className="w-16 h-16 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-all duration-200 hover:scale-105">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                  />
                  {uploadingImages ? (
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 text-muted-foreground mb-0.5" />
                      <span className="text-xs text-muted-foreground">Add</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={rating === 0 || submitReviewMutation.isPending}
              className="flex-1"
            >
              {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}