import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isAsaasConfigured } from "@/lib/asaas";

export async function GET() {
  try {
    // 1. Métricas de Vendas
    const { data: vendas, error: vendasError } = await supabaseAdmin
      .from("venda")
      .select("id, status, valortotal, datavenda, createdat, forma_pagamento, status_entrega");

    let totalVendasValor = 0;
    let totalPedidos = 0;
    let pedidosPagos = 0;
    let pedidosPendentes = 0;

    if (vendas) {
      totalPedidos = vendas.length;
      for (const v of vendas) {
        if (v.status === "PAGO") {
          pedidosPagos++;
          totalVendasValor += Number(v.valortotal || 0);
        } else if (v.status === "PENDENTE") {
          pedidosPendentes++;
        }
      }
    }

    // 2. Métricas de Catálogo e Estoque
    const { data: produtos, count: totalProdutos } = await supabaseAdmin
      .from("produto")
      .select("id, titulo, precovenda, estoque, conservacao, fabricante", { count: "exact" });

    let estoqueCritico = 0;
    let totalUsadas = 0;
    let totalNovas = 0;

    if (produtos) {
      for (const p of produtos) {
        if (p.estoque <= 1) estoqueCritico++;
        if (p.conservacao === "USADO") totalUsadas++;
        else totalNovas++;
      }
    }

    // 3. Compatibilidade Veicular
    const { count: totalCompatibilidades } = await supabaseAdmin
      .from("produto_compatibilidade")
      .select("id", { count: "exact" });

    // 4. Últimos Webhooks Recebidos
    const { data: webhooks } = await supabaseAdmin
      .from("payment_webhook_event")
      .select("*")
      .order("processed_at", { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      metrics: {
        totalVendasValor,
        totalPedidos,
        pedidosPagos,
        pedidosPendentes,
        totalProdutos: totalProdutos || 0,
        estoqueCritico,
        totalUsadas,
        totalNovas,
        totalCompatibilidades: totalCompatibilidades || 0,
        asaasConfigured: isAsaasConfigured(),
        supabaseConnected: true,
      },
      webhooks: webhooks || [],
    });
  } catch (err: any) {
    console.error("Erro ao buscar métricas admin:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao consultar métricas administrativas." },
      { status: 500 }
    );
  }
}
