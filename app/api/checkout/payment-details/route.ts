import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAsaasPayment, getAsaasPixQrCode, getAsaasBoletoLine } from "@/lib/asaas";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function getAuthenticatedUser(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (user && !error) return user;
  } catch {
    // Falha silenciosa para tentar via header
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token);
      if (user && !error) return user;
    }
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ message: "Faça login para consultar o pagamento." }, { status: 401 });
    const id = Number(new URL(request.url).searchParams.get("orderId"));
    if (!Number.isSafeInteger(id) || id < 1) return NextResponse.json({ message: "Pedido inválido." }, { status: 400 });
    const { data: customer, error: customerError } = await supabaseAdmin.from("cliente").select("id").eq("user_id", user.id).maybeSingle();
    if (customerError) throw customerError;
    if (!customer) return NextResponse.json({ message: "Perfil não encontrado." }, { status: 403 });
    const { data: order, error } = await supabaseAdmin.from("venda").select("id, gateway_payment_id, payment_provider")
      .eq("id", id).eq("clienteid", customer.id).maybeSingle();
    if (error) throw error;
    let paymentId=order?.payment_provider==='ASAAS'?order.gateway_payment_id:null;
    if(!paymentId) {
      const {data:attempt,error:attemptError}=await supabaseAdmin.from('checkout_attempt').select('payment_id,phase').eq('order_id',id).eq('cliente_id',customer.id).maybeSingle();
      if(attemptError)throw attemptError;
      if(!attempt)return NextResponse.json({message:'Pagamento não encontrado.'},{status:404});
      if(!attempt.payment_id)return NextResponse.json({processing:attempt.phase!=='CANCELLED',status:attempt.phase==='CANCELLED'?'CANCELLED':'PREPARING'},{status:202});
      paymentId=attempt.payment_id;
    }
    const payment = await getAsaasPayment(paymentId);
    const common = { billingType: payment.billingType, dueDate: payment.dueDate, status: payment.status };
    if (["RECEIVED", "CONFIRMED", "REFUNDED", "DELETED", "CHARGEBACK_REQUESTED"].includes(String(payment.status))) return NextResponse.json(common);
    if (payment.billingType === "PIX") {
      const pix = await getAsaasPixQrCode(paymentId);
      return NextResponse.json({ ...common, pix });
    }
    if (payment.billingType === "BOLETO") {
      const boleto = await getAsaasBoletoLine(paymentId);
      return NextResponse.json({ ...common, boleto: { line: boleto.identificationField, url: payment.bankSlipUrl || null } });
    }
    return NextResponse.json(common);
  } catch {
    console.error("[checkout/payment-details] Falha ao consultar instruções de pagamento.");
    return NextResponse.json({ message: "Não foi possível carregar os dados do pagamento. Tente novamente sem criar outro pedido." }, { status: 502 });
  }
}
