import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3000),
  llmProvider: process.env.LLM_PROVIDER || 'mock',
  sttProvider: process.env.STT_PROVIDER || 'mock',
  ttsProvider: process.env.TTS_PROVIDER || 'mock',
  streamChunkMs: Number(process.env.STREAM_CHUNK_MS || 120),
  maxConversationTurns: Number(process.env.MAX_CONVERSATION_TURNS || 30)
};
