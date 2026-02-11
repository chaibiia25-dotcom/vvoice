import { evaluateResponse } from './evaluation/rubric.js';
import { config } from './config.js';

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type'
  });
  res.end(JSON.stringify(payload));
}

function sendHtml(res, statusCode, html) {
  res.writeHead(statusCode, {
    'content-type': 'text/html; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type'
  });
  res.end(html);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 2_000_000) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
      }
    });

    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });

    req.on('error', reject);
  });
}

export function createApp() {
  return async function app(req, res) {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET,POST,OPTIONS',
        'access-control-allow-headers': 'content-type'
      });
      res.end();
      return;
    }

    if (req.method === 'GET' && url.pathname === '/') {
      sendHtml(res, 200, `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>vvoice backend</title>
  </head>
  <body>
    <h1>vvoice backend en ligne ✅</h1>
    <p>Le serveur fonctionne sur le port <code>${config.port}</code>.</p>
    <p>Endpoints disponibles :</p>
    <ul>
      <li><code>GET /api/health</code></li>
      <li><code>GET /api/capabilities</code></li>
      <li><code>POST /api/evaluation/score</code></li>
      <li><code>GET /ws</code> (upgrade WebSocket requis)</li>
    </ul>
  </body>
</html>`);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, {
        status: 'ok',
        providers: {
          llm: config.llmProvider,
          stt: config.sttProvider,
          tts: config.ttsProvider
        }
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/capabilities') {
      sendJson(res, 200, {
        transport: ['REST', 'WebSocket:/ws'],
        pipeline: ['speech_to_text', 'llm_streaming', 'text_to_speech'],
        qualityRubric: ['factuality', 'relevance', 'fluency', 'uncertainty']
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/evaluation/score') {
      try {
        const body = await readJsonBody(req);
        const { factuality, relevance, fluency, uncertainty } = body ?? {};
        const result = evaluateResponse({ factuality, relevance, fluency, uncertainty });
        sendJson(res, 200, result);
      } catch (error) {
        if (error.message === 'INVALID_JSON') {
          sendJson(res, 400, { error: 'INVALID_JSON', message: 'Payload JSON invalide.' });
          return;
        }

        if (error.message === 'PAYLOAD_TOO_LARGE') {
          sendJson(res, 413, { error: 'PAYLOAD_TOO_LARGE' });
          return;
        }

        sendJson(res, 500, { error: 'INTERNAL_ERROR' });
      }
      return;
    }

    if (req.method === 'GET' && url.pathname === '/ws') {
      sendJson(res, 426, {
        error: 'UPGRADE_REQUIRED',
        message: 'Utilisez un client WebSocket pour ws://localhost:' + config.port + '/ws'
      });
      return;
    }

    sendJson(res, 404, { error: 'NOT_FOUND' });
  };
}
