"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

export default function FaleConoscoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone, assunto, mensagem }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao enviar mensagem.");
      }

      setSuccess(true);
      setNome("");
      setEmail("");
      setTelefone("");
      setAssunto("");
      setMensagem("");
    } catch (err: any) {
      setErrorMsg(err.message || "Falha ao enviar mensagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <nav className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
            <Link href="/" className="hover:text-zinc-900">
              Início
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">Fale Conosco</span>
          </nav>
          <h1 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
            Canais de Atendimento BR Peças PB
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Tire dúvidas sobre peças, consulte compatibilidade veicular ou visite nossa loja física.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Informações de Contato e Localização (5 colunas) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-black text-lg text-zinc-950 pb-2 border-b border-zinc-100">
                Informações Institucionais
              </h3>

              <div className="space-y-4 text-xs text-zinc-700">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-50 text-[#FF6B00] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900">Endereço da Loja Física:</h4>
                    <p className="mt-0.5 leading-relaxed">{siteConfig.address.full}</p>
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      Próximo aos principais eixos logísticos da Grande João Pessoa.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-50 text-[#FF6B00] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900">Telefones & WhatsApp:</h4>
                    <p className="mt-0.5 font-semibold text-zinc-900">{siteConfig.phone}</p>
                    <a
                      href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-bold mt-1 text-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chamar no WhatsApp Direto</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-50 text-[#FF6B00] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900">E-mail:</h4>
                    <p className="mt-0.5">{siteConfig.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-orange-50 text-[#FF6B00] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900">Horário de Funcionamento:</h4>
                    <p className="mt-0.5">{siteConfig.openingHours}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-500 space-y-1">
                <p className="font-bold text-zinc-800">{siteConfig.legalName}</p>
                <p>CNPJ: {siteConfig.cnpj} | Inscrição Estadual: {siteConfig.ie}</p>
              </div>
            </div>
          </div>

          {/* Formulário de Envio (7 colunas) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
              <h3 className="font-black text-lg text-zinc-950 mb-1">
                Envie uma Mensagem para nossa Equipe
              </h3>
              <p className="text-xs text-zinc-500 mb-6">
                Respondemos rapidamente durante nosso horário comercial.
              </p>

              {success && (
                <div className="p-4 mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Sua mensagem foi enviada com sucesso! Entraremos em contato em breve.</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Seu Nome *</label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Carlos Santos"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">Seu E-mail *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="carlos@email.com"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Telefone / Celular
                    </label>
                    <input
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(83) 99999-9999"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Assunto *
                    </label>
                    <input
                      type="text"
                      required
                      value={assunto}
                      onChange={(e) => setAssunto(e.target.value)}
                      placeholder="Dúvida de peça, compatibilidade..."
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Sua Mensagem *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Descreva a peça procurada, modelo do veículo, ano ou tire sua dúvida..."
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#FF6B00] hover:bg-[#E65A00] text-white font-bold text-xs rounded-xl shadow-lg glow-orange flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? "Enviando..." : "Enviar Mensagem"}</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
