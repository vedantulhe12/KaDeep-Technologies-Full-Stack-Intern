import { Link } from "wouter";
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { items, itemCount, subtotal, removeItem, updateQuantity, isLoading } = useCart();

  const shipping = subtotal >= 35 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex gap-4">
                  <div className="w-24 h-24 bg-muted animate-pulse rounded-md shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                    <div className="h-9 bg-muted animate-pulse rounded w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-6 bg-muted animate-pulse rounded" />
                <div className="h-12 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
          <ShoppingCart className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
        </p>
        <Link href="/products">
          <Button size="lg" className="gap-2" data-testid="button-start-shopping">
            <ShoppingBag className="h-5 w-5" />
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/products">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold" data-testid="text-cart-title">
          Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} data-testid={`card-cart-item-${item.productId}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Link href={`/product/${item.productId}`}>
                    <div className="w-24 h-24 rounded-md overflow-hidden bg-muted shrink-0">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/product/${item.productId}`}>
                          <h3 className="font-medium hover:text-primary transition-colors line-clamp-2">
                            {item.product.name}
                          </h3>
                        </Link>
                        {item.product.isPrime && (
                          <Badge className="bg-blue-600 text-white mt-1">Prime</Badge>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.product.inStock ? (
                            <span className="text-green-600">In Stock</span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${item.product.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          data-testid={`button-decrease-${item.productId}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          data-testid={`button-increase-${item.productId}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive gap-2"
                        onClick={() => removeItem(item.productId)}
                        data-testid={`button-remove-${item.productId}`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-28">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({itemCount} items)</span>
                <span data-testid="text-subtotal">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span data-testid="text-shipping">
                  {shipping === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground">
                  Add ${(35 - subtotal).toFixed(2)} more for FREE shipping
                </p>
              )}
              <div className="flex justify-between text-sm">
                <span>Estimated Tax</span>
                <span data-testid="text-tax">${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span data-testid="text-total">${total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Link href="/checkout" className="w-full">
                <Button className="w-full" size="lg" data-testid="button-proceed-checkout">
                  Proceed to Checkout
                </Button>
              </Link>
              <Link href="/products" className="w-full">
                <Button variant="outline" className="w-full" data-testid="button-continue-shopping">
                  Continue Shopping
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
