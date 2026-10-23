import React from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts, getCatalogFilterOptions, ProductFilters } from "@/lib/catalog/products";
import { getCategories } from "@/lib/catalog/categories";
import { Filter } from "lucide-react";
import { CatalogFilters } from "@/components/product/CatalogFilters";
import { CatalogSort } from "@/components/product/CatalogSort";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface ProdutosPageProps {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    condicao?: "NOVO" | "USADO" | "RECONDICIONADO" | "TODOS";
    fabricante?: string;
    estoque?: string;
    sort?: "price_asc" | "price_desc" | "recent" | "name";
    min?: string;
    max?: string;
    page?: string;
  }>;
}

export default async function ProdutosPage({ searchParams }: ProdutosPageProps) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, Math.floor(Number(resolvedParams.page) || 1));
  const pageSize = 48;

  const categoryId = resolvedParams.categoria ? parseInt(resolvedParams.categoria, 10) : undefined;
  const minPrice = resolvedParams.min ? parseFloat(resolvedParams.min) : undefined;
  const maxPrice = resolvedParams.max ? parseFloat(resolvedParams.max) : undefined;

  const filters: ProductFilters = {
    query: resolvedParams.q,
    manufacturer: resolvedParams.fabricante,
    inStockOnly: resolvedParams.estoque === "disponivel",
    categoryId: isNaN(categoryId as number) ? undefined : categoryId,
    condition: resolvedParams.condicao,
    sort: resolvedParams.sort || "recent",
    minPrice,
    maxPrice,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };

  const [{ products, total }, categories, filterOptions] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getCatalogFilterOptions(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageUrl = (number: number) => {
    const params = new URLSearchParams(Object.entries(resolvedParams).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
    params.set("page", String(number));
    return `/produtos?${params}`;
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb e Título */}
        <div className="mb-6">
          <nav className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
            <Link href="/" className="hover:text-zinc-900">
              Início
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">Catálogo de Peças</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Catálogo de Peças Automotivas
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Mostrando <strong className="text-zinc-900">{products.length}</strong> de{" "}
                <strong className="text-zinc-900">{total}</strong> produtos disponíveis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CatalogFilters mobile categories={categories} {...filterOptions} total={total} />
              <CatalogSort value={resolvedParams.sort || "recent"} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-8 items-start">
          <aside className="hidden lg:block sticky top-40 max-h-[calc(100dvh-11rem)] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5">
            <CatalogFilters categories={categories} {...filterOptions} total={total} />
          </aside>

          {/* Grid de Produtos */}
          <main className="min-w-0">
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">
                  Nenhuma peça encontrada com estes filtros
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Tente limpar alguns filtros ou buscar pelo nome, marca ou código da peça.
                </p>
                <Link
                  href="/produtos"
                  className="mt-6 inline-flex px-5 py-2.5 rounded-xl bg-[#FF6B00] text-white text-xs font-bold shadow-md hover:bg-[#E65A00] transition-colors"
                >
                  Ver Todos os Produtos
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </main>
        </div>
        {totalPages > 1 && <Pagination className="mt-8" aria-label="Páginas do catálogo">
          <PaginationContent>
            {page > 1 && <PaginationItem><PaginationPrevious href={pageUrl(page - 1)} aria-label="Página anterior" /></PaginationItem>}
            {Array.from({ length: totalPages }, (_, index) => index + 1).filter(number => Math.abs(number - page) <= 2 || number === 1 || number === totalPages).map(number =>
              <PaginationItem key={number}><PaginationLink href={pageUrl(number)} isActive={page === number}>{number}</PaginationLink></PaginationItem>)}
            {page < totalPages && <PaginationItem><PaginationNext href={pageUrl(page + 1)} aria-label="Próxima página" /></PaginationItem>}
          </PaginationContent>
        </Pagination>}
      </div>
    </div>
  );
}
