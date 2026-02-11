import express from 'express';
import cors from 'cors';
import { evaluateResponse } from './evaluation/rubric.js';
import { config } from './config.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      providers: {
        llm: config.llmProvider,
        stt: config.sttProvider,
        tts: config.ttsProvider
      }
    });
  });

  app.get('/api/capabilities', (_req, res) => {
    res.json({
      transport: ['REST', 'WebSocket:/ws'],
      pipeline: ['speech_to_text', 'llm_streaming', 'text_to_speech'],
      qualityRubric: ['factuality', 'relevance', 'fluency', 'uncertainty']
    });
  });

  app.post('/api/evaluation/score', (req, res) => {
    const { factuality, relevance, fluency, uncertainty } = req.body ?? {};
    const result = evaluateResponse({ factuality, relevance, fluency, uncertainty });
    res.json(result);
  });

  return app;
}
