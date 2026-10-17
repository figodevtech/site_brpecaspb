import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCategories } from "@/lib/catalog/categories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://brpecaspb.com.br";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/produtos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${baseUrl}/trocas-e-devolucoes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/fale-conosco`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/politica-de-privacidade`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/termos-de-uso`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Rotas de Categorias
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategories();
    categoryRoutes = categories.map((cat) => ({
      url: `${baseUrl}/categoria/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    console.error("Erro ao gerar sitemap de categorias:", err);
  }

  // Rotas Dinâmicas de Produtos
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: prods } = await supabaseAdmin
      .from("produto")
      .select("id, updatedat")
      .limit(500);

    if (prods) {
      productRoutes = prods.map((p) => ({
        url: `${baseUrl}/produto/${p.id}`,
        lastModified: p.updatedat ? new Date(p.updatedat) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }
  } catch (err) {
    console.error("Erro ao gerar sitemap de produtos:", err);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
