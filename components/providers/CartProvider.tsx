"use client";

import React, { createContext, useContext } from "react";
import { useCart } from "@/hooks/useCart";
import { CartItem, Product } from "@/lib/types";

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isLoaded: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCartContext deve ser usado dentro de CartProvider");
  }
  return ctx;
}
