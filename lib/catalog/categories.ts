import { supabaseAdmin } from "@/lib/supabase/admin";
import { ProductCategory } from "@/lib/types";
import { slugify, formatCategoryName } from "@/lib/utils";

export async function getCategories(): Promise<ProductCategory[]> {
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

    // Obter contagem de produtos por categoria
    const { data: countData } = await supabaseAdmin
      .from("produto")
      .select("grupo_produto_id, count", { count: "exact" })
      .eq("is_deleted", false);

    // Mapear imagens ilustrativas das categorias
    const categoryImages: Record<string, string> = {
      "painel-de-instrumentos": "/images/categories/painel.png",
      "modulos": "/images/categories/modulos-v2.webp",
      "volantes": "/images/categories/volantes.jpg",
      "freios": "/images/categories/freios.jpg",
      "motor": "/images/categories/motor.png",
      "motor-de-partida": "/images/categories/motor-de-partida-v3.webp",
      "alternadores": "/images/categories/alternador-v2.webp",
    };

    return data.map((cat) => {
      const slug = slugify(cat.nome);
      return {
        id: cat.id,
        nome: formatCategoryName(cat.nome),
        descricao: cat.descricao,
        slug,
        imagem: categoryImages[slug] || "/images/categories/ferramentas.png",
      };
    });
  } catch (err) {
    console.error("Erro inesperado em getCategories:", err);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) || null;
}
