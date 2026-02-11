import express from 'express';
import cors from 'cors';
import { evaluateResponse } from './evaluation/rubric.js';
import { config } from './config.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.get('/', (_req, res) => {
    res.type('html').send(`<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>vvoice backend</title>
    <style>
      body { font-family: Inter, Arial, sans-serif; margin: 2rem; color: #1f2937; }
      h1 { margin-bottom: .5rem; }
      code { background: #f3f4f6; padding: .125rem .35rem; border-radius: 4px; }
      li { margin: .25rem 0; }
    </style>
  </head>
  <body>
    <h1>vvoice backend en ligne ✅</h1>
    <p>Le serveur fonctionne sur le port <code>${config.port}</code>.</p>
    <p>Endpoints disponibles :</p>
    <ul>
      <li><code>GET /api/health</code></li>
      <li><code>GET /api/capabilities</code></li>
      <li><code>POST /api/evaluation/score</code></li>
      <li><code>WS /ws</code></li>
    </ul>
  </body>
</html>`);
  });

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
