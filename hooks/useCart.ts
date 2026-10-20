"use client";

import { useState, useEffect, useCallback } from "react";
import { Product, CartItem } from "@/lib/types";
import { toast } from "sonner";
import { purchasableQuantity, restoreCart } from "@/lib/cart";

const CART_STORAGE_KEY = "br_pecas_cart_v1";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Carregar do localStorage
  useEffect(() => {
    const timer = window.setTimeout(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(restoreCart(JSON.parse(stored)));
      }
    } catch (e) {
      console.error("Falha ao recuperar carrinho:", e);
    } finally {
      setIsLoaded(true);
    }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Salvar no localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Falha ao salvar carrinho:", e);
    }
  }, [items, isLoaded]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    const availableQuantity = purchasableQuantity(product, quantity);
    if (!availableQuantity) {
      toast.error("Este produto não está disponível para compra.");
      return;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.produto.id === product.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantidade;
        const newQty = purchasableQuantity(product, currentQty + availableQuantity);
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          produto: product,
          quantidade: newQty,
        };
        return updated;
      } else {
        return [...prev, { produto: product, quantidade: availableQuantity }];
      }
    });

    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.produto.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (!Number.isFinite(quantity)) return;
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.produto.id === productId) {
          const validQty = purchasableQuantity(i.produto, quantity);
          return { ...i, quantidade: validQty };
        }
        return i;
      }).filter(item => item.quantidade > 0)
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const subtotal = items.reduce(
    (sum, i) => sum + (i.produto.preco_site ?? i.produto.precovenda) * i.quantidade,
    0
  );

  const totalItems = items.reduce((sum, i) => sum + i.quantidade, 0);

  return {
    items,
    totalItems,
    subtotal,
    isLoaded,
    isOpen,
    setIsOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };
}
