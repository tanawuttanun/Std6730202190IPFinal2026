const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/app');
const { createMemoryEmployeeRepository } = require('../src/repositories/memoryEmployeeRepository');
const { kMeans1D } = require('../src/services/kmeans');

const store = createMemoryEmployeeRepository();
const app = createApp(store, { logRequests: false });

let server;
let base;

before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());
beforeEach(() => store.reset());

const req = async (method, path, body, rawBody) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
  return { status: res.status, body: await res.json() };
};

// ---------------- Login ----------------
test('login success', async () => {
  const r = await req('POST', '/api/login', { username: 'admin', password: 'password123' });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, { success: true, token: 'mock-jwt-token' });
});

test('login failures -> 401', async () => {
  for (const body of [
    { username: 'admin', password: 'wrong' },
    { username: 'root', password: 'password123' },
    { username: 'admin' },
    {},
    { username: ['admin'], password: ['password123'] },
  ]) {
    const r = await req('POST', '/api/login', body);
    assert.equal(r.status, 401, JSON.stringify(body));
    assert.equal(r.body.success, false);
    assert.ok(r.body.message);
  }
});

test('malformed JSON -> 400', async () => {
  const r = await req('POST', '/api/login', undefined, '{bad json');
  assert.equal(r.status, 400);
});

// ---------------- CRUD ----------------
test('GET employees returns >= 5 with correct schema', async () => {
  const r = await req('GET', '/api/employees');
  assert.equal(r.status, 200);
  assert.ok(r.body.data.length >= 5);
  for (const e of r.body.data) {
    assert.equal(typeof e.id, 'string');
    assert.equal(typeof e.salary, 'number');
    assert.ok(['Active', 'On Leave'].includes(e.status));
  }
});

test('POST employee success (salary as string is converted to number)', async () => {
  const r = await req('POST', '/api/employees', { name: '  Alice  ', position: 'QA', salary: '30000' });
  assert.equal(r.status, 201);
  assert.equal(r.body.data.name, 'Alice');
  assert.equal(r.body.data.salary, 30000);
  assert.equal(r.body.data.status, 'Active');
  const list = await req('GET', '/api/employees');
  assert.ok(list.body.data.some((e) => e.id === r.body.data.id));
});

test('POST employee with empty / invalid fields -> 400', async () => {
  for (const body of [
    {},
    { name: '', position: 'QA', salary: 1000 },
    { name: '   ', position: 'QA', salary: 1000 },
    { name: 'A', position: '', salary: 1000 },
    { name: 'A', position: 'QA', salary: '' },
    { name: 'A', position: 'QA' },
    { name: 'A', position: 'QA', salary: 'abc' },
    { name: 'A', position: 'QA', salary: -5 },
    { name: 'A', position: 'QA', salary: 0 },
    { name: 'A', position: 'QA', salary: [1] },
    { name: 123, position: 'QA', salary: 1000 },
  ]) {
    const r = await req('POST', '/api/employees', body);
    assert.equal(r.status, 400, JSON.stringify(body));
    assert.equal(r.body.success, false);
  }
});

test('PUT toggle status both ways, 404 for unknown id', async () => {
  const a = await req('PUT', '/api/employees/1/status');
  assert.equal(a.status, 200);
  assert.equal(a.body.data.status, 'On Leave');
  const b = await req('PUT', '/api/employees/1/status');
  assert.equal(b.body.data.status, 'Active');
  const c = await req('PUT', '/api/employees/999/status');
  assert.equal(c.status, 404);
});

test('DELETE employee, then 404 on second delete', async () => {
  const a = await req('DELETE', '/api/employees/2');
  assert.equal(a.status, 200);
  const b = await req('DELETE', '/api/employees/2');
  assert.equal(b.status, 404);
  const list = await req('GET', '/api/employees');
  assert.ok(!list.body.data.some((e) => e.id === '2'));
});

test('new ids never collide after delete', async () => {
  await req('DELETE', '/api/employees/8');
  const a = await req('POST', '/api/employees', { name: 'X', position: 'Y', salary: 1 });
  const b = await req('POST', '/api/employees', { name: 'Z', position: 'Y', salary: 2 });
  assert.notEqual(a.body.data.id, b.body.data.id);
  assert.notEqual(a.body.data.id, '8');
});

// ---------------- K-Means ----------------
test('salary-clusters returns 3 sorted tiers whose counts sum to total', async () => {
  const r = await req('GET', '/api/employees/salary-clusters');
  assert.equal(r.status, 200);
  assert.equal(r.body.success, true);
  assert.equal(r.body.clusters.length, 3);
  assert.deepEqual(r.body.clusters.map((c) => c.group), ['Tier 1', 'Tier 2', 'Tier 3']);
  const centroids = r.body.clusters.map((c) => c.centroid);
  assert.deepEqual([...centroids].sort((x, y) => x - y), centroids);
  const total = r.body.clusters.reduce((s, c) => s + c.count, 0);
  assert.equal(total, r.body.totalEmployees);
});

test('salary-clusters with no employees does not crash', async () => {
  const list = await req('GET', '/api/employees');
  for (const e of list.body.data) await req('DELETE', `/api/employees/${e.id}`);
  const r = await req('GET', '/api/employees/salary-clusters');
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.clusters, []);
});

test('kMeans1D edge cases', () => {
  assert.deepEqual(kMeans1D([]), []);
  assert.equal(kMeans1D([5000]).length, 1);
  assert.equal(kMeans1D([5000, 5000, 5000, 5000]).length, 1);
  assert.equal(kMeans1D([1000, 2000]).length, 2);
  const c = kMeans1D([10, 11, 12, 50, 51, 52, 100, 101, 102]);
  assert.deepEqual(c.map((x) => x.centroid), [11, 51, 101]);
  assert.deepEqual(c.map((x) => x.values.length), [3, 3, 3]);
});

// ---------------- Extra edge cases ----------------
test('health endpoint reports storage', async () => {
  const r = await req('GET', '/api/health');
  assert.equal(r.status, 200);
  assert.equal(r.body.storage, 'memory');
});

test('salary too large / unknown route', async () => {
  const a = await req('POST', '/api/employees', { name: 'A', position: 'B', salary: 1e12 });
  assert.equal(a.status, 400);
  const b = await req('GET', '/api/nope');
  assert.equal(b.status, 404);
  assert.equal(b.body.success, false);
});

test('decimal salary is rounded to 2 places', async () => {
  const r = await req('POST', '/api/employees', { name: 'A', position: 'B', salary: '12345.678' });
  assert.equal(r.status, 201);
  assert.equal(r.body.data.salary, 12345.68);
});

test('changes are reflected in salary clusters', async () => {
  await req('POST', '/api/employees', { name: 'CEO', position: 'CEO', salary: 500000 });
  const r = await req('GET', '/api/employees/salary-clusters');
  const top = r.body.clusters[r.body.clusters.length - 1];
  assert.equal(top.maxSalary, 500000);
  assert.equal(r.body.totalEmployees, 9);
});

test('unreachable MySQL falls back to in-memory instead of crashing', async () => {
  Object.assign(process.env, {
    DB_HOST: '127.0.0.1', DB_PORT: '1', DB_USER: 'x', DB_NAME: 'x', DB_REQUIRED: 'false', DB_CONNECT_TIMEOUT_MS: '1000',
  });
  for (const key of Object.keys(require.cache)) {
    if (key.includes(`${require('path').sep}src${require('path').sep}`)) delete require.cache[key];
  }
  const warn = console.warn;
  console.warn = () => {};
  try {
    const { createEmployeeRepository } = require('../src/repositories');
    const repo = await createEmployeeRepository();
    assert.equal(repo.kind, 'memory');
  } finally {
    console.warn = warn;
    for (const k of ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME', 'DB_REQUIRED', 'DB_CONNECT_TIMEOUT_MS']) delete process.env[k];
  }
});

test('AUTH_USERNAME / AUTH_PASSWORD override the default login', async () => {
  const sep = require('path').sep;
  const clear = () => {
    for (const key of Object.keys(require.cache)) if (key.includes(`${sep}src${sep}`)) delete require.cache[key];
  };
  Object.assign(process.env, { AUTH_USERNAME: 'Admin', AUTH_PASSWORD: '1234' });
  clear();
  try {
    const { createApp: makeApp } = require('../src/app');
    const { createMemoryEmployeeRepository: makeRepo } = require('../src/repositories/memoryEmployeeRepository');
    const srv = makeApp(makeRepo(), { logRequests: false }).listen(0);
    await new Promise((r) => srv.once('listening', r));
    const url = `http://127.0.0.1:${srv.address().port}/api/login`;
    const post = (body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal((await post({ username: 'Admin', password: '1234' })).status, 200);
    assert.equal((await post({ username: 'admin', password: 'password123' })).status, 401);
    srv.close();
  } finally {
    delete process.env.AUTH_USERNAME;
    delete process.env.AUTH_PASSWORD;
    clear();
  }
});
