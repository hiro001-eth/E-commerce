import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Star, MessageCircle } from "lucide-react";
import type { Review, User, Product } from "@shared/schema";

interface ReviewWithDetails extends Review {
  user: Pick<User, 'id' | 'firstName' | 'lastName'>;
  product: Pick<Product, 'id' | 'name'>;
}

export default function RecentReviews() {
  const { data: reviews, isLoading } = useQuery<ReviewWithDetails[]>({
    queryKey: ["/api/reviews/recent"],
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading customer reviews...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Reviews Yet</h3>
        <p className="text-muted-foreground">
          Be the first to share your experience! Reviews are only available from verified customers who have completed their purchases.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {reviews.slice(0, 6).map((review) => (
          <Card key={review.id} className="hover:shadow-xl smooth-transition">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mr-4">
                  {review.user.firstName?.charAt(0) || '?'}
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {review.user.firstName} {review.user.lastName?.charAt(0)}.
                  </h4>
                  <p className="text-sm text-muted-foreground">Verified Customer</p>
                </div>
              </div>
              
              <div className="flex items-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {review.rating}/5
                </span>
              </div>

              {review.comment && (
                <p className="text-muted-foreground text-sm mb-3">
                  "{review.comment}"
                </p>
              )}

              <div className="text-xs text-muted-foreground border-t pt-3">
                Review for: <span className="font-medium">{review.product.name}</span>
                <div className="mt-1">
                  {new Date(review.createdAt!).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length > 0 && (
        <div className="text-center">
          <div className="bg-card rounded-lg p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-foreground mb-4">Trusted by Our Community</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}/5
                </div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{reviews.length.toLocaleString()}+</div>
                <p className="text-sm text-muted-foreground">Verified Reviews</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100)}%
                </div>
                <p className="text-sm text-muted-foreground">Positive Reviews</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}