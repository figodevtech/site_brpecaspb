"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Heart,
  User,
  Phone,
  ShieldCheck,
  Menu,
  X,
  Car,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useCartContext } from "@/components/providers/CartProvider";
import { useWishlistContext } from "@/components/providers/WishlistProvider";
import { siteConfig } from "@/lib/site-config";
import { SearchField } from "@/components/layout/SearchField";
import type { ProductCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Header({ categories = [] }: { categories?: ProductCategory[] }) {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { totalItems, setIsOpen } = useCartContext();
  const { totalFavorites } = useWishlistContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navCategories: { name: string; href: string; badge?: string }[] = [
    ...categories.map(category => ({ name: category.nome, href: `/produtos?categoria=${category.id}` })),
    { name: "Peças Seminovas", href: "/produtos?condicao=USADO" },
    { name: "Peças Novas", href: "/produtos?condicao=NOVO" },
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-[#0B0D12] text-white shadow-xl">
      {/* Topbar Institucional */}
      <div className="hidden sm:block bg-[#141821] border-b border-white/10 text-xs py-2 px-4 sm:px-6">
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex min-w-0 items-center justify-between gap-2 lg:gap-4">
        {/* Logo */}
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3 shrink-0 group">
          <div className="relative size-9 sm:size-11 shrink-0 rounded-lg overflow-hidden border border-orange-500/50 shadow-md group-hover:border-orange-400 transition-colors">
            <Image
              src="/brand/logo_br_symbol.png"
              alt="BR Peças PB"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="whitespace-nowrap font-extrabold text-base sm:text-xl tracking-tight leading-none text-white">
              BR PEÇAS <span className="text-[#FF6B00]">PB</span>
            </span>
            <span className="hidden sm:block text-[10px] tracking-wider uppercase text-zinc-400 font-medium mt-0.5">
              Peças Novas e Seminovas
            </span>
          </div>
        </Link>

        {/* Busca Central */}
        <form
          onSubmit={handleSearch}
          role="search" aria-label="Busca no catálogo"
          className="hidden lg:block min-w-0 flex-1 max-w-xl"
        >
          <SearchField id="header-search-desktop" value={searchQuery} onChange={setSearchQuery} />
        </form>

        {/* Ações Rápidas (Veículo, Favoritos, Conta, Carrinho) */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2 xl:gap-3">
          <Link
            href="/produtos"
            className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181C26] hover:bg-[#202533] border border-zinc-700 text-xs font-medium text-zinc-200 hover:text-white transition-colors"
          >
            <Car className="w-4 h-4 text-[#FF6B00]" />
            <span>Buscar p/ Veículo</span>
          </Link>

          <Link
            href="/favoritos"
            className="hidden sm:block relative p-2 text-zinc-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Favoritos"
          >
            <Heart className="w-5 h-5" />
            {totalFavorites > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalFavorites}
              </span>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:flex text-zinc-300 hover:text-white hover:bg-white/5" aria-label="Minha conta">
                <User className="w-5 h-5" /><span className="hidden xl:inline">{user ? "Minha conta" : "Entrar"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{profile?.nomerazaosocial || "Área do cliente"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user ? <>
                <DropdownMenuItem asChild><Link href="/conta">Meu perfil</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/pedidos">Meus pedidos</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/enderecos">Meus endereços</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/favoritos">Favoritos</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/conta/cartoes">Cartões salvos</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/conta/seguranca">Segurança</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void signOut()}>Sair</DropdownMenuItem>
              </> : <>
                <DropdownMenuItem asChild><Link href="/login?redirect=/conta">Entrar na minha conta</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/registro">Criar conta</Link></DropdownMenuItem>
              </>}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button type="button" variant="ghost" size="sm"
            onClick={() => setIsOpen(true)}
            className="relative h-10 flex items-center gap-1.5 bg-[#FF6B00] hover:bg-[#E65A00] text-white px-2.5 sm:px-3.5 rounded-lg font-semibold text-sm transition-all shadow-md active:scale-95"
            title="Carrinho de Compras"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Carrinho</span>
            {totalItems > 0 && (
              <span className="bg-black text-[#FF6B00] font-bold text-xs px-1.5 py-0.2 rounded-full border border-orange-400">
                {totalItems}
              </span>
            )}
          </Button>

          {/* Mobile menu toggle */}
          <Button type="button" variant="ghost" size="sm"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setCategoriesExpanded(false);
            }}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={mobileMenuOpen} aria-controls="mobile-menu"
            className="lg:hidden size-10 p-2 text-zinc-300 hover:text-white rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden px-3 sm:px-6 pb-3">
        <form onSubmit={handleSearch} role="search" aria-label="Busca no catálogo móvel">
          <SearchField id="header-search-mobile" value={searchQuery} onChange={setSearchQuery} />
        </form>
      </div>

      {/* Category Navigation Bar */}
      <nav aria-label="Categorias de produtos" className="relative bg-[#12151D] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 py-1.5 text-xs font-medium">
          <div className="min-w-0 flex-1">
            <div className="grid grid-cols-2 items-center gap-1 md:grid-cols-4 xl:grid-cols-5">
              <Link
                href="/produtos"
                onClick={() => setCategoriesExpanded(false)}
                className="flex min-w-0 items-center gap-1.5 whitespace-nowrap rounded px-2 py-1.5 font-semibold text-[#FF6B00] hover:bg-white/5"
              >
                <Sparkles className="size-3.5 shrink-0" />
                <span className="truncate">Todas as Peças</span>
              </Link>

              {navCategories.slice(0,4).map((cat,index) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={() => setCategoriesExpanded(false)}
                  title={cat.name}
                  className={`min-w-0 items-center gap-1 rounded px-2 py-1.5 text-zinc-300 transition-colors hover:bg-white/5 hover:text-white ${index===0?'flex':index<3?'hidden md:flex':'hidden xl:flex'}`}
                >
                  <span className="truncate">{cat.name}</span>
                  {cat.badge && (
                    <span className="bg-[#FF6B00] text-black text-[9px] font-extrabold px-1 py-0.2 rounded-sm ml-0.5">
                      {cat.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            type="button"
            aria-expanded={categoriesExpanded}
            aria-controls="header-all-categories"
            aria-label={categoriesExpanded ? "Recolher categorias" : "Mostrar todas as categorias"}
            onClick={() => {
              setCategoriesExpanded(!categoriesExpanded);
              setMobileMenuOpen(false);
            }}
            className="flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-orange-500/30 bg-orange-500/10 px-2.5 font-semibold text-orange-400 transition-colors hover:bg-orange-500/20 hover:text-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            {categoriesExpanded ? "Recolher" : "Ver todas"}
            <ChevronDown aria-hidden="true" className={`size-3.5 transition-transform motion-reduce:transition-none ${categoriesExpanded ? "rotate-180" : ""}`} />
          </Button>
        </div>
        <div id="header-all-categories" hidden={!categoriesExpanded} className="absolute inset-x-0 top-full z-50 border-y border-white/10 bg-[#12151D] shadow-2xl">
          <div className="max-w-7xl mx-auto max-h-[50svh] overflow-y-auto px-4 py-4 sm:px-6">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {navCategories.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  onClick={() => setCategoriesExpanded(false)}
                  className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-3 text-xs font-medium text-zinc-300 transition-colors hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="lg:hidden max-h-[60svh] overflow-y-auto bg-[#141821] border-t border-white/10 px-4 py-4 space-y-3">
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

