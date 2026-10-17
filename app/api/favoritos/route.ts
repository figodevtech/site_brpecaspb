import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { Product } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json({ success: true, products: [] });
    }

    const ids = idsParam
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id) && id > 0);

    if (ids.length === 0) {
      return NextResponse.json({ success: true, products: [] });
    }

    const { data: dbProducts, error } = await supabaseAdmin
      .from("produto")
      .select(`
        id,
        titulo,
        "tituloMarketplace",
        descricao,
        precovenda,
        estoque,
        referencia,
        fabricante,
        "imgUrl",
        conservacao,
        destaque,
        site_product_link (
          preco_site
        )
      `)
      .in("id", ids);

    if (error) {
      console.error("Erro ao buscar favoritos:", error);
      return NextResponse.json({ error: "Erro ao buscar produtos favoritos." }, { status: 500 });
    }

    const products: Product[] = (dbProducts || []).map((p: any) => {
      const siteLink = Array.isArray(p.site_product_link)
        ? p.site_product_link[0]
        : p.site_product_link;

      return {
        id: p.id,
        titulo: p.tituloMarketplace || p.titulo,
        descricao: p.descricao,
        precovenda: Number(p.precovenda || 0),
        preco_site: siteLink?.preco_site ? Number(siteLink.preco_site) : null,
        estoque: p.estoque || 0,
        referencia: p.referencia,
        fabricante: p.fabricante,
        imgUrl: p.imgUrl,
        conservacao: p.conservacao || "USADO",
        destaque: p.destaque || false,
      };
    });

    return NextResponse.json({ success: true, products });
  } catch (err: any) {
    console.error("Erro na rota de favoritos:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno." },
      { status: 500 }
    );
  }
}
