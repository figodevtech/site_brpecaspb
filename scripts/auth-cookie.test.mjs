import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createBrowserClient, createServerClient } from '@supabase/ssr';

test('compact SSR cookies omit the duplicated profile and still authenticate on the server', async () => {
  const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'test@example.test', user_metadata: { name: 'Test', details: 'x'.repeat(20000) } };
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const accessToken = [Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'), Buffer.from(JSON.stringify({ sub: user.id, exp })).toString('base64url'), 'test-signature'].join('.');
  const jar = new Map(), profileStore = new Map();
  const cookies = {
    encode: 'tokens-only',
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: changes => { for (const { name, value, options } of changes) { if (options.maxAge === 0) jar.delete(name); else jar.set(name, value); } },
  };
  const userStorage = { getItem: key => profileStore.get(key) ?? null, setItem: (key, value) => profileStore.set(key, value), removeItem: key => profileStore.delete(key) };
  const fetchUser = async () => Response.json(user);
  const browser = createBrowserClient('https://test.supabase.co', 'test-anon-key', {
    isSingleton: false, cookies, auth: { autoRefreshToken: false, detectSessionInUrl: false, userStorage }, global: { fetch: fetchUser },
  });
  const { error } = await browser.auth.setSession({ access_token: accessToken, refresh_token: 'test-refresh' });
  assert.equal(error, null);
  assert.ok(jar.size > 0);
  assert.ok([...jar.values()].reduce((size, value) => size + value.length, 0) < 4000);
  assert.equal((await browser.auth.getSession()).data.session.user.id, user.id);
  const server = createServerClient('https://test.supabase.co', 'test-anon-key', { cookies, global: { fetch: fetchUser } });
  const result = await server.auth.getUser();
  assert.equal(result.error, null);
  assert.equal(result.data.user.id, user.id);
});
