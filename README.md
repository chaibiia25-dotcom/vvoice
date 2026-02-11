# vvoice — backend agent vocal multimodal

Ce projet fournit un **socle backend Node.js** pour un agent conversationnel multimodal (voix temps réel), conforme à un cahier des charges de stage orienté:
- STT (speech-to-text)
- LLM streaming
- TTS (text-to-speech)
- évaluation qualitative (hallucinations, pertinence, fluidité, incertitude)

## Stack actuelle
- Node.js (ESM)
- HTTP natif Node (API REST)
- Architecture provider-based (mock / openai / anthropic / gemini / local)
- Hook WebSocket prêt pour une implémentation complète

## Démarrage
Aucune dépendance externe n'est requise pour exécuter ce socle.
```bash
npm run dev
```

Serveur HTTP: `http://localhost:3001`  
WebSocket: `ws://localhost:3001/ws` (endpoint réservé, handshake non implémenté dans cette version sans dépendances externes)

En ouvrant `http://localhost:3001/`, une page de statut backend s'affiche (plus de `Cannot GET /`).

## Endpoints REST
### `GET /api/health`
Retourne le statut et les providers actifs.

### `GET /api/capabilities`
Retourne les capacités pipeline disponibles.

### `POST /api/evaluation/score`
Calcule une note globale (0-10) à partir de:
- `factuality`
- `relevance`
- `fluency`
- `uncertainty`

Exemple payload:
```json
{
  "factuality": 8,
  "relevance": 9,
  "fluency": 7,
  "uncertainty": 6
}
```

## Protocole WebSocket `/ws`
### Client -> serveur
- `ping`
- `audio.frame`:
```json
{ "type": "audio.frame", "audioBase64": "..." }
```

### Serveur -> client
- `GET /ws` retourne `426` si appelé en HTTP
- Upgrade WebSocket: stub architecture présent, implémentation complète à brancher au prochain jalon

## Variables d'environnement
- `PORT` (défaut: `3001`)
- `LLM_PROVIDER` (`mock`, `openai`, `anthropic`, `gemini`, `local`)
- `STT_PROVIDER` (`mock`, puis whisper/google à brancher)
- `TTS_PROVIDER` (`mock`, puis elevenlabs/google/pyttsx3 bridge)
- `STREAM_CHUNK_MS` (défaut: `120`)
- `MAX_CONVERSATION_TURNS` (défaut: `30`)

## Scripts
- `npm run dev`: mode watch
- `npm start`: run production
- `npm run check`: vérification syntaxe
- `npm test`: tests unitaires pipeline

## Évolution recommandée (prochain jalon)
1. Migrer en TypeScript strict.
2. Brancher un provider LLM réel (GPT-4o, Sonnet, Gemini) + prompt safety.
3. Brancher Whisper (ou STT cloud) et ElevenLabs/Google TTS.
4. Ajouter benchmarks de latence et dashboard qualité.

Voir `docs/ARCHITECTURE.md`.
