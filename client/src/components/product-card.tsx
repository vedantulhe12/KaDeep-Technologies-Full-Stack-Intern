import { Link } from "wouter";
import { ShoppingCart, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/product/${product.id}`}>
      <Card
        className={cn(
          "group overflow-visible h-full transition-shadow hover:shadow-md cursor-pointer",
          className
        )}
        data-testid={`card-product-${product.id}`}
      >
        <div className="relative aspect-square overflow-hidden rounded-t-md bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
          {product.isDeal && discount > 0 && (
            <Badge className="absolute top-2 left-2" variant="destructive">
              {discount}% OFF
            </Badge>
          )}
          {product.isPrime && (
            <Badge className="absolute top-2 right-2 bg-blue-600 text-white">
              Prime
            </Badge>
          )}
        </div>
        <CardContent className="p-4 flex flex-col gap-2">
          <h3 className="text-sm font-normal line-clamp-2 min-h-[2.5rem]" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          
          <StarRating
            rating={product.rating}
            size="sm"
            reviewCount={product.reviewCount}
          />

          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold" data-testid={`text-product-price-${product.id}`}>
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {product.isPrime && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Truck className="h-3 w-3" />
              <span>FREE delivery</span>
            </div>
          )}

          <Button
            size="sm"
            className="mt-auto w-full gap-2"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="h-4 w-4" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="h-full">
      <div className="aspect-square bg-muted animate-pulse rounded-t-md" />
      <CardContent className="p-4 space-y-3">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        <div className="h-6 w-20 bg-muted animate-pulse rounded" />
        <div className="h-9 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}
