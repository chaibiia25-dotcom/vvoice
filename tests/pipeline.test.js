import assert from 'node:assert/strict';
import { evaluateResponse } from '../src/evaluation/rubric.js';
import { streamLlmResponse } from '../src/llm/providers.js';

async function run() {
  const rubric = evaluateResponse({
    factuality: 8,
    relevance: 9,
    fluency: 7,
    uncertainty: 6
  });

  assert.equal(rubric.global, 7.5);

  const chunks = await streamLlmResponse({
    provider: 'mock',
    prompt: 'Bonjour',
    context: [{ role: 'user', content: 'Contexte' }]
  });

  assert.ok(chunks.length > 0);
  assert.ok(chunks.join('').includes('Bonjour'));

  console.log('Pipeline tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
