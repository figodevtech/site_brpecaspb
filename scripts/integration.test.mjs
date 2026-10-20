import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = new URL('../', import.meta.url);

// Run the actual route handlers with isolated environment and service doubles.
function route(file, { env = {}, admin, user = null, revalidatePath = () => {} } = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(new URL(file, root), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, {
    exports, Buffer, Request, Response, URL, AbortSignal, console,
    process: { env },
    require(name) {
      if (name === 'next/server') return { NextResponse: { json: (body, init) => Response.json(body, init) } };
      if (name === 'next/cache') return { revalidatePath };
      if (name === '@/lib/supabase/admin') return { supabaseAdmin: admin ?? new Proxy({}, { get() { throw new Error('Unexpected database access'); } }) };
      if (name === '@/lib/supabase/server') return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user } }) } }) };
      if (name === '@/lib/auth-utils') return route('lib/auth-utils.ts');
      if (name === '@/lib/asaas') return new Proxy({}, { get() { return () => { throw new Error('Unexpected Asaas request'); }; } });
      return require(name);
    },
  }, { filename: file });
  return exports;
}

const request = (body = {}, headers = {}) => new Request('https://brpecaspb.com.br/api/test', {
  method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body),
});

test('ERP endpoints reject missing or incorrect tenant secrets before database access', async () => {
  for (const [file, method, env] of [
    ['app/api/integrations/erp/catalog/route.ts', 'POST', { ERP_CATALOG_SYNC_SECRET: 'br-catalog' }],
    ['app/api/integrations/erp/orders/route.ts', 'GET', { ERP_ORDER_SYNC_SECRET: 'br-orders' }],
    ['app/api/integrations/erp/orders/[id]/route.ts', 'PATCH', { ERP_ORDER_SYNC_SECRET: 'br-orders' }],
  ]) {
    for (const authorization of ['', 'Bearer another-client-secret']) {
      const handlers = route(file, { env });
      const response = await handlers[method](request({}, { authorization }), { params: Promise.resolve({ id: '1' }) });
      assert.equal(response.status, 401, file);
    }
  }
});

test('catalog validates authenticated payload and writes only the storefront contract', async () => {
  const writes = [], invalidations = [];
  const admin = { from(table) { return {
    async upsert(rows) { writes.push({ table, rows }); return { error: null }; },
    delete() { return { in: async () => ({ error: null }) }; },
    async insert(rows) { writes.push({ table, rows }); return { error: null }; },
  }; } };
  const handlers = route('app/api/integrations/erp/catalog/route.ts', {
    env: { ERP_CATALOG_SYNC_SECRET: 'br-catalog' }, admin, revalidatePath: (path) => invalidations.push(path),
  });
  const headers = { authorization: 'Bearer br-catalog' };
  assert.equal((await handlers.POST(request({ products: [] }, headers))).status, 400);
  assert.equal(writes.length, 0);
  const response = await handlers.POST(request({
    categories: [{ id: 10, name: 'Motor' }],
    products: [{ id: 123, title: 'Peca BR', price: 125.9, stock: 4, visible: false,
      categoryId: 10, internalCost: 50, images: [{ url: 'https://example.com/part.jpg' }] }],
  }, headers));
  assert.equal(response.status, 200);
  const product = writes.find(({ table }) => table === 'produto').rows[0];
  assert.equal(product.id, 123);
  assert.equal(product.precovenda, 125.9);
  assert.equal(product.estoque, 4);
  assert.equal(product.visible, false);
  assert.equal(product.internalCost, undefined);
  assert.ok(writes.some(({ table }) => table === 'produto_imagem'));
  assert.ok(invalidations.includes('/produtos'));
});

test('Asaas payment webhook rejects missing configuration and foreign token', async () => {
  const file = 'app/api/webhooks/asaas/route.ts';
  assert.equal((await route(file).POST(request())).status, 503);
  assert.equal((await route(file, { env: { ASAAS_WEBHOOK_TOKEN: 'br-webhook' } }).POST(
    request({}, { 'asaas-access-token': 'other-client' }),
  )).status, 401);
});

test('Pix authorization requires a separate strong token and refuses unsupported operations', async () => {
  const file = 'app/api/webhooks/asaas/authorize-refund/route.ts';
  assert.equal((await route(file).POST(request())).status, 503);
  const token = 'br-refund-authorization-token-32-characters';
  const handlers = route(file, { env: { ASAAS_REFUND_AUTHORIZATION_TOKEN: token } });
  assert.equal((await handlers.POST(request({}, { 'asaas-access-token': 'other-client' }))).status, 401);
  const response = await handlers.POST(request({ type: 'TRANSFER' }, { 'asaas-access-token': token }));
  assert.equal((await response.json()).status, 'REFUSED');
});

test('legacy order lookup requires login and scopes lookup to authenticated customer', async () => {
  const file = 'app/api/pedidos/[id]/route.ts';
  const context = { params: Promise.resolve({ id: '100' }) };
  assert.equal((await route(file).GET(request(), context)).status, 401);
  const filters = [];
  const admin = { from(table) { return {
    select() { return this; },
    eq(column, value) { filters.push([table, column, value]); return this; },
    async maybeSingle() { return { data: table === 'cliente' ? { id: 42 } : null, error: null }; },
  }; } };
  const response = await route(file, { user: { id: 'br-user' }, admin }).GET(request(), context);
  assert.equal(response.status, 404);
  assert.ok(filters.some(([t, c, v]) => t === 'cliente' && c === 'user_id' && v === 'br-user'));
  assert.ok(filters.some(([t, c, v]) => t === 'venda' && c === 'clienteid' && v === 42));
});

test('retired public APIs do not expose customer data or modify orders', async () => {
  for (const file of ['app/api/conta/route.ts', 'app/api/admin/metrics/route.ts', 'app/api/admin/pedidos/route.ts']) {
    const handlers = route(file);
    assert.equal((await handlers.GET()).status, 410);
    assert.equal((await handlers.PATCH()).status, 410);
  }
});

test('profile creation requires login and uses the authenticated identity', async () => {
  const file = 'app/api/account/profile/route.ts';
  assert.equal((await route(file).POST(request())).status, 401);
  let inserted;
  const admin = { from(table) {
    assert.equal(table, 'cliente');
    return {
      select() { return this; }, eq() { return this; },
      async maybeSingle() { return { data: null, error: null }; },
      insert(values) { inserted = values; return this; },
      async single() { return { data: { id: 123, ...inserted }, error: null }; },
    };
  } };
  const user = { id: 'authenticated-user', email: 'customer@example.test', user_metadata: {
    name: 'Cliente de Teste', person_type: 'FISICA', cpf_cnpj: '11144477735', phone: '83999990000',
  } };
  const response = await route(file, { admin, user }).POST(request({ user_id: 'another-user', email: 'forged@example.test' }));
  assert.equal(response.status, 200);
  assert.equal(inserted.user_id, user.id);
  assert.equal(inserted.email, user.email);
  assert.equal((await response.json()).created, true);
});

test('restoring a cart rejects corrupted entries and respects available stock', () => {
  const { restoreCart, purchasableQuantity } = route('lib/cart.ts');
  const product = { id: 1, titulo: 'Peca', estoque: 3, precovenda: 50 };
  assert.equal(purchasableQuantity(product, NaN), 0);
  assert.equal(purchasableQuantity(product, -1), 0);
  assert.equal(purchasableQuantity({ ...product, precovenda: 0 }, 1), 0);
  assert.equal(purchasableQuantity(product, 100), 3);
  assert.equal(restoreCart('invalid').length, 0);
  const restored = restoreCart([null, { produto: product, quantidade: 2 }, { produto: product, quantidade: 2 }, { produto: { ...product, id: 2, estoque: 0 }, quantidade: 1 }]);
  assert.equal(restored.length, 1);
  assert.equal(restored[0].quantidade, 3);
});

test('storefront controls use shadcn and never call native browser dialogs', () => {
  const violations = [];
  function walk(directory) {
    for (const entry of fs.readdirSync(new URL(directory, root), { withFileTypes: true })) {
      if (entry.name === 'ui') continue;
      const file = `${directory}/${entry.name}`;
      if (entry.isDirectory()) { walk(file); continue; }
      if (!/\.tsx?$/.test(file)) continue;
      const tree = ts.createSourceFile(file, fs.readFileSync(new URL(file, root), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      function visit(node) {
        if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && ['button','input','textarea','select','option','dialog'].includes(node.tagName.getText(tree))) violations.push(file);
        if (ts.isCallExpression(node) && /^(?:(?:window|globalThis)\.)?(alert|confirm|prompt)$/.test(node.expression.getText(tree))) violations.push(file);
        ts.forEachChild(node, visit);
      }
      visit(tree);
    }
  }
  for (const directory of ['app','components','hooks']) walk(directory);
  assert.deepEqual(violations, []);
});
