import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Lock,
  FileText,
  Truck,
} from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="bg-[#0B0D12] text-zinc-300 border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Selos de Confiança e Benefícios */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-white/10">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#141821] border border-white/5">
            <div className="p-2.5 rounded-lg bg-orange-950/80 text-[#FF6B00] shrink-0 border border-orange-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Peças Selecionadas & Testadas</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Rigoroso controle de qualidade, testes em bancada e procedência garantida.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#141821] border border-white/5">
            <div className="p-2.5 rounded-lg bg-orange-950/80 text-[#FF6B00] shrink-0 border border-orange-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Garantia Comprovada</h4>
              <p className="text-xs text-zinc-400 mt-1">
                90 dias de garantia em peças seminovas testadas e garantia de fábrica nas novas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#141821] border border-white/5">
            <div className="p-2.5 rounded-lg bg-orange-950/80 text-[#FF6B00] shrink-0 border border-orange-500/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Envio p/ Todo Brasil</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Correios, transportadoras parceiras e retirada presencial grátis em Cabedelo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#141821] border border-white/5">
            <div className="p-2.5 rounded-lg bg-orange-950/80 text-[#FF6B00] shrink-0 border border-orange-500/30">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Pagamento Seguro</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Pix com confirmação instantânea, Cartão de Crédito e Boleto via Asaas.
              </p>
            </div>
          </div>
        </div>

        {/* Links Principais e Contato */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
          {/* Coluna 1: Sobre & Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-orange-500/60">
                <Image
                  src="/brand/logo_br_symbol.png"
                  alt="BR Peças PB"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-extrabold text-lg text-white">
                BR PEÇAS <span className="text-[#FF6B00]">PB</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Especialistas no comércio de peças e acessórios automotivos novos e seminovos originais testados. Rigor técnico, fotos reais do produto e procedência garantida.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.whatsappDefaultMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all shadow-md"
              >
                <Phone className="w-4 h-4" />
                Falar no WhatsApp Oficial
              </a>
            </div>
          </div>

          {/* Coluna 2: Navegação & Categorias */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 border-l-2 border-[#FF6B00] pl-2.5">
              Departamentos
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/categoria/painel-de-instrumentos" className="hover:text-white transition-colors">
                  Painéis de Instrumentos
                </Link>
              </li>
              <li>
                <Link href="/categoria/modulos" className="hover:text-white transition-colors">
                  Módulos de Injeção & Freio
                </Link>
              </li>
              <li>
                <Link href="/categoria/freios" className="hover:text-white transition-colors">
                  Freios & Pinças
                </Link>
              </li>
              <li>
                <Link href="/categoria/volantes" className="hover:text-white transition-colors">
                  Volantes Automotivos
                </Link>
              </li>
              <li>
                <Link href="/categoria/motor" className="hover:text-white transition-colors">
                  Motores & Componentes
                </Link>
              </li>
              <li>
                <Link href="/produtos?condicao=USADO" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
                  Catálogo de Peças Seminovas
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Institucional & Conformidade */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 border-l-2 border-[#FF6B00] pl-2.5">
              Institucional & Legal
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/trocas-e-devolucoes" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-orange-500" />
                  Garantia e Devoluções
                </Link>
              </li>
              <li>
                <Link href="/trocas-e-devolucoes" className="hover:text-white transition-colors">
                  Política de Trocas e Garantia
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidade" className="hover:text-white transition-colors">
                  Privacidade & LGPD
                </Link>
              </li>
              <li>
                <Link href="/fale-conosco" className="hover:text-white transition-colors">
                  Fale Conosco / Suporte
                </Link>
              </li>
              <li>
                <Link href="/conta" className="hover:text-white transition-colors">
                  Minha Conta & Pedidos
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Localização e Dados Fiscais */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm mb-4 border-l-2 border-[#FF6B00] pl-2.5">
              Loja Física & Retirada
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-zinc-400">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <span>{siteConfig.address.full}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-400">
              <Clock className="w-4 h-4 text-orange-500 shrink-0" />
              <span>{siteConfig.openingHours}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-400">
              <Mail className="w-4 h-4 text-orange-500 shrink-0" />
              <span>{siteConfig.email}</span>
            </div>
            <div className="pt-2 text-[11px] text-zinc-500 border-t border-white/5 space-y-0.5">
              <p>Razão Social: {siteConfig.legalName}</p>
              <p>CNPJ: {siteConfig.cnpj} | IE: {siteConfig.ie}</p>
            </div>
          </div>
        </div>

        {/* Rodapé Final com Direitos e Formas de Pagamento */}
        <div className="pt-8 mt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 text-[11px]">Pagamentos processados com segurança por</span>
            <span className="font-extrabold text-white bg-zinc-800 px-2 py-0.5 rounded text-[11px] border border-zinc-700">
              Asaas Gateway
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
