import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  CreditCard, 
  Truck, 
  Check, 
  Lock, 
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCart, getCartSessionId } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { shippingAddressSchema, type ShippingAddress } from "@shared/schema";
import { cn } from "@/lib/utils";

type CheckoutStep = "shipping" | "payment" | "review";

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { items, subtotal, clearCart } = useCart();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [shippingData, setShippingData] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const shipping = subtotal >= 35 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const form = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      phone: "",
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const sessionId = getCartSessionId();
      return apiRequest("POST", "/api/orders", {
        sessionId,
        shippingAddress: JSON.stringify(shippingData),
        paymentMethod,
        items: items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          productImage: item.product.imageUrl,
          price: item.product.price,
          quantity: item.quantity,
        })),
        subtotal,
        shipping,
        tax,
        total,
      });
    },
    onSuccess: async (response) => {
      const order = await response.json();
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setLocation(`/order-confirmation/${order.id}`);
    },
    onError: () => {
      toast({
        title: "Order failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleShippingSubmit = (data: ShippingAddress) => {
    setShippingData(data);
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = () => {
    setCurrentStep("review");
  };

  const handlePlaceOrder = () => {
    placeOrderMutation.mutate();
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">
          Add some items to your cart before checking out.
        </p>
        <Link href="/products">
          <Button data-testid="button-shop-now">Shop Now</Button>
        </Link>
      </div>
    );
  }

  const steps = [
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "review", label: "Review", icon: Check },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/cart">
          <Button variant="ghost" size="icon" data-testid="button-back-to-cart">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Checkout</h1>
      </div>

      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full",
                index <= currentStepIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <step.icon className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-12 h-0.5 mx-2",
                  index < currentStepIndex ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Collapsible open={currentStep === "shipping"}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover-elevate rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Address
                      {shippingData && currentStep !== "shipping" && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </CardTitle>
                    {currentStep === "shipping" ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                  {shippingData && currentStep !== "shipping" && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {shippingData.fullName}, {shippingData.addressLine1}, {shippingData.city}
                    </p>
                  )}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleShippingSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} data-testid="input-full-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="addressLine1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 1</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} data-testid="input-address1" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="addressLine2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address Line 2 (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Apt 4B" {...field} data-testid="input-address2" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="New York" {...field} data-testid="input-city" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="NY" {...field} data-testid="input-state" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="10001" {...field} data-testid="input-zip" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="submit" className="w-full" data-testid="button-continue-payment">
                        Continue to Payment
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible open={currentStep === "payment"}>
            <Card className={currentStepIndex < 1 ? "opacity-50" : ""}>
              <CollapsibleTrigger asChild disabled={currentStepIndex < 1}>
                <CardHeader className={cn("rounded-t-lg", currentStepIndex >= 1 && "cursor-pointer hover-elevate")}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                      {paymentMethod && currentStep === "review" && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </CardTitle>
                    {currentStepIndex >= 1 && (
                      currentStep === "payment" ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )
                    )}
                  </div>
                  {currentStep === "review" && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {paymentMethod === "card" ? "Credit/Debit Card" : "PayPal"}
                    </p>
                  )}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="card" id="card" data-testid="radio-card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          <span>Credit/Debit Card</span>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="paypal" id="paypal" data-testid="radio-paypal" />
                      <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600">PayPal</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 p-4 bg-muted rounded-lg">
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="4242 4242 4242 4242"
                          className="mt-1"
                          data-testid="input-card-number"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            className="mt-1"
                            data-testid="input-expiry"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            className="mt-1"
                            data-testid="input-cvv"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Your payment information is secure
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("shipping")}
                      data-testid="button-back-shipping"
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handlePaymentSubmit}
                      data-testid="button-review-order"
                    >
                      Review Order
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Collapsible open={currentStep === "review"}>
            <Card className={currentStepIndex < 2 ? "opacity-50" : ""}>
              <CollapsibleTrigger asChild disabled={currentStepIndex < 2}>
                <CardHeader className={cn("rounded-t-lg", currentStepIndex >= 2 && "cursor-pointer hover-elevate")}>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    Review Order
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Items ({items.length})</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium shrink-0">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Shipping Address</h3>
                      {shippingData && (
                        <div className="text-sm text-muted-foreground">
                          <p>{shippingData.fullName}</p>
                          <p>{shippingData.addressLine1}</p>
                          {shippingData.addressLine2 && <p>{shippingData.addressLine2}</p>}
                          <p>
                            {shippingData.city}, {shippingData.state} {shippingData.zipCode}
                          </p>
                          <p>{shippingData.phone}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Payment Method</h3>
                      <p className="text-sm text-muted-foreground">
                        {paymentMethod === "card" ? "Credit/Debit Card ending in ****" : "PayPal"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("payment")}
                      data-testid="button-back-payment"
                    >
                      Back
                    </Button>
                    <Button
                      className="flex-1"
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={placeOrderMutation.isPending}
                      data-testid="button-place-order"
                    >
                      {placeOrderMutation.isPending ? "Processing..." : `Place Order - $${total.toFixed(2)}`}
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-28">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({items.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Estimated Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
