const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise the actual route with an isolated persistence boundary; no live enquiries are created.
function route({ fail = false } = {}) {
  const records = [];
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync('app/api/learning/interest/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, {
    module, exports: module.exports, console: { error() {} },
    require(id) {
      if (id === 'next/server') return { NextResponse: { json: (data, options) => Response.json(data, options) } };
      if (id === '@/lib/db') return { connectDB: async () => {} };
      if (id === '@/models/VerificationRequest') return {
        LearningInterest: { create: async (record) => { if (fail) throw Error('Database unavailable'); records.push(record); } },
      };
      throw Error(`Unexpected import: ${id}`);
    },
  });
  return { submit: (body) => module.exports.POST(new Request('http://localhost/api/learning/interest', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })), post: module.exports.POST, records };
}
const valid = { kind: 'event', itemId: 'networking', itemTitle: 'Networking evening', name: '  Test User  ', email: '  TEST@example.com  ', notes: '  Question  ' };

test('all shared form kinds save normalized details and return the stored reference', async () => {
  for (const kind of ['event', 'course', 'masterclass']) {
    const { submit, records } = route();
    const response = await submit({ ...valid, kind });
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.equal(records.length, 1);
    assert.equal(records[0].referenceId, data.referenceId);
    assert.equal(records[0].name, 'Test User');
    assert.equal(records[0].email, 'test@example.com');
    assert.equal(records[0].notes, 'Question');
    assert.equal(records[0].kind, kind);
    assert.equal(records[0].status, 'submitted');
  }
});

test('invalid submissions never reach persistence', async () => {
  const { submit, records } = route();
  for (const change of [{ name: '  ' }, { name: 'x'.repeat(121) }, { email: 'bad@' }, { email: 'a@b@c.com' }, { notes: 'x'.repeat(2001) }, { kind: 'unknown' }, { itemId: '' }, { name: {} }]) {
    const response = await submit({ ...valid, ...change });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).success, false);
  }
  assert.equal(records.length, 0);
});

test('optional notes may be omitted', async () => {
  const { submit, records } = route();
  assert.equal((await submit({ ...valid, notes: undefined })).status, 200);
  assert.equal(records[0].notes, '');
});

test('malformed JSON and invalid body shapes return 400', async () => {
  const { post, submit } = route();
  const response = await post(new Request('http://localhost/api/learning/interest', { method: 'POST', body: '{' }));
  assert.equal(response.status, 400);
  for (const body of [null, [], 'hello']) assert.equal((await submit(body)).status, 400);
});

test('database failure never reports a successful registration', async () => {
  const { submit, records } = route({ fail: true });
  const response = await submit(valid);
  const data = await response.json();
  assert.equal(response.status, 500);
  assert.equal(data.success, false);
  assert.equal(data.referenceId, undefined);
  assert.equal(records.length, 0);
});

function form(fetch) {
  let cursor = 0;
  const slots = [];
  const module = { exports: {} };
  const hooks = {
    useId: () => 'test-form',
    useState(initial) { const i = cursor++; if (!(i in slots)) slots[i] = initial; return [slots[i], value => { slots[i] = value; }]; },
    useRef(initial) { const i = cursor++; return slots[i] ?? (slots[i] = { current: initial }); },
  };
  const source = ts.transpileModule(fs.readFileSync('app/components/InterestForm.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, {
    module, exports: module.exports, fetch,
    require(id) {
      if (id === 'react') return hooks;
      if (id === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) };
      if (id === 'react-toastify') return { toast: { success() {} } };
      if (id === 'lucide-react' || id.endsWith('.css')) return {};
      throw Error(`Unexpected import: ${id}`);
    },
  });
  const render = () => { cursor = 0; return module.exports.default({ kind: 'event', itemId: valid.itemId, itemTitle: valid.itemTitle }); };
  const nodes = (tree) => !tree || typeof tree !== 'object' ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)];
  const fill = () => {
    for (const node of nodes(render())) if (['name', 'email', 'notes'].includes(node.props?.name)) node.props.onChange({ target: { value: valid[node.props.name] } });
    return render();
  };
  return { render, fill, nodes };
}

test('form sends to the route, prevents simultaneous submits and shows saved reference', async () => {
  const api = route();
  let requests = 0, release;
  const gate = new Promise(resolve => { release = resolve; });
  const ui = form(async (url, options) => { assert.equal(url, '/api/learning/interest'); requests++; await gate; return api.submit(JSON.parse(options.body)); });
  const tree = ui.fill();
  const event = { preventDefault() {} };
  const pending = tree.props.onSubmit(event);
  await tree.props.onSubmit(event);
  assert.equal(requests, 1);
  assert.equal(ui.nodes(ui.render()).find(n => n.type === 'button').props.disabled, true);
  release();
  await pending;
  const result = ui.render();
  assert.ok(JSON.stringify(result).includes(api.records[0].referenceId));
  assert.equal(ui.nodes(result).find(n => n.props?.name === 'name').props.value, '');
});

test('form keeps entered values and allows retry after a failed save', async () => {
  const api = route({ fail: true });
  const ui = form(async (_url, options) => api.submit(JSON.parse(options.body)));
  await ui.fill().props.onSubmit({ preventDefault() {} });
  const nodes = ui.nodes(ui.render());
  assert.equal(nodes.find(n => n.props?.name === 'name').props.value, valid.name);
  assert.ok(nodes.find(n => n.props?.role === 'alert'));
  assert.equal(nodes.find(n => n.type === 'button').props.disabled, false);
});

test('network and invalid server responses preserve input and allow a successful retry', async () => {
  for (const failure of ['network', 'invalid-json', 'missing-reference']) {
    let fail = true;
    const api = route();
    const ui = form(async (_url, options) => {
      if (!fail) return api.submit(JSON.parse(options.body));
      if (failure === 'network') throw Error('Offline');
      if (failure === 'invalid-json') return new Response('Unavailable', { status: 503 });
      return Response.json({ success: true });
    });
    await ui.fill().props.onSubmit({ preventDefault() {} });
    let nodes = ui.nodes(ui.render());
    assert.ok(nodes.find(n => n.props?.role === 'alert'));
    assert.equal(nodes.find(n => n.props?.name === 'email').props.value, valid.email);
    assert.equal(nodes.find(n => n.type === 'button').props.disabled, false);
    fail = false;
    await ui.render().props.onSubmit({ preventDefault() {} });
    nodes = ui.nodes(ui.render());
    assert.ok(nodes.find(n => n.props?.role === 'status'));
    assert.equal(api.records.length, 1);
  }
});

test('whitespace-only names are rejected before sending a request', async () => {
  let requests = 0;
  const ui = form(async () => { requests++; return Response.json({ success: true }); });
  ui.fill();
  ui.nodes(ui.render()).find(n => n.props?.name === 'name').props.onChange({ target: { value: '   ' } });
  await ui.render().props.onSubmit({ preventDefault() {} });
  assert.equal(requests, 0);
  assert.ok(ui.nodes(ui.render()).find(n => n.props?.role === 'alert'));
});
