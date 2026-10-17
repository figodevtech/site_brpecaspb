import { ShippingOption } from "@/lib/types";

export interface CalculateShippingParams {
  cep: string;
  subtotal: number;
  weightKg?: number;
}

export async function calculateShipping({
  cep,
  subtotal,
  weightKg = 2,
}: CalculateShippingParams): Promise<ShippingOption[]> {
  const cleanCep = cep.replace(/\D/g, "");

  if (cleanCep.length !== 8) {
    throw new Error("CEP inválido. Deve conter 8 dígitos.");
  }

  // Identificar se é Paraíba (58000-000 a 58999-999)
  const isPB = cleanCep.startsWith("58");
  const isGrandeJP = isPB && (cleanCep.startsWith("580") || cleanCep.startsWith("581")); // João Pessoa, Cabedelo, Bayeux, Sta Rita

  const options: ShippingOption[] = [
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
