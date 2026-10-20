import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";

const contactSchema = z.object({
  nome: z.string().trim().min(2, "Nome é obrigatório"),
  email: z.string().trim().email("E-mail inválido"),
  telefone: z.string().trim().optional(),
  assunto: z.string().trim().min(3, "Assunto é obrigatório"),
  mensagem: z.string().trim().min(10, "Mensagem deve conter no mínimo 10 caracteres"),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = contactSchema.parse(json);

    const { error } = await supabaseAdmin.from("contato_lead").insert({
      nome: data.nome,
      email: data.email,
      telefone: data.telefone || null,
      assunto: data.assunto,
      mensagem: data.mensagem,
      origem: "SITE",
      status: "NOVO",
    });

    if (error) {
      console.error("Erro ao salvar contato_lead:", error);
      return NextResponse.json({ error: "Falha ao registrar mensagem." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Mensagem enviada com sucesso!" });
  } catch (err) {
    console.error("Erro no formulário de contato:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao processar contato." },
      { status: 400 }
    );
  }
}
