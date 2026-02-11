# Architecture agent conversationnel multimodal (temps réel)

## Pipeline cible
1. Capture audio (client WebRTC/WebAudio)
2. Envoi frame audio via WebSocket (`audio.frame`)
3. Transcription STT (Whisper / Google Speech-to-Text / mock)
4. Génération LLM avec streaming de tokens (`llm.chunk`)
5. Synthèse TTS de la réponse finale (`assistant.final.audioBase64`)
6. Évaluation qualité via grille (`/api/evaluation/score`)

## Objectifs mesurables
- Latence aller-retour audio->audio < 1200ms (cible de démo)
- Détection/gestion d'incertitude explicite côté prompt
- Limitation du contexte conversationnel (fenêtre glissante)

## Risques & mitigations
- Hallucinations: imposer un prompt de prudence + score d'incertitude.
- Erreurs STT: confirmation utilisateur et correction editable côté UI.
- Dérive contextuelle: tronquer et résumer les anciens tours.
