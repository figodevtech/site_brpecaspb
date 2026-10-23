import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { createClient } from '@supabase/supabase-js';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = new URL('../', import.meta.url);

function load(file, imports = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(new URL(file, root), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    exports, console,
    require: name => Object.hasOwn(imports, name) ? imports[name] : require(name),
  }, { filename: file });
  return exports;
}

const collections = load('lib/catalog/collections.ts');
const categories = [
  { id: 10, slug: 'modulos' },
  { id: 20, slug: 'painel-de-instrumentos' },
  { id: 30, slug: 'molduras' },
  { id: 40, slug: 'botao' },
  { id: 50, slug: 'oleos' },
];

function catalog(availableCategories = categories) {
  const requests = [];
  let categoryReads = 0;
  const client = createClient('https://catalog.example.test', 'test-key', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async input => {
      const url = new URL(typeof input === 'string' ? input : input.url || input.toString());
      requests.push(url);
      if (url.pathname.endsWith('/produto_imagem')) return Response.json([]);
      const groups = url.searchParams.getAll('grupo_produto_id').find(value => value.startsWith('in.'));
      const groupId = groups === 'in.(30,40)' ? 30 : 10;
      return Response.json([{
        id: groupId, titulo: 'Peca original', grupo_produto_id: groupId,
        estoque: 1, precovenda: 100, conservacao: 'USADO',
        imgUrl: 'https://example.test/part.jpg', produtogrupo: { nome: 'Categoria' },
      }], { headers: { 'content-range': '0-0/1' } });
    } },
  });
  const { getProducts } = load('lib/catalog/products.ts', {
    '@/lib/supabase/admin': { supabaseAdmin: client },
    '@/lib/catalog/categories': { getCategories: async () => { categoryReads++; return availableCategories; } },
    '@/lib/catalog/collections': collections,
  });
  return { getProducts, requests, categoryReads: () => categoryReads };
}

test('home collections use separate categories and preserve published, pictured, in-stock filtering', async () => {
  const catalogApi = catalog();
  const results = [];
  for (const slug of ['modulos-paineis', 'acabamento-comandos']) {
    results.push(await catalogApi.getProducts({ collection: slug, inStockOnly: true, limit: 8 }));
  }
  const queries = catalogApi.requests.filter(url => url.pathname.endsWith('/produto')).map(url => url.searchParams);
  assert.equal(queries.length, 2);
  assert.equal(queries[0].get('grupo_produto_id'), 'in.(10,20)');
  assert.equal(queries[1].get('grupo_produto_id'), 'in.(30,40)');
  assert.ok(queries[0].get('or').includes('titulo.ilike.%modul%'));
  assert.ok(queries[0].get('or').includes('titulo.ilike.%painel%'));
  assert.equal(queries[1].has('or'), false);
  for (const query of queries) {
    assert.equal(query.get('visible'), 'eq.true');
    assert.equal(query.get('is_deleted'), 'eq.false');
    assert.equal(query.get('estoque'), 'gt.0');
    assert.ok(query.getAll('imgUrl').includes('not.is.null'));
    assert.ok(query.getAll('imgUrl').includes('not.match.^[[:space:]]*$'));
    assert.equal(query.get('limit'), '8');
  }
  assert.notEqual(results[0].products[0].id, results[1].products[0].id);
  const [first, second] = Object.values(collections.catalogCollections);
  assert.ok(first.categorySlugs.every(slug => !second.categorySlugs.includes(slug)));
});

test('an unavailable collection returns no products without falling back to the whole catalog', async () => {
  const catalogApi = catalog([{ id: 50, slug: 'oleos' }]);
  const result = await catalogApi.getProducts({ collection: 'modulos-paineis', limit: 8 });
  assert.equal(result.total, 0);
  assert.equal(result.products.length, 0);
  assert.equal(catalogApi.requests.length, 0);
});

test('collection browsing keeps its scope when paginated or narrowed to a category', async () => {
  const catalogApi = catalog();
  await catalogApi.getProducts({ collection: 'modulos-paineis', categoryId: 20, offset: 48, limit: 48 });
  const query = catalogApi.requests[0].searchParams;
  assert.deepEqual(query.getAll('grupo_produto_id'), ['eq.20', 'in.(10,20)']);
  assert.equal(query.get('offset'), '48');
  assert.equal(query.get('limit'), '48');
});

test('the general catalog remains unrestricted by collections', async () => {
  const catalogApi = catalog();
  await catalogApi.getProducts({ limit: 8 });
  assert.equal(catalogApi.categoryReads(), 0);
  assert.equal(catalogApi.requests[0].searchParams.has('grupo_produto_id'), false);
  assert.equal(collections.getCatalogCollection('unknown'), undefined);
});
