import type { CardPaymentQuote } from '@/lib/card-payment-quote';
export type ConditionType = "NOVO" | "USADO" | "RECONDICIONADO";

export interface ProductImage {
  id: string | number;
  produto_id: number;
  url: string;
  path: string;
  ordem: number;
}

export interface Product {
  cardPaymentTerms?: CardPaymentQuote|null;
  id: number;
  titulo: string;
  tituloMarketplace?: string | null;
  descricao?: string | null;
  descricaoMarketplace?: string | null;
  precovenda: number;
  preco_site?: number | null;
  estoque: number;
  status_estoque?: "OK" | "BAIXO" | "CRITICO" | "ESGOTADO";
  em_estoque?: boolean;
  referencia?: string | null;
  fabricante?: string | null;
  grupo_produto_id?: number | null;
  grupo_nome?: string | null;
  imgUrl?: string | null;
  conservacao: ConditionType;
  destaque?: boolean;
  codigobarras?: string | null;
  local?: string | null;
  garantia_dias?: number;
  imagens?: ProductImage[];
  defeitos_informados?: string | null;
  origem_veiculo?: {
    testado_bancada?: boolean;
    selo_qualidade?: boolean;
    tipo_veiculo?: string;
  };
}

export interface ProductCategory {
  id: number;
  nome: string;
  descricao?: string | null;
  slug: string;
  total_produtos?: number;
  imagem?: string | null;
}

export interface CartItem {
  produto: Product;
  quantidade: number;
}

export interface ShippingOption {
  id: string;
  nome: string;
  prazo: string;
  preco: number;
  descricao?: string;
  modalidade: "RETIRADA" | "TRANSPORTADORA" | "CORREIOS" | "COTACAO_MANUAL";
}

export interface CustomerAddress {
  id?: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  principal?: boolean;
}

export interface Customer {
  id: number;
  user_id?: string;
  nomerazaosocial: string;
  cpfcnpj: string;
  email: string;
  telefone: string;
  tipopessoa: "FISICA" | "JURIDICA";
  enderecos?: CustomerAddress[];
}

export type OrderStatus = "PENDENTE" | "AUTORIZADO" | "PAGO" | "CANCELADO";
export type DeliveryStatus = "SEPARACAO" | "FATURADO" | "ENVIADO" | "ENTREGUE";

export interface OrderItem {
  id?: number;
  produtoid: number;
  quantidade: number;
  sub_total: number;
  valor_total: number;
  valor_frete?: number;
  produto?: Product;
}

export interface Order {
  id: number;
  status: OrderStatus;
  status_entrega?: DeliveryStatus | null;
  valortotal: number;
  sub_total: number;
  forma_pagamento?: string | null;
  endereco_entrega_snapshot: CustomerAddress;
  datavenda: string;
  codigo_rastreio?: string | null;
  transportadora?: string | null;
  url_rastreio?: string | null;
  itens?: OrderItem[];
}
