import { existsSync, readFileSync } from 'node:fs';

function loadDotEnv(path = '.env') {
  if (!existsSync(path)) {
    return;
  }

  const content = readFileSync(path, 'utf8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const index = line.indexOf('=');
    if (index === -1) {
      continue;
    }

    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

export const config = {
  port: Number(process.env.PORT || 3001),
  llmProvider: process.env.LLM_PROVIDER || 'mock',
  sttProvider: process.env.STT_PROVIDER || 'mock',
  ttsProvider: process.env.TTS_PROVIDER || 'mock',
  streamChunkMs: Number(process.env.STREAM_CHUNK_MS || 120),
  maxConversationTurns: Number(process.env.MAX_CONVERSATION_TURNS || 30)
};
