import React from "react";
import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts, ProductFilters } from "@/lib/catalog/products";
import { getCategories } from "@/lib/catalog/categories";
import { getVehicleFilterOptions } from "@/lib/catalog/vehicles";
import { Filter, SlidersHorizontal, Car, X, Check } from "lucide-react";
import { CatalogSort } from "@/components/product/CatalogSort";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

interface ProdutosPageProps {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    condicao?: "NOVO" | "USADO" | "RECONDICIONADO" | "TODOS";
    montadora?: string;
    modelo?: string;
    ano?: string;
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
  const anoNum = resolvedParams.ano ? parseInt(resolvedParams.ano, 10) : undefined;
  const minPrice = resolvedParams.min ? parseFloat(resolvedParams.min) : undefined;
  const maxPrice = resolvedParams.max ? parseFloat(resolvedParams.max) : undefined;

  const filters: ProductFilters = {
    query: resolvedParams.q,
    categoryId: isNaN(categoryId as number) ? undefined : categoryId,
    condition: resolvedParams.condicao,
    montadora: resolvedParams.montadora,
    modelo: resolvedParams.modelo,
    ano: isNaN(anoNum as number) ? undefined : anoNum,
    sort: resolvedParams.sort || "recent",
    minPrice,
    maxPrice,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };

  const [{ products, total }, categories, vehicleOptions] = await Promise.all([
    getProducts(filters),
    getCategories(),
    getVehicleFilterOptions(),
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
            <CatalogSort value={resolvedParams.sort || "recent"} />
          </div>
        </div>

        {/* Layout Grid: Filtros Laterais + Grid de Produtos */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de Filtros */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <span className="text-sm font-black text-zinc-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#FF6B00]" />
                  Filtros Avançados
                </span>
                <Link
                  href="/produtos"
                  className="text-[11px] font-semibold text-zinc-500 hover:text-[#FF6B00]"
                >
                  Limpar Todos
                </Link>
              </div>

              {/* Filtro por Condição (Nova vs Seminova) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2.5">
                  Estado da Peça
                </h4>
                <div className="flex flex-col gap-1.5 text-xs">
                  <Link
                    href={`/produtos?${new URLSearchParams({ ...resolvedParams, condicao: "TODOS" }).toString()}`}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      !resolvedParams.condicao || resolvedParams.condicao === "TODOS"
                        ? "bg-[#FF6B00] text-white font-bold"
                        : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    Todas as Peças
                  </Link>
                  <Link
                    href={`/produtos?${new URLSearchParams({ ...resolvedParams, condicao: "USADO" }).toString()}`}
                    className={`px-3 py-2 rounded-lg font-medium flex items-center justify-between transition-colors ${
                      resolvedParams.condicao === "USADO"
                        ? "bg-[#0B0D12] text-[#FF6B00] font-bold border border-orange-500/50"
                        : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    <span>Peças Seminovas</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-100 text-orange-950 font-black">
                      Garantia
                    </span>
                  </Link>
                  <Link
                    href={`/produtos?${new URLSearchParams({ ...resolvedParams, condicao: "NOVO" }).toString()}`}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      resolvedParams.condicao === "NOVO"
                        ? "bg-emerald-700 text-white font-bold"
                        : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    Peças Novas (Originais)
                  </Link>
                </div>
              </div>

              {/* Categorias */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2.5">
                  Categorias
                </h4>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1 text-xs">
                  {categories.map((c) => {
                    const active = resolvedParams.categoria === String(c.id);
                    return (
                      <Link
                        key={c.id}
                        href={`/produtos?${new URLSearchParams({ ...resolvedParams, categoria: String(c.id) }).toString()}`}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                          active
                            ? "bg-orange-50 text-[#FF6B00] font-bold"
                            : "hover:bg-zinc-50 text-zinc-600"
                        }`}
                      >
                        <span>{c.nome}</span>
                        {active && <Check className="w-3.5 h-3.5 text-[#FF6B00]" />}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Filtro por Montadora de Veículo */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2.5 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#FF6B00]" />
                  Marca do Veículo
                </h4>
                <div className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1">
                  {vehicleOptions.map((v) => {
                    const active = resolvedParams.montadora === v.montadora;
                    return (
                      <Link
                        key={v.montadora}
                        href={`/produtos?${new URLSearchParams({
                          ...resolvedParams,
                          montadora: v.montadora,
                        }).toString()}`}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                          active
                            ? "bg-orange-50 text-[#FF6B00] font-bold"
                            : "hover:bg-zinc-50 text-zinc-600"
                        }`}
                      >
                        <span>{v.montadora}</span>
                        {active && <Check className="w-3.5 h-3.5 text-[#FF6B00]" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid de Produtos */}
          <main className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">
                  Nenhuma peça encontrada com estes filtros
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Tente limpar alguns filtros ou faça uma busca mais ampla pelo modelo do seu carro.
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
