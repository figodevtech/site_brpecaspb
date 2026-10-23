import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const env = {};
for (const name of ['.env', '.env.local', '.env.migrations', '.env.migrations.local']) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}
for (const key of ['NEXT_PUBLIC_STORE_SUPABASE_URL', 'NEXT_PUBLIC_STORE_SUPABASE_ANON_KEY', 'STORE_SUPABASE_SERVICE_ROLE_KEY', 'ERP_CATALOG_SYNC_SECRET', 'ERP_ORDER_SYNC_SECRET', 'ERP_ORDER_WEBHOOK_URL']) {
  console.log(`${key}: ${env[key] ? 'configurado' : 'ausente'}`);
}
const databaseUrl = env.DATABASE_URL || env.MIGRATIONS_DATABASE_URL;
for (const key of ['NEXT_PUBLIC_SITE_URL', 'ERP_ORDER_WEBHOOK_URL', 'NEXT_PUBLIC_STORE_SUPABASE_URL']) {
  try { if (env[key]) console.log(`${key} host: ${new URL(env[key]).hostname}`); } catch { console.log(`${key}: URL invalida`); }
}
if (!databaseUrl) { console.log('Banco: conexao ausente'); process.exit(1); }
const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
try {
  await client.connect();
  const result = await client.query(`select table_name, array_agg(column_name::text order by ordinal_position) as columns
    from information_schema.columns where table_schema='public' and table_name in
    ('produto','cliente','favorito','venda','cliente_endereco','store_payment_config','order_fulfillment_event','customer_payment_card') group by table_name order by table_name`);
  for (const row of result.rows) console.log(`${row.table_name}: ${row.columns.join(', ')}`);
  const tables = new Set(result.rows.map(row => row.table_name));
  if (tables.has('produto')) {
    console.log('Catalogo:', (await client.query(`select count(*)::int as total,
      count(*) filter(where visible and not is_deleted)::int as publicados,
      count(*) filter(where visible and not is_deleted and estoque>0 and precovenda>0)::int as compraveis from public.produto`)).rows[0]);
  }
  const history = await client.query("select to_regclass('supabase_migrations.schema_migrations') as relation");
  if (history.rows[0].relation) console.log('Migrations aplicadas:', (await client.query('select version from supabase_migrations.schema_migrations order by version')).rows.map(row => row.version).join(', '));
} catch (error) {
  console.error(`Verificacao indisponivel (${error.code || error.errors?.map(e => e.code).join(', ') || error.constructor.name}).`);
  let message = String(error.message || '');
  for (const value of Object.values(env).sort((a,b) => b.length-a.length)) if (value.length > 3) message = message.split(value).join('[oculto]');
  console.error(message.replace(/(?:postgres(?:ql)?|https?):\/\/\S+/g, '[URL oculta]'));
  process.exitCode = 1;
} finally { await client.end(); }
