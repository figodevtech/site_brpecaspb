export type CatalogCollectionSlug = "modulos-paineis" | "acabamento-comandos";

interface CatalogCollection {
  slug: CatalogCollectionSlug;
  title: string;
  description: string;
  categorySlugs: readonly string[];
  titleTerms?: readonly string[];
}

export const catalogCollections: Record<CatalogCollectionSlug, CatalogCollection> = {
  "modulos-paineis": {
    slug: "modulos-paineis",
    title: "Módulos e Painéis Originais",
    description: "Módulos eletrônicos e painéis de instrumentos para reposição, com procedência e garantia.",
    categorySlugs: ["modulos", "modulo", "painel-de-instrumentos", "paineis-de-instrumentos"],
    // O ERP também cadastra botões e caixas de fusíveis no grupo de módulos.
    titleTerms: ["modul", "módul", "painel", "paineis", "painéis"],
  },
  "acabamento-comandos": {
    slug: "acabamento-comandos",
    title: "Acabamento e Comandos",
    description: "Molduras, botões, chaves, pedais e alavancas para completar a reposição do seu veículo.",
    categorySlugs: [
      "molduras", "moldura", "botao", "botoes", "chave", "chaves",
      "pedal", "pedais", "alavanca-de-marcha", "alavancas-de-marcha",
      "comando", "comandos", "tampa-gas",
    ],
  },
};

export function getCatalogCollection(slug?: string | null) {
  return Object.values(catalogCollections).find((collection) => collection.slug === slug);
}
