import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (!orderId || isNaN(orderId)) {
      return NextResponse.json({ error: "ID do pedido inválido." }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from("venda")
      .select(`
        id,
        clienteid,
        status,
        status_entrega,
        valortotal,
        sub_total,
        valor_frete,
        datavenda,
        forma_pagamento,
        endereco_entrega_snapshot,
        codigo_rastreio,
        transportadora,
        url_rastreio,
        gateway_status,
        gateway_payment_id,
        gateway_checkout_url,
        createdat,
        cliente:clienteid (
          nomerazaosocial,
          email,
          telefone
        )
      `)
      .eq("id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    const { data: items, error: itemsError } = await supabaseAdmin
      .from("vendaproduto")
      .select(`
        id,
        produtoid,
        quantidade,
        sub_total,
        valor_total,
        produto:produtoid (
          id,
          titulo,
          "imgUrl",
          conservacao,
          referencia
        )
      `)
      .eq("venda_id", orderId);

    if (itemsError) {
      console.error("Erro ao buscar itens da venda:", itemsError);
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        itens: items || [],
      },
    });
  } catch (err: any) {
    console.error("Erro ao consultar pedido:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao consultar pedido." },
      { status: 500 }
    );
  }
}
