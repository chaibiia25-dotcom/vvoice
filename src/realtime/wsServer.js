import { streamLlmResponse } from '../llm/providers.js';
import { transcribeAudioFrame } from '../services/transcription.js';
import { synthesizeSpeech } from '../services/tts.js';
import { config } from '../config.js';

export function registerRealtimeServer(httpServer) {
  // No external websocket dependency required for local execution.
  // This hook keeps the architecture ready for a future ws/websocket implementation.
  httpServer.on('upgrade', async (_req, socket) => {
    const transcription = await transcribeAudioFrame({ provider: config.sttProvider, audioBase64: '' });
    const chunks = await streamLlmResponse({
      provider: config.llmProvider,
      prompt: transcription.text || '(silence)',
      context: []
    });
    const text = chunks.join('');
    await synthesizeSpeech({ provider: config.ttsProvider, text });

    socket.write('HTTP/1.1 501 Not Implemented\r\nConnection: close\r\n\r\n');
    socket.destroy();
  });

  return null;
}
