import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = new URL('../', import.meta.url);

// Run the actual route handlers with isolated environment and service doubles.
function route(file, { env = {}, admin, user = null, revalidatePath = () => {}, fetchMock, asaas = {}, inventory = async () => ({reserved:true}), policy } = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(new URL(file, root), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, {
    exports, Buffer, Request, Response, URL, URLSearchParams, AbortSignal, console, Error, fetch: fetchMock,
    process: { env },
    require(name) {
      if (name === 'next/server') return { NextResponse: { json: (body, init) => Response.json(body, init) } };
      if (name === 'next/cache') return { revalidatePath };
      if (name === 'server-only') return {};
      if (name === '@/lib/checkout-attempt') return route('lib/checkout-attempt.ts',{env,admin,user,asaas,inventory});
      if (name === '@/lib/checkout-reconcile') return {reconcileCheckout:async()=>false};
      if (name === '@/lib/erp-checkout') return {erpCheckout:inventory,InventoryError:class extends Error{}};
      if (name === '@/lib/supabase/admin' || name === '@/lib/supabaseAdmin') return { supabaseAdmin: admin ?? new Proxy({}, { get() { throw new Error('Unexpected database access'); } }) };
      if (name === '@/lib/integrations/storefront-http') return { storefrontFetch: fetchMock };
      if (name === '@/lib/supabase/server') return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user } }) } }) };
      if (name === '@/lib/auth-utils') return route('lib/auth-utils.ts');
      if (name === '@/lib/checkout-card') return route('lib/checkout-card.ts');
      if (name === '@/lib/melhor-envio-oauth') return route('lib/melhor-envio-oauth.ts',{env,admin,fetchMock});
      if (name === '@/lib/asaas-fees') return {getCardFees:async()=>({operationValue:0.5,one:2,six:4,twelve:6})};
      if (name === '@/lib/shipping-quote') return route('lib/shipping-quote.ts',{env,admin,policy,fetchMock});
      if (name === '@/lib/checkout-policy') return route('lib/checkout-policy.ts');
      if (name === '@/lib/erp-checkout-policy') return {getCheckoutPolicy:async(ids=[])=>({policies:Object.fromEntries(ids.map(id=>[String(id),policy||route('lib/checkout-policy.ts').defaultCheckoutPolicy])),revision:'test',available:true,originCep:'58000000'})};
      if (name === '@/lib/save-checkout-card') return route('lib/save-checkout-card.ts',{admin});
      if (name === '@/lib/payment-methods') return route('lib/payment-methods.ts');
      if (name === '@/lib/site-config') return { siteConfig: { url: 'https://www.brpecaspb.com.br', address: { full: 'Loja' } } };
      if (name === '@/lib/shipping') return { isPickupEligible: () => false };
      if (name === '@/lib/store-payment-config') return { getStorePaymentConfig: async () => ({ enabled: true, commissionEnabled: false, commissionPercent: 0, revision: 1 }) };
      if (name === '@/lib/asaas') return new Proxy(asaas, { get(target, key) { return target[key] || (() => { throw new Error('Unexpected Asaas request'); }); } });
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

test('a category can be hidden without sending or modifying products', async () => {
  for (const file of ['app/api/integrations/erp/catalog/route.ts', '../site_demirdiesel/app/api/integrations/erp/catalog/route.ts']) {
  const writes = [];
  const handlers = route(file, {
    env: { ERP_CATALOG_SYNC_SECRET: 'br-catalog' },
    admin: { from(table) {
      assert.equal(table, 'produtogrupo', 'category-only sync must not modify products or images');
      return { async upsert(rows) { writes.push(...rows); return { error: null }; } };
    } },
  });
  const response = await handlers.POST(request({ categories: [{ id: 10, name: 'Motor', active: false }] }, { authorization: 'Bearer br-catalog' }));
  assert.equal(response.status, 200);
  assert.equal(writes[0].ativo, false);
  assert.equal((await response.json()).products, 0);
  }
});

test('ERP synchronizes category visibility even when the product queue is empty', async () => {
  let payload;
  const admin = {
    async rpc(name) { assert.equal(name, 'fn_reservar_sincronizacao_site'); return { data: [], error: null }; },
    from(table) {
      const data = table === 'produtogrupo' ? [
        { id: 1, nome: 'Oculta', ativo: true, exibirSite: false },
        { id: 2, nome: 'Exibida', ativo: false, exibirSite: true },
      ] : [];
      return { select() { return this; }, eq() { return this; }, in() { return this; }, order() { return this; },
        then(resolve) { return Promise.resolve({ data, error: null }).then(resolve); } };
    },
  };
  const { syncStorefrontCatalog } = route('../src/lib/integrations/storefront-catalog.ts', {
    admin, env: { STOREFRONT_API_URL: 'https://store.example.test', STOREFRONT_CATALOG_SYNC_SECRET: 'test' },
    fetchMock: async (_url, options) => { payload = JSON.parse(options.body); return { ok: true }; },
  });
  const result = await syncStorefrontCatalog(1);
  assert.equal(result.products, 0);
  assert.equal(result.categories, 2);
  assert.equal(payload.categories[0].active, false);
  assert.equal(payload.categories[1].active, true);
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


test('empty saved cards do not call Asaas; existing cards stay scoped and masked', async () => {
  for (const hasCards of [false, true]) {
    let gatewayCalls = 0;
    const filters = [];
    const cards = hasCards ? [
      { id: 'own', provider_customer_id: 'current', brand: 'VISA', last_four: '1234', provider_card_token: 'private-token' },
      { id: 'old-account', provider_customer_id: 'old', last_four: '5678' },
    ] : [];
    const admin = { from(table) {
      return { select() { return this; }, eq(key, value) { filters.push([table, key, value]); return this; }, order() { return this; },
        single: async () => ({ data: { id: 12, cpfcnpj: '12345678901' }, error: null }),
        then(resolve) { return Promise.resolve({ data: cards, error: null }).then(resolve); },
      };
    } };
    const handlers = route('app/api/account/cards/route.ts', { user: { id: 'user-1' }, admin,
      asaas: { findAsaasCustomer: async () => { gatewayCalls++; return { id: 'current' }; } },
    });
    const response = await handlers.GET(request());
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(gatewayCalls, hasCards ? 1 : 0);
    assert.deepEqual(result.cards.map(card => card.id), hasCards ? ['own'] : []);
    assert.ok(filters.some(([table, key, value]) => table === 'customer_payment_card' && key === 'user_id' && value === 'user-1'));
    assert.ok(filters.some(([table, key, value]) => table === 'customer_payment_card' && key === 'cliente_id' && value === 12));
    assert.equal(JSON.stringify(result).includes('private-token'), false);
    assert.equal(JSON.stringify(result).includes('provider_customer_id'), false);
  }
});

test('both stores reject new boleto checkouts before stock reservations or gateway calls', async () => {
  for (const file of ['app/api/checkout/route.ts', '../site_demirdiesel/app/api/checkout/route.ts']) {
    const admin = { from(table) {
      assert.equal(table, 'cliente');
      return { select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: {
        id: 7, user_id: 'user-1', nomerazaosocial: 'TEST USER', cpfcnpj: '11144477735',
        telefone: '83999990000', email: 'test@example.test',
      }, error: null }) };
    } };
    const handlers = route(file, { user: { id: 'user-1' }, admin, inventory: async () => { throw Error('Stock must not be reserved'); } });
    const response = await handlers.POST(request({ billingType: 'BOLETO', addressId: 3, items: [{ productId: 9, quantity: 1 }] }));
    assert.equal(response.status, 400, file);
    assert.equal((await response.json()).error, 'FORMA_PAGAMENTO_INVALIDA');
  }
});

test('both Asaas clients disable billing notifications for new and existing customers', async () => {
  for (const file of ['lib/asaas.ts', '../site_demirdiesel/lib/asaas.ts']) {
    const calls = [];
    const client = route(file, { env: { ASAAS_API_KEY: 'test-key', ASAAS_ENVIRONMENT: 'sandbox' }, fetchMock: async (url, init) => {
      calls.push({ url, method: init.method, body: JSON.parse(init.body) });
      return Response.json({ id: 'cus_test', notificationDisabled: true });
    } });
    await client.createAsaasCustomer({ name: 'Test', notificationDisabled: false });
    await client.disableAsaasCustomerNotifications('cus_test');
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[0].body.notificationDisabled, true);
    assert.equal(calls[1].method, 'PUT');
    assert.ok(calls[1].url.endsWith('/customers/cus_test'));
    assert.deepEqual(calls[1].body, { notificationDisabled: true });
  }
});

test('transparent card checkout sends card only to Asaas and keeps authoritative totals', async () => {
  const card = { holderName: 'TEST USER', number: '4111111111111111', expiryMonth: '12', expiryYear: '2035', ccv: '123' };
  for (const billingType of ['PIX', 'CREDIT_CARD']) {
    let gatewayPayload; let notificationsDisabled = false; const writes = [];
    const admin = { from(table) {
      const data = table === 'cliente' ? { id: 7, user_id: 'user-1', nomerazaosocial: 'TEST USER', cpfcnpj: '11144477735', telefone: '83999990000', email: 'test@example.test', asaas_customer_id: 'cus_test' }
        : table === 'cliente_endereco' ? { id: 3, cliente_id: 7, cep: '58108152', numero: '10' }
        : table === 'produto' ? [{ id: 9, titulo: 'Peca', precovenda: 100, estoque: 3, visible: true, is_deleted: false }] : null;
      return { select() { return this; }, eq() { return this; }, not() {return this;}, in() { return this; }, update(value) { writes.push(value); return this; },
        maybeSingle: async () => ({ data, error: null }), then(resolve) { return Promise.resolve({ data, error: null }).then(resolve); } };
    }, async rpc(name, payload) { writes.push(payload); if(name==='fn_start_checkout'){assert.equal(payload.p_total,200);return {data:{orderId:42,started:true},error:null};} if(name==='fn_checkout_sending'||name==='fn_checkout_bind')return {data:true,error:null};throw Error(`Unexpected RPC ${name}`); } };
    const handlers = route('app/api/checkout/route.ts', { user: { id: 'user-1' }, admin, asaas: {
      findAsaasCustomer: async () => ({ id: 'cus_test' }),
      disableAsaasCustomerNotifications: async id => { assert.equal(id, 'cus_test'); notificationsDisabled = true; },
      createAsaasPayment: async payload => { assert.equal(notificationsDisabled, true); gatewayPayload = payload; return { id: 'pay_test', status: 'PENDING', billingType }; },
    } });
    const response = await handlers.POST(request({ checkoutAttemptId:'10000000-0000-4000-8000-000000000001',transparent: true, billingType, addressId: 3, items: [{ productId: 9, quantity: 2, price: 1 }], card: billingType === 'CREDIT_CARD' ? card : undefined }));
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.directPayment, true); assert.equal(result.transparent, true); assert.equal(result.orderId, 42);
    assert.equal(gatewayPayload.value, 200);
    assert.equal(gatewayPayload.callback, undefined);
    if (billingType === 'CREDIT_CARD') assert.equal(gatewayPayload.creditCard.number, card.number);
    assert.equal(JSON.stringify(writes).includes(card.number), false);
    assert.equal(JSON.stringify(writes).includes('ccv'), false);
    assert.equal(JSON.stringify(result).includes(card.number), false);
  }
});

test('both checkout servers validate free shipping before reserving stock and charge only products',async()=>{
 for(const file of ['app/api/checkout/route.ts','../site_demirdiesel/app/api/checkout/route.ts']){
  let charged=0,reserved=0,snapshot;
  const admin={from(table){const data=table==='cliente'?{id:7,user_id:'user-1',nomerazaosocial:'TEST USER',cpfcnpj:'11144477735',telefone:'83999990000',email:'test@example.test',asaas_customer_id:'cus_test'}:table==='cliente_endereco'?{id:3,cliente_id:7,cep:'58108152',numero:'10'}:table==='produto'?[{id:9,titulo:'Peca',precovenda:100,estoque:3,visible:true,is_deleted:false}]:null;
   return {select(){return this;},eq(){return this;},not(){return this;},in(){return this;},update(){return this;},maybeSingle:async()=>({data,error:null}),then(resolve){return Promise.resolve({data,error:null}).then(resolve);}};
  },async rpc(name,payload){if(name==='fn_start_checkout'){reserved++;assert.equal(payload.p_total,200);snapshot=payload;return {data:{orderId:42,started:true},error:null};}if(name==='fn_checkout_sending'||name==='fn_checkout_bind')return {data:true,error:null};throw Error(name);}};
  const handlers=route(file,{user:{id:'user-1'},admin,policy:{...route('lib/checkout-policy.ts').defaultCheckoutPolicy,freeShipping:true},asaas:{findAsaasCustomer:async()=>({id:'cus_test'}),disableAsaasCustomerNotifications:async()=>{},createAsaasPayment:async payload=>{charged++;assert.equal(payload.value,200);return {id:'pay_free',status:'PENDING',billingType:'PIX'};}}});
  const body={checkoutAttemptId:'10000000-0000-4000-8000-000000000001',transparent:true,billingType:'PIX',addressId:3,deliveryMethod:'delivery',items:[{productId:9,quantity:2}],shippingServiceId:999999,expectedShipping:0,expectedTotal:200};
  assert.equal((await handlers.POST(request({...body,expectedShipping:30}))).status,409);assert.equal(reserved,0);assert.equal(charged,0);
  assert.equal((await handlers.POST(request(body))).status,200);assert.equal(charged,1);assert.equal(reserved,1);assert.match(JSON.stringify(snapshot),/merchantShippingProductIds/);assert.match(JSON.stringify(snapshot),/"mode":"free"/);
 }
});

test('both checkouts enforce ERP installments, debit redirect, explicit card consent and authoritative interest',async()=>{
 const credit={holderName:'TEST USER',number:'4111111111111111',expiryMonth:'12',expiryYear:'2035',ccv:'123'};
 for(const file of ['app/api/checkout/route.ts','../site_demirdiesel/app/api/checkout/route.ts'])for(const mode of ['credit','installments','debit','save','changed','shipping','shipping-changed']){
  let payload;const cardWrites=[];let stockReservations=0;
  const admin={from(table){
   const data=table==='cliente'?{id:7,user_id:'user-1',nomerazaosocial:'TEST USER',cpfcnpj:'11144477735',telefone:'83999990000',email:'test@example.test',asaas_customer_id:'cus_test'}:table==='cliente_endereco'?{id:3,cliente_id:7,cep:'58108152',numero:'10'}:table==='produto'?[{id:9,titulo:'Peca',precovenda:100,estoque:3,visible:true,is_deleted:false}]:null;
   return {select(){return this;},eq(){return this;},not(){return this;},in(){return this;},update(){return this;},insert(value){assert.equal(table,'customer_payment_card');cardWrites.push(value);return Promise.resolve({error:null});},maybeSingle:async()=>({data,error:null}),then(resolve){return Promise.resolve({data,error:null,count:0}).then(resolve);}};
  },async rpc(name,args){if(name==='fn_start_checkout'){assert.equal(args.p_total,mode==='installments'?204.17:mode.startsWith('shipping')?230:200);return {data:{orderId:42,started:true},error:null};}return {data:true,error:null};}};
  const handler=route(file,{env:mode.startsWith('shipping')?{MELHOR_ENVIO_TOKEN:'test-token',MELHOR_ENVIO_ENVIRONMENT:'production',NEXT_PUBLIC_COMPANY_EMAIL:'test@example.test'}:{},fetchMock:async()=>Response.json([{id:1,name:'PAC',company:{name:'Correios'},price:'1.00',custom_price:'30.00',custom_delivery_time:5}]),user:{id:'user-1'},admin,policy:{maxInstallments:3,minimumInstallment:5,interestFreeInstallments:1,monthlyInterestPercent:0,feeMode:'incremental',shippingPackage:{weight:1,width:15,height:10,length:20},shippingRates:[]},inventory:async()=>{stockReservations++;return {reserved:true};},asaas:{
   findAsaasCustomer:async()=>({id:'cus_test',notificationDisabled:true}),
   createAsaasPayment:async body=>{payload=body;return {id:'pay_test',customer:'cus_test',value:body.totalValue||body.value,billingType:'CREDIT_CARD',status:'CONFIRMED',invoiceUrl:'https://www.asaas.com/i/test',creditCard:{creditCardToken:'token-safe',creditCardBrand:'VISA'}};},
  }});
  const response=await handler.POST(request({checkoutAttemptId:'10000000-0000-4000-8000-000000000001',addressId:3,items:[{productId:9,quantity:2}],billingType:mode==='debit'?'DEBIT_CARD':'CREDIT_CARD',transparent:true,installmentCount:mode==='installments'||mode==='changed'?3:1,expectedTotal:mode==='installments'?204.17:mode.startsWith('shipping')?230:200,shippingServiceId:mode.startsWith('shipping')?1:undefined,expectedShipping:mode==='shipping-changed'?29:30,saveCard:mode==='save',card:credit}));
  if(mode==='changed'||mode==='shipping-changed'){assert.equal(response.status,409);assert.equal(payload,undefined);assert.equal(stockReservations,0);continue;}
  assert.equal(response.status,200,file+mode);const result=await response.json();
  if(mode==='debit'){assert.equal(payload.billingType,'CREDIT_CARD');assert.equal(payload.creditCard,undefined);assert.equal(result.directPayment,false);assert.ok(result.url);}
  else assert.equal(result.directPayment,true);
  if(mode==='installments'){assert.equal(payload.installmentCount,3);assert.equal(payload.totalValue,204.17);assert.equal(payload.value,undefined);assert.equal(result.interest,4.17);}
  else assert.equal(payload.installmentCount,undefined);
  if(mode==='shipping')assert.equal(payload.value,230);
  assert.equal(cardWrites.length,mode==='save'?1:0);
  assert.equal(JSON.stringify(cardWrites).includes(credit.number),false);assert.equal(JSON.stringify(cardWrites).includes('ccv'),false);
  if(mode==='save'){assert.equal(result.cardSaved,true);assert.equal(cardWrites[0].provider_card_token,'token-safe');assert.equal(cardWrites[0].last_four,'1111');}
 }
});

test('installment aggregation uses the full purchase and refunds the entire plan in both clients',async()=>{
 for(const file of ['lib/asaas.ts','../site_demirdiesel/lib/asaas.ts']){
  const calls=[];let refunded=false;
  const rows=()=>[1,2,3].map(n=>({id:`pay_${n}`,installment:'plan_1',installmentNumber:n,customer:'cus_1',externalReference:'42',value:n===3?69.34:69.33,billingType:'CREDIT_CARD',status:refunded?'REFUNDED':'CONFIRMED'}));
  const client=route(file,{env:{ASAAS_API_KEY:'test-key'},fetchMock:async(url,init)=>{calls.push([url,init.method]);return Response.json(url.endsWith('/refund')?(refunded=true,{}):url.includes('/installments/')?{data:rows(),hasMore:false}:rows()[0]);}});
  const payment=await client.getAsaasPayment('pay_2');assert.equal(payment.value,208);assert.equal(payment.id,'pay_1');
  const result=await client.refundAsaasPayment('pay_1','Teste');assert.equal(result.status,'REFUNDED');
  assert.ok(calls.some(([url,method])=>url.endsWith('/installments/plan_1/refund')&&method==='POST'));
  assert.equal(calls.some(([url,method])=>url.includes('/payments/pay_1/refund')&&method==='POST'),false);
 }
});

test('installment quote defaults to cash and rounds cents without inventing shipping rates',()=>{
 const {installmentQuote,installmentQuoteForItems,defaultCheckoutPolicy,checkoutPolicySchema}=route('lib/checkout-policy.ts');
 assert.equal(defaultCheckoutPolicy.maxInstallments,1);assert.equal(defaultCheckoutPolicy.shippingRates.length,0);
 assert.throws(()=>installmentQuote(100,2,defaultCheckoutPolicy));
 const quote=installmentQuote(100,3,{...defaultCheckoutPolicy,maxInstallments:3});
 assert.equal(quote.installment,33.33);assert.equal(quote.lastInstallment,33.34);assert.equal(quote.total,100);
 assert.equal(checkoutPolicySchema.safeParse({...defaultCheckoutPolicy,shippingRates:[{name:'PAC',cepStart:'99999999',cepEnd:'00000000',price:30,businessDays:5}]}).success,false);
 const items=[{productId:1,total:100},{productId:2,total:200}];
 assert.throws(()=>installmentQuoteForItems(items,3,{'1':{...defaultCheckoutPolicy,maxInstallments:3}}),'an unconfigured item keeps the whole cart at cash');
 const combined=installmentQuoteForItems(items,3,{'1':{...defaultCheckoutPolicy,maxInstallments:3,feeMode:'incremental'},'2':{...defaultCheckoutPolicy,maxInstallments:3}}, {operationValue:0.5,one:2,six:4,twelve:6});
 assert.equal(combined.total,302.03);assert.equal(combined.interest,2.03,'interest is calculated individually, not applied to the interest-free product');
});

test('Asaas pass-through modes gross up fees, respect the free limit and share mixed-cart costs',()=>{
 const {installmentQuote,installmentQuoteForItems,defaultCheckoutPolicy}=route('lib/checkout-policy.ts');
 const fees={operationValue:0.5,one:2,six:4,twelve:6};
 const policy={...defaultCheckoutPolicy,maxInstallments:12};
 assert.equal(installmentQuote(100,3,{...policy,monthlyInterestPercent:20}).total,100,'obsolete monthly interest is never charged');
 assert.equal(installmentQuote(100,1,{...policy,feeMode:'incremental'},fees).total,100);
 assert.equal(installmentQuote(100,1,{...policy,feeMode:'full'},fees).total,102.56);
 const full=installmentQuote(100,3,{...policy,feeMode:'full'},fees);
 assert.equal(full.total,104.69);
 assert.ok(full.total*(1-.04)-.5>=100,'gross-up covers fees on the final charged amount');
 assert.throws(()=>installmentQuote(100,3,{...policy,feeMode:'full'}),'missing fees cannot silently remove the surcharge');
 assert.equal(installmentQuote(100,3,{...policy,feeMode:'incremental',interestFreeInstallments:3},fees).total,100);
 const items=[{productId:1,total:100},{productId:2,total:100}];
 const combined=installmentQuoteForItems(items,3,{'1':{...policy,feeMode:'full'},'2':{...policy,feeMode:'full'}},fees,30);
 assert.equal(combined.total,240.11,'the operational fee is shared once, not repeated per product, and includes freight');
});

test('account fees use only current promotions and reject malformed provider responses',async()=>{
 const card={operationValue:.49,oneInstallmentPercentage:3,upToSixInstallmentsPercentage:4,upToTwelveInstallmentsPercentage:5,discountOneInstallmentPercentage:1,discountUpToSixInstallmentsPercentage:2,discountUpToTwelveInstallmentsPercentage:3};
 for(const [discountExpiration,one] of [['2000-01-01',3],['2099-01-01',1]]){
  const client=route('lib/asaas-fees.ts',{asaas:{asaasRequest:async path=>{assert.equal(path,'/myAccount/fees/');return {payment:{creditCard:{...card,discountExpiration}}};}}});
  assert.equal((await client.getCardFees()).one,one);
 }
 await assert.rejects(()=>route('lib/asaas-fees.ts',{asaas:{asaasRequest:async()=>({payment:{creditCard:{...card,operationValue:null}}})}}).getCardFees());
});

test('shipping uses ERP company origin, unit measurements, authoritative prices and custom carrier values',async()=>{
 let payload;
 const admin={from(){return {select(){return this;},in(){return Promise.resolve({data:[{id:9,precovenda:100,visible:true,is_deleted:false}],error:null});}};}};
 const policy={...route('lib/checkout-policy.ts').defaultCheckoutPolicy,shippingPackage:{weight:1,width:15,height:10,length:20}};
 const client=route('lib/shipping-quote.ts',{env:{MELHOR_ENVIO_TOKEN:'test',MELHOR_ENVIO_ENVIRONMENT:'production',NEXT_PUBLIC_COMPANY_EMAIL:'test@example.test'},admin,policy,fetchMock:async(url,init)=>{
  assert.equal(url,'https://melhorenvio.com.br/api/v2/me/shipment/calculate');payload=JSON.parse(init.body);
  return Response.json([{id:1,name:'PAC',custom_price:'30.00',price:'1.00',custom_delivery_time:5},{id:2,error:'unavailable'}]);
 }});
 const result=await client.quoteShipping('58108152',[{productId:9,quantity:2},{productId:9,quantity:1}]);
 assert.equal(payload.from.postal_code,'58000000');assert.equal(payload.to.postal_code,'58108152');
 assert.equal(payload.products[0].quantity,3);assert.equal(payload.products[0].insurance_value,100);assert.equal(payload.products[0].weight,1);
 assert.equal(result.options.length,1);assert.equal(result.options[0].price,30);
 const missing=route('lib/shipping-quote.ts',{env:{MELHOR_ENVIO_TOKEN:'test',MELHOR_ENVIO_ENVIRONMENT:'production'},admin,policy:{...policy,shippingPackage:null}});
 await assert.rejects(()=>missing.quoteShipping('58108152',[{productId:9,quantity:1}]),/peso e dimens/);
 const manual=route('app/api/shipping/quote/route.ts');
 assert.equal((await (await manual.POST(request({cep:'58108152',items:[{productId:9,quantity:1}]}))).json()).manual,true);
 assert.equal((await manual.POST(request({cep:'58108152',items:[{productId:9,quantity:-1}]}))).status,422);
});

test('partial refunds and conflicting installment customers never become a full refund',async()=>{
 const payment={id:'pay_1',customer:'cus_1',externalReference:'42',installment:'plan_1',installmentNumber:1,billingType:'CREDIT_CARD',status:'REFUNDED',value:50};
 for(const file of ['lib/asaas.ts','../site_demirdiesel/lib/asaas.ts'])for(const conflict of [false,true]){
 const client=route(file,{env:{ASAAS_API_KEY:'test-key'},fetchMock:async url=>Response.json(url.includes('/installments/')?{data:[payment,{...payment,id:'pay_2',installmentNumber:2,status:'CONFIRMED',customer:conflict?'foreign':'cus_1'}]}:payment)});
 if(conflict)await assert.rejects(()=>client.getAsaasPayment('pay_1'));
 else assert.equal((await client.getAsaasPayment('pay_1')).status,'PARTIALLY_REFUNDED');
 }
});

test('card installments change attempt identity without changing legacy cash fingerprints',()=>{
 const {attemptIdentity}=route('lib/checkout-attempt.ts');
 const id='10000000-0000-4000-8000-000000000001',items=new Map([[9,2]]);
 const old=require('node:crypto').createHash('sha256').update(JSON.stringify([7,'3','delivery','CREDIT_CARD',null,[[9,2]]])).digest('hex');
 assert.equal(attemptIdentity(id,7,3,'delivery','CREDIT_CARD',null,items).hash,old);
 assert.notEqual(attemptIdentity(id,7,3,'delivery','CREDIT_CARD',null,items,{installmentCount:3,debit:false}).hash,old);
});

test('a removed installment plan can only reuse a previously verified payment binding',async()=>{
 for(const file of ['lib/asaas.ts','../site_demirdiesel/lib/asaas.ts']){
 const client=route(file,{env:{ASAAS_API_KEY:'test-key'},fetchMock:async url=>url.includes('/installments/')?Response.json({errors:[]},{status:404}):Response.json({id:'pay_1',customer:'cus_1',externalReference:'42',value:50,installment:'plan_1',deleted:true,status:'PENDING',billingType:'CREDIT_CARD'})});
 const payment=await client.getAsaasPayment('pay_1');assert.equal(payment.installmentGroupDeleted,true);
 const admin={from(){return {select(){return this;},eq(){return this;},maybeSingle:async()=>({data:{payment_id:'pay_1',expected_customer:'cus_1',phase:'BOUND'},error:null})};},rpc(){throw Error('A deleted plan must not overwrite its original amount');}};
 const {bindCheckoutPayment}=route('lib/checkout-attempt.ts',{admin});
 assert.equal(await bindCheckoutPayment(42,payment),true);
 await assert.rejects(()=>bindCheckoutPayment(42,{...payment,id:'pay_foreign'}));
 }
});

test('payment instructions require ownership and retrieve only the stored gateway payment', async () => {
  assert.equal((await route('app/api/checkout/payment-details/route.ts').GET(new Request('https://shop.test/api/checkout/payment-details?orderId=42'))).status, 401);
  for (const own of [false, true]) {
    const filters = [];
    const admin = { from(table) { return { select() { return this; }, eq(key, value) { filters.push([table, key, value]); return this; }, maybeSingle: async () => ({ data: table === 'cliente' ? { id: 7 } : own ? { id: 42, payment_provider: 'ASAAS', gateway_payment_id: 'pay_stored' } : null, error: null }) }; } };
    const handlers = route('app/api/checkout/payment-details/route.ts', { user: { id: 'user-1' }, admin, asaas: {
      getAsaasPayment: async id => { assert.equal(id, 'pay_stored'); return { billingType: 'PIX', status: 'PENDING' }; },
      getAsaasPixQrCode: async id => { assert.equal(id, 'pay_stored'); return { encodedImage: 'test', payload: 'pix-test' }; },
    } });
    const response = await handlers.GET(new Request('https://shop.test/api/checkout/payment-details?orderId=42&paymentId=foreign'));
    assert.equal(response.status, own ? 200 : 404);
    assert.ok(filters.some(([table, key, value]) => table === 'venda' && key === 'clienteid' && value === 7));
    if (own) assert.equal((await response.json()).pix.payload, 'pix-test');
  }
});

test('card validation refuses invalid numbers and expired cards', () => {
  const { parseCheckoutCard } = route('lib/checkout-card.ts');
  const card = { holderName: 'TEST', number: '4111111111111111', expiryMonth: '12', expiryYear: '2035', ccv: '123' };
  assert.ok(parseCheckoutCard(card));
  assert.equal(parseCheckoutCard({ ...card, number: '4111111111111112' }), null);
  assert.equal(parseCheckoutCard({ ...card, expiryYear: '2020' }), null);
  assert.equal(parseCheckoutCard({ ...card, ccv: '' }), null);
});

test('payment instructions remain available for an owned checkout before payment creates an order',async()=>{
 for(const ownsAttempt of [false,true]){
  const filters=[];
  const admin={from(table){return {select(){return this;},eq(key,value){filters.push([table,key,value]);return this;},maybeSingle:async()=>({data:table==='cliente'?{id:7}:table==='checkout_attempt'&&ownsAttempt?{payment_id:'pay_attempt',phase:'BOUND'}:null,error:null})};}};
  const handlers=route('app/api/checkout/payment-details/route.ts',{user:{id:'user-1'},admin,asaas:{getAsaasPayment:async id=>{assert.equal(id,'pay_attempt');return {billingType:'PIX',status:'PENDING'};},getAsaasPixQrCode:async id=>{assert.equal(id,'pay_attempt');return {payload:'qr_pending'};}}});
  const response=await handlers.GET(new Request('https://shop.test/api/checkout/payment-details?orderId=42&paymentId=untrusted'));
  assert.equal(response.status,ownsAttempt?200:404);
  assert.ok(filters.some(([table,key,value])=>table==='checkout_attempt'&&key==='cliente_id'&&value===7));
 }
});
