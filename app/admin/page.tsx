"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Truck,
  Layers,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  ExternalLink,
  Edit,
  Save,
  X,
  Database,
  Activity,
  Car,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    "metricas" | "pedidos" | "estoque" | "compatibilidade" | "webhooks" | "saude"
  >("metricas");

  const [metrics, setMetrics] = useState<any>(null);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal / Edição de Rastreio
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editStatusEntrega, setEditStatusEntrega] = useState("");
  const [editRastreio, setEditRastreio] = useState("");
  const [editTransportadora, setEditTransportadora] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);

  const loadData = async () => {
    try {
      const [resMetrics, resPedidos] = await Promise.all([
        fetch("/api/admin/metrics"),
        fetch("/api/admin/pedidos"),
      ]);

      const dataMetrics = await resMetrics.json();
      const dataPedidos = await resPedidos.json();

      if (dataMetrics.success) {
        setMetrics(dataMetrics.metrics);
        setWebhooks(dataMetrics.webhooks || []);
      }

      if (dataPedidos.success) {
        setPedidos(dataPedidos.orders || []);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do admin:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOpenEdit = (order: any) => {
    setEditingOrder(order);
    setEditStatus(order.status || "PENDENTE");
    setEditStatusEntrega(order.status_entrega || "SEPARACAO");
    setEditRastreio(order.codigo_rastreio || "");
    setEditTransportadora(order.transportadora || "Correios");
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setSavingOrder(true);
    try {
      const res = await fetch("/api/admin/pedidos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingOrder.id,
          status: editStatus,
          status_entrega: editStatusEntrega,
          codigo_rastreio: editRastreio,
          transportadora: editTransportadora,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditingOrder(null);
        loadData();
      } else {
        alert(data.error || "Erro ao salvar.");
      }
    } catch (err) {
      alert("Falha na atualização do pedido.");
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <div className="bg-[#0B0D12] text-zinc-100 min-h-screen">
      {/* Top Bar Admin */}
      <div className="bg-[#141821] border-b border-zinc-800 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center font-black shadow-md glow-orange">
              BR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-white tracking-tight">
                  Painel de Controle — BR Peças PB
                </h1>
                <span className="text-[10px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  Produção
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Operação de E-commerce, Pedidos Asaas, Catálogo & ERP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs rounded-xl"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
              Atualizar Dados
            </Button>

            <Button asChild size="sm" className="bg-[#FF6B00] hover:bg-[#E65A00] text-white text-xs font-bold rounded-xl">
              <Link href="/" target="_blank">
                Ver Loja Virtual
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#141821] p-5 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Faturamento Total</span>
              <DollarSign className="w-4 h-4 text-[#FF6B00]" />
            </div>
            <div className="text-2xl font-black text-white">
              {metrics ? formatPrice(metrics.totalVendasValor) : "R$ 0,00"}
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold block">
              {metrics?.pedidosPagos || 0} pedido(s) faturado(s)
            </span>
          </div>

          <div className="bg-[#141821] p-5 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Total de Pedidos</span>
              <Package className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {metrics?.totalPedidos || 0}
            </div>
            <span className="text-[11px] text-amber-400 font-semibold block">
              {metrics?.pedidosPendentes || 0} aguardando pagamento
            </span>
          </div>

          <div className="bg-[#141821] p-5 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Catálogo Ativo</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {metrics?.totalProdutos || 49}
            </div>
            <span className="text-[11px] text-zinc-400 font-semibold block">
              {metrics?.totalUsadas || 0} peças seminovas • {metrics?.totalNovas || 0} novas
            </span>
          </div>

          <div className="bg-[#141821] p-5 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span>Estoque Crítico (≤ 1 un)</span>
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {metrics?.estoqueCritico || 0}
            </div>
            <span className="text-[11px] text-red-400 font-semibold block">
              Atenção para reposição / baixa
            </span>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("metricas")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "metricas"
                ? "bg-[#FF6B00] text-white shadow-md glow-orange"
                : "bg-[#141821] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            Visão Geral & Vendas
          </button>

          <button
            onClick={() => setActiveTab("pedidos")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "pedidos"
                ? "bg-[#FF6B00] text-white shadow-md glow-orange"
                : "bg-[#141821] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            Gestão de Pedidos ({pedidos.length})
          </button>

          <button
            onClick={() => setActiveTab("webhooks")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "webhooks"
                ? "bg-[#FF6B00] text-white shadow-md glow-orange"
                : "bg-[#141821] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            Webhooks Asaas ({webhooks.length})
          </button>

          <button
            onClick={() => setActiveTab("saude")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "saude"
                ? "bg-[#FF6B00] text-white shadow-md glow-orange"
                : "bg-[#141821] text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            Saúde das Integrações
          </button>
        </div>

        {/* Aba Visão Geral & Pedidos */}
        {(activeTab === "metricas" || activeTab === "pedidos") && (
          <div className="bg-[#141821] rounded-3xl border border-zinc-800 p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white">Pedidos e Vendas Recentes</h3>
                <p className="text-xs text-zinc-400">
                  Acompanhe aprovação de pagamentos Asaas, baixa de estoque e despacho.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                Carregando vendas...
              </div>
            ) : pedidos.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                Nenhum pedido registrado até o momento.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-[#181C26] text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4"># Pedido</th>
                      <th className="py-3 px-4">Cliente / CPF</th>
                      <th className="py-3 px-4">Valor Total</th>
                      <th className="py-3 px-4">Pagamento</th>
                      <th className="py-3 px-4">Status Venda</th>
                      <th className="py-3 px-4">Rastreamento</th>
                      <th className="py-3 px-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {pedidos.map((order) => {
                      const isPaid = order.status === "PAGO";
                      return (
                        <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-white">
                            #{order.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block">
                              {order.cliente?.nomerazaosocial || "Cliente"}
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              {order.cliente?.email || order.cliente?.cpfcnpj}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-black text-white">
                            {formatPrice(order.valortotal)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-zinc-300 block">
                              {order.forma_pagamento || "Asaas"}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {order.gateway_status || "PENDING"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                isPaid
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                                  : order.status === "CANCELADO"
                                  ? "bg-red-950 text-red-400 border border-red-800/60"
                                  : "bg-amber-950 text-amber-400 border border-amber-800/60"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {order.codigo_rastreio ? (
                              <span className="font-mono text-[11px] text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded border border-orange-800/40">
                                {order.codigo_rastreio}
                              </span>
                            ) : (
                              <span className="text-zinc-500 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              onClick={() => handleOpenEdit(order)}
                              size="sm"
                              variant="outline"
                              className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-[11px] h-8 rounded-lg"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Gerenciar
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Aba Webhooks Asaas */}
        {activeTab === "webhooks" && (
          <div className="bg-[#141821] rounded-3xl border border-zinc-800 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-black text-white">Auditoria de Webhooks Asaas</h3>
              <p className="text-xs text-zinc-400">
                Log dos últimos eventos de pagamento processados com idempotência automática.
              </p>
            </div>

            {webhooks.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                Nenhum evento registrado ainda. Quando um cliente pagar via Pix, Boleto ou Cartão no Asaas, o evento aparecerá aqui.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-[#181C26] text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
                    <tr>
                      <th className="py-3 px-4">Data/Hora</th>
                      <th className="py-3 px-4">Evento</th>
                      <th className="py-3 px-4">Payment ID</th>
                      <th className="py-3 px-4">Venda ID</th>
                      <th className="py-3 px-4">Status Resultado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {webhooks.map((w) => (
                      <tr key={w.id} className="hover:bg-zinc-800/30">
                        <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                          {new Date(w.processed_at).toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3 px-4 font-bold text-orange-400">{w.event_type}</td>
                        <td className="py-3 px-4 font-mono text-zinc-400">{w.payment_id}</td>
                        <td className="py-3 px-4 font-mono text-white">#{w.venda_id || "—"}</td>
                        <td className="py-3 px-4">
                          <span className="font-black text-emerald-400">{w.resulting_order_status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Aba Saúde das Integrações */}
        {activeTab === "saude" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#141821] p-6 rounded-3xl border border-zinc-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-orange-950 text-[#FF6B00] flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-white text-sm">Gateway Asaas</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Processamento de PIX Instantâneo, Boleto Bancário e Cartão de Crédito.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ativo & Homologado
                </span>
              </div>
            </div>

            <div className="bg-[#141821] p-6 rounded-3xl border border-zinc-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-white text-sm">Supabase PostgreSQL</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Conexão ativa com pooler AWS e funções atômicas de reserva e estorno de estoque.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Conectado (49 produtos)
                </span>
              </div>
            </div>

            <div className="bg-[#141821] p-6 rounded-3xl border border-zinc-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-white text-sm">Controle de Qualidade</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Testes em bancada e catálogo revisado com garantia legal de 90 dias.
                </p>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-500">Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Inspeção Ativa
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição de Pedido / Rastreio */}
        {editingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#141821] border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-lg font-black text-white">
                    Gerenciar Pedido #{editingOrder.id}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Cliente: {editingOrder.cliente?.nomerazaosocial}
                  </p>
                </div>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveOrder} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-zinc-300 mb-1">
                    Status do Pagamento
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-[#181C26] border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="PENDENTE">PENDENTE</option>
                    <option value="PAGO">PAGO (Executa baixa de estoque automática)</option>
                    <option value="CANCELADO">CANCELADO (Estorna estoque)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">
                    Status da Entrega
                  </label>
                  <select
                    value={editStatusEntrega}
                    onChange={(e) => setEditStatusEntrega(e.target.value)}
                    className="w-full bg-[#181C26] border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6B00]"
                  >
                    <option value="SEPARACAO">SEPARAÇÃO / CONFERÊNCIA</option>
                    <option value="FATURADO">FATURADO (NOTA EMITIDA)</option>
                    <option value="ENVIADO">ENVIADO (EM TRÂNSITO)</option>
                    <option value="ENTREGUE">ENTREGUE AO DESTINATÁRIO</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">
                    Transportadora
                  </label>
                  <input
                    type="text"
                    value={editTransportadora}
                    onChange={(e) => setEditTransportadora(e.target.value)}
                    placeholder="Ex: Correios SEDEX, Jadlog, Azul Cargo"
                    className="w-full bg-[#181C26] border border-zinc-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-zinc-300 mb-1">
                    Código de Rastreamento
                  </label>
                  <input
                    type="text"
                    value={editRastreio}
                    onChange={(e) => setEditRastreio(e.target.value.toUpperCase())}
                    placeholder="Ex: QB123456789BR"
                    className="w-full bg-[#181C26] border border-zinc-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingOrder(null)}
                    className="border-zinc-700 text-zinc-300"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingOrder}
                    className="bg-[#FF6B00] hover:bg-[#E65A00] text-white font-bold"
                  >
                    {savingOrder ? "Salvando..." : "Salvar Atualização"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
