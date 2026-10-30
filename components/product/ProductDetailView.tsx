"use client";

import type { CardPaymentPolicy } from "@/lib/card-payment-policies";
import React from "react";
import { ProductImageCarousel } from "./ProductImageCarousel";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  ShoppingCart,
  Heart,
  MessageCircle,
  FileCheck,
} from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCartContext } from "@/components/providers/CartProvider";
import { useWishlistContext } from "@/components/providers/WishlistProvider";
import { ProductPaymentTerms } from "./ProductPaymentTerms";
import { ShippingSimulator } from "./ShippingSimulator";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

interface ProductDetailViewProps {
  initialPaymentPolicy?:CardPaymentPolicy|null;
  product: Product;
}

export function ProductDetailView({ product,initialPaymentPolicy }: ProductDetailViewProps) {
  const { addItem } = useCartContext();
  const { isFavorite, toggleFavorite } = useWishlistContext();

  const price = product.preco_site ?? product.precovenda;
  const hasPrice = typeof price === "number" && price > 0;
  const isUsed = product.conservacao === "USADO";
  const favorited = isFavorite(product.id);
  const inStock = product.estoque > 0;

  const whatsappMessage = hasPrice
    ? `Olá! Tenho interesse no produto *${product.titulo}* (Código: #${product.id}, Valor: ${formatPrice(price)}). Poderiam tirar uma dúvida sobre compatibilidade e envio?`
    : `Olá! Tenho interesse no produto *${product.titulo}* (Código: #${product.id}). Gostaria de consultar o preço, condições e prazo de envio.`;
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="bg-[#F8F9FA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 mb-6 flex flex-wrap items-center gap-1.5">
          <Link href="/" className="hover:text-zinc-900">
            Início
          </Link>
          <span>/</span>
          <Link href="/produtos" className="hover:text-zinc-900">
            Catálogo
          </Link>
          {product.grupo_nome && (
            <>
              <span>/</span>
              <span className="hover:text-zinc-900">{product.grupo_nome}</span>
            </>
          )}
          <span>/</span>
          <span className="text-zinc-900 font-bold truncate max-w-xs">{product.titulo}</span>
        </nav>

        {/* Card Principal do Produto */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-10 mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Coluna da Galeria (5 colunas) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative rounded-2xl bg-white border border-zinc-200 shadow-inner">
                <ProductImageCarousel key={product.id} images={[product.imgUrl || "", ...(product.imagens || []).map(image => image.url)]} title={product.titulo} thumbnails />

                {/* Badges de Conservação */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                  {isUsed ? (
                    <span className="inline-flex items-center gap-1.5 bg-[#0B0D12] text-[#FF6B00] border border-orange-500/50 text-xs font-black px-3 py-1 rounded-md shadow-lg">
                      <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
                      PEÇA SEMINOVA ORIGINAL · TESTADA EM BANCADA
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-md shadow-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      PEÇA NOVA ORIGINAL
                    </span>
                  )}
                </div>

                {/* Botão de Favorito */}
                <Button type="button" variant="ghost" size="sm"
                  onClick={() => toggleFavorite(product.id)}
                  className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all ${
                    favorited
                      ? "bg-[#FF6B00] text-white shadow-lg"
                      : "bg-white/80 hover:bg-white text-zinc-700 shadow-sm"
                  }`}
                  title={favorited ? "Favoritado" : "Favoritar"}
                >
                  <Heart className={`w-5 h-5 ${favorited ? "fill-white" : ""}`} />
                </Button>
              </div>

              {/* Garantia e Procedência Box */}
              <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80 flex items-start gap-3">
                <FileCheck className="w-6 h-6 text-[#FF6B00] shrink-0 mt-0.5" />
                <div className="text-xs text-orange-950">
                  <h5 className="font-bold">Procedência & Qualidade Garantida</h5>
                  <p className="mt-0.5 text-zinc-700 leading-relaxed">
                    Item genuíno revisado e testado por técnicos especializados. Garantia legal de 90 dias com Nota Fiscal Eletrônica.
                  </p>
                </div>
              </div>
            </div>

            {/* Coluna de Informações e Compra (6 colunas) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                {/* Fabricante e Categoria */}
                <div className="flex items-center gap-3 text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">
                  <span>{product.grupo_nome || "Peça Automotiva"}</span>
                  {product.fabricante && (
                    <>
                      <span>•</span>
                      <span className="text-[#FF6B00] font-black">{product.fabricante}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>Cód: #{product.id}</span>
                </div>

                {/* Título Principal */}
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 leading-tight">
                  {product.titulo}
                </h1>

                {/* Referência e Códigos OEM */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {product.referencia && (
                    <span className="px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 text-xs font-mono font-medium border border-zinc-200">
                      OEM / Ref: <strong>{product.referencia}</strong>
                    </span>
                  )}
                  {product.codigobarras && (
                    <span className="px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 text-xs font-mono font-medium border border-zinc-200">
                      EAN: <strong>{product.codigobarras}</strong>
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Estoque Real: {product.estoque} unid.
                  </span>
                </div>

                {/* Bloco de Preço */}
                {hasPrice ? (
                  <div className="mt-6 p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-zinc-950">
                        {formatPrice(price)}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        à vista no Pix
                      </span>
                    </div>
                    <div className="mt-2"><ProductPaymentTerms productId={product.id} price={price} initialPolicy={initialPaymentPolicy}/></div>
                  </div>
                ) : (
                  <div className="mt-6 p-5 rounded-2xl bg-orange-50/60 border border-orange-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl sm:text-3xl font-black text-[#FF6B00]">
                        Consultar Preço
                      </span>
                      <span className="text-xs font-bold text-zinc-700 bg-white px-2 py-1 rounded-md border border-zinc-200 shadow-sm">
                        Sob consulta
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                      Esta peça possui cotação personalizada e condições especiais sob consulta direta com nossa equipe.
                    </p>
                  </div>
                )}

                {/* Botões de Ação Imediata */}
                <div className="mt-6 space-y-3">
                  {hasPrice ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        onClick={() => addItem(product)}
                        disabled={!inStock}
                        className="w-full h-12 bg-[#FF6B00] hover:bg-[#E65A00] text-white font-black text-sm rounded-xl shadow-lg glow-orange flex items-center justify-center gap-2 active:scale-95"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>{inStock ? "Comprar Agora" : "Produto Esgotado"}</span>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl border-emerald-600 shadow-md flex items-center justify-center gap-2"
                      >
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="w-4 h-4" />
                          <span>Falar no WhatsApp</span>
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Button
                        asChild
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95"
                      >
                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="w-5 h-5" />
                          <span>Consultar Preço no WhatsApp</span>
                        </a>
                      </Button>
                      <p className="text-center text-[11px] text-zinc-500 mt-2">
                        Atendimento ágil com fotos detalhadas, compatibilidade e cotação imediata.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-8"><ShippingSimulator productIds={[product.id]} prefillFromAccount/></div>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição Técnica Completa */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm mb-10">
          <h3 className="text-lg font-black text-zinc-950 mb-4">
            Descrição Técnica do Produto
          </h3>
          <div className="prose prose-zinc text-xs sm:text-sm text-zinc-700 leading-relaxed max-w-none space-y-3">
            <p>
              {product.descricaoMarketplace ||
                product.descricao ||
                "Peça automotiva original de procedência e qualidade inspecionada. Todas as peças elétricas e mecânicas são testadas individualmente antes da disponibilização para venda."}
            </p>
            <div className="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-bold text-zinc-900 block">Condição:</span>
                <span>{isUsed ? "Peça Seminova Original (Revisada em Bancada)" : "Peça Nova na Embalagem"}</span>
              </div>
              <div>
                <span className="font-bold text-zinc-900 block">Garantia:</span>
                <span>{product.garantia_dias || 90} dias contra defeitos de funcionamento</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
