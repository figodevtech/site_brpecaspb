import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = supabaseAdmin
      .from("venda")
      .select(`
        id,
        status,
        status_entrega,
        valortotal,
        sub_total,
        valor_frete,
        datavenda,
        createdat,
        forma_pagamento,
        codigo_rastreio,
        transportadora,
        url_rastreio,
        gateway_status,
        gateway_payment_id,
        estoque_baixado,
        endereco_entrega_snapshot,
        cliente:clienteid (
          nomerazaosocial,
          email,
          telefone,
          cpfcnpj
        )
      `)
      .order("createdat", { ascending: false })
      .limit(50);

    if (status && status !== "TODOS") {
      query = query.eq("status", status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("Erro ao listar vendas:", error);
      return NextResponse.json({ error: "Erro ao buscar vendas." }, { status: 500 });
    }

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (err: any) {
    console.error("Erro no GET pedidos admin:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, status_entrega, codigo_rastreio, transportadora, url_rastreio } = body;

    if (!id) {
      return NextResponse.json({ error: "ID do pedido obrigatório." }, { status: 400 });
    }

    const updateData: any = {
      updatedat: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (status_entrega) updateData.status_entrega = status_entrega;
    if (codigo_rastreio !== undefined) updateData.codigo_rastreio = codigo_rastreio;
    if (transportadora !== undefined) updateData.transportadora = transportadora;
    if (url_rastreio !== undefined) updateData.url_rastreio = url_rastreio;

    // Se mudou para PAGO e ainda não baixou estoque, executa a baixa transacional
    if (status === "PAGO") {
      updateData.pagamento_em = new Date().toISOString();
      try {
        await supabaseAdmin.rpc("fn_baixar_estoque_venda", { p_venda_id: id });
      } catch (e) {
        console.warn("Estoque já pode ter sido baixado:", e);
      }
    }

    const { data: updated, error } = await supabaseAdmin
      .from("venda")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar venda:", error);
      return NextResponse.json({ error: "Falha ao salvar atualizações." }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    console.error("Erro no PATCH pedido admin:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao atualizar." },
      { status: 500 }
    );
  }
}
