import { createContext, useContext, useMemo, useCallback, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CartItemWithProduct, Product } from "@shared/schema";
import { apiRequest } from "./queryClient";

type CartContextType = {
  items: CartItemWithProduct[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function getSessionIdSafe(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    let sessionId = localStorage.getItem("shophub-session");
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("shophub-session", sessionId);
    }
    return sessionId;
  } catch {
    return null;
  }
}

export function getCartSessionId(): string {
  const sessionId = getSessionIdSafe();
  if (!sessionId) {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  return sessionId;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const id = getSessionIdSafe();
    if (id) {
      setSessionId(id);
    }
  }, []);

  const { data: items = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart", { sessionId }],
    enabled: !!sessionId,
  });

  const addItemMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!sessionId) throw new Error("No session");
      return apiRequest("POST", "/api/cart", { productId, quantity, sessionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!sessionId) throw new Error("No session");
      return apiRequest("DELETE", `/api/cart/${productId}?sessionId=${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!sessionId) throw new Error("No session");
      return apiRequest("PATCH", `/api/cart/${productId}`, { quantity, sessionId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error("No session");
      return apiRequest("DELETE", `/api/cart/clear?sessionId=${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
  });

  const addItem = useCallback((product: Product, quantity = 1) => {
    addItemMutation.mutate({ productId: product.id, quantity });
  }, [addItemMutation]);

  const removeItem = useCallback((productId: string) => {
    removeItemMutation.mutate(productId);
  }, [removeItemMutation]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItemMutation.mutate(productId);
      return;
    }
    updateQuantityMutation.mutate({ productId, quantity });
  }, [updateQuantityMutation, removeItemMutation]);

  const clearCart = useCallback(() => {
    clearCartMutation.mutate();
  }, [clearCartMutation]);

  const itemCount = useMemo(() => 
    items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(() =>
    items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isLoading: isLoading || !sessionId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
