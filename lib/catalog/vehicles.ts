import { supabaseAdmin } from "@/lib/supabase/admin";

export interface VehicleOption {
  montadora: string;
  modelos: {
    nome: string;
    ano_inicio: number;
    ano_fim: number;
    motores: string[];
  }[];
}

export async function getVehicleFilterOptions() {
  const { data, error } = await supabaseAdmin
    .from("veiculo_compatibilidade")
    .select("montadora, modelo, ano_inicio, ano_fim, motor")
    .order("montadora", { ascending: true })
    .order("modelo", { ascending: true });

  if (error || !data) {
    console.error("Erro ao carregar veículos de compatibilidade:", error);
    return [];
  }

  // Agrupar por montadora
  const map = new Map<string, Map<string, { ano_inicio: number; ano_fim: number; motores: Set<string> }>>();

  for (const item of data) {
    const montadora = item.montadora.trim().toUpperCase();
    const modelo = item.modelo.trim().toUpperCase();

    if (!map.has(montadora)) {
      map.set(montadora, new Map());
    }
    const modelosMap = map.get(montadora)!;

    if (!modelosMap.has(modelo)) {
      modelosMap.set(modelo, {
        ano_inicio: item.ano_inicio,
        ano_fim: item.ano_fim,
        motores: new Set(),
      });
    }

    const mObj = modelosMap.get(modelo)!;
    mObj.ano_inicio = Math.min(mObj.ano_inicio, item.ano_inicio);
    mObj.ano_fim = Math.max(mObj.ano_fim, item.ano_fim);
    if (item.motor) {
      mObj.motores.add(item.motor.trim());
    }
  }

  const result: VehicleOption[] = [];
  for (const [montadora, modelosMap] of map.entries()) {
    const modelosList = [];
    for (const [modelo, info] of modelosMap.entries()) {
      modelosList.push({
        nome: modelo,
        ano_inicio: info.ano_inicio,
        ano_fim: info.ano_fim,
        motores: Array.from(info.motores),
      });
    }
    result.push({
      montadora,
      modelos: modelosList,
    });
  }

  return result;
}
