"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useWishlistContext } from "@/components/providers/WishlistProvider";
import { ProductCard } from "@/components/product/ProductCard";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { AccountShell } from "@/components/account/AccountShell";
import { useAuth } from "@/components/providers/AuthContext";
import { useRouter } from "next/navigation";

export default function FavoritosPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { favoriteIds, clearWishlist, totalFavorites, isLoaded } = useWishlistContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadedIds, setLoadedIds] = useState("");
  const idsKey = favoriteIds.join(",");
  const loading = favoriteIds.length > 0 && loadedIds !== idsKey;

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?redirect=/favoritos");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!isLoaded) return;

    if (favoriteIds.length === 0) return;

    const controller = new AbortController();
    fetch(`/api/favoritos?ids=${favoriteIds.join(",")}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.products) {
          setProducts(data.products);
          setLoadedIds(idsKey);
        }
      })
      .catch((err) => { if (!controller.signal.aborted) { console.error("Erro ao carregar favoritos:", err); setLoadedIds(idsKey); } });
    return () => controller.abort();
  }, [favoriteIds, idsKey, isLoaded]);

  if (authLoading || !user) return <div role="status" className="container mx-auto p-8">Carregando sua conta...</div>;

  return (
    <AccountShell>
    <div className="bg-[#F8F9FA] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-zinc-900">
            Início
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Meus Favoritos</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-zinc-200 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
              <Heart className="w-7 h-7 text-[#FF6B00] fill-[#FF6B00]" />
              Lista de Desejos / Favoritos
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Peças automotivas salvas para sua cotação ou compra posterior.
            </p>
          </div>

          {totalFavorites > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearWishlist}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Limpar Todos os Favoritos
            </Button>
          )}
        </div>

        {/* Conteúdo */}
        {(!isLoaded || (loading && totalFavorites > 0)) ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center p-8">
            <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-zinc-500 text-xs">Carregando seus produtos favoritos...</p>
          </div>
        ) : totalFavorites === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm my-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto border border-orange-100">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-black text-zinc-900">Sua lista está vazia</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Você ainda não adicionou nenhuma peça aos seus favoritos. Navegue pelo catálogo e clique no ícone de coração para salvar itens.
            </p>
            <Button asChild className="bg-[#FF6B00] hover:bg-[#E65A00] text-white font-bold text-xs rounded-xl shadow-md glow-orange">
              <Link href="/produtos">
                <ShoppingBag className="w-4 h-4 mr-1.5" />
                Explorar Catálogo de Peças
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 min-[440px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {products.filter(product => favoriteIds.includes(product.id)).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
    </AccountShell>
  );
}
