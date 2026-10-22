"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { availableStock } from '@/lib/stock-client';
import { Product, CartItem } from "@/lib/types";
import { toast } from "sonner";
import { purchasableQuantity, restoreCart } from "@/lib/cart";

const CART_STORAGE_KEY = "br_pecas_cart_v1";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pending = useRef(new Set<number>());
  const revision = useRef(0);

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

  const addItem = useCallback(async (product: Product, quantity = 1) => {
    if(pending.current.has(product.id)) return;
    pending.current.add(product.id);
    const startedRevision=revision.current;
    try {
    const stock=await availableStock(product.id);
    if(startedRevision!==revision.current) return;
    product={...product,estoque:stock};
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
    } catch(error) {toast.error(error instanceof Error?error.message:'Não foi possível consultar o estoque.');}
    finally {pending.current.delete(product.id);}
  }, []);

  const removeItem = useCallback((productId: number) => {
    revision.current++;
    setItems((prev) => prev.filter((i) => i.produto.id !== productId));
  }, []);

  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    if (!Number.isFinite(quantity)) return;
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    if(pending.current.has(productId)) return;
    pending.current.add(productId);
    const startedRevision=revision.current;
    try {
    const stock=await availableStock(productId);
    if(startedRevision!==revision.current) return;
    if(stock<quantity) toast.warning(stock?`Disponível agora: ${stock} unidade(s).`:'Este produto está sem estoque.');

    setItems((prev) =>
      prev.map((i) => {
        if (i.produto.id === productId) {
          const produto={...i.produto,estoque:stock};
          const validQty = purchasableQuantity(produto, quantity);
          return { ...i, produto, quantidade: validQty };
        }
        return i;
      }).filter(item => item.quantidade > 0)
    );
    } catch(error) {toast.error(error instanceof Error?error.message:'Não foi possível consultar o estoque.');}
    finally {pending.current.delete(productId);}
  }, [removeItem]);

  const clearCart = useCallback(() => {
    revision.current++;
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
