import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const vehicles = [
  { montadora: "TOYOTA", modelo: "HILUX", ano_inicio: 2016, ano_fim: 2020, motor: "2.8 DIESEL", combustivel: "DIESEL" },
  { montadora: "TOYOTA", modelo: "COROLLA", ano_inicio: 2015, ano_fim: 2019, motor: "2.0 / 1.8 DUAL VVT-I", combustivel: "FLEX" },
  { montadora: "LAND ROVER", modelo: "DISCOVERY SPORT", ano_inicio: 2015, ano_fim: 2018, motor: "2.0 SI4 / INGENIUM", combustivel: "GASOLINA/DIESEL" },
  { montadora: "LAND ROVER", modelo: "DISCOVERY 4", ano_inicio: 2009, ano_fim: 2013, motor: "2.7 / 3.0 TDV6", combustivel: "DIESEL" },
  { montadora: "LAND ROVER", modelo: "FREELANDER 2", ano_inicio: 2007, ano_fim: 2014, motor: "2.2 TD4 / 3.2 I6", combustivel: "DIESEL/GASOLINA" },
  { montadora: "FIAT", modelo: "UNO", ano_inicio: 2010, ano_fim: 2021, motor: "1.0 / 1.4 FIRE", combustivel: "FLEX" },
  { montadora: "FIAT", modelo: "PALIO", ano_inicio: 2008, ano_fim: 2017, motor: "1.0 / 1.4 / 1.6", combustivel: "FLEX" },
  { montadora: "FIAT", modelo: "STRADA", ano_inicio: 2008, ano_fim: 2020, motor: "1.4 / 1.6 / 1.8", combustivel: "FLEX" },
  { montadora: "FIAT", modelo: "SIENA", ano_inicio: 2008, ano_fim: 2016, motor: "1.0 / 1.4 / 1.6", combustivel: "FLEX" },
  { montadora: "FIAT", modelo: "FIORINO", ano_inicio: 2014, ano_fim: 2022, motor: "1.4 FIRE EVO", combustivel: "FLEX" },
  { montadora: "HONDA", modelo: "HR-V", ano_inicio: 2017, ano_fim: 2021, motor: "1.8 16V I-VTEC", combustivel: "FLEX" },
  { montadora: "HONDA", modelo: "CIVIC", ano_inicio: 2016, ano_fim: 2021, motor: "2.0 I-VTEC / 1.5 TURBO", combustivel: "FLEX/GASOLINA" },
  { montadora: "CHEVROLET", modelo: "ONIX", ano_inicio: 2013, ano_fim: 2019, motor: "1.0 / 1.4 SPE/4", combustivel: "FLEX" },
  { montadora: "CHEVROLET", modelo: "S10", ano_inicio: 2013, ano_fim: 2022, motor: "2.8 TURBO DIESEL", combustivel: "DIESEL" },
  { montadora: "VOLKSWAGEN", modelo: "GOL", ano_inicio: 2009, ano_fim: 2022, motor: "1.0 / 1.6 TOTAL FLEX", combustivel: "FLEX" },
  { montadora: "VOLKSWAGEN", modelo: "AMAROK", ano_inicio: 2011, ano_fim: 2022, motor: "2.0 / 3.0 V6 TDI", combustivel: "DIESEL" },
  { montadora: "FORD", modelo: "RANGER", ano_inicio: 2013, ano_fim: 2022, motor: "2.2 / 3.2 DURATORQ", combustivel: "DIESEL" },
  { montadora: "JEEP", modelo: "RENEGADE", ano_inicio: 2015, ano_fim: 2021, motor: "1.8 E.TORQ / 2.0 MULTIJET", combustivel: "FLEX/DIESEL" },
  { montadora: "JEEP", modelo: "COMPASS", ano_inicio: 2017, ano_fim: 2021, motor: "2.0 TIGERSHARK / 2.0 MULTIJET", combustivel: "FLEX/DIESEL" }
];

async function seed() {
  try {
    await client.connect();
    console.log("Conectado para seed de compatibilidade.");

    for (const v of vehicles) {
      const res = await client.query(`
        INSERT INTO public.veiculo_compatibilidade (montadora, modelo, ano_inicio, ano_fim, motor, combustivel)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [v.montadora, v.modelo, v.ano_inicio, v.ano_fim, v.motor, v.combustivel]);
    }
    console.log("Veículos de compatibilidade inseridos!");

    // Buscar todos os veículos cadastrados
    const { rows: allVehicles } = await client.query("SELECT * FROM public.veiculo_compatibilidade");
    const { rows: allProducts } = await client.query("SELECT id, titulo, fabricante FROM public.produto");

    let linksCount = 0;
    for (const prod of allProducts) {
      const t = (prod.titulo || "").toUpperCase();
      for (const veh of allVehicles) {
        if (t.includes(veh.modelo)) {
          await client.query(`
            INSERT INTO public.produto_compatibilidade (produto_id, compatibilidade_id, observacao)
            VALUES ($1, $2, $3)
            ON CONFLICT (produto_id, compatibilidade_id) DO NOTHING
          `, [prod.id, veh.id, `Compatível com ${veh.montadora} ${veh.modelo} (${veh.ano_inicio}-${veh.ano_fim})`]);
          linksCount++;
        }
      }
    }
    console.log(`Vinculados ${linksCount} produtos com veículos compatíveis!`);
  } catch (err) {
    console.error("Erro no seed:", err);
  } finally {
    await client.end();
  }
}

seed();
