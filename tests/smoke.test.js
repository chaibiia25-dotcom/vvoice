import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createApp } from '../src/app.js';

async function run() {
  const app = createApp();
  const server = createServer(app);

  server.listen(0);
  await once(server, 'listening');

  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  const root = await fetch(`${base}/`);
  assert.equal(root.status, 200);
  const rootHtml = await root.text();
  assert.ok(rootHtml.includes('vvoice backend en ligne'));

  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  const healthJson = await health.json();
  assert.equal(healthJson.status, 'ok');

  const caps = await fetch(`${base}/api/capabilities`);
  assert.equal(caps.status, 200);
  const capsJson = await caps.json();
  assert.ok(capsJson.pipeline.includes('llm_streaming'));

  const evalRequest = await fetch(`${base}/api/evaluation/score`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ factuality: 8, relevance: 9, fluency: 7, uncertainty: 6 })
  });
  assert.equal(evalRequest.status, 200);
  const evalJson = await evalRequest.json();
  assert.equal(evalJson.global, 7.5);

  server.close();
}

run().then(() => {
  console.log('Smoke tests passed');
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
