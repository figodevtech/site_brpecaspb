import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await createClient();
    const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ error: "Faça login para consultar seu pedido." }, { status: 401 });
    const { data: customer } = await supabaseAdmin.from("cliente").select("id").eq("user_id", user.id).maybeSingle();
    if (!customer) return NextResponse.json({ error: "Cadastro não encontrado." }, { status: 404 });
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
      .eq("id", orderId).eq("clienteid", customer.id)
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
  } catch (err) {
    console.error("Erro ao consultar pedido:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno ao consultar pedido." },
      { status: 500 }
    );
  }
}
