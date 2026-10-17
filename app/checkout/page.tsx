"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  FileText,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  MapPin,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import { useCartContext } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { calculateShipping } from "@/lib/shipping";
import { ShippingOption } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartContext();

  // Form State
  const [name, setName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD" | "BOLETO">("PIX");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardInstallments, setCardInstallments] = useState(1);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Pix Modal State
  const [pixData, setPixData] = useState<{
    orderId: number;
    qrCode?: string;
    copiaECola?: string;
  } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Auto fetch CEP
  useEffect(() => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length === 8) {
      setLoadingShipping(true);
      fetch(`https://viacep.com.br/ws/${clean}/json/`)
        .then((res) => res.json())
        .then(async (data) => {
          if (!data.erro) {
            setLogradouro(data.logradouro || "");
            setBairro(data.bairro || "");
            setCidade(data.localidade || "");
            setEstado(data.uf || "");

            // Calcular opções de frete
            const opts = await calculateShipping({ cep: clean, subtotal });
            setShippingOptions(opts);
            setSelectedShipping(opts[0]);
          }
        })
        .catch((err) => console.error("Erro ViaCEP:", err))
        .finally(() => setLoadingShipping(false));
    }
  }, [cep, subtotal]);

  const shippingCost = selectedShipping?.preco || 0;
  const grandTotal = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (items.length === 0) {
      setErrorMsg("O carrinho está vazio.");
      return;
    }

    if (!selectedShipping) {
      setErrorMsg("Por favor, selecione uma opção de frete ou retirada.");
      return;
    }

    setSubmitting(true);

    try {
      const payload: any = {
        items: items.map((i) => ({
          produtoid: i.produto.id,
          quantidade: i.quantidade,
        })),
        customer: {
          name,
          cpfCnpj,
          email,
          phone,
          address: {
            cep,
            logradouro,
            numero,
            complemento,
            bairro,
            cidade,
            estado,
          },
        },
        shipping: selectedShipping,
        paymentMethod,
      };

      if (paymentMethod === "CREDIT_CARD") {
        const [month, year] = cardExpiry.split("/");
        payload.creditCard = {
          holderName: cardHolder,
          number: cardNumber,
          expiryMonth: month?.trim() || "12",
          expiryYear: year?.trim().length === 2 ? `20${year.trim()}` : year?.trim() || "2027",
          ccv: cardCvv,
          installments: cardInstallments,
        };
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao concluir pedido.");
      }

      clearCart();

      if (paymentMethod === "PIX") {
        setPixData({
          orderId: data.orderId,
          qrCode: data.payment?.pixQrCode,
          copiaECola: data.payment?.pixCopiaECola,
        });
      } else {
        router.push(`/sucesso?pedido=${data.orderId}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Falha ao processar checkout.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPix = () => {
    if (pixData?.copiaECola) {
      navigator.clipboard.writeText(pixData.copiaECola);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight flex items-center gap-2">
            <Lock className="w-6 h-6 text-[#FF6B00]" />
            Finalização de Compra Segura
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Ambiente blindado com criptografia e processamento oficial Asaas Gateway.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna de Dados do Cliente e Pagamento (8 colunas) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Bloco 1: Dados Pessoais */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white text-[11px] font-black flex items-center justify-center">
                  1
                </span>
                Dados do Comprador / Identificação
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Nome Completo / Razão Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    CPF ou CNPJ (para Nota Fiscal) *
                  </label>
                  <input
                    type="text"
                    required
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    E-mail (para confirmação e rastreio) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="joao@email.com"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Telefone / WhatsApp com DDD *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(83) 99999-9999"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>
            </div>

            {/* Bloco 2: Endereço de Entrega */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white text-[11px] font-black flex items-center justify-center">
                  2
                </span>
                Endereço de Entrega
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    CEP (com busca automática) *
                  </label>
                  <input
                    type="text"
                    required
                    value={cep}
                    maxLength={9}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="58108-152"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                  {loadingShipping && (
                    <span className="text-[10px] text-zinc-400 mt-1 block">Buscando CEP...</span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-700 mb-1">
                    Logradouro (Rua / Avenida) *
                  </label>
                  <input
                    type="text"
                    required
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    placeholder="Rua..."
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Número *</label>
                  <input
                    type="text"
                    required
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    placeholder="146"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    placeholder="Quadra / Bloco"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Bairro *</label>
                  <input
                    type="text"
                    required
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    placeholder="Bairro"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Cidade *</label>
                  <input
                    type="text"
                    required
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Cidade"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Estado (UF) *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={estado}
                    onChange={(e) => setEstado(e.target.value.toUpperCase())}
                    placeholder="PB"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Opções de Envio */}
              {shippingOptions.length > 0 && (
                <div className="pt-4 border-t border-zinc-100">
                  <h3 className="text-xs font-black uppercase text-zinc-800 mb-2">
                    Selecione a Modalidade de Envio:
                  </h3>
                  <div className="space-y-2">
                    {shippingOptions.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                          selectedShipping?.id === opt.id
                            ? "border-[#FF6B00] bg-orange-50/60"
                            : "border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingModal"
                            checked={selectedShipping?.id === opt.id}
                            onChange={() => setSelectedShipping(opt)}
                            className="accent-[#FF6B00]"
                          />
                          <div>
                            <span className="font-bold text-zinc-900 block">{opt.nome}</span>
                            <span className="text-[11px] text-zinc-500">{opt.prazo}</span>
                          </div>
                        </div>
                        <span className="font-black text-sm text-zinc-950">
                          {opt.preco === 0 ? "GRÁTIS" : formatPrice(opt.preco)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bloco 3: Forma de Pagamento */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white text-[11px] font-black flex items-center justify-center">
                  3
                </span>
                Forma de Pagamento (Asaas)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("PIX")}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === "PIX"
                      ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00] font-black shadow-sm"
                      : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                  }`}
                >
                  <QrCode className="w-6 h-6" />
                  <span className="text-xs font-bold">PIX (Instantâneo)</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                    Aprovação Rápida
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CREDIT_CARD")}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === "CREDIT_CARD"
                      ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00] font-black shadow-sm"
                      : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs font-bold">Cartão de Crédito</span>
                  <span className="text-[10px] text-zinc-500">Até 12x</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("BOLETO")}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === "BOLETO"
                      ? "border-[#FF6B00] bg-orange-50 text-[#FF6B00] font-black shadow-sm"
                      : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"
                  }`}
                >
                  <FileText className="w-6 h-6" />
                  <span className="text-xs font-bold">Boleto Bancário</span>
                  <span className="text-[10px] text-zinc-500">1 a 2 dias úteis</span>
                </button>
              </div>

              {/* Campos do Cartão de Crédito */}
              {paymentMethod === "CREDIT_CARD" && (
                <div className="pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Nome Impresso no Cartão *
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      placeholder="JOAO DA SILVA"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Número do Cartão *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">
                        Validade (MM/AA) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="12/28"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">CVV *</label>
                      <input
                        type="text"
                        required
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-700 mb-1">
                      Parcelas no Cartão
                    </label>
                    <select
                      value={cardInstallments}
                      onChange={(e) => setCardInstallments(parseInt(e.target.value, 10))}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                    >
                      {[1, 2, 3, 4, 5, 6, 10, 12].map((num) => (
                        <option key={num} value={num}>
                          {num}x de {formatPrice(grandTotal / num)} sem juros
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coluna Lateral: Resumo do Pedido (4 colunas) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <h3 className="font-black text-base text-zinc-950 pb-3 border-b border-zinc-100">
                Itens no Pedido ({items.length})
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.produto.id} className="flex gap-3 text-xs">
                    <div className="relative w-12 h-12 rounded-lg bg-zinc-50 border border-zinc-200 overflow-hidden shrink-0">
                      {i.produto.imgUrl && (
                        <Image
                          src={i.produto.imgUrl}
                          alt={i.produto.titulo}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-zinc-900 line-clamp-1">{i.produto.titulo}</p>
                      <p className="text-zinc-500 text-[11px]">
                        {i.quantidade}x {formatPrice(i.produto.preco_site ?? i.produto.precovenda)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totais */}
              <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal:</span>
                  <span className="font-bold text-zinc-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Frete selecionado:</span>
                  <span className="font-bold text-zinc-900">
                    {selectedShipping ? (
                      selectedShipping.preco === 0 ? (
                        <span className="text-emerald-700">Grátis (Retirada)</span>
                      ) : (
                        formatPrice(selectedShipping.preco)
                      )
                    ) : (
                      "Informe o CEP"
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-zinc-950 pt-2 border-t border-zinc-100">
                  <span>Total a Pagar:</span>
                  <span className="text-xl text-[#FF6B00]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 bg-[#FF6B00] hover:bg-[#E65A00] text-white font-black text-sm rounded-xl shadow-lg glow-orange flex items-center justify-center gap-2"
              >
                {submitting ? "Processando Pedido..." : "Confirmar e Pagar Pedido"}
              </Button>
            </div>
          </div>
        </form>

        {/* Modal de Pagamento Pix com QR Code e Copia e Cola */}
        {pixData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-xl font-black text-zinc-950">
                  Pedido #{pixData.orderId} Gerado!
                </h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Escaneie o QR Code abaixo no app do seu banco ou use a chave Copia e Cola.
                </p>
              </div>

              {pixData.qrCode && (
                <div className="relative w-48 h-48 mx-auto p-2 bg-white rounded-2xl border border-zinc-200 shadow-md">
                  <Image
                    src={pixData.qrCode}
                    alt="QR Code Pix"
                    fill
                    className="object-contain p-2"
                  />
                </div>
              )}

              {pixData.copiaECola && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase mb-1">
                    Pix Copia e Cola:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixData.copiaECola}
                      className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono text-zinc-700 select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-3.5 py-2 bg-[#FF6B00] text-white rounded-xl text-xs font-bold hover:bg-[#E65A00] flex items-center gap-1 shrink-0"
                    >
                      {copiedPix ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedPix ? "Copiado!" : "Copiar"}</span>
                    </button>
                  </div>
                </div>
              )}

              <Button
                asChild
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-2.5 rounded-xl"
              >
                <Link href={`/pedidos`}>Acompanhar Meus Pedidos</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
