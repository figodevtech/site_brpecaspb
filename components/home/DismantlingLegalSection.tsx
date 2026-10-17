import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, CheckCircle2, Award, ArrowRight, Wrench, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function DismantlingLegalSection() {
  return (
    <section className="py-20 bg-[#0B0D12] text-white relative overflow-hidden border-y border-white/10">
      {/* Glow e iluminação de fundo */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Lado Esquerdo: Imagem / Badge Cinematográfico */}
          <div className="relative rounded-2xl overflow-hidden border border-orange-500/30 shadow-2xl group">
            <div className="relative aspect-16/10 w-full">
              <Image
                src="/banners/banner_2.jpg"
                alt="Inspeção Técnica de Peças BR Peças PB"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            </div>

            {/* Selo Sobreposto */}
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#FF6B00] text-white shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-[#FF6B00] tracking-wider block">
                  Qualidade Assegurada
                </span>
                <h4 className="text-sm font-bold text-white">
                  Peças Testadas em Bancada de Diagnóstico
                </h4>
              </div>
            </div>
          </div>

          {/* Lado Direito: Texto e Pilares de Qualidade */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/80 border border-orange-500/40 text-[#FF6B00] text-xs font-black tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Controle Rigoroso de Qualidade</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Peças Selecionadas: Compre com <span className="text-[#FF6B00]">Total Confiança</span>
            </h2>

            <p className="text-zinc-300 text-sm leading-relaxed">
              Na <strong>BR Peças PB</strong>, todas as peças automotivas passam por criteriosa avaliação mecânica e elétrica. Componentes originais testados e higienizados, prontos para instalação com nota fiscal e garantia comprovada.
            </p>

            {/* Lista de Garantias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#141821] border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Testes em Bancada</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Componentes elétricos e mecânicos testados antes de disponibilizados.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#141821] border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Fotos Reais do Produto</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Transparência completa: você recebe exatamente a peça anunciada.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#141821] border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Garantia de 90 Dias</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Tranquilidade e segurança para você e seu mecânico.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#141821] border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Nota Fiscal Eletrônica</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Comercialização regularizada com procedência formal e nota fiscal.</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                asChild
                className="bg-[#FF6B00] hover:bg-[#E65A00] text-white font-black text-xs h-11 px-6 rounded-xl shadow-lg glow-orange"
              >
                <Link href="/produtos">
                  <span>Ver Catálogo de Peças</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 text-xs font-bold h-11 px-5 rounded-xl"
              >
                <a
                  href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>Tirar Dúvidas no WhatsApp</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
