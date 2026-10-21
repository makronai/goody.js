import test from 'node:test';
import assert from 'node:assert/strict';
import { GoodCli } from '../src/goodjs/cli/cli.ts';
import { TEMPLATES } from '../src/goodjs/cli/templates.ts';

test('CLI: prints help when no arguments provided', async () => {
  const cli = new GoodCli();
  const res = await cli.run([]);
  assert.equal(res.code, 0);
  assert.ok(res.stdout.some((line) => line.includes('GoodJS CLI')));
});

test('CLI: doctor passes all health checks', async () => {
  const cli = new GoodCli();
  const res = await cli.run(['doctor']);
  assert.equal(res.code, 0);
  assert.ok(res.stdout.some((line) => line.includes('GoodJS system health: EXCELLENT')));
});

test('CLI: create scaffolds frontend template files', async () => {
  const cli = new GoodCli();
  const res = await cli.run(['create', 'my-portfolio', '--template', 'frontend']);
  assert.equal(res.code, 0);
  assert.ok(res.stdout.some((line) => line.includes("Creating GoodJS project 'my-portfolio'")));
  assert.ok(res.stdout.some((line) => line.includes('my-portfolio/package.json')));
  assert.ok(res.stdout.some((line) => line.includes('my-portfolio/src/main.ts')));
});

test('CLI: templates dictionary contains valid templates', () => {
  assert.ok(TEMPLATES.frontend);
  assert.ok(TEMPLATES.backend);
  assert.ok(TEMPLATES.fullstack);

  for (const [id, tpl] of Object.entries(TEMPLATES)) {
    assert.equal(tpl.id, id);
    assert.ok(tpl.files.length > 0);
    for (const f of tpl.files) {
      assert.ok(f.path);
      assert.ok(f.content.length > 0);
    }
  }
});
