"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Phone,
  ShieldCheck,
  Menu,
  X,
  Car,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useCartContext } from "@/components/providers/CartProvider";
import { useWishlistContext } from "@/components/providers/WishlistProvider";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

export function Header() {
  const router = useRouter();
  const { totalItems, setIsOpen } = useCartContext();
  const { totalFavorites } = useWishlistContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navCategories: { name: string; href: string; badge?: string }[] = [
    { name: "Painéis de Instrumentos", href: "/categoria/painel-de-instrumentos" },
    { name: "Módulos & Injeção", href: "/categoria/modulos" },
    { name: "Freios", href: "/categoria/freios" },
    { name: "Motores & Partes", href: "/categoria/motor" },
    { name: "Alternadores", href: "/categoria/alternadores" },
    { name: "Volantes", href: "/categoria/volantes" },
    { name: "Peças Seminovas", href: "/produtos?condicao=USADO" },
    { name: "Peças Novas", href: "/produtos?condicao=NOVO" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-[#0B0D12] text-white shadow-xl">
      {/* Topbar Institucional */}
      <div className="bg-[#141821] border-b border-white/10 text-xs py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="inline-flex items-center gap-1 font-semibold text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Qualidade Garantida
            </span>
            <span className="hidden md:inline text-zinc-400">
              Peças novas e seminovas testadas em bancada com nota fiscal e 90 dias de garantia.
            </span>
          </div>

          <div className="flex items-center gap-4 text-zinc-300">
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-orange-400 transition-colors flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5 text-orange-500" />
              <span>{siteConfig.phone}</span>
            </a>
            <span className="hidden lg:inline text-zinc-500">|</span>
            <span className="hidden lg:inline text-zinc-400">Cabedelo / João Pessoa - PB</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-orange-500/50 shadow-md group-hover:border-orange-400 transition-colors">
            <Image
              src="/brand/logo_br_symbol.png"
              alt="BR Peças PB"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight leading-none text-white">
              BR PEÇAS <span className="text-[#FF6B00]">PB</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-zinc-400 font-medium mt-0.5">
              Peças Novas e Seminovas
            </span>
          </div>
        </Link>

        {/* Busca Central */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-xl relative items-center"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar peça por nome, código OEM, referência ou modelo de carro..."
            className="w-full bg-[#181C26] text-white placeholder-zinc-400 text-sm pl-4 pr-12 py-2.5 rounded-lg border border-zinc-700/80 focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00] transition-all shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3.5 bg-[#FF6B00] hover:bg-[#E65A00] text-white rounded-md flex items-center justify-center transition-colors"
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Ações Rápidas (Veículo, Favoritos, Conta, Carrinho) */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/produtos"
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#202533] border border-zinc-700 text-xs font-medium text-zinc-200 hover:text-white transition-colors"
          >
            <Car className="w-4 h-4 text-[#FF6B00]" />
            <span>Buscar p/ Veículo</span>
          </Link>

          <Link
            href="/favoritos"
            className="relative p-2 text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Favoritos"
          >
            <Heart className="w-5 h-5" />
            {totalFavorites > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalFavorites}
              </span>
            )}
          </Link>

          <Link
            href="/conta"
            className="hidden sm:flex items-center gap-1.5 p-2 text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-xs font-medium"
            title="Minha Conta"
          >
            <User className="w-5 h-5" />
            <span className="hidden xl:inline">Conta</span>
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            className="relative flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E65A00] text-white px-3.5 py-2 rounded-lg font-semibold text-sm transition-all shadow-md active:scale-95"
            title="Carrinho de Compras"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Carrinho</span>
            {totalItems > 0 && (
              <span className="bg-black text-[#FF6B00] font-bold text-xs px-1.5 py-0.2 rounded-full border border-orange-400">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-300 hover:text-white rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar peça, código ou veículo..."
            className="w-full bg-[#181C26] text-white placeholder-zinc-400 text-sm pl-4 pr-11 py-2 rounded-lg border border-zinc-700 focus:border-[#FF6B00] focus:outline-none"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-[#FF6B00] text-white rounded-md"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Category Navigation Bar */}
      <div className="bg-[#12151D] border-t border-white/5 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 py-1.5 text-xs font-medium whitespace-nowrap">
          <Link
            href="/produtos"
            className="text-white hover:text-[#FF6B00] px-3 py-1.5 rounded hover:bg-white/5 flex items-center gap-1.5 font-semibold text-[#FF6B00]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Todas as Peças
          </Link>

          <span className="text-zinc-700">|</span>

          {navCategories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="text-zinc-300 hover:text-white px-3 py-1.5 rounded hover:bg-white/5 transition-colors flex items-center gap-1"
            >
              {cat.name}
              {cat.badge && (
                <span className="bg-[#FF6B00] text-black text-[9px] font-extrabold px-1 py-0.2 rounded-sm ml-0.5">
                  {cat.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#141821] border-t border-white/10 px-4 py-4 space-y-3">
          <Link
            href="/produtos"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-semibold text-orange-400 border-b border-white/5"
          >
            <Car className="w-4 h-4" /> Catálogo Completo por Veículo
          </Link>
          <div className="grid grid-cols-2 gap-2 text-sm text-zinc-300 pt-1">
            {navCategories.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1.5 hover:text-orange-400 text-xs"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-zinc-400">
            <Link href="/conta" onClick={() => setMobileMenuOpen(false)}>
              Minha Conta
            </Link>
            <Link href="/pedidos" onClick={() => setMobileMenuOpen(false)}>
              Meus Pedidos
            </Link>
            <Link href="/fale-conosco" onClick={() => setMobileMenuOpen(false)}>
              Fale Conosco
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
