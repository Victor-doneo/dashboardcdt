import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requestDashboard, DASHBOARD_TIMEOUT_MS } from '../src/dashboardRequest.js';

function setup(t, response) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  return t.mock.method(globalThis, 'fetch', response);
}
const response = (status, body) => new Response(JSON.stringify(body), { status });

test('keeps credentials and accepts a response after the old 30s budget', async (t) => {
  const fetch = setup(t, () => new Promise(resolve => setTimeout(() => resolve(response(200, { profil: 'lecture', editable: false })), 45_000)));
  const pending = requestDashboard('https://example.test', 'public-key', 'private-code');
  t.mock.timers.tick(45_000);
  assert.deepEqual(await pending, { profil: 'lecture', editable: false });
  const [url, options] = fetch.mock.calls[0].arguments;
  assert.equal(url, 'https://example.test/rest/v1/rpc/get_partner_dashboard');
  assert.equal(options.method, 'POST');
  assert.equal(options.headers.Authorization, 'Bearer public-key');
  assert.equal(options.body, JSON.stringify({ p_token: 'private-code' }));
  t.mock.timers.tick(DASHBOARD_TIMEOUT_MS);
  assert.equal(options.signal.aborted, false, 'success clears the timeout');
});

test('aborts a stalled request at 65s and permits a new attempt', async (t) => {
  const fetch = setup(t, (_, { signal }) => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))));
  const pending = requestDashboard('https://example.test', 'key', 'code');
  const rejected = assert.rejects(pending, /65 secondes/);
  t.mock.timers.tick(64_999);
  assert.equal(fetch.mock.calls[0].arguments[1].signal.aborted, false);
  t.mock.timers.tick(1);
  await rejected;
  fetch.mock.mockImplementation(async () => response(200, { profil: 'lecture' }));
  assert.equal((await requestDashboard('https://example.test', 'key', 'code')).profil, 'lecture');
});

test('timeout also covers a stalled response body', async (t) => {
  setup(t, async (_, { signal }) => ({ ok: true, json: () => new Promise((_, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))) }));
  const pending = requestDashboard('https://example.test', 'key', 'code');
  const rejected = assert.rejects(pending, /65 secondes/);
  await Promise.resolve();
  t.mock.timers.tick(DASHBOARD_TIMEOUT_MS);
  await rejected;
});

for (const [name, status, body, expected] of [
  ['SQL timeout', 500, { code: '57014', message: 'internal SQL' }, /délai autorisé/],
  ['gateway timeout', 504, {}, /délai autorisé/],
  ['invalid code', 403, { code: '42501' }, /accès refusé/],
  ['server failure', 500, { message: 'sensitive detail' }, /Impossible de charger/],
  ['empty successful response', 200, null, /Réponse du serveur invalide/],
]) {
  test(name, async (t) => {
    const fetch = setup(t, async () => response(status, body));
    await assert.rejects(requestDashboard('https://example.test', 'key', 'code'), expected);
    t.mock.timers.tick(DASHBOARD_TIMEOUT_MS);
    assert.equal(fetch.mock.calls[0].arguments[1].signal.aborted, false);
    assert.equal(fetch.mock.callCount(), 1, 'no automatic retry');
  });
}

test('handles non-JSON responses', async (t) => {
  setup(t, async () => new Response('<html>Unavailable</html>', { status: 502 }));
  await assert.rejects(requestDashboard('https://example.test', 'key', 'code'), /Réponse du serveur invalide/);
});

test('handles network failures', async (t) => {
  setup(t, async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(requestDashboard('https://example.test', 'key', 'code'), /Vérifiez votre connexion/);
});
