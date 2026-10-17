"use client";

import { useState, useEffect } from "react";

const WISHLIST_STORAGE_KEY = "br_pecas_wishlist_v1";

export function useWishlist() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        setFavoriteIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Falha ao recuperar favoritos:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (e) {
      console.error("Falha ao salvar favoritos:", e);
    }
  }, [favoriteIds, isLoaded]);

  const toggleFavorite = (productId: number) => {
    setFavoriteIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const clearWishlist = () => {
    setFavoriteIds([]);
  };

  const isFavorite = (productId: number) => favoriteIds.includes(productId);

  return {
    favoriteIds,
    isLoaded,
    toggleFavorite,
    clearWishlist,
    isFavorite,
    totalFavorites: favoriteIds.length,
  };
}
