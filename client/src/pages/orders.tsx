import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Package, ChevronRight, Calendar, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OrderWithItems } from "@shared/schema";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

export default function OrdersPage() {
  const sessionId = localStorage.getItem("shophub-session");

  const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders", { sessionId }],
    enabled: !!sessionId,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-muted animate-pulse rounded-md" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted animate-pulse rounded w-32" />
                    <div className="h-4 bg-muted animate-pulse rounded w-24" />
                    <div className="h-4 bg-muted animate-pulse rounded w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
          <Package className="w-12 h-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">No orders yet</h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          When you place orders, they will appear here. Start shopping to see your order history!
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8" data-testid="text-orders-title">Your Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const orderDate = new Date(order.createdAt);
          const formattedDate = orderDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          return (
            <Card key={order.id} data-testid={`card-order-${order.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </CardTitle>
                    <Badge
                      className={`${statusColors[order.status] || "bg-gray-500"} text-white`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2 shrink-0">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div
                        key={item.id}
                        className="w-16 h-16 rounded-md overflow-hidden bg-muted border-2 border-background"
                        style={{ zIndex: 3 - index }}
                      >
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <div className="w-16 h-16 rounded-md bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-sm font-medium">
                          +{order.items.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">
                      {order.items?.length} {order.items?.length === 1 ? "item" : "items"}
                    </p>
                    <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                  </div>

                  <Link href={`/order-confirmation/${order.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1" data-testid={`button-view-order-${order.id}`}>
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
