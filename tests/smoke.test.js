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

  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  const healthJson = await health.json();
  assert.equal(healthJson.status, 'ok');

  const badRequest = await fetch(`${base}/api/voice/process`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.equal(badRequest.status, 400);

  const validRequest = await fetch(`${base}/api/voice/process`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: '  Bonjour React  ' })
  });
  assert.equal(validRequest.status, 200);
  const validJson = await validRequest.json();
  assert.equal(validJson.processedText, 'Bonjour React');
  assert.equal(validJson.length, 13);

  server.close();
}

run().then(() => {
  console.log('Smoke tests passed');
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
