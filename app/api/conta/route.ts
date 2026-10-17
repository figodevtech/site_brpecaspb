import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get("identificador")?.trim();

    if (!identifier) {
      return NextResponse.json(
        { error: "Informe seu e-mail ou CPF para acessar sua conta." },
        { status: 400 }
      );
    }

    const cleanCpf = identifier.replace(/\D/g, "");
    const isCpf = cleanCpf.length === 11 || cleanCpf.length === 14;

    // Buscar cliente por CPF ou por e-mail
    let clienteQuery = supabaseAdmin.from("cliente").select("*");
    if (isCpf) {
      clienteQuery = clienteQuery.eq("cpfcnpj", cleanCpf);
    } else {
      clienteQuery = clienteQuery.ilike("email", identifier);
    }

    const { data: cliente, error: cliError } = await clienteQuery.maybeSingle();

    if (cliError) {
      console.error("Erro ao buscar cliente:", cliError);
      return NextResponse.json({ error: "Erro ao localizar dados." }, { status: 500 });
    }

    if (!cliente) {
      return NextResponse.json({
        found: false,
        message: "Nenhum cadastro encontrado com este dado.",
      });
    }

    // Buscar endereços do cliente
    const { data: enderecos } = await supabaseAdmin
      .from("cliente_endereco")
      .select("*")
      .eq("cliente_id", cliente.id)
      .order("principal", { ascending: false });

    // Buscar pedidos do cliente
    const { data: vendas } = await supabaseAdmin
      .from("venda")
      .select(`
        id,
        status,
        status_entrega,
        valortotal,
        sub_total,
        forma_pagamento,
        datavenda,
        createdat,
        codigo_rastreio,
        transportadora,
        url_rastreio,
        gateway_status,
        endereco_entrega_snapshot
      `)
      .eq("clienteid", cliente.id)
      .order("createdat", { ascending: false });

    return NextResponse.json({
      found: true,
      cliente: {
        id: cliente.id,
        nome: cliente.nomerazaosocial,
        cpfCnpj: cliente.cpfcnpj,
        email: cliente.email,
        telefone: cliente.telefone,
        enderecos: enderecos || [],
      },
      pedidos: vendas || [],
    });
  } catch (err: any) {
    console.error("Erro na API da conta:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao processar requisição." },
      { status: 500 }
    );
  }
}
