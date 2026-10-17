import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  isAsaasConfigured,
  findOrCreateAsaasCustomer,
  createAsaasPayment,
} from "@/lib/asaas";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        produtoid: z.number().int().positive(),
        quantidade: z.number().int().positive(),
      })
    )
    .min(1, "Carrinho deve ter pelo menos um item"),
  customer: z.object({
    name: z.string().trim().min(3, "Nome completo é obrigatório"),
    cpfCnpj: z.string().trim().min(11, "CPF ou CNPJ inválido"),
    email: z.string().trim().email("E-mail inválido"),
    phone: z.string().trim().min(8, "Telefone é obrigatório"),
    address: z.object({
      cep: z.string().trim().min(8),
      logradouro: z.string().trim().min(2),
      numero: z.string().trim().min(1),
      complemento: z.string().trim().optional(),
      bairro: z.string().trim().min(1),
      cidade: z.string().trim().min(1),
      estado: z.string().trim().min(2),
    }),
  }),
  shipping: z.object({
    id: z.string(),
    nome: z.string(),
    preco: z.number().min(0),
  }),
  paymentMethod: z.enum(["PIX", "CREDIT_CARD", "BOLETO"]),
  creditCard: z
    .object({
      holderName: z.string(),
      number: z.string(),
      expiryMonth: z.string(),
      expiryYear: z.string(),
      ccv: z.string(),
      installments: z.number().int().min(1).max(12).default(1),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = checkoutSchema.parse(json);

    // 1. Validar e travar o estoque atual dos produtos no Supabase
    const productIds = data.items.map((i) => i.produtoid);
    const { data: dbProducts, error: prodError } = await supabaseAdmin
      .from("produto")
      .select("id, titulo, precovenda, estoque, conservacao, site_product_link(preco_site)")
      .in("id", productIds);

    if (prodError || !dbProducts || dbProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: "Um ou mais produtos selecionados não foram encontrados." },
        { status: 400 }
      );
    }

    let calculatedSubtotal = 0;
    const validatedItems: any[] = [];

    for (const item of data.items) {
      const prod = dbProducts.find((p) => p.id === item.produtoid);
      if (!prod) {
        return NextResponse.json(
          { error: `Produto #${item.produtoid} não encontrado.` },
          { status: 400 }
        );
      }

      if (prod.estoque < item.quantidade) {
        return NextResponse.json(
          {
            error: `Estoque insuficiente para "${prod.titulo}". Disponível: ${prod.estoque} unidade(s).`,
          },
          { status: 400 }
        );
      }

      const siteLink = Array.isArray(prod.site_product_link)
        ? prod.site_product_link[0]
        : prod.site_product_link;

      const unitPrice = siteLink?.preco_site
        ? Number(siteLink.preco_site)
        : Number(prod.precovenda || 0);

      const itemTotal = unitPrice * item.quantidade;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        produtoid: prod.id,
        quantidade: item.quantidade,
        sub_total: unitPrice,
        valor_total: itemTotal,
        valor_desconto: 0,
        valor_frete: 0,
        tipo_desconto: null,
      });
    }

    const grandTotal = calculatedSubtotal + data.shipping.preco;

    // 2. Localizar ou cadastrar o cliente na base
    const cleanCpfCnpj = data.customer.cpfCnpj.replace(/\D/g, "");
    let clienteId: number;

    const { data: existingCliente } = await supabaseAdmin
      .from("cliente")
      .select("id")
      .eq("cpfcnpj", cleanCpfCnpj)
      .maybeSingle();

    if (existingCliente) {
      clienteId = existingCliente.id;
    } else {
      const isCnpj = cleanCpfCnpj.length > 11;
      const { data: newCliente, error: cliError } = await supabaseAdmin
        .from("cliente")
        .insert({
          nomerazaosocial: data.customer.name,
          cpfcnpj: cleanCpfCnpj,
          email: data.customer.email,
          telefone: data.customer.phone.replace(/\D/g, ""),
          tipopessoa: isCnpj ? "JURIDICA" : "FISICA",
          endereco: data.customer.address.logradouro,
          endereconumero: data.customer.address.numero,
          enderecocomplemento: data.customer.address.complemento,
          bairro: data.customer.address.bairro,
          cidade: data.customer.address.cidade,
          estado: data.customer.address.estado,
          cep: data.customer.address.cep.replace(/\D/g, ""),
        })
        .select("id")
        .single();

      if (cliError || !newCliente) {
        console.error("Erro ao registrar cliente:", cliError);
        return NextResponse.json(
          { error: "Falha ao registrar dados do cliente." },
          { status: 500 }
        );
      }
      clienteId = newCliente.id;
    }

    // 3. Salvar endereço em cliente_endereco
    await supabaseAdmin
      .from("cliente_endereco")
      .insert({
        cliente_id: clienteId,
        cep: data.customer.address.cep.replace(/\D/g, ""),
        logradouro: data.customer.address.logradouro,
        numero: data.customer.address.numero,
        complemento: data.customer.address.complemento,
        bairro: data.customer.address.bairro,
        cidade: data.customer.address.cidade,
        estado: data.customer.address.estado,
        principal: true,
      })
      .select("id")
      .maybeSingle();

    // 4. Criar pedido atomicamente via function Postgres
    const enderecoSnapshot = {
      ...data.customer.address,
      destinatario: data.customer.name,
      telefone: data.customer.phone,
      frete_escolhido: data.shipping,
    };

    const { data: orderId, error: orderError } = await supabaseAdmin.rpc("fn_criar_pedido_site", {
      p_cliente_id: clienteId,
      p_endereco_snapshot: enderecoSnapshot,
      p_itens: validatedItems,
      p_subtotal: calculatedSubtotal,
      p_total: grandTotal,
      p_canal: "ONLINE",
      p_forma_pagamento: data.paymentMethod,
    });

    if (orderError || !orderId) {
      console.error("Erro ao criar venda:", orderError);
      return NextResponse.json(
        { error: "Falha transacional ao gerar pedido." },
        { status: 500 }
      );
    }

    // 5. Integração com o Gateway Asaas
    let paymentResult: any = {
      orderId,
      status: "PENDENTE",
      method: data.paymentMethod,
    };

    if (isAsaasConfigured()) {
      try {
        const asaasCustomer = await findOrCreateAsaasCustomer({
          name: data.customer.name,
          cpfCnpj: cleanCpfCnpj,
          email: data.customer.email,
          phone: data.customer.phone,
        });

        const today = new Date();
        const dueDate = new Date(today.setDate(today.getDate() + 2))
          .toISOString()
          .split("T")[0];

        const asaasPayment = await createAsaasPayment({
          customer: asaasCustomer.id,
          billingType: data.paymentMethod,
          value: grandTotal,
          dueDate,
          description: `Pedido #${orderId} - BR Peças PB`,
          externalReference: String(orderId),
          creditCard: data.creditCard
            ? {
                holderName: data.creditCard.holderName,
                number: data.creditCard.number.replace(/\D/g, ""),
                expiryMonth: data.creditCard.expiryMonth,
                expiryYear: data.creditCard.expiryYear,
                ccv: data.creditCard.ccv,
              }
            : undefined,
          installmentCount: data.creditCard?.installments,
        });

        // Atualizar venda com dados do gateway
        await supabaseAdmin
          .from("venda")
          .update({
            gateway_payment_id: asaasPayment.id,
            gateway_checkout_url: asaasPayment.invoiceUrl,
            gateway_status: asaasPayment.status,
          })
          .eq("id", orderId);

        paymentResult = {
          ...paymentResult,
          gatewayId: asaasPayment.id,
          invoiceUrl: asaasPayment.invoiceUrl,
          pixQrCode: asaasPayment.pixQrCodeUrl,
          pixCopiaECola: asaasPayment.pixCopiaECola,
          bankSlipUrl: asaasPayment.bankSlipUrl,
        };
      } catch (asaasErr: any) {
        console.error("Erro no processamento Asaas:", asaasErr);
        // Não quebra a venda: devolve fallback de pagamento com instruções
        paymentResult.warning = "Gateway de pagamento em processamento em fila.";
      }
    } else {
      // Modo Demonstração / Homologação Local Segura
      const mockPixCode = `00020126580014br.gov.bcb.pix0136${cleanCpfCnpj}5204000053039865405${grandTotal.toFixed(2)}5802BR5916BR PECAS PB6008CABEDELO62070503***6304`;
      paymentResult = {
        ...paymentResult,
        pixCopiaECola: mockPixCode,
        pixQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(mockPixCode)}`,
        simulated: true,
      };
    }

    return NextResponse.json({
      success: true,
      orderId,
      subtotal: calculatedSubtotal,
      total: grandTotal,
      payment: paymentResult,
    });
  } catch (err: any) {
    console.error("Erro no checkout:", err);
    return NextResponse.json(
      { error: err.message || "Erro inesperado ao processar checkout." },
      { status: 400 }
    );
  }
}
