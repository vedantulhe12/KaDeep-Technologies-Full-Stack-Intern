import { Link } from "wouter";
import { Trash2, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from "@/components/star-rating";

export default function WishlistPage() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      quantity: 1,
      product,
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    removeFromWishlist(productId);
    toast({
      title: "Removed from wishlist",
      description: `${productName} has been removed from your wishlist.`,
    });
  };

  const handleClearWishlist = () => {
    clearWishlist();
    toast({
      title: "Wishlist cleared",
      description: "All items have been removed from your wishlist.",
    });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-4">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-6">
          Save items you love to buy them later.
        </p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        {items.length > 0 && (
          <Button 
            variant="outline" 
            onClick={handleClearWishlist}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="p-4">
              <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="space-y-2">
                <Link href={`/product/${product.id}`}>
                  <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2">
                  <StarRating rating={product.rating} />
                  <span className="text-sm text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">${product.price}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm line-through text-muted-foreground">
                      ${product.originalPrice}
                    </span>
                  )}
                  {product.isDeal && (
                    <Badge variant="destructive" className="text-xs">
                      Deal
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                <Button
                  className="w-full gap-2"
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => handleRemoveFromWishlist(product.id, product.name)}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}