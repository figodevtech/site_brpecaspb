import { withCardPaymentTerms } from "./card-payment-terms";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Product, ProductImage } from "@/lib/types";
import { getCategories } from "@/lib/catalog/categories";
import { getCatalogCollection, type CatalogCollectionSlug } from "@/lib/catalog/collections";

export async function getCatalogFilterOptions() {
  const brands = new Set<string>();
  let min = Infinity;
  let max = 0;
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabaseAdmin.from("produto")
      .select("fabricante, precovenda").eq("is_deleted", false).eq("visible", true).not("imgUrl", "is", null).not("imgUrl", "match", "^[[:space:]]*$")
      .order("id").range(offset, offset + 999);
    if (error) {
      console.error("Erro ao carregar opções do catálogo:", error);
      break;
    }
    for (const product of data || []) {
      if (product.fabricante?.trim()) brands.add(product.fabricante.trim());
      const price = Number(product.precovenda);
      if (Number.isFinite(price) && price > 0) {
        min = Math.min(min, price);
        max = Math.max(max, price);
      }
    }
    if (!data || data.length < 1000) break;
  }
  return { brands: [...brands].sort((a, b) => a.localeCompare(b, "pt-BR")), priceBounds: { min: Number.isFinite(min) ? Math.floor(min) : 0, max: Math.ceil(max) } };
}

export interface ProductFilters {
  query?: string;
  categoryId?: number;
  collection?: CatalogCollectionSlug;
  condition?: "NOVO" | "USADO" | "RECONDICIONADO" | "TODOS";
  manufacturer?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  inStockOnly?: boolean;
  sort?: "price_asc" | "price_desc" | "recent" | "name";
  limit?: number;
  offset?: number;
}

async function loadProducts(filters: ProductFilters = {}): Promise<{ products: Product[]; total: number }> {
  const {
    query,
    categoryId,
    collection,
    condition,
    manufacturer,
    minPrice,
    maxPrice,
    featured,
    inStockOnly = false,
    sort = "recent",
    limit = 24,
    offset = 0,
  } = filters;

  try {
    const selectedCollection = getCatalogCollection(collection);
    let collectionCategoryIds: number[] | undefined;
    if (selectedCollection) {
      const categories = await getCategories();
      collectionCategoryIds = categories
        .filter((category) => selectedCollection.categorySlugs.includes(category.slug))
        .map((category) => category.id);
      // Uma coleção sem categorias publicadas não deve mostrar o catálogo inteiro.
      if (collectionCategoryIds.length === 0) return { products: [], total: 0 };
    }

    let supabaseQuery = supabaseAdmin
      .from("produto")
      .select(
        `
        id,
        titulo,
        "tituloMarketplace",

        "descricaoMarketplace",
        precovenda,
        estoque,
        status_estoque,
        em_estoque,
        referencia,
        fabricante,
        grupo_produto_id,
        "imgUrl",
        conservacao,
        destaque,
        codigobarras,

        produtogrupo (
          id,
          nome
        )
      `,
        { count: "exact" }
      )
      .eq("is_deleted", false)
      .eq("visible", true).not("imgUrl", "is", null).not("imgUrl", "match", "^[[:space:]]*$");

    if (query && query.trim()) {
      const q = query.trim().replace(/[%_,().\\]/g, " ").slice(0, 160);
      supabaseQuery = supabaseQuery.or(
        `titulo.ilike.%${q}%,descricaoMarketplace.ilike.%${q}%,referencia.ilike.%${q}%,fabricante.ilike.%${q}%,codigobarras.ilike.%${q}%`
      );
    }

    if (categoryId) {
      supabaseQuery = supabaseQuery.eq("grupo_produto_id", categoryId);
    }

    if (collectionCategoryIds) {
      supabaseQuery = supabaseQuery.in("grupo_produto_id", collectionCategoryIds);
    }

    if (selectedCollection?.titleTerms) {
      supabaseQuery = supabaseQuery.or(
        selectedCollection.titleTerms.map((term) => `titulo.ilike.%${term}%`).join(",")
      );
    }

    if (condition && condition !== "TODOS") {
      supabaseQuery = supabaseQuery.eq("conservacao", condition);
    }

    if (manufacturer) {
      supabaseQuery = supabaseQuery.ilike("fabricante", `%${manufacturer}%`);
    }

    if (minPrice !== undefined && minPrice > 0) {
      supabaseQuery = supabaseQuery.gte("precovenda", minPrice);
    }

    if (maxPrice !== undefined && maxPrice > 0) {
      supabaseQuery = supabaseQuery.lte("precovenda", maxPrice);
    }

    if (featured) {
      supabaseQuery = supabaseQuery.eq("destaque", true);
    }

    if (inStockOnly) {
      supabaseQuery = supabaseQuery.gt("estoque", 0);
    }

    // Ordenação
    switch (sort) {
      case "price_asc":
        supabaseQuery = supabaseQuery.order("precovenda", { ascending: true });
        break;
      case "price_desc":
        supabaseQuery = supabaseQuery.order("precovenda", { ascending: false });
        break;
      case "name":
        supabaseQuery = supabaseQuery.order("titulo", { ascending: true });
        break;
      case "recent":
      default:
        supabaseQuery = supabaseQuery.order("id", { ascending: false });
        break;
    }

    supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

    const { data, count, error } = await supabaseQuery;

    if (error || !data) {
      console.error("Erro na busca de produtos:", error);
      return { products: [], total: 0 };
    }

    // Buscar imagens extras para os produtos encontrados
    const productIds = data.map((d) => d.id);
    let imagesByProduct: Record<number, ProductImage[]> = {};

    if (productIds.length > 0) {
      const { data: images } = await supabaseAdmin
        .from("produto_imagem")
        .select("id, produto_id, url, path, ordem")
        .in("produto_id", productIds)
        .order("ordem", { ascending: true });

      if (images) {
        imagesByProduct = images.reduce((acc, img) => {
          if (!acc[img.produto_id]) acc[img.produto_id] = [];
          acc[img.produto_id].push(img);
          return acc;
        }, {} as Record<number, ProductImage[]>);
      }
    }

    const mappedProducts: Product[] = data.map((item) => {
      const group = Array.isArray(item.produtogrupo) ? item.produtogrupo[0] : item.produtogrupo;
      const effectivePrice = Number(item.precovenda || 0);

      const isUsed = (item.conservacao || "USADO").toUpperCase() === "USADO";

      return {
        id: item.id,
        titulo: item.titulo,
        tituloMarketplace: item.tituloMarketplace,
        descricao: item.descricaoMarketplace,
        descricaoMarketplace: item.descricaoMarketplace,
        precovenda: effectivePrice,
        preco_site: effectivePrice,
        estoque: Number(item.estoque || 0),
        status_estoque: item.status_estoque || (item.estoque > 0 ? "OK" : "ESGOTADO"),
        em_estoque: item.em_estoque !== undefined ? Boolean(item.em_estoque) : item.estoque > 0,
        referencia: item.referencia,
        fabricante: item.fabricante,
        grupo_produto_id: item.grupo_produto_id,
        grupo_nome: group?.nome || null,
        imgUrl: item.imgUrl || (imagesByProduct[item.id]?.[0]?.url ?? null),
        conservacao: (item.conservacao as Product["conservacao"]) || "USADO",
        destaque: Boolean(item.destaque),
        codigobarras: item.codigobarras,
        
        garantia_dias: isUsed ? 90 : 180, // 90 dias garantia legal para peças usadas (CDC)
        imagens: imagesByProduct[item.id] || [],
        origem_veiculo: isUsed
          ? {
              testado_bancada: true,
              selo_qualidade: true,
            }
          : undefined,
      };
    });

    return { products: mappedProducts, total: count ?? mappedProducts.length };
  } catch (err) {
    console.error("Erro fatal em getProducts:", err);
    return { products: [], total: 0 };
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const { data: item, error } = await supabaseAdmin
      .from("produto")
      .select(
        `
        id,
        titulo,
        "tituloMarketplace",

        "descricaoMarketplace",
        precovenda,
        estoque,
        status_estoque,
        em_estoque,
        referencia,
        fabricante,
        grupo_produto_id,
        "imgUrl",
        conservacao,
        destaque,
        codigobarras,

        produtogrupo (
          id,
          nome
        )
      `
      )
      .eq("id", id)
      .eq("is_deleted", false)
      .eq("visible", true).not("imgUrl", "is", null).not("imgUrl", "match", "^[[:space:]]*$")
      .single();

    if (error || !item) {
      return null;
    }

    // Buscar imagens do produto
    const { data: images } = await supabaseAdmin
      .from("produto_imagem")
      .select("id, produto_id, url, path, ordem")
      .eq("produto_id", id)
      .order("ordem", { ascending: true });

    const effectivePrice = Number(item.precovenda || 0);

    const isUsed = (item.conservacao || "USADO").toUpperCase() === "USADO";

    return {
      id: item.id,
      titulo: item.titulo,
      tituloMarketplace: item.tituloMarketplace,
      descricao: item.descricaoMarketplace,
      descricaoMarketplace: item.descricaoMarketplace,
      precovenda: effectivePrice,
      preco_site: effectivePrice,
      estoque: Number(item.estoque || 0),
      status_estoque: item.status_estoque || (item.estoque > 0 ? "OK" : "ESGOTADO"),
      em_estoque: item.em_estoque !== undefined ? Boolean(item.em_estoque) : item.estoque > 0,
      referencia: item.referencia,
      fabricante: item.fabricante,
      grupo_produto_id: item.grupo_produto_id,
      grupo_nome: (Array.isArray(item.produtogrupo) ? item.produtogrupo[0] : item.produtogrupo)?.nome || null,
      imgUrl: item.imgUrl || images?.[0]?.url || null,
      conservacao: (item.conservacao as Product["conservacao"]) || "USADO",
      destaque: Boolean(item.destaque),
      codigobarras: item.codigobarras,
      
      garantia_dias: isUsed ? 90 : 180,
      imagens: images || [],
      origem_veiculo: isUsed
        ? {
            testado_bancada: true,
            selo_qualidade: true,
          }
        : undefined,
    };
  } catch (err) {
    console.error(`Erro ao buscar produto ${id}:`, err);
    return null;
  }
}

export async function getProducts(filters:ProductFilters={}){
 const result=await loadProducts(filters);
 return {...result,products:await withCardPaymentTerms(result.products,product=>product.preco_site??product.precovenda)};
}
