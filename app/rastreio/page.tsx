"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Truck,
  Search,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Phone,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

function RastreioContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("codigo") || "";

  const [searchCode, setSearchCode] = useState(initialCode);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (codeToSearch: string) => {
    const clean = codeToSearch.trim();
    if (!clean) return;

    setLoading(true);
    setErrorMsg("");
    setOrder(null);

    try {
      const res = await fetch(`/api/pedidos/${clean}`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.order) {
        throw new Error(data.error || "Pedido ou código de rastreio não localizado.");
      }

      setOrder(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao consultar rastreamento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      handleSearch(initialCode);
    }
  }, [initialCode]);

  // Definir etapas da timeline
  const isPaid = order?.status === "PAGO";
  const isShipped = Boolean(order?.codigo_rastreio || order?.status_entrega === "ENVIADO");
  const isDelivered = order?.status_entrega === "ENTREGUE";

  const steps = [
    {
      title: "Pedido Realizado",
      desc: order ? `Registrado em ${new Date(order.createdat || order.datavenda).toLocaleDateString("pt-BR")}` : "Aguardando confirmação",
      completed: true,
      current: !isPaid,
    },
    {
      title: "Pagamento Confirmado",
      desc: isPaid ? "Processado via Asaas Gateway" : "Aguardando aprovação bancária",
      completed: isPaid,
      current: isPaid && !isShipped,
    },
    {
      title: "Separação & Conferência",
      desc: isPaid ? "Inspeção técnica e embalagem segura" : "Pendente",
      completed: isPaid,
      current: isPaid && !isShipped,
    },
    {
      title: "Despachado / Em Trânsito",
      desc: isShipped ? `Via ${order.transportadora || "Correios"} (${order.codigo_rastreio})` : "Aguardando envio",
      completed: isShipped,
      current: isShipped && !isDelivered,
    },
    {
      title: "Entregue ao Destinatário",
      desc: isDelivered ? "Entrega concluída" : "Previsão conforme modalidade",
      completed: isDelivered,
      current: false,
    },
  ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-zinc-900">
            Início
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Rastrear Pedido</span>
        </nav>

        {/* Hero de Busca */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 text-center shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto border border-orange-100">
            <Truck className="w-7 h-7" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Rastreamento de Encomendas
          </h1>
          <p className="text-xs text-zinc-500 max-w-lg mx-auto">
            Acompanhe o status em tempo real do seu pedido na BR Peças PB. Digite o número do pedido gerado na sua compra.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchCode);
            }}
            className="max-w-md mx-auto flex gap-2 pt-2"
          >
            <input
              type="text"
              required
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Digite o número do pedido (Ex: 12)"
              className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-4 py-3 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
            />
            <Button
              type="submit"
              disabled={loading}
              className="h-12 bg-[#FF6B00] hover:bg-[#E65A00] text-white px-6 font-bold text-xs rounded-xl shadow-md glow-orange"
            >
              {loading ? "Buscando..." : "Rastrear"}
            </Button>
          </form>

          {errorMsg && (
            <div className="max-w-md mx-auto p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Resultado do Pedido */}
        {order && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in-50 duration-300">
            {/* Header com Dados Básicos */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-zinc-100 gap-4">
              <div>
                <span className="text-[11px] font-bold text-zinc-400">
                  Atualizado em tempo real
                </span>
                <h2 className="text-xl font-black text-zinc-950">
                  Pedido #{order.id}
                </h2>
                <p className="text-xs text-zinc-500">
                  Cliente: {order.cliente?.nomerazaosocial || "Cliente BR Peças"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black uppercase px-3 py-1.5 rounded-xl ${
                    isPaid
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {isPaid ? "Pagamento Confirmado" : "Aguardando Pagamento"}
                </span>
              </div>
            </div>

            {/* Timeline Visual */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase text-zinc-900 tracking-wider">
                Linha do Tempo da Encomenda
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200">
                {steps.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div
                      className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${
                        step.completed
                          ? "bg-emerald-600 text-white"
                          : step.current
                          ? "bg-[#FF6B00] text-white animate-pulse"
                          : "bg-zinc-200 text-zinc-500"
                      }`}
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <h4
                        className={`text-xs font-black ${
                          step.completed || step.current ? "text-zinc-950" : "text-zinc-400"
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Código de Rastreio Oficial e Link da Transportadora */}
            {order.codigo_rastreio && (
              <div className="p-5 rounded-2xl bg-orange-50/70 border border-orange-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-600 text-white font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-orange-950 uppercase tracking-wider block">
                      Código de Rastreamento ({order.transportadora || "Correios"})
                    </span>
                    <span className="text-sm font-mono font-black text-orange-900">
                      {order.codigo_rastreio}
                    </span>
                  </div>
                </div>

                {order.url_rastreio ? (
                  <Button
                    asChild
                    className="bg-[#FF6B00] hover:bg-[#E65A00] text-white font-bold text-xs rounded-xl"
                  >
                    <a href={order.url_rastreio} target="_blank" rel="noopener noreferrer">
                      Ver no Site da Transportadora
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </a>
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl"
                  >
                    <a
                      href={`https://rastreamento.correios.com.br/app/index.php?codigo=${order.codigo_rastreio}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Rastrear nos Correios
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </a>
                  </Button>
                )}
              </div>
            )}

            {/* Endereço de Entrega */}
            {order.endereco_entrega_snapshot && (
              <div className="pt-4 border-t border-zinc-100 flex items-start gap-3 text-xs text-zinc-600">
                <MapPin className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-900 block">Endereço de Entrega:</span>
                  <span>
                    {order.endereco_entrega_snapshot.logradouro}, {order.endereco_entrega_snapshot.numero}{" "}
                    {order.endereco_entrega_snapshot.complemento && `(${order.endereco_entrega_snapshot.complemento})`} —{" "}
                    {order.endereco_entrega_snapshot.bairro}, {order.endereco_entrega_snapshot.cidade}/
                    {order.endereco_entrega_snapshot.estado} (CEP: {order.endereco_entrega_snapshot.cep})
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RastreioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RastreioContent />
    </Suspense>
  );
}
