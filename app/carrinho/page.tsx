"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { useCartContext } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { calculateShipping } from "@/lib/shipping";
import { ShippingOption } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } = useCartContext();

  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[] | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState("");

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setShippingError("");
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) {
      setShippingError("Digite um CEP válido com 8 dígitos.");
      return;
    }
    setShippingLoading(true);
    try {
      const opts = await calculateShipping({ cep: clean, subtotal });
      setShippingOptions(opts);
      setSelectedShipping(opts[0]);
    } catch (err: any) {
      setShippingError(err.message || "Erro ao calcular frete.");
    } finally {
      setShippingLoading(false);
    }
  };

  const shippingCost = selectedShipping?.preco || 0;
  const grandTotal = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="bg-[#F8F9FA] min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-zinc-900">Seu carrinho está vazio</h2>
          <p className="text-xs text-zinc-500 mt-2">
            Adicione itens ao carrinho navegando por nossas categorias ou pesquisando por seu veículo.
          </p>
          <Button
            asChild
            className="mt-6 bg-[#FF6B00] hover:bg-[#E65A00] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md"
          >
            <Link href="/produtos">Navegar no Catálogo</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Carrinho de Compras ({totalItems} itens)
          </h1>
          <button
            onClick={clearCart}
            className="text-xs text-zinc-500 hover:text-red-600 transition-colors"
          >
            Esvaziar Carrinho
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lista de Itens (8 colunas) */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => {
              const price = item.produto.preco_site ?? item.produto.precovenda;
              const isUsed = item.produto.conservacao === "USADO";

              return (
                <div
                  key={item.produto.id}
                  className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-50 border border-zinc-200 shrink-0">
                      {item.produto.imgUrl ? (
                        <Image
                          src={item.produto.imgUrl}
                          alt={item.produto.titulo}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                          Sem foto
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        {isUsed ? (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-zinc-900 text-[#FF6B00]">
                            PEÇA SEMINOVA
                          </span>
                        ) : (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                            NOVA
                          </span>
                        )}
                        {item.produto.fabricante && (
                          <span className="text-[11px] font-bold text-zinc-500 uppercase">
                            {item.produto.fabricante}
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/produto/${item.produto.id}`}
                        className="font-bold text-sm text-zinc-900 hover:text-[#FF6B00] transition-colors line-clamp-1 mt-1"
                      >
                        {item.produto.titulo}
                      </Link>

                      <div className="text-xs text-zinc-500 mt-0.5">
                        Unitário: {formatPrice(price)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                    {/* Controles de Quantidade */}
                    <div className="flex items-center border border-zinc-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.produto.id, item.quantidade - 1)}
                        className="p-1.5 text-zinc-600 hover:bg-zinc-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-zinc-900">
                        {item.quantidade}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.produto.id, item.quantidade + 1)}
                        disabled={item.quantidade >= item.produto.estoque}
                        className="p-1.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Preço Total do Item */}
                    <div className="text-right">
                      <span className="text-base font-black text-zinc-950 block">
                        {formatPrice(price * item.quantidade)}
                      </span>
                    </div>

                    {/* Botão Remover */}
                    <button
                      onClick={() => removeItem(item.produto.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <Link
                href="/produtos"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] hover:text-[#E65A00]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continuar Comprando</span>
              </Link>
            </div>
          </div>

          {/* Resumo do Pedido (4 colunas) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-5">
              <h3 className="font-black text-base text-zinc-950 pb-3 border-b border-zinc-100">
                Resumo da Compra
              </h3>

              {/* Cálculo de Frete no Carrinho */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#FF6B00]" />
                  Calcular Frete
                </label>
                <form onSubmit={handleCalculateShipping} className="flex gap-2">
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="CEP de entrega"
                    maxLength={9}
                    className="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                  />
                  <Button
                    type="submit"
                    disabled={shippingLoading}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-3 py-2 rounded-xl"
                  >
                    {shippingLoading ? "..." : "Ok"}
                  </Button>
                </form>
                {shippingError && (
                  <p className="text-[11px] text-red-500 mt-1">{shippingError}</p>
                )}

                {shippingOptions && (
                  <div className="mt-3 space-y-1.5">
                    {shippingOptions.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          selectedShipping?.id === opt.id
                            ? "border-[#FF6B00] bg-orange-50/50"
                            : "border-zinc-200 hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="shipping"
                            checked={selectedShipping?.id === opt.id}
                            onChange={() => setSelectedShipping(opt)}
                            className="accent-[#FF6B00]"
                          />
                          <div>
                            <span className="font-semibold text-zinc-900 block">{opt.nome}</span>
                            <span className="text-[10px] text-zinc-500">{opt.prazo}</span>
                          </div>
                        </div>
                        <span className="font-black text-zinc-900">
                          {opt.preco === 0 ? "GRÁTIS" : formatPrice(opt.preco)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Valores Totais */}
              <div className="space-y-2 pt-3 border-t border-zinc-100 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal dos produtos:</span>
                  <span className="font-bold text-zinc-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Frete estimado:</span>
                  <span className="font-bold text-zinc-900">
                    {selectedShipping ? (
                      selectedShipping.preco === 0 ? (
                        <span className="text-emerald-700">Grátis (Retirada)</span>
                      ) : (
                        formatPrice(selectedShipping.preco)
                      )
                    ) : (
                      "A calcular"
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-zinc-950 pt-2 border-t border-zinc-100">
                  <span>Total do Pedido:</span>
                  <span className="text-xl text-[#FF6B00]">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* Botão de Fechar Pedido */}
              <Button
                asChild
                className="w-full h-12 bg-[#FF6B00] hover:bg-[#E65A00] text-white font-black text-sm rounded-xl shadow-lg glow-orange flex items-center justify-center gap-2"
              >
                <Link href="/checkout">
                  <span>Prosseguir para Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-500 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
                  <span>Compra 100% Segura</span>
                </div>
                <p>Garantia de 90 dias, nota fiscal e pagamento seguro via Asaas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
