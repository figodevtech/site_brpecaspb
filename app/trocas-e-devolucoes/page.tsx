import React from "react";
import Link from "next/link";
import { RefreshCw, ShieldCheck, CheckCircle2, Clock, Phone, AlertCircle } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Trocas, Devoluções e Garantia",
  description:
    "Conheça as regras de troca, devolução em até 7 dias e garantia de 90 dias da BR Peças PB.",
};

export default function TrocasEDevolucoesPage() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div>
          <nav className="text-xs text-zinc-500 mb-2 flex items-center gap-1.5">
            <Link href="/" className="hover:text-zinc-900">
              Início
            </Link>
            <span>/</span>
            <span className="text-zinc-900 font-semibold">Trocas e Devoluções</span>
          </nav>
          <h1 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
            Política de Trocas, Devoluções e Garantia
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Garantia legal, transparência e respeito ao Código de Defesa do Consumidor (Lei 8.078/1990).
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-sm space-y-6 text-xs sm:text-sm text-zinc-700 leading-relaxed">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-950">
            <ShieldCheck className="w-5 h-5 text-[#FF6B00] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold">Garantia Legal de 90 Dias</h3>
              <p className="text-xs text-zinc-700 mt-1">
                Todas as peças seminovas comercializadas pela BR Peças PB possuem garantia legal de 90 (noventa) dias a contar da data de recebimento do produto, cobrindo eventuais falhas de funcionamento elétrico ou mecânico.
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-900">
              1. Direito de Arrependimento (Compras Online)
            </h2>
            <p>
              Conforme o <strong>Artigo 49 do Código de Defesa do Consumidor</strong>, nas compras efetuadas fora do estabelecimento comercial (pelo site ou WhatsApp), o cliente tem até <strong>7 (sete) dias corridos</strong> a partir do recebimento para manifestar o arrependimento e solicitar a devolução integral dos valores pagos, incluindo o frete.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-900">
              2. Condições para Devolução Física do Item
            </h2>
            <p>Para que a devolução ou troca seja acolhida, a peça deve:</p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600">
              <li>Estar acompanhada da respectiva Nota Fiscal emitida pela BR Peças PB;</li>
              <li>Manter os lacres de segurança e marcações de inspeção intactos (sem violação);</li>
              <li>Não apresentar sinais de instalação incorreta, sobrecarga elétrica ou queda;</li>
              <li>Ser devolvida com todos os conectores, acessórios e embalagem em que foi despachada.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-900">
              3. Procedimento de Logística Reversa
            </h2>
            <p>
              Para iniciar o processo de troca ou devolução, entre em contato com nosso atendimento pelo WhatsApp <strong>{siteConfig.phone}</strong> ou pelo e-mail <strong>{siteConfig.email}</strong> informando o número do pedido e o motivo da solicitação. Forneceremos o código de postagem reversa dos Correios ou acionaremos a transportadora parceira.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-zinc-900">
              4. Reembolso dos Valores
            </h2>
            <p>
              Após a chegada da peça em nosso centro de triagem em Cabedelo/PB e a validação técnica (até 2 dias úteis):
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600">
              <li><strong>Pix:</strong> Reembolso transferido imediatamente para a mesma conta bancária de origem;</li>
              <li><strong>Cartão de Crédito:</strong> Estorno solicitado à operadora pelo gateway Asaas, creditado em até 2 faturas subsequentes;</li>
              <li><strong>Boleto:</strong> Depósito em conta bancária de titularidade do mesmo CPF/CNPJ pagador.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
