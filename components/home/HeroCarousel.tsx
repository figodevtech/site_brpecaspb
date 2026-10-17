"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Truck,
  Sparkles,
  Phone,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

const banners = [
  {
    id: 1,
    image: "/banners/hero-catalogo-v2.webp",
    tag: "CATÁLOGO OFICIAL 2026",
    title: "Peças Automotivas Originais",
    highlight: "Novas & Seminovas com Garantia Real",
    description:
      "Mais de 40 categorias com estoque real verificado para pronta-entrega. Painéis digitais, módulos, motores, alternadores e freios.",
    ctaText: "Explorar Catálogo",
    ctaLink: "/produtos",
    secondaryText: "Peças Seminovas",
    secondaryLink: "/produtos?condicao=USADO",
  },
  {
    id: 2,
    image: "/banners/hero-bancada-v2.webp",
    tag: "PROCEDÊNCIA & QUALIDADE",
    title: "Peças Testadas em Bancada",
    highlight: "Garantia de 90 Dias & Nota Fiscal",
    description:
      "Rigorosa inspeção técnica e testes de bancada em componentes eletrônicos, mecânicos e estruturais. Peças prontas para instalação imediata.",
    ctaText: "Ver Peças Seminovas",
    ctaLink: "/produtos?condicao=USADO",
    secondaryText: "WhatsApp Oficial",
    secondaryLink: `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
      siteConfig.whatsappDefaultMessage
    )}`,
  },
  {
    id: 3,
    image: "/banners/hero-entrega-v2.webp",
    tag: "ENVIO BRASIL & RETIRADA NA LOJA",
    title: "Entrega Rápida e Segura",
    highlight: "Retirada em até 2h em Cabedelo/PB",
    description:
      "Frete expresso para todo o Brasil e transportadoras para cargas pesadas paletizadas. Retirada gratuita na loja física.",
    ctaText: "Ver Peças com Retirada",
    ctaLink: "/produtos",
    secondaryText: "Garantia & Trocas",
    secondaryLink: "/trocas-e-devolucoes",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, []);

  // Slide automático a cada 5.5s com pausa ao passar o mouse
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Gestos de toque (touch swipe) no mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div
      className="relative w-full bg-[#0B0D12] overflow-hidden select-none border-b border-zinc-800/40"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Trilho de Slides Horizontal (Proporção Retangular 16:5 compacta com metade da altura) */}
      <div
        className="flex w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner, index) => {
          const isActive = index === current;
          return (
            <div
              key={banner.id}
              className="w-full shrink-0 relative h-[260px] sm:h-[300px] md:h-[330px] lg:h-[360px] xl:h-[380px] overflow-hidden"
            >
              {/* Arte panorâmica inteira no desktop e recorte à direita no mobile */}
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                sizes="100vw"
                priority={index === 0}
                className={`origin-right object-cover object-[72%_center] lg:object-contain lg:object-right transition-transform duration-1000 ${
                  isActive ? "scale-105" : "scale-100"
                }`}
              />

              {/* Camadas de Gradiente Escurecido e Iluminação Automotiva */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D12]/95 via-[#0B0D12]/60 to-[#0B0D12]/15 lg:via-[#0B0D12]/20 lg:to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D12]/45 via-transparent to-[#0B0D12]/10 z-10" />

              {/* Conteúdo textual do Slide (otimizado para altura retangular compacta) */}
              <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-center pb-6 sm:pb-4">
                <div
                  className={`max-w-2xl space-y-2 sm:space-y-3 transition-all duration-700 ${
                    isActive
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-8"
                  }`}
                >
                  {/* Tag / Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-950/80 border border-[#FF6B00]/40 text-[#FF6B00] text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase backdrop-blur-sm">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{banner.tag}</span>
                  </div>

                  {/* Título Principal */}
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                    {banner.title} —{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-orange-400 to-amber-300">
                      {banner.highlight}
                    </span>
                  </h1>

                  {/* Descrição Compacta */}
                  <p className="text-xs sm:text-sm text-zinc-300 max-w-xl line-clamp-2 leading-relaxed">
                    {banner.description}
                  </p>

                  {/* Botões de Ação (CTAs) */}
                  <div className="pt-1 flex flex-wrap items-center gap-2.5">
                    <Button
                      asChild
                      className="bg-[#FF6B00] hover:bg-[#E65A00] text-white font-black text-xs h-9 sm:h-10 px-4 sm:px-5 rounded-lg shadow-md glow-orange flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <Link href={banner.ctaLink}>
                        <span>{banner.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="bg-zinc-900/80 hover:bg-zinc-800 text-zinc-100 border-zinc-700 font-bold text-xs h-9 sm:h-10 px-4 rounded-lg backdrop-blur-md"
                    >
                      <Link href={banner.secondaryLink}>
                        <span>{banner.secondaryText}</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Setas de Navegação Laterais Compactas */}
      <button
        onClick={prevSlide}
        aria-label="Slide Anterior"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-[#FF6B00] text-white border border-white/20 transition-all backdrop-blur-sm active:scale-95 hover:scale-105"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Próximo Slide"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-[#FF6B00] text-white border border-white/20 transition-all backdrop-blur-sm active:scale-95 hover:scale-105"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Indicadores / Paginação dos Slides com Barra de Progresso */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Ir para o slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === current ? "w-6 bg-[#FF6B00]" : "w-2 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
