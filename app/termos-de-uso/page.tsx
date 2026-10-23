import React from "react";
import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Termos de Uso e Condições Gerais | BR Peças PB",
  description:
    "Termos de uso, condições de compra, regras de garantia e comercialização de autopeças novas e peças seminovas revisadas.",
};

export default function TermosUsoPage() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-zinc-900">
            Início
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Termos de Uso</span>
        </nav>

        {/* Hero */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Termos de Uso e Condições Comerciais
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Regras gerais de utilização do portal e-commerce BR Peças PB
              </p>
            </div>
          </div>
        </div>

        {/* Artigos */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-sm space-y-8 text-xs text-zinc-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white text-[11px] font-black flex items-center justify-center">
                1
              </span>
              Natureza da Operação e Produtos Comercializados
            </h2>
            <p>
              A <strong>BR Peças PB</strong> comercializa autopeças automotivas classificadas em duas categorias distintas, claramente sinalizadas em cada anúncio:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-600">
              <li>
                <strong>Peças Novas:</strong> Itens lacrados, fornecidos por fabricantes e distribuidores homologados, acompanhados de garantia integral de fábrica.
              </li>
              <li>
                <strong>Peças Seminovas:</strong> Itens genuínos revisados e rigorosamente inspecionados. Todas as peças passam por testes de bancada e inspeção funcional prévia antes de sua disponibilização.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white text-[11px] font-black flex items-center justify-center">
                2
              </span>
              Compatibilidade e Responsabilidade Técnica
            </h2>
            <p>
              Busque no catálogo pelo nome, marca, código ou referência da peça. Cabe ao cliente e/ou mecânico instalador verificar a exata correspondência do código da peça original do veículo antes da aquisição e instalação.
            </p>
            <p>
              Em caso de dúvidas prévias sobre encaixe, chicotes ou calibração de módulos, nosso suporte técnico está à disposição via WhatsApp oficial.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white text-[11px] font-black flex items-center justify-center">
                3
              </span>
              Prazos de Garantia e Condições de Troca
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600">
              <li>
                <strong>Garantia Legal de 90 dias:</strong> Válida para todas as peças seminovas e novas contra defeitos de funcionamento, contados a partir da data de entrega do produto.
              </li>
              <li>
                <strong>Lacres de Segurança:</strong> As peças são enviadas com lacres invioláveis e marcações de inspeção. O rompimento, remoção ou adulteração desses lacres anula a garantia comercial.
              </li>
              <li>
                <strong>Direito de Arrependimento:</strong> Conforme o Código de Defesa do Consumidor (art. 49), compras realizadas pela internet podem ser canceladas em até 7 dias corridos após o recebimento, desde que o produto permaneça sem uso e em perfeito estado.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white text-[11px] font-black flex items-center justify-center">
                4
              </span>
              Envios, Prazos e Cargas Pesadas
            </h2>
            <p>
              Os envios são efetuados via Correios (PAC e SEDEX) ou transportadoras rodoviárias especializadas para componentes de grande porte (como blocos de motor, transmissões completas e eixos). Peças pesadas são enviadas paletizadas e seguradas contra avarias no transporte.
            </p>
            <p>
              Clientes da Região Metropolitana de João Pessoa e Cabedelo podem optar pela retirada presencial gratuita em nossa loja física.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
