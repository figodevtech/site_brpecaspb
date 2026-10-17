import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layers } from "lucide-react";
import type { ProductCategory } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CategoryShowcaseProps {
  categories: ProductCategory[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
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
                key={cat.id}
                className="basis-[128px] pl-4 sm:basis-[156px] sm:pl-6 lg:basis-[168px]"
              >
                <Link
                  href={`/produtos?categoria=${cat.id}`}
                  className="group flex flex-col items-center gap-4 rounded-lg px-1 py-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-inset"
                >
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-full border border-zinc-200/70 bg-white shadow-sm transition-all duration-300 group-hover:border-[#FF6B00] group-hover:shadow-md sm:size-28 lg:size-32">
                    <Image
                      src={cat.imagem || "/images/categories/ferramentas.png"}
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
