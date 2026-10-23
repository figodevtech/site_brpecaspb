import React from "react";
import Link from "next/link";
import { ArrowRight, Cpu, SlidersHorizontal } from "lucide-react";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { DismantlingLegalSection } from "@/components/home/DismantlingLegalSection";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/catalog/products";
import { catalogCollections } from "@/lib/catalog/collections";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 60; // ISR 60s

export default async function HomePage() {
  const electronics = catalogCollections["modulos-paineis"];
  const trim = catalogCollections["acabamento-comandos"];
  const [electronicsData, trimData] = await Promise.all([
    getProducts({ collection: electronics.slug, inStockOnly: true, limit: 8 }),
    getProducts({ collection: trim.slug, inStockOnly: true, limit: 8 }),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Carousel com fotos automotivas de alto impacto */}
      <HeroCarousel />

      {/* 3. Vitrine de Categorias */}
      <CategoryShowcase />

      {/* 4. Vitrine: Módulos e Painéis Originais */}
      {electronicsData.products.length > 0 && <section className="py-14 bg-zinc-50 border-t border-zinc-200" aria-labelledby="electronics-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] uppercase tracking-wider mb-1">
                <Cpu className="w-4 h-4" />
                Eletrônica Automotiva
              </div>
              <h2 id="electronics-heading" className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                {electronics.title}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {electronics.description}
              </p>
            </div>

            <Link
              href={`/produtos?colecao=${electronics.slug}&estoque=disponivel`}
              className="text-xs font-bold text-[#FF6B00] hover:text-[#E65A00] flex items-center gap-1 group"
            >
              <span>Ver módulos e painéis ({electronicsData.total})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {electronicsData.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>}

      {/* 5. Seção de Controle de Qualidade & Testes em Bancada */}
      <DismantlingLegalSection />

      {/* 6. Vitrine: Acabamento e Comandos */}
      {trimData.products.length > 0 && <section className="py-16 bg-white" aria-labelledby="trim-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 bg-orange-100 px-2 py-0.5 rounded border border-orange-200 uppercase tracking-wider mb-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF6B00]" />
                Interior e Comandos
              </div>
              <h2 id="trim-heading" className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                {trim.title}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {trim.description}
              </p>
            </div>

            <Link
              href={`/produtos?colecao=${trim.slug}&estoque=disponivel`}
              className="text-xs font-bold text-[#FF6B00] hover:text-[#E65A00] flex items-center gap-1 group"
            >
              <span>Ver acabamento e comandos ({trimData.total})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trimData.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>}

      {/* 7. Banner Institucional de Retirada Presencial */}
      <section className="py-12 bg-[#12151D] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-black uppercase text-[#FF6B00] tracking-wider">
              Está na Paraíba?
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Compre Online e Retire Grátis na Loja Física
            </h3>
            <p className="text-xs text-zinc-400">
              {siteConfig.address.full} · Pronto para retirada em até 2 horas após a aprovação.
            </p>
          </div>

          <Link
            href="/produtos"
            className="px-6 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#E65A00] text-white text-xs font-bold shadow-lg glow-orange shrink-0 transition-transform active:scale-95"
          >
            Ver Catálogo com Retirada
          </Link>
        </div>
      </section>
    </div>
  );
}
