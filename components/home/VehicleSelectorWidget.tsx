"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Car, Search, CheckCircle2, RotateCcw, ShieldCheck, Wrench, Truck } from "lucide-react";
import { VehicleOption } from "@/lib/catalog/vehicles";
import { Button } from "@/components/ui/button";

interface VehicleSelectorWidgetProps {
  vehicleOptions: VehicleOption[];
}

export function VehicleSelectorWidget({ vehicleOptions }: VehicleSelectorWidgetProps) {
  const router = useRouter();
  const [selectedMontadora, setSelectedMontadora] = useState("");
  const [selectedModelo, setSelectedModelo] = useState("");
  const [selectedAno, setSelectedAno] = useState("");

  // Modelos disponíveis para a montadora selecionada
  const availableModelos = useMemo(() => {
    if (!selectedMontadora) return [];
    const found = vehicleOptions.find((v) => v.montadora === selectedMontadora);
    return found ? found.modelos : [];
  }, [selectedMontadora, vehicleOptions]);

  // Anos disponíveis para o modelo selecionado
  const availableAnos = useMemo(() => {
    if (!selectedModelo) return [];
    const found = availableModelos.find((m) => m.nome === selectedModelo);
    if (!found) return [];
    const anos: number[] = [];
    for (let y = found.ano_fim; y >= found.ano_inicio; y--) {
      anos.push(y);
    }
    return anos;
  }, [selectedModelo, availableModelos]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedMontadora) params.set("montadora", selectedMontadora);
    if (selectedModelo) params.set("modelo", selectedModelo);
    if (selectedAno) params.set("ano", selectedAno);

    router.push(`/produtos?${params.toString()}`);
  };

  const handleReset = () => {
    setSelectedMontadora("");
    setSelectedModelo("");
    setSelectedAno("");
  };

  return (
    <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Card da Busca em Alto Destaque (Fundo Branco, Faixa Laranja Superior, Sombra 3D) */}
      <div className="bg-white border-2 border-orange-500/25 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden transition-all hover:border-orange-500/40">
        {/* Faixa Gradiente Superior da Identidade Visual BR Peças */}
        <div className="h-2 w-full bg-gradient-to-r from-[#FF6B00] via-amber-400 to-[#FF6B00]" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header do Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] border border-orange-200/80 flex items-center justify-center shrink-0 shadow-sm">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-zinc-950 tracking-tight">
                    Busca Rápida por Veículo
                  </h2>
                  <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Compatibilidade Garantida
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Filtre apenas peças 100% testadas e compatíveis com a marca, modelo e ano do seu carro.
                </p>
              </div>
            </div>

            {(selectedMontadora || selectedModelo || selectedAno) && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-zinc-500 hover:text-[#FF6B00] font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto py-1 px-3 rounded-lg hover:bg-orange-50 border border-zinc-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>

          {/* Formulário de Seleção */}
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Montadora */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-800 mb-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#FF6B00] text-white text-[10px] font-black mr-1.5">
                  1
                </span>
                Montadora / Marca
              </label>
              <select
                value={selectedMontadora}
                onChange={(e) => {
                  setSelectedMontadora(e.target.value);
                  setSelectedModelo("");
                  setSelectedAno("");
                }}
                className="w-full bg-zinc-50 hover:bg-zinc-100/80 focus:bg-white text-zinc-900 text-xs font-bold px-3.5 py-3 rounded-xl border border-zinc-300 focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-500/20 transition-all outline-none cursor-pointer"
              >
                <option value="">Selecione a Marca...</option>
                {vehicleOptions.map((v) => (
                  <option key={v.montadora} value={v.montadora}>
                    {v.montadora}
                  </option>
                ))}
              </select>
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-800 mb-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#FF6B00] text-white text-[10px] font-black mr-1.5">
                  2
                </span>
                Modelo do Veículo
              </label>
              <select
                value={selectedModelo}
                disabled={!selectedMontadora}
                onChange={(e) => {
                  setSelectedModelo(e.target.value);
                  setSelectedAno("");
                }}
                className="w-full bg-zinc-50 hover:bg-zinc-100/80 focus:bg-white text-zinc-900 text-xs font-bold px-3.5 py-3 rounded-xl border border-zinc-300 focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-500/20 transition-all outline-none disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">
                  {selectedMontadora ? "Selecione o Modelo..." : "Escolha a marca primeiro"}
                </option>
                {availableModelos.map((m) => (
                  <option key={m.nome} value={m.nome}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Ano */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-800 mb-1.5">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#FF6B00] text-white text-[10px] font-black mr-1.5">
                  3
                </span>
                Ano de Fabricação
              </label>
              <select
                value={selectedAno}
                disabled={!selectedModelo}
                onChange={(e) => setSelectedAno(e.target.value)}
                className="w-full bg-zinc-50 hover:bg-zinc-100/80 focus:bg-white text-zinc-900 text-xs font-bold px-3.5 py-3 rounded-xl border border-zinc-300 focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-500/20 transition-all outline-none disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">
                  {selectedModelo ? "Selecione o Ano..." : "Escolha o modelo"}
                </option>
                {availableAnos.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão de Busca */}
            <div className="flex flex-col justify-end">
              <Button
                type="submit"
                className="w-full h-[45px] bg-[#FF6B00] hover:bg-[#E65A00] text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 glow-orange transition-all active:scale-95 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Buscar Peças Compatíveis</span>
              </Button>
            </div>
          </form>

          {/* Selos de Confiança na Base do Card */}
          <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
              <span className="font-semibold text-zinc-700">Peças com código OEM e aplicação conferida</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#FF6B00]" />
              <span className="font-semibold text-zinc-700">Garantia de 90 dias em peças seminovas testadas</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#FF6B00]" />
              <span className="font-semibold text-zinc-700">Envio para todo Brasil ou retirada em Cabedelo/PB</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
