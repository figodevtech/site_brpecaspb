"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { useCartContext } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { ShippingSimulator } from "@/components/product/ShippingSimulator";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems, isLoaded } = useCartContext();

  const grandTotal = subtotal;

  if (!isLoaded) return <div role="status" className="container mx-auto px-4 py-16">Carregando seu carrinho...</div>;

  if (items.length === 0) {
    return (
      <div className="bg-[#F8F9FA] min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200 p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-zinc-900">Seu carrinho está vazio</h2>
          <p className="text-xs text-zinc-500 mt-2">
            Adicione itens ao carrinho navegando pelas categorias ou buscando pelo nome ou código da peça.
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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Carrinho de Compras ({totalItems} itens)
          </h1>
          <Button type="button" variant="ghost" size="sm"
            onClick={clearCart}
            className="text-xs text-zinc-500 hover:text-red-600 transition-colors"
          >
            Esvaziar Carrinho
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lista de Itens (8 colunas) */}
          <div className="min-w-0 lg:col-span-8 space-y-4">
            {items.map((item) => {
              const price = item.produto.preco_site ?? item.produto.precovenda;
              const isUsed = item.produto.conservacao === "USADO";

              return (
                <div
                  key={item.produto.id}
                  className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm"
                >
                  <div className="flex min-w-0 w-full sm:w-auto items-center gap-3 sm:gap-4">
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

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
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
                      <Button type="button" variant="ghost" size="sm"
                        onClick={() => updateQuantity(item.produto.id, item.quantidade - 1)}
                         aria-label={`Diminuir quantidade de ${item.produto.titulo}`}
                        className="p-1.5 text-zinc-600 hover:bg-zinc-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <span className="px-3 text-xs font-bold text-zinc-900">
                        {item.quantidade}
                      </span>
                      <Button type="button" variant="ghost" size="sm"
                        onClick={() => updateQuantity(item.produto.id, item.quantidade + 1)}
                         aria-label={`Aumentar quantidade de ${item.produto.titulo}`}
                        disabled={item.quantidade >= item.produto.estoque}
                        className="p-1.5 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Preço Total do Item */}
                    <div className="text-right">
                      <span className="text-base font-black text-zinc-950 block">
                        {formatPrice(price * item.quantidade)}
                      </span>
                    </div>

                    {/* Botão Remover */}
                    <Button type="button" variant="ghost" size="sm"
                      onClick={() => removeItem(item.produto.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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

              <ShippingSimulator productIds={items.map(item=>item.produto.id)} prefillFromAccount/>

              {/* Valores Totais */}
              <div className="space-y-2 pt-3 border-t border-zinc-100 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal dos produtos:</span>
                  <span className="font-bold text-zinc-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Frete estimado:</span>
                  <span className="font-bold text-zinc-900">
                    A combinar com a loja
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
