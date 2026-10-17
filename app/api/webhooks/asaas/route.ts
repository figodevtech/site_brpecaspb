import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    // 1. Verificação de token de webhook (se configurado)
    const webhookTokenHeader = request.headers.get("asaas-access-token");
    const configuredWebhookSecret = process.env.ASAAS_WEBHOOK_SECRET;

    if (configuredWebhookSecret && webhookTokenHeader) {
      if (webhookTokenHeader !== configuredWebhookSecret) {
        console.warn("Webhook Asaas rejeitado: token inválido.");
        return NextResponse.json({ error: "Token de webhook inválido." }, { status: 401 });
      }
    }

    const payload = await request.json();
    const event = payload?.event;
    const payment = payload?.payment;

    if (!event || !payment?.id) {
      return NextResponse.json({ error: "Payload de webhook incompleto." }, { status: 400 });
    }

    const eventId = `${event}_${payment.id}_${payment.status || ""}_${Date.now()}`;
    const paymentId = payment.id;
    const externalRef = payment.externalReference;
    const orderId = externalRef ? parseInt(externalRef, 10) : null;

    // 2. Idempotência: verificar se já processamos exatamente este evento para este payment
    const { data: existingEvent } = await supabaseAdmin
      .from("payment_webhook_event")
      .select("id")
      .eq("provider", "ASAAS")
      .eq("payment_id", paymentId)
      .eq("gateway_status", payment.status || event)
      .maybeSingle();

    if (existingEvent) {
      return NextResponse.json({
        received: true,
        message: "Evento já processado anteriormente (idempotente).",
      });
    }

    // 3. Localizar a venda correspondente
    let vendaId: number | null = orderId && !isNaN(orderId) ? orderId : null;

    if (!vendaId) {
      const { data: vendaFound } = await supabaseAdmin
        .from("venda")
        .select("id")
        .eq("gateway_payment_id", paymentId)
        .maybeSingle();

      if (vendaFound) {
        vendaId = vendaFound.id;
      }
    }

    let resultingStatus = "PENDENTE";

    // 4. Processamento de status do evento Asaas
    switch (event) {
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED": {
        resultingStatus = "PAGO";
        if (vendaId) {
          // Atualiza o status da venda e data de pagamento
          await supabaseAdmin
            .from("venda")
            .update({
              status: "PAGO",
              gateway_status: payment.status || "RECEIVED",
              pagamento_em: new Date().toISOString(),
              updatedat: new Date().toISOString(),
            })
            .eq("id", vendaId);

          // Baixa transacional e atômica de estoque via Postgres function
          try {
            await supabaseAdmin.rpc("fn_baixar_estoque_venda", {
              p_venda_id: vendaId,
            });
            console.log(`Estoque baixado com sucesso para venda #${vendaId}`);
          } catch (stockErr) {
            console.error(`Erro ao baixar estoque da venda #${vendaId}:`, stockErr);
          }
        }
        break;
      }

      case "PAYMENT_REFUNDED":
      case "PAYMENT_DELETED": {
        resultingStatus = "CANCELADO";
        if (vendaId) {
          await supabaseAdmin
            .from("venda")
            .update({
              status: "CANCELADO",
              gateway_status: payment.status || "REFUNDED",
              cancelada_at: new Date().toISOString(),
              motivo_cancelamento: "Estorno ou exclusão pelo Asaas Gateway",
              updatedat: new Date().toISOString(),
            })
            .eq("id", vendaId);

          // Estorno de estoque para reposição
          try {
            await supabaseAdmin.rpc("fn_estornar_estoque_venda", {
              p_venda_id: vendaId,
            });
            console.log(`Estoque estornado com sucesso para venda #${vendaId}`);
          } catch (refundErr) {
            console.error(`Erro ao estornar estoque da venda #${vendaId}:`, refundErr);
          }
        }
        break;
      }

      case "PAYMENT_OVERDUE": {
        resultingStatus = "CANCELADO";
        if (vendaId) {
          await supabaseAdmin
            .from("venda")
            .update({
              status: "CANCELADO",
              gateway_status: "OVERDUE",
              motivo_cancelamento: "Prazo de pagamento expirado no Asaas",
              updatedat: new Date().toISOString(),
            })
            .eq("id", vendaId);
        }
        break;
      }

      default: {
        resultingStatus = payment.status || "EM_PROCESSAMENTO";
        if (vendaId) {
          await supabaseAdmin
            .from("venda")
            .update({
              gateway_status: payment.status || event,
              updatedat: new Date().toISOString(),
            })
            .eq("id", vendaId);
        }
        break;
      }
    }

    // 5. Registrar evento de webhook para auditoria e controle de idempotência
    await supabaseAdmin.from("payment_webhook_event").insert({
      provider: "ASAAS",
      event_id: eventId,
      event_type: event,
      payment_id: paymentId,
      venda_id: vendaId,
      gateway_status: payment.status || event,
      resulting_order_status: resultingStatus,
    });

    return NextResponse.json({
      received: true,
      event,
      vendaId,
      resultingStatus,
    });
  } catch (err: any) {
    console.error("Erro crítico no webhook Asaas:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao processar webhook." },
      { status: 500 }
    );
  }
}
