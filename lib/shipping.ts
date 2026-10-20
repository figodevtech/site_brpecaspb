import { siteConfig } from "@/lib/site-config";

export type DeliveryMethod = "delivery" | "pickup";

export interface ShippingOption {
  id: DeliveryMethod;
  type: string;
  price: number;
  formattedPrice: string;
  daysText: string;
  description: string;
}

export interface ShippingQuoteResult {
  hasValidCep: boolean;
  status: "pending_analysis" | "calculated";
  message: string;
  options: ShippingOption[];
  shippingAmount: number;
  pickupEligible: boolean;
}

export interface ShippingLocation {
  city?: string | null;
  state?: string | null;
}

export const LOCAL_PICKUP_CITIES = [
  "João Pessoa",
  "Bayeux",
  "Cabedelo",
  "Conde",
  "Santa Rita",
] as const;

export function isPickupEligible(location: ShippingLocation) {
  if (normalize(location.state) !== "pb") return false;
  const city = normalize(location.city);
  return LOCAL_PICKUP_CITIES.some((allowedCity) => normalize(allowedCity) === city);
}

export function getShippingEstimate(cep: string, location: ShippingLocation = {}): ShippingQuoteResult {
  const cleanCep = cep.replace(/\D/g, "");

  if (cleanCep.length !== 8) {
    return {
      hasValidCep: false,
      status: "pending_analysis",
      message: "Digite um CEP válido com 8 dígitos.",
      options: [],
      shippingAmount: 0,
      pickupEligible: false,
    };
  }

  const pickupEligible = isPickupEligible(location);
  const options: ShippingOption[] = [
    {
      id: "delivery",
      type: "Entrega por transportadora",
      price: 0,
      formattedPrice: "A calcular",
      daysText: "Prazo informado após cotação",
      description: "O valor será confirmado conforme endereço, peso e dimensões do pedido.",
    },
  ];

  if (pickupEligible) {
    options.unshift({
      id: "pickup",
      type: "Retirada no local",
      price: 0,
      formattedPrice: "Grátis",
      daysText: "Após confirmação de que o pedido está pronto",
      description: siteConfig.address.full,
    });
  }

  return {
    hasValidCep: true,
    status: "pending_analysis",
    message: pickupEligible
      ? "Este endereço pode retirar gratuitamente na BR Peças PB ou solicitar entrega."
      : "O frete será confirmado após a análise do endereço e da cubagem.",
    options,
    shippingAmount: 0,
    pickupEligible,
  };
}

function normalize(value: string | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

import { ShippingOption as LegacyShippingOption } from "@/lib/types";

export interface CalculateShippingParams {
  cep: string;
  subtotal: number;
  weightKg?: number;
}

export async function calculateShipping({
  cep,
  subtotal,
  weightKg = 2,
}: CalculateShippingParams): Promise<LegacyShippingOption[]> {
  const cleanCep = cep.replace(/\D/g, "");

  if (cleanCep.length !== 8) {
    throw new Error("CEP inválido. Deve conter 8 dígitos.");
  }

  // Identificar se é Paraíba (58000-000 a 58999-999)
  const isPB = cleanCep.startsWith("58");
  const isGrandeJP = isPB && (cleanCep.startsWith("580") || cleanCep.startsWith("581")); // João Pessoa, Cabedelo, Bayeux, Sta Rita

  const options: LegacyShippingOption[] = [
    {
      id: "retirada-loja",
      nome: "Retirada na Loja Física (Cabedelo - PB)",
      prazo: "Disponível em até 2 horas úteis",
      preco: 0,
      descricao: "Rua José Rubenildo da Silva, 146 - Renascer, Cabedelo/PB. Grátis.",
      modalidade: "RETIRADA",
    },
  ];

  if (isGrandeJP) {
    options.push({
      id: "entrega-expressa-local",
      nome: "Entrega Expressa Regional (Grande JP / Cabedelo)",
      prazo: "1 dia útil",
      preco: 25.0,
      descricao: "Entrega dedicada por motoboy ou veículo próprio da BR Peças.",
      modalidade: "TRANSPORTADORA",
    });
  }

  // Opções para todo o Brasil
  if (weightKg > 30) {
    // Cargas pesadas (Motores, transmissões completas)
    options.push({
      id: "transportadora-pesada",
      nome: "Transportadora Carga Pesada (Paletizada)",
      prazo: isPB ? "2 a 4 dias úteis" : "5 a 10 dias úteis",
      preco: isPB ? 120.0 : 280.0,
      descricao: "Envio seguro com seguro total e rastreio para peças volumosas.",
      modalidade: "TRANSPORTADORA",
    });
  } else {
    options.push(
      {
        id: "correios-pac",
        nome: "PAC / Encomenda Econômica",
        prazo: isPB ? "2 a 4 dias úteis" : "6 a 12 dias úteis",
        preco: isPB ? 29.9 : 54.9,
        descricao: "Entrega econômica com código de rastreamento oficial.",
        modalidade: "CORREIOS",
      },
      {
        id: "correios-sedex",
        nome: "SEDEX / Expresso",
        prazo: isPB ? "1 a 2 dias úteis" : "3 a 5 dias úteis",
        preco: isPB ? 44.9 : 89.9,
        descricao: "Envio prioritário mais rápido com código de rastreamento.",
        modalidade: "CORREIOS",
      }
    );
  }

  return options;
}
