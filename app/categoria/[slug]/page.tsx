import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { getProducts } from "@/lib/catalog/products";
import { getCategories, getCategoryBySlug } from "@/lib/catalog/categories";
import { ArrowLeft, Layers } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { products, total } = await getProducts({ categoryId: category.id, limit: 48 });

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
            <Link href="/" className="hover:text-zinc-900">
              Início
            </Link>
            <span>/</span>
            <Link href="/produtos" className="hover:text-zinc-900">
              Categorias
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">{category.nome}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] uppercase tracking-wider mb-1">
                <Layers className="w-3.5 h-3.5" />
                Departamento Especializado
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
                {category.nome}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                {total} produtos disponíveis nesta categoria com estoque real e procedência garantida.
              </p>
            </div>

            <Link
              href="/produtos"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-lg bg-white border border-zinc-200 shadow-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver todos os departamentos</span>
            </Link>
          </div>
        </div>

        {/* Lista de Produtos */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200">
            <h3 className="text-lg font-bold text-zinc-900">
              Nenhuma peça em estoque nesta categoria no momento
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Novas peças chegam semanalmente ao nosso catálogo testado e revisado.
            </p>
            <Link
              href="/produtos"
              className="mt-4 inline-flex px-5 py-2.5 rounded-xl bg-[#FF6B00] text-white text-xs font-bold shadow-md hover:bg-[#E65A00] transition-colors"
            >
              Explorar Outras Categorias
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
