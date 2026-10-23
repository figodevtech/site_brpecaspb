import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layers } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Curadoria fixa da vitrine: nomes, buscas e imagens locais independem do banco.
const categories = [
  { nome: "Painel de Instrumentos", busca: "painel", imagem: "/images/categories/painel-v2.webp" },
  { nome: "Módulos", busca: "modulo", imagem: "/images/categories/modulos-v2.webp" },
  { nome: "Volantes", busca: "volante", imagem: "/images/categories/volantes.jpg" },
  { nome: "Freios", busca: "freio", imagem: "/images/categories/freios.jpg" },
  { nome: "Motor", busca: "motor", imagem: "/images/categories/motor-v2.webp" },
  { nome: "Motor de Partida", busca: "motor de partida", imagem: "/images/categories/motor-de-partida-v3.webp" },
  { nome: "Alternadores", busca: "alternador", imagem: "/images/categories/alternador-v2.webp" },
  // { nome: "Filtros de Óleo", busca: "filtro de óleo", imagem: "/images/categories/filtros-de-oleo-v2.webp" },
  // { nome: "Filtros de Ar", busca: "filtro de ar", imagem: "/images/categories/filtros-de-ar-v2.webp" },
  // { nome: "Filtros de Combustível", busca: "combustível", imagem: "/images/categories/filtros-de-combustivel-v2.webp" },
  // { nome: "Óleos e Lubrificantes", busca: "oleo", imagem: "/images/categories/oleos-lubrificantes-v2.webp" },
  // { nome: "Arrefecimento", busca: "radiador", imagem: "/images/categories/arrefecimento-v2.webp" },
  { nome: "Molduras", busca: "moldura", imagem: "/images/categories/molduras-v2.webp" },
  { nome: "Botões e Comandos", busca: "botao", imagem: "/images/categories/botoes-comandos-v2.webp" },
  { nome: "Pedais", busca: "pedal", imagem: "/images/categories/pedais-v2.webp" },
] as const;

export function CategoryShowcase() {
  return (
    <section className="bg-zinc-50 py-12 sm:py-14" aria-labelledby="categories-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              Navegação por Departamento
            </div>
            <h2 id="categories-heading" className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              Principais Categorias Automotivas
            </h2>
          </div>
          <Link
            href="/produtos"
            className="text-xs font-bold text-[#FF6B00] hover:text-[#E65A00] flex items-center gap-1 group"
          >
            <span>Ver todas as categorias</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <Carousel
          opts={{ align: "start", slidesToScroll: "auto" }}
          aria-label="Categorias automotivas"
          className="px-10 sm:px-12"
        >
          <CarouselContent className="-ml-4 sm:-ml-6">
            {categories.map((cat) => (
              <CarouselItem
                key={cat.busca}
                className="basis-[128px] pl-4 sm:basis-[156px] sm:pl-6 lg:basis-[168px]"
              >
                <Link
                  href={`/produtos?${new URLSearchParams({ q: cat.busca })}`}
                  className="group flex flex-col items-center gap-4 rounded-lg px-1 py-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-inset"
                >
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-full border border-zinc-200/70 bg-white shadow-sm transition-all duration-300 group-hover:border-[#FF6B00] group-hover:shadow-md sm:size-28 lg:size-32">
                    <Image
                      src={cat.imagem}
                      alt={cat.nome}
                      fill
                      sizes="(min-width: 1024px) 128px, (min-width: 640px) 112px, 96px"
                      className="object-contain p-4 transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                    />
                  </div>
                  <h3 className="min-h-10 text-xs font-semibold leading-5 text-zinc-800 transition-colors group-hover:text-[#FF6B00] sm:text-sm">
                    {cat.nome}
                  </h3>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious
            aria-label="Categorias anteriores"
            className="top-14 left-0 size-9 border-zinc-200 bg-white text-zinc-700 shadow-sm hover:border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white disabled:opacity-30 sm:top-16 lg:top-18"
          />
          <CarouselNext
            aria-label="Próximas categorias"
            className="top-14 right-0 size-9 border-zinc-200 bg-white text-zinc-700 shadow-sm hover:border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white disabled:opacity-30 sm:top-16 lg:top-18"
          />
        </Carousel>
      </div>
    </section>
  );
}
