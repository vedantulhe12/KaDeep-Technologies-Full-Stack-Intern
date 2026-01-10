import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Package, Truck, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { OrderWithItems } from "@shared/schema";

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery<OrderWithItems>({
    queryKey: ["/api/orders", id],
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-muted animate-pulse rounded-full mx-auto mb-4" />
          <div className="h-8 bg-muted animate-pulse rounded w-64 mx-auto mb-2" />
          <div className="h-5 bg-muted animate-pulse rounded w-48 mx-auto" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="h-6 bg-muted animate-pulse rounded" />
            <div className="h-6 bg-muted animate-pulse rounded" />
            <div className="h-6 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn't find this order. Please check your order history.
        </p>
        <Link href="/orders">
          <Button data-testid="button-view-orders">View Orders</Button>
        </Link>
      </div>
    );
  }

  const shippingAddress = JSON.parse(order.shippingAddress);
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 mx-auto mb-4 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-order-confirmed">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground">
          Thank you for your order. We'll send you shipping updates via email.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order #{order.id.slice(0, 8).toUpperCase()}
            </CardTitle>
            <Badge variant="secondary" className="text-sm">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
            <div>
              <p className="font-medium">Estimated Delivery</p>
              <p className="text-sm text-muted-foreground">
                {estimatedDelivery.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Items Ordered</h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Shipping Address
              </h3>
              <div className="text-sm text-muted-foreground">
                <p>{shippingAddress.fullName}</p>
                <p>{shippingAddress.addressLine1}</p>
                {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                <p>
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                </p>
                <p>{shippingAddress.phone}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Order Summary</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {order.shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${order.shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/orders">
          <Button variant="outline" className="w-full sm:w-auto gap-2" data-testid="button-view-all-orders">
            View All Orders
          </Button>
        </Link>
        <Link href="/products">
          <Button className="w-full sm:w-auto gap-2" data-testid="button-continue-shopping">
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
