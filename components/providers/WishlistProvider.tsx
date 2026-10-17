"use client";

import React, { createContext, useContext } from "react";
import { useWishlist } from "@/hooks/useWishlist";

interface WishlistContextType {
  favoriteIds: number[];
  isLoaded: boolean;
  toggleFavorite: (productId: number) => void;
  clearWishlist: () => void;
  isFavorite: (productId: number) => boolean;
  totalFavorites: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const wishlist = useWishlist();
  return <WishlistContext.Provider value={wishlist}>{children}</WishlistContext.Provider>;
}

export function useWishlistContext() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlistContext deve ser usado dentro de WishlistProvider");
  }
  return ctx;
}
