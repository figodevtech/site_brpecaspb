import React from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/catalog/products";
import { Search, ArrowLeft } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const { products, total } = await getProducts({ query, limit: 48 });

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <nav className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
            <Link href="/" className="hover:text-zinc-900">
              Início
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">Busca</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] uppercase tracking-wider mb-1">
                <Search className="w-3.5 h-3.5" />
                Resultado da Pesquisa
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                {query ? `Resultados para "${query}"` : "Todas as Peças"}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                {total} peças encontradas no catálogo
              </p>
            </div>

            <Link
              href="/produtos"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-lg bg-white border border-zinc-200 shadow-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver catálogo completo</span>
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
            <h3 className="text-lg font-bold text-zinc-900">
              Nenhuma peça encontrada para &quot;{query}&quot;
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Verifique a ortografia ou tente buscar pelo nome, marca, referência ou código da peça.
            </p>
            <Link
              href="/produtos"
              className="mt-6 inline-flex px-5 py-2.5 rounded-xl bg-[#FF6B00] text-white text-xs font-bold shadow-md hover:bg-[#E65A00] transition-colors"
            >
              Ver Todas as Peças
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
