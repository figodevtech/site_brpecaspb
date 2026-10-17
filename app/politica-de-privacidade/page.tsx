import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Política de Privacidade & LGPD | BR Peças PB",
  description:
    "Conheça nossa política de privacidade e tratamento de dados conforme a LGPD (Lei nº 13.709/2018).",
};

export default function PoliticaPrivacidadePage() {
  return (
    <div className="bg-[#F8F9FA] min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-zinc-500 flex items-center gap-1.5">
          <Link href="/" className="hover:text-zinc-900">
            Início
          </Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Política de Privacidade & LGPD</span>
        </nav>

        {/* Hero */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B00] flex items-center justify-center border border-orange-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Política de Privacidade & Proteção de Dados
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)
              </p>
            </div>
          </div>
        </div>

        {/* Artigos da Política */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-sm space-y-8 text-xs text-zinc-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white text-[11px] font-black flex items-center justify-center">
                1
              </span>
              Compromisso da BR Peças PB
            </h2>
            <p>
              A <strong>{siteConfig.legalName}</strong> (nome fantasia <strong>{siteConfig.tradeName}</strong>), inscrita no CNPJ sob o nº <strong>{siteConfig.cnpj}</strong>, com sede na {siteConfig.address.full}, valoriza a privacidade e a segurança dos dados pessoais de seus clientes, usuários e parceiros comerciais.
            </p>
            <p>
              Esta política esclarece como coletamos, tratamos, armazenamos e protegemos seus dados pessoais ao navegar ou realizar compras em nosso e-commerce.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white text-[11px] font-black flex items-center justify-center">
                2
              </span>
              Dados Coletados e Finalidade
            </h2>
            <p>Coletamos estritamente os dados necessários para o cumprimento da operação comercial e fiscal:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-600">
              <li>
                <strong>Identificação Pessoal:</strong> Nome completo, CPF ou CNPJ (obrigatórios para emissão legal da Nota Fiscal Eletrônica - NF-e e conformidade perante a Receita Federal e SEFAZ-PB).
              </li>
              <li>
                <strong>Contato:</strong> E-mail e telefone/WhatsApp para envio de notificações do pedido, código de rastreamento e suporte técnico.
              </li>
              <li>
                <strong>Entrega:</strong> Endereço completo (CEP, logradouro, número, bairro, cidade, estado) repassado aos Correios ou à transportadora parceira contratada.
              </li>
              <li>
                <strong>Pagamento:</strong> Os dados de cartão de crédito e transações são processados diretamente pela instituição de pagamento autorizada pelo Banco Central (<strong>Asaas Gestão Financeira Instituição de Pagamento S.A.</strong>), através de ambiente criptografado PCI-DSS, não ficando armazenados em nossos servidores.
              </li>
            </ul>
          </section>

          <section className="space-y-3 p-5 rounded-2xl bg-orange-50/60 border border-orange-200">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white text-[11px] font-black flex items-center justify-center">
                3
              </span>
              Segurança das Transações e Proteção das Informações
            </h2>
            <p className="text-orange-950">
              Todas as transações e comunicações em nossa plataforma contam com certificados de criptografia SSL/TLS de ponta a ponta, assegurando total sigilo aos dados dos clientes durante o processo de compra e navegação.
            </p>
            <p className="text-orange-950">
              <strong>Garantia de Sigilo:</strong> Suas informações cadastrais e financeiras são tratadas com o mais estrito sigilo comercial e protegidas de acordo com as diretrizes da LGPD.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white text-[11px] font-black flex items-center justify-center">
                4
              </span>
              Compartilhamento Seguro de Dados
            </h2>
            <p>
              A BR Peças PB não comercializa e não compartilha dados pessoais com terceiros para fins de marketing não autorizado. O compartilhamento restringe-se a:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600">
              <li>Transportadoras e Correios para a entrega física da mercadoria.</li>
              <li>Gateway de Pagamento Asaas para aprovação segura do crédito ou PIX.</li>
              <li>Autoridades fiscais e judiciais quando exigido por lei.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white text-[11px] font-black flex items-center justify-center">
                5
              </span>
              Direitos do Titular (LGPD) e Contato
            </h2>
            <p>
              Você tem direito de solicitar confirmação de tratamento, acesso, correção ou eliminação dos seus dados pessoais cadastrados, observadas as obrigações fiscais de guarda documental.
            </p>
            <p>
              Para exercer qualquer direito ou esclarecer dúvidas, entre em contato com nosso Encarregado de Proteção de Dados (DPO) pelo e-mail: <strong>{siteConfig.email}</strong> ou pelo WhatsApp <strong>{siteConfig.whatsappDisplay}</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
