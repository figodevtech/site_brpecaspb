import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductById } from "@/lib/catalog/products";
import { ProductDetailView } from "@/components/product/ProductDetailView";
import { siteConfig } from "@/lib/site-config";
import { formatPrice } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return { title: "Produto não encontrado" };

  const product = await getProductById(numId);
  if (!product) return { title: "Produto não encontrado" };

  const price = product.preco_site ?? product.precovenda;
  const hasPrice = typeof price === "number" && price > 0;
  const condition = product.conservacao === "USADO" ? "Peça Seminova Rastreável" : "Peça Nova";

  return {
    title: hasPrice ? `${product.titulo} - ${formatPrice(price)}` : `${product.titulo} - Consultar Preço`,
    description: `${condition} em Cabedelo/PB. ${product.descricaoMarketplace || product.descricao || product.titulo}. Envio para todo o Brasil ou retirada presencial.`,
    openGraph: {
      title: `${product.titulo} | ${siteConfig.name}`,
      description: hasPrice
        ? `R$ ${price} - Compre online na BR Peças PB com garantia e nota fiscal.`
        : `Preço sob consulta - Fale conosco na BR Peças PB com garantia e nota fiscal.`,
      images: product.imgUrl ? [{ url: product.imgUrl }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  if (isNaN(numId)) {
    notFound();
  }

  const product = await getProductById(numId);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
