import { supabaseAdmin } from "@/lib/supabase/admin";
import { ProductCategory } from "@/lib/types";
import { slugify, formatCategoryName } from "@/lib/utils";
import { cache } from "react";

export const getCategories = cache(async (): Promise<ProductCategory[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from("produtogrupo")
      .select("id, nome, descricao, ativo")
      .eq("ativo", true)
      .order("nome", { ascending: true });

    if (error || !data) {
      console.error("Erro ao buscar categorias:", error);
      return [];
    }

    const catalog = new Map<number, { count: number; image: string | null }>();
    for (let offset = 0; ; offset += 1000) {
      const { data: products, error: productsError } = await supabaseAdmin
        .from("produto")
        .select("grupo_produto_id, imgUrl")
        .eq("visible", true)
        .not("imgUrl", "is", null)
        .not("imgUrl", "match", "^[[:space:]]*$")
        .eq("is_deleted", false)
        .order("id", { ascending: false })
        .range(offset, offset + 999);
      if (productsError) throw productsError;
      for (const product of products || []) {
        if (!product.grupo_produto_id) continue;
        const group = catalog.get(product.grupo_produto_id) || { count: 0, image: null };
        group.count += 1;
        if (!group.image && product.imgUrl) group.image = product.imgUrl;
        catalog.set(product.grupo_produto_id, group);
      }
      if (!products || products.length < 1000) break;
    }

    return data.filter(cat => catalog.has(cat.id)).map((cat) => {
      const slug = slugify(cat.nome);
      return {
        id: cat.id,
        nome: formatCategoryName(cat.nome),
        descricao: cat.descricao,
        slug,
        imagem: catalog.get(cat.id)?.image || null,
      };
    });
  } catch (err) {
    console.error("Erro inesperado em getCategories:", err);
    return [];
  }
});

export async function getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) || null;
}
