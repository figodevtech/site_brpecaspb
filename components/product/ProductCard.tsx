"use client";

import React from "react";
import { ProductCardPaymentTerms } from "./ProductCardPaymentTerms";
import { ProductImageCarousel } from "./ProductImageCarousel";
import Link from "next/link";
import { ShoppingCart, Heart, ShieldCheck, Check, AlertTriangle, MessageCircle, Eye } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCartContext } from "@/components/providers/CartProvider";
import { useWishlistContext } from "@/components/providers/WishlistProvider";
import { siteConfig } from "@/lib/site-config";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartContext();
  const { isFavorite, toggleFavorite } = useWishlistContext();

  const price = product.preco_site ?? product.precovenda;
  const hasPrice = typeof price === "number" && price > 0;
  const isUsed = product.conservacao === "USADO";
  const favorited = isFavorite(product.id);
  const inStock = product.estoque > 0;
  const isCriticalStock = inStock && product.estoque <= 2;

  const whatsappMessage = hasPrice
    ? `Olá! Vi no site o produto *${product.titulo}* (Cód: #${product.id}, R$ ${price}) e gostaria de confirmar compatibilidade e disponibilidade.`
    : `Olá! Vi no site o produto *${product.titulo}* (Cód: #${product.id}) e gostaria de consultar o valor e disponibilidade.`;
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="group relative flex flex-col bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Imagem do Produto (Proporção mais fina na altura 16:10 com encaixe perfeito) */}
      <div className="relative aspect-16/10 w-full bg-white overflow-hidden border-b border-zinc-100 flex items-center justify-center">
        <ProductImageCarousel key={product.id} images={[product.imgUrl || "", ...(product.imagens || []).map(image => image.url)]} title={product.titulo} href={`/produto/${product.id}`} />

        {/* Badges no Topo */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none flex flex-col gap-1 items-start">
          {isUsed ? (
            <span className="inline-flex items-center gap-1 bg-[#0B0D12] text-[#FF6B00] border border-orange-500/40 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm">
              <ShieldCheck className="w-3 h-3 text-[#FF6B00]" />
              PEÇA SEMINOVA
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm">
              <Check className="w-3 h-3" />
              PEÇA NOVA
            </span>
          )}

          {isCriticalStock && (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
              <AlertTriangle className="w-2.5 h-2.5" />
              ÚLTIMA(S) {product.estoque} UNID.
            </span>
          )}
        </div>

        {/* Botão de Favorito */}
        <Button type="button" variant="ghost" size="sm"
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(product.id);
          }}
          className={`absolute top-2 right-2 z-20 p-1.5 rounded-full backdrop-blur-md transition-all ${
            favorited
              ? "bg-[#FF6B00] text-white shadow-md"
              : "bg-white/80 hover:bg-white text-zinc-700 shadow-sm"
          }`}
          title={favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart className={`w-4 h-4 ${favorited ? "fill-white" : ""}`} />
        </Button>
      </div>

      {/* Conteúdo / Detalhes */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Categoria / Fabricante */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 uppercase font-semibold tracking-wider mb-1">
            <span>{product.grupo_nome || "Peças"}</span>
            {product.fabricante && <span className="text-zinc-700 font-bold">{product.fabricante}</span>}
          </div>

          {/* Título com Link */}
          <Link href={`/produto/${product.id}`} className="block group-hover:text-[#FF6B00] transition-colors">
            <h3 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug">
              {product.titulo}
            </h3>
          </Link>

          {/* Código Referência */}
          {product.referencia && (
            <p className="text-[11px] text-zinc-400 mt-1 font-mono">
              Ref: <span className="text-zinc-600">{product.referencia}</span>
            </p>
          )}
        </div>

        {/* Preço e CTAs */}
        <div className="mt-4 pt-3 border-t border-zinc-100 flex flex-col gap-3">
          {hasPrice ? (
            <div>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-lg font-black text-zinc-950">
                  {formatPrice(price)}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                  à vista no Pix
                </span>
              </div>
              <ProductCardPaymentTerms productId={Number(product.id)} price={price} initialQuote={product.cardPaymentTerms}/>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-[#FF6B00]">
                  Consultar Preço
                </span>
                <span className="text-[10px] text-zinc-600 font-bold bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                  Sob consulta
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Consulte condições e envio rápido
              </p>
            </div>
          )}

          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {hasPrice ? (
              <Button type="button" variant="ghost" size="sm"
                onClick={() => addItem(product)}
                disabled={!inStock}
                className="col-span-4 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FF6B00] hover:bg-[#E65A00] disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold text-xs rounded-lg transition-colors shadow-sm active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{inStock ? "Comprar Agora" : "Sem Estoque"}</span>
              </Button>
            ) : (
              <Link
                href={`/produto/${product.id}`}
                className="col-span-4 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#0B0D12] hover:bg-[#FF6B00] text-white font-bold text-xs rounded-lg transition-colors shadow-sm active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 text-zinc-300" />
                <span>Ver Produto</span>
              </Link>
            )}

            {/* Botão WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-1 flex items-center justify-center p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
              title={hasPrice ? "Tirar dúvida no WhatsApp" : "Consultar preço no WhatsApp"}
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
