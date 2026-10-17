import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Flame, Wrench } from "lucide-react";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { VehicleSelectorWidget } from "@/components/home/VehicleSelectorWidget";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { DismantlingLegalSection } from "@/components/home/DismantlingLegalSection";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/catalog/products";
import { getCategories } from "@/lib/catalog/categories";
import { getVehicleFilterOptions } from "@/lib/catalog/vehicles";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 60; // ISR 60s

export default async function HomePage() {
  const [vehicleOptions, categories, featuredData, usedData] = await Promise.all([
    getVehicleFilterOptions(),
    getCategories(),
    getProducts({ limit: 8 }),
    getProducts({ limit: 8, condition: "USADO" }),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Carousel com fotos automotivas de alto impacto */}
      <HeroCarousel />

      {/* 2. Seletor Inteligente de Veículos */}
      <div className="bg-[#F4F6F9] border-b border-zinc-200">
        <VehicleSelectorWidget vehicleOptions={vehicleOptions} />
      </div>

      {/* 3. Vitrine de Categorias */}
      <CategoryShowcase categories={categories} />

      {/* 4. Vitrine: Produtos em Destaque */}
      <section className="py-14 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4" />
                Catálogo em Alta
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Peças em Destaque
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Estoque real para pronta-entrega ou retirada na loja em Cabedelo/PB.
              </p>
            </div>

            <Link
              href="/produtos"
              className="text-xs font-bold text-[#FF6B00] hover:text-[#E65A00] flex items-center gap-1 group"
            >
              <span>Ver todo o catálogo ({featuredData.total} itens)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredData.products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Seção de Controle de Qualidade & Testes em Bancada */}
      <DismantlingLegalSection />

      {/* 6. Vitrine: Peças Seminovas Originais */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 bg-orange-100 px-2 py-0.5 rounded border border-orange-200 uppercase tracking-wider mb-1">
                <Wrench className="w-3.5 h-3.5 text-[#FF6B00]" />
                Revisadas em Bancada
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Peças Seminovas Originais
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Peças originais testadas em bancada, com fotografias reais e 90 dias de garantia legal.
              </p>
            </div>

            <Link
              href="/produtos?condicao=USADO"
              className="text-xs font-bold text-[#FF6B00] hover:text-[#E65A00] flex items-center gap-1 group"
            >
              <span>Ver todas as peças seminovas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {usedData.products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

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
