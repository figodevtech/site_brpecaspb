"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useCartContext } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, totalItems } =
    useCartContext();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white text-zinc-900 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 bg-[#0B0D12] text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="font-bold text-base">Seu Carrinho ({totalItems})</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner de Aviso de Estoque Real */}
        <div className="bg-orange-50 border-b border-orange-100 px-4 py-2 text-xs text-orange-950 flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0" />
          <span>Peças reservadas temporariamente durante o pedido.</span>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="font-semibold text-zinc-800 text-base">Seu carrinho está vazio</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Explore nosso catálogo com mais de 40 categorias de peças novas e seminovas com garantia.
              </p>
              <Button
                onClick={() => setIsOpen(false)}
                asChild
                className="mt-5 bg-[#FF6B00] hover:bg-[#E65A00] text-white font-bold text-xs"
              >
                <Link href="/produtos">Explorar Catálogo</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => {
              const price = item.produto.preco_site ?? item.produto.precovenda;
              const isUsed = item.produto.conservacao === "USADO";

              return (
                <div
                  key={item.produto.id}
                  className="flex gap-3 p-3 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-colors"
                >
                  {/* Foto */}
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-white shrink-0 border border-zinc-200">
                    {item.produto.imgUrl ? (
                      <Image
                        src={item.produto.imgUrl}
                        alt={item.produto.titulo}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                        Sem foto
                      </div>
                    )}
                    {isUsed && (
                      <span className="absolute top-1 left-1 bg-zinc-900/90 text-white text-[9px] font-extrabold px-1 py-0.5 rounded">
                        SEMINOVA
                      </span>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 line-clamp-2 leading-snug">
                        {item.produto.titulo}
                      </h4>
                      {item.produto.fabricante && (
                        <p className="text-[10px] text-zinc-500 uppercase mt-0.5">
                          {item.produto.fabricante}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100">
                      {/* Quantidade */}
                      <div className="flex items-center border border-zinc-300 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.produto.id, item.quantidade - 1)}
                          className="px-2 py-1 text-zinc-600 hover:bg-zinc-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-zinc-900">
                          {item.quantidade}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.produto.id, item.quantidade + 1)}
                          disabled={item.quantidade >= item.produto.estoque}
                          className="px-2 py-1 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Preço e Excluir */}
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-sm text-zinc-900">
                          {formatPrice(price * item.quantidade)}
                        </span>
                        <button
                          onClick={() => removeItem(item.produto.id)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer com Subtotal e Checkout */}
        {items.length > 0 && (
          <div className="p-4 border-t border-zinc-200 bg-zinc-50 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600">Subtotal:</span>
              <span className="font-black text-lg text-zinc-950">{formatPrice(subtotal)}</span>
            </div>

            <div className="text-[11px] text-zinc-500 flex items-center justify-between">
              <span>Frete e descontos:</span>
              <span>Calculados no checkout</span>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                asChild
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#FF6B00] hover:bg-[#E65A00] text-white font-bold py-3 text-sm rounded-lg shadow-lg flex items-center justify-center gap-2"
              >
                <Link href="/checkout">
                  <span>Fechar Pedido</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                asChild
                className="w-full text-xs font-semibold text-zinc-700"
              >
                <Link href="/carrinho">Ver Carrinho Completo</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
