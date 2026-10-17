"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Package,
  MapPin,
  Car,
  Clock,
  ShieldCheck,
  Search,
  ExternalLink,
  Phone,
  AlertCircle,
  CheckCircle2,
  Truck,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

interface Order {
  id: number;
  status: string;
  status_entrega?: string;
  valortotal: number;
  sub_total: number;
  forma_pagamento?: string;
  datavenda?: string;
  createdat?: string;
  codigo_rastreio?: string;
  transportadora?: string;
  url_rastreio?: string;
  gateway_status?: string;
  endereco_entrega_snapshot?: any;
}

interface Address {
  id: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  principal: boolean;
}

interface SavedVehicle {
  montadora: string;
  modelo: string;
  ano: number;
  motor?: string;
}

export default function ContaPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"pedidos" | "enderecos" | "veiculos">("pedidos");

  const [cliente, setCliente] = useState<any>(null);
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicle[]>([]);

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedId = localStorage.getItem("brpecas_client_id");
    if (savedId) {
      setIdentifier(savedId);
      fetchAccountData(savedId);
    }

    const localVehicles = localStorage.getItem("brpecas_garage_vehicles");
    if (localVehicles) {
      try {
        setSavedVehicles(JSON.parse(localVehicles));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const fetchAccountData = async (ident: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/conta?identificador=${encodeURIComponent(ident)}`);
      const data = await res.json();

      if (!res.ok || !data.found) {
        throw new Error(data.message || data.error || "Cadastro não localizado. Verifique o CPF ou e-mail.");
      }

      setCliente(data.cliente);
      setPedidos(data.pedidos || []);
      localStorage.setItem("brpecas_client_id", ident);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao carregar conta.");
      setCliente(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (identifier.trim()) {
      fetchAccountData(identifier.trim());
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("brpecas_client_id");
    setCliente(null);
    setPedidos([]);
    setIdentifier("");
  };

  // Veículos da Garagem
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const montadora = (form.elements.namedItem("montadora") as HTMLSelectElement).value;
    const modelo = (form.elements.namedItem("modelo") as HTMLInputElement).value.trim();
    const ano = parseInt((form.elements.namedItem("ano") as HTMLInputElement).value, 10);
    const motor = (form.elements.namedItem("motor") as HTMLInputElement).value.trim();

    if (!montadora || !modelo || !ano) return;

    const updated = [...savedVehicles, { montadora, modelo, ano, motor }];
    setSavedVehicles(updated);
    localStorage.setItem("brpecas_garage_vehicles", JSON.stringify(updated));
    form.reset();
  };

  const handleRemoveVehicle = (idx: number) => {
    const updated = savedVehicles.filter((_, i) => i !== idx);
    setSavedVehicles(updated);
    localStorage.setItem("brpecas_garage_vehicles", JSON.stringify(updated));
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-zinc-900">
            Início
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Minha Conta</span>
        </nav>

        {!cliente ? (
          /* Formulário de Identificação / Login */
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center mx-auto border border-orange-100">
                <User className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-black text-zinc-950">Acesse sua Conta</h1>
              <p className="text-xs text-zinc-500">
                Acompanhe seus pedidos, códigos de rastreio, endereços cadastrados e veículos salvos na garagem.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  CPF ou E-mail utilizado na compra
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="000.000.000-00 ou seu@email.com"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#FF6B00] hover:bg-[#E65A00] text-white font-black text-xs rounded-xl shadow-md glow-orange"
              >
                {loading ? "Localizando Cadastro..." : "Consultar Meus Pedidos"}
              </Button>
            </form>

            <div className="pt-4 border-t border-zinc-100 text-center">
              <p className="text-[11px] text-zinc-400">
                Ainda não fez compras? Suas informações serão salvas automaticamente ao finalizar seu primeiro pedido.
              </p>
            </div>
          </div>
        ) : (
          /* Painel da Conta do Cliente */
          <div className="space-y-8">
            {/* Header com dados do usuário */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0B0D12] text-white flex items-center justify-center font-black text-xl border border-zinc-800 shadow-md">
                  {cliente.nome ? cliente.nome.charAt(0).toUpperCase() : "C"}
                </div>
                <div>
                  <h1 className="text-xl font-black text-zinc-950">{cliente.nome}</h1>
                  <p className="text-xs text-zinc-500">
                    CPF/CNPJ: <span className="font-mono">{cliente.cpfCnpj}</span> | E-mail: {cliente.email}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-xs font-bold border-zinc-300 text-zinc-700 hover:bg-zinc-100 rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Desconectar
              </Button>
            </div>

            {/* Navegação das Abas */}
            <div className="flex gap-2 border-b border-zinc-200 pb-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab("pedidos")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === "pedidos"
                    ? "bg-[#FF6B00] text-white shadow-md glow-orange"
                    : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                <Package className="w-4 h-4" />
                Meus Pedidos ({pedidos.length})
              </button>

              <button
                onClick={() => setActiveTab("veiculos")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === "veiculos"
                    ? "bg-[#FF6B00] text-white shadow-md glow-orange"
                    : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                <Car className="w-4 h-4" />
                Minha Garagem ({savedVehicles.length})
              </button>

              <button
                onClick={() => setActiveTab("enderecos")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === "enderecos"
                    ? "bg-[#FF6B00] text-white shadow-md glow-orange"
                    : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                <MapPin className="w-4 h-4" />
                Endereços Salvos ({cliente.enderecos?.length || 0})
              </button>
            </div>

            {/* Conteúdo Aba Pedidos */}
            {activeTab === "pedidos" && (
              <div className="space-y-4">
                {pedidos.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-3">
                    <Package className="w-12 h-12 text-zinc-300 mx-auto" />
                    <h3 className="font-black text-sm text-zinc-800">Nenhum pedido realizado ainda</h3>
                    <p className="text-xs text-zinc-500">
                      Explore nosso estoque de peças novas e seminovas revisadas.
                    </p>
                    <Button asChild className="bg-[#FF6B00] text-white text-xs font-bold mt-2">
                      <Link href="/produtos">Ir para a Loja</Link>
                    </Button>
                  </div>
                ) : (
                  pedidos.map((order) => {
                    const isPaid = order.status === "PAGO";
                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4 hover:border-zinc-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-zinc-100 gap-2">
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-bold text-zinc-400">
                              Pedido realizado em{" "}
                              {new Date(order.createdat || order.datavenda || "").toLocaleDateString("pt-BR")}
                            </span>
                            <h3 className="text-base font-black text-zinc-950">
                              Pedido #{order.id}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full ${
                                isPaid
                                  ? "bg-emerald-100 text-emerald-800"
                                  : order.status === "CANCELADO"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {isPaid
                                ? "Pagamento Confirmado"
                                : order.status === "CANCELADO"
                                ? "Cancelado"
                                : "Aguardando Pagamento"}
                            </span>

                            {order.status_entrega && (
                              <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                                {order.status_entrega}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="font-bold text-zinc-500 block mb-1">Pagamento:</span>
                            <span className="text-zinc-900 font-semibold">{order.forma_pagamento || "Asaas"}</span>
                            <p className="text-base font-black text-[#FF6B00] mt-1">
                              {formatPrice(order.valortotal)}
                            </p>
                          </div>

                          <div>
                            <span className="font-bold text-zinc-500 block mb-1">Envio / Rastreamento:</span>
                            {order.codigo_rastreio ? (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                                  <Truck className="w-3.5 h-3.5 text-[#FF6B00]" />
                                  {order.codigo_rastreio}
                                </span>
                                {order.transportadora && (
                                  <span className="text-zinc-500 block text-[11px]">
                                    Via {order.transportadora}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-zinc-400">Em preparação no estoque</span>
                            )}
                          </div>

                          <div className="flex flex-col sm:items-end justify-center gap-2">
                            <Button
                              asChild
                              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl"
                            >
                              <Link href={`/rastreio?codigo=${order.id}`}>
                                Acompanhar Rastreio
                                <ChevronRight className="w-3.5 h-3.5 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Conteúdo Aba Minha Garagem (Veículos Salvos) */}
            {activeTab === "veiculos" && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Car className="w-4 h-4 text-[#FF6B00]" />
                    Adicionar Veículo à Minha Garagem
                  </h3>
                  <p className="text-xs text-zinc-500 mb-6">
                    Cadastre os veículos da sua frota ou oficina para filtrar peças compatíveis com 1 clique em todo o site.
                  </p>

                  <form onSubmit={handleAddVehicle} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">Montadora *</label>
                      <select
                        name="montadora"
                        required
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                      >
                        <option value="TOYOTA">TOYOTA</option>
                        <option value="LAND ROVER">LAND ROVER</option>
                        <option value="FIAT">FIAT</option>
                        <option value="HONDA">HONDA</option>
                        <option value="CHEVROLET">CHEVROLET</option>
                        <option value="VOLKSWAGEN">VOLKSWAGEN</option>
                        <option value="FORD">FORD</option>
                        <option value="JEEP">JEEP</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">Modelo *</label>
                      <input
                        type="text"
                        name="modelo"
                        required
                        placeholder="Ex: HILUX, STRADA, CIVIC"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">Ano de Fabricação *</label>
                      <input
                        type="number"
                        name="ano"
                        required
                        min={1990}
                        max={2030}
                        placeholder="Ex: 2018"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 mb-1">Motor / Versão</label>
                      <input
                        type="text"
                        name="motor"
                        placeholder="Ex: 2.8 DIESEL / 1.4 FIRE"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-[#FF6B00]"
                      />
                    </div>

                    <div className="sm:col-span-4 flex justify-end">
                      <Button
                        type="submit"
                        className="bg-[#FF6B00] hover:bg-[#E65A00] text-white font-bold text-xs rounded-xl"
                      >
                        Salvar Veículo na Garagem
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Lista de veículos cadastrados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {savedVehicles.map((v, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-3 relative group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF6B00] flex items-center justify-center font-bold">
                          <Car className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-zinc-900">
                            {v.montadora} {v.modelo}
                          </h4>
                          <span className="text-[11px] text-zinc-500 font-semibold">
                            Ano {v.ano} {v.motor && `• ${v.motor}`}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-zinc-100">
                        <Button
                          asChild
                          size="sm"
                          className="bg-[#0B0D12] hover:bg-zinc-800 text-white text-[11px] font-bold rounded-lg"
                        >
                          <Link href={`/produtos?montadora=${v.montadora}&modelo=${v.modelo}&ano=${v.ano}`}>
                            Ver Peças Compatíveis
                          </Link>
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleRemoveVehicle(i)}
                          className="text-[11px] text-zinc-400 hover:text-red-600 transition-colors"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conteúdo Aba Endereços */}
            {activeTab === "enderecos" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cliente.enderecos?.length === 0 ? (
                  <div className="sm:col-span-2 bg-white rounded-3xl border border-zinc-200 p-8 text-center text-xs text-zinc-500">
                    Nenhum endereço secundário registrado. Seus endereços de entrega são salvos a cada compra.
                  </div>
                ) : (
                  cliente.enderecos?.map((end: Address) => (
                    <div
                      key={end.id}
                      className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-2 relative"
                    >
                      {end.principal && (
                        <span className="inline-block text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mb-1">
                          Principal
                        </span>
                      )}
                      <p className="text-xs font-bold text-zinc-900">
                        {end.logradouro}, {end.numero} {end.complemento && `(${end.complemento})`}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {end.bairro} — {end.cidade}/{end.estado}
                      </p>
                      <p className="font-mono text-xs text-zinc-400">CEP: {end.cep}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
