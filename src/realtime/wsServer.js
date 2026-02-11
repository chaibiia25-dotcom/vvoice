import { WebSocketServer } from 'ws';
import { streamLlmResponse } from '../llm/providers.js';
import { transcribeAudioFrame } from '../services/transcription.js';
import { synthesizeSpeech } from '../services/tts.js';
import { config } from '../config.js';

function safeParse(raw) {
  try {
    return JSON.parse(raw.toString());
  } catch {
    return null;
  }
}

export function registerRealtimeServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (socket) => {
    const session = {
      turns: [],
      startedAt: Date.now()
    };

    socket.send(JSON.stringify({ type: 'session.ready', message: 'WebSocket connecté' }));

    socket.on('message', async (raw) => {
      const data = safeParse(raw);
      if (!data) {
        socket.send(JSON.stringify({ type: 'error', code: 'BAD_JSON' }));
        return;
      }

      if (data.type === 'audio.frame') {
        const transcription = await transcribeAudioFrame({
          provider: config.sttProvider,
          audioBase64: data.audioBase64
        });

        if (transcription.text) {
          session.turns.push({ role: 'user', content: transcription.text, at: Date.now() });
        }

        const chunks = await streamLlmResponse({
          provider: config.llmProvider,
          prompt: transcription.text || '(silence)',
          context: session.turns
        });

        let builtText = '';
        for (const chunk of chunks) {
          builtText += chunk;
          socket.send(JSON.stringify({ type: 'llm.chunk', chunk }));
          await new Promise((resolve) => setTimeout(resolve, config.streamChunkMs));
        }

        session.turns.push({ role: 'assistant', content: builtText, at: Date.now() });

        const speech = await synthesizeSpeech({
          provider: config.ttsProvider,
          text: builtText
        });

        socket.send(JSON.stringify({
          type: 'assistant.final',
          text: builtText,
          audioBase64: speech.audioBase64,
          durationMs: speech.durationMs,
          telemetry: {
            latencyMs: Date.now() - session.startedAt,
            turnCount: session.turns.length
          }
        }));

        if (session.turns.length > config.maxConversationTurns * 2) {
          session.turns.splice(0, session.turns.length - config.maxConversationTurns * 2);
        }
        return;
      }

      if (data.type === 'ping') {
        socket.send(JSON.stringify({ type: 'pong', now: Date.now() }));
        return;
      }

      socket.send(JSON.stringify({ type: 'error', code: 'UNKNOWN_EVENT' }));
    });
  });

  return wss;
}
