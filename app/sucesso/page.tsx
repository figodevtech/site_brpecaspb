"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Truck,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  QrCode,
  FileText,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

function SucessoContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("pedido");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedPix, setCopiedPix] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/pedidos/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError(data.error || "Pedido não encontrado.");
        }
      })
      .catch((err) => {
        setError("Erro ao carregar detalhes do pedido.");
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-600 font-medium text-sm">Carregando detalhes do pedido...</p>
      </div>
    );
  }

  if (error || !orderId) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-zinc-200 text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-black text-zinc-900">Pedido não localizado</h1>
        <p className="text-xs text-zinc-500">
          Não foi possível encontrar as informações deste pedido. Se você acabou de concluir a compra, confira seu e-mail ou entre em contato com nosso atendimento.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button asChild className="bg-[#FF6B00] hover:bg-[#E65A00] text-white">
            <Link href="/produtos">Ir para o Catálogo</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/fale-conosco">Falar com Suporte</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isPix = order?.forma_pagamento?.toUpperCase() === "PIX";
  const isPaid = order?.status === "PAGO";
  const address = order?.endereco_entrega_snapshot;
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
    `Olá BR Peças PB! Fiz o pedido #${order.id} no valor de ${formatPrice(
      order.valortotal
    )} e gostaria de acompanhar o envio.`
  )}`;

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header de Confirmação */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#FF6B00]" />
          
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="inline-block text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full mb-2">
            Pedido Registrado com Sucesso
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Obrigado pela sua compra na BR Peças PB!
          </h1>
          <p className="text-xs text-zinc-500 max-w-lg mx-auto mt-2 leading-relaxed">
            Número do Pedido: <strong className="text-zinc-900 font-black text-sm">#{order.id}</strong>.
            Enviamos uma cópia de confirmação para o seu e-mail cadastrado.
          </p>

          {/* Status Badge */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-zinc-50 text-xs font-bold">
            <Clock className="w-4 h-4 text-[#FF6B00]" />
            <span>Status do Pagamento:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] uppercase font-black ${
                isPaid
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {isPaid ? "Pagamento Aprovado" : "Aguardando Pagamento"}
            </span>
          </div>
        </div>

        {/* Resumo do Pedido e Entrega */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Itens do Pedido (2 colunas) */}
          <div className="md:col-span-2 bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider pb-3 border-b border-zinc-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#FF6B00]" />
              Peças Selecionadas ({order.itens?.length || 0})
            </h2>

            <div className="divide-y divide-zinc-100">
              {order.itens?.map((item: any) => (
                <div key={item.id || item.produtoid} className="py-3 flex gap-4 items-center">
                  <div className="relative w-14 h-14 rounded-xl bg-zinc-50 border border-zinc-200 overflow-hidden shrink-0">
                    {item.produto?.imgUrl ? (
                      <Image
                        src={item.produto.imgUrl}
                        alt={item.produto.titulo || "Peça"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                        Foto
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-900 truncate">
                      {item.produto?.titulo || `Produto #${item.produtoid}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-zinc-100 text-zinc-700 font-semibold px-1.5 py-0.5 rounded">
                        {item.produto?.conservacao === "USADO" ? "Peça Seminova" : "Peça Nova"}
                      </span>
                      <span className="text-xs text-zinc-500">
                        Qtd: {item.quantidade}x
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-zinc-900">
                      {formatPrice(item.valor_total || item.sub_total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="pt-4 border-t border-zinc-100 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="font-bold text-zinc-900">{formatPrice(order.sub_total)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Frete ({address?.frete_escolhido?.nome || "Transporte"}):</span>
                <span className="font-bold text-zinc-900">
                  {order.valor_frete > 0 ? formatPrice(order.valor_frete) : "Grátis / Retirada"}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-zinc-950 pt-2 border-t border-zinc-100">
                <span>Total Pago / A Pagar:</span>
                <span className="text-[#FF6B00] text-lg">{formatPrice(order.valortotal)}</span>
              </div>
            </div>
          </div>

          {/* Dados de Entrega e Suporte (1 coluna) */}
          <div className="space-y-6">
            {/* Endereço */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#FF6B00]" />
                Destino da Entrega
              </h3>
              {address ? (
                <div className="text-xs text-zinc-600 space-y-1">
                  <p className="font-bold text-zinc-900">{address.destinatario || order.cliente?.nomerazaosocial}</p>
                  <p>
                    {address.logradouro}, {address.numero} {address.complemento && `- ${address.complemento}`}
                  </p>
                  <p>
                    {address.bairro} — {address.cidade}/{address.estado}
                  </p>
                  <p className="font-mono text-zinc-500">CEP: {address.cep}</p>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">Retirada na loja física da BR Peças PB em Cabedelo/PB.</p>
              )}
            </div>

            {/* Suporte Rápido WhatsApp */}
            <div className="bg-emerald-50 rounded-3xl border border-emerald-200 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                <Phone className="w-4 h-4" />
                Dúvidas ou Comprovante?
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Nosso time de consultores técnicos está disponível para agilizar seu envio ou orientar na instalação.
              </p>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-black text-xs rounded-xl shadow-md transition-colors"
              >
                <Phone className="w-4 h-4" />
                Falar com Atendente
              </a>
            </div>

            {/* Ações */}
            <div className="space-y-2">
              <Button asChild className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs h-11 rounded-xl">
                <Link href={`/rastreio?codigo=${order.id}`}>
                  <Truck className="w-4 h-4 mr-1.5" />
                  Rastrear Este Pedido
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full text-xs font-bold h-11 rounded-xl">
                <Link href="/produtos">Continuar Comprando</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SucessoContent />
    </Suspense>
  );
}
