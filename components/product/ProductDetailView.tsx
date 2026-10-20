"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Truck,
  Car,
  ShoppingCart,
  Heart,
  MessageCircle,
  FileCheck,
  AlertCircle,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Product, ShippingOption } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCartContext } from "@/components/providers/CartProvider";
import { useWishlistContext } from "@/components/providers/WishlistProvider";
import { calculateShipping } from "@/lib/shipping";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

interface ProductDetailViewProps {
  product: Product;
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addItem } = useCartContext();
  const { isFavorite, toggleFavorite } = useWishlistContext();

  // Imagens da galeria
  const allImages =
    product.imagens && product.imagens.length > 0
      ? product.imagens.map((img) => img.url)
      : product.imgUrl
      ? [product.imgUrl]
      : [];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Cálculo de Frete
  const [cepInput, setCepInput] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[] | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");

  const price = product.preco_site ?? product.precovenda;
  const hasPrice = typeof price === "number" && price > 0;
  const isUsed = product.conservacao === "USADO";
  const favorited = isFavorite(product.id);
  const inStock = product.estoque > 0;

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setShippingError("");
    const clean = cepInput.replace(/\D/g, "");
    if (clean.length !== 8) {
      setShippingError("Digite um CEP válido com 8 dígitos.");
      return;
    }
    setShippingLoading(true);
    try {
      const opts = await calculateShipping({ cep: clean, subtotal: price });
      setShippingOptions(opts);
    } catch (err) {
      setShippingError(err instanceof Error ? err.message : "Erro ao calcular frete.");
    } finally {
      setShippingLoading(false);
    }
  };

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
              {/* Foto Principal com Zoom (Proporção mais fina na altura 16:10) */}
              <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-white border border-zinc-200 shadow-inner group">
                {allImages.length > 0 ? (
                  <Image
                    src={allImages[activeImageIndex]}
                    alt={product.titulo}
                    fill
                    priority
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
                    Fotografia em processamento
                  </div>
                )}

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

              {/* Thumbnails da Galeria */}
              {allImages.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {allImages.map((imgUrl, idx) => (
                    <Button type="button" variant="ghost" size="sm"
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx
                          ? "border-[#FF6B00] shadow-md scale-95"
                          : "border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <Image
                        src={imgUrl}
                        alt={`${product.titulo} - Foto ${idx + 1}`}
                        fill
                        className="object-contain p-1"
                      />
                    </Button>
                  ))}
                </div>
              )}

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
                    <p className="text-xs text-zinc-600 mt-1">
                      ou em até <strong className="text-zinc-900">12x de {formatPrice(price / 12)}</strong> no cartão de crédito
                    </p>
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

                {/* Calculadora de Frete por CEP */}
                <div className="mt-8 pt-6 border-t border-zinc-200">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 mb-2 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#FF6B00]" />
                    Simular Frete e Prazo de Entrega
                  </h4>

                  <form onSubmit={handleCalculateShipping} className="flex gap-2 max-w-sm">
                    <Input
                      type="text"
                      value={cepInput}
                      onChange={(e) => setCepInput(e.target.value)}
                      placeholder="Digite seu CEP (ex: 58108-152)"
                      maxLength={9}
                      className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                    />
                    <Button
                      type="submit"
                      disabled={shippingLoading}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-4 rounded-xl"
                    >
                      {shippingLoading ? "Calculando..." : "Calcular"}
                    </Button>
                  </form>

                  {shippingError && (
                    <p className="text-xs text-red-600 mt-2 font-medium">{shippingError}</p>
                  )}

                  {shippingOptions && (
                    <div className="mt-3 space-y-2 border border-zinc-200 rounded-xl p-3 bg-zinc-50">
                      {shippingOptions.map((opt) => (
                        <div
                          key={opt.id}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-200/60 last:border-0"
                        >
                          <div>
                            <span className="font-bold text-zinc-900">{opt.nome}</span>
                            <p className="text-[11px] text-zinc-500">{opt.prazo}</p>
                          </div>
                          <span className="font-black text-zinc-900">
                            {opt.preco === 0 ? "GRÁTIS" : formatPrice(opt.preco)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 text-[11px] text-zinc-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Retirada grátis disponível na loja física em Cabedelo/PB.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compatibilidade Automotiva Confirmada */}
        {product.compatibilidades && product.compatibilidades.length > 0 && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Car className="w-5 h-5 text-[#FF6B00]" />
              <h3 className="text-lg font-black text-zinc-950">
                Veículos Compatíveis Confirmados
              </h3>
            </div>
            <p className="text-xs text-zinc-500 mb-4">
              Aplicação técnica validada para os seguintes modelos e anos:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {product.compatibilidades.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between"
                >
                  <div className="font-bold text-xs text-zinc-900">
                    {c.montadora} {c.modelo}
                  </div>
                  <div className="text-[11px] text-zinc-600 mt-1">
                    Anos: <strong>{c.ano_inicio} a {c.ano_fim}</strong>
                    {c.motor && ` · Motor ${c.motor}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

import { Input } from "@/components/ui/input";
