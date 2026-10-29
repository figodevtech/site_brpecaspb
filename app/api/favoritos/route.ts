import { withCardPaymentTerms } from "@/lib/catalog/card-payment-terms";
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
        "descricaoMarketplace",
        precovenda,
        estoque,
        referencia,
        fabricante,
        "imgUrl",
        conservacao,
        destaque
      `)
      .in("id", ids).eq("visible", true).eq("is_deleted", false)
      .not("imgUrl", "is", null).not("imgUrl", "match", "^[[:space:]]*$");

    if (error) {
      console.error("Erro ao buscar favoritos:", error);
      return NextResponse.json({ error: "Erro ao buscar produtos favoritos." }, { status: 500 });
    }

    const products: Product[] = (dbProducts || []).map((p) => {
      return {
        id: p.id,
        titulo: p.tituloMarketplace || p.titulo,
        descricao: p.descricaoMarketplace,
        precovenda: Number(p.precovenda || 0),
        preco_site: Number(p.precovenda || 0),
        estoque: p.estoque || 0,
        referencia: p.referencia,
        fabricante: p.fabricante,
        imgUrl: p.imgUrl,
        conservacao: p.conservacao || "USADO",
        destaque: p.destaque || false,
      };
    });

    return NextResponse.json({ success: true, products:await withCardPaymentTerms(products,product=>product.preco_site??product.precovenda) });
  } catch (err) {
    console.error("Erro na rota de favoritos:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno." },
      { status: 500 }
    );
  }
}
