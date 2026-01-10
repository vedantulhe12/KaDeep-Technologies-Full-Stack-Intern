import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw,
  Check,
  Minus,
  Plus,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { StarRating, InteractiveStarRating } from "@/components/star-rating";
import { ProductCard, ProductCardSkeleton } from "@/components/product-card";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, Review } from "@shared/schema";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");

  const { data: product, isLoading: productLoading } = useQuery<Product>({
    queryKey: ["/api/products", id],
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/reviews", id],
  });

  const { data: relatedProducts } = useQuery<Product[]>({
    queryKey: ["/api/products", { category: product?.category, limit: 5 }],
    enabled: !!product?.category,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; title: string; content: string }) => {
      return apiRequest("POST", `/api/reviews/${id}`, {
        ...data,
        userName: "Guest User",
        isVerified: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/products", id] });
      setReviewRating(5);
      setReviewTitle("");
      setReviewContent("");
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} has been added to your cart.`,
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewContent.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all review fields.",
        variant: "destructive",
      });
      return;
    }
    submitReviewMutation.mutate({
      rating: reviewRating,
      title: reviewTitle,
      content: reviewContent,
    });
  };

  if (productLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted animate-pulse rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-6 bg-muted animate-pulse rounded w-1/4" />
            <div className="h-10 bg-muted animate-pulse rounded w-1/3" />
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="h-12 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The product you're looking for doesn't exist.
        </p>
        <Link href="/products">
          <Button data-testid="button-back-to-products">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const images = product.images?.length 
    ? [product.imageUrl, ...product.images] 
    : [product.imageUrl];
  
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const ratingDistribution = reviews?.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/products?category=${product.category}`}>
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-48 truncate">{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="img-product-main"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "w-20 h-20 rounded-md overflow-hidden shrink-0 border-2 transition-colors",
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground/50"
                  )}
                  data-testid={`button-thumbnail-${index}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2" data-testid="text-product-name">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <StarRating
                rating={product.rating}
                size="md"
                showValue
                reviewCount={product.reviewCount}
              />
            </div>
            <Separator />
          </div>

          <div>
            <div className="flex items-baseline gap-3 flex-wrap">
              {discount > 0 && (
                <Badge variant="destructive" className="text-sm">
                  {discount}% OFF
                </Badge>
              )}
              <span className="text-3xl font-bold" data-testid="text-product-price">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.isPrime && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Badge className="bg-blue-600 text-white">Prime</Badge>
                <span className="text-muted-foreground">FREE Delivery</span>
              </div>
            )}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">In Stock</span>
                  {product.stockCount && product.stockCount < 10 && (
                    <span className="text-muted-foreground">
                      (Only {product.stockCount} left)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>
          </div>

          <p className="text-muted-foreground" data-testid="text-product-description">
            {product.description}
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="quantity" className="text-sm">Qty:</Label>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-r-none"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  data-testid="button-quantity-decrease"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.stockCount || 99}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-0 rounded-none"
                  data-testid="input-quantity"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-l-none"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= (product.stockCount || 99)}
                  data-testid="button-quantity-increase"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1"
              disabled={!product.inStock}
              data-testid="button-buy-now"
            >
              Buy Now
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-wishlist">
              <Heart className="h-4 w-4" />
              Add to Wishlist
            </Button>
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-share">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">Free Delivery</p>
                  <p className="text-muted-foreground">On orders over $35</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">Free Returns</p>
                  <p className="text-muted-foreground">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-muted-foreground">100% protected checkout</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="reviews" className="mb-12">
        <TabsList>
          <TabsTrigger value="description" data-testid="tab-description">Description</TabsTrigger>
          <TabsTrigger value="specifications" data-testid="tab-specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews" data-testid="tab-reviews">
            Reviews ({product.reviewCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="p-6 prose dark:prose-invert max-w-none">
              <p>{product.description}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="p-6">
              {product.specifications ? (
                <pre className="text-sm whitespace-pre-wrap">{product.specifications}</pre>
              ) : (
                <p className="text-muted-foreground">No specifications available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold">{product.rating.toFixed(1)}</div>
                  <StarRating rating={product.rating} size="lg" className="justify-center my-2" />
                  <p className="text-sm text-muted-foreground">
                    {product.reviewCount} reviews
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2 text-sm">
                      <span className="w-12">{rating} star</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${
                              reviews?.length
                                ? ((ratingDistribution[rating] || 0) / reviews.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="w-8 text-muted-foreground">
                        {ratingDistribution[rating] || 0}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <h4 className="font-semibold">Write a Review</h4>
                  <div>
                    <Label className="text-sm mb-2 block">Your Rating</Label>
                    <InteractiveStarRating
                      value={reviewRating}
                      onChange={setReviewRating}
                    />
                  </div>
                  <div>
                    <Label htmlFor="review-title" className="text-sm mb-2 block">
                      Review Title
                    </Label>
                    <Input
                      id="review-title"
                      placeholder="Summarize your experience"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      data-testid="input-review-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="review-content" className="text-sm mb-2 block">
                      Your Review
                    </Label>
                    <Textarea
                      id="review-content"
                      placeholder="What did you like or dislike?"
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      rows={4}
                      data-testid="input-review-content"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitReviewMutation.isPending}
                    data-testid="button-submit-review"
                  >
                    {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              {reviewsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded w-24" />
                      <div className="h-5 bg-muted animate-pulse rounded w-1/2" />
                      <div className="h-16 bg-muted animate-pulse rounded" />
                    </CardContent>
                  </Card>
                ))
              ) : reviews?.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No reviews yet. Be the first to review this product!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                reviews?.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="font-semibold text-primary">
                            {review.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{review.userName}</span>
                            {review.isVerified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <StarRating rating={review.rating} size="sm" className="my-1" />
                          <h4 className="font-semibold">{review.title}</h4>
                          <p className="text-muted-foreground text-sm mt-1">
                            {review.content}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span>{review.createdAt}</span>
                            <button className="hover:text-foreground">
                              Helpful ({review.helpfulCount})
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {relatedProducts && relatedProducts.length > 1 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Related Products</h2>
            <Link href={`/products?category=${product.category}`}>
              <Button variant="ghost" className="gap-2" data-testid="link-see-more-related">
                See More <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedProducts
              .filter((p) => p.id !== product.id)
              .slice(0, 5)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
