"use client";

import { useState, useEffect } from "react";
import { Product, CartItem } from "@/lib/types";

const CART_STORAGE_KEY = "br_pecas_cart_v1";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Carregar do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Falha ao recuperar carrinho:", e);
    } finally {
      setIsLoaded(true);
    }
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

  const addItem = (product: Product, quantity = 1) => {
    if (product.estoque <= 0) {
      alert("Desculpe, este produto está temporariamente sem estoque.");
      return;
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.produto.id === product.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantidade;
        const newQty = Math.min(currentQty + quantity, product.estoque);
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantidade: newQty,
        };
        return updated;
      } else {
        return [...prev, { produto: product, quantidade: Math.min(quantity, product.estoque) }];
      }
    });

    setIsOpen(true);
  };

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.produto.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.produto.id === productId) {
          const validQty = Math.min(quantity, i.produto.estoque);
          return { ...i, quantidade: validQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

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
