export async function transcribeAudioFrame({ provider, audioBase64 }) {
  if (!audioBase64) {
    return { text: '', confidence: 0, provider };
  }

  // Stub de transcription (à remplacer par Whisper/Google STT)
  const decodedHint = Buffer.from(audioBase64, 'base64').toString('utf8').slice(0, 120).trim();
  const text = decodedHint || 'transcription_mock';

  return {
    text,
    confidence: decodedHint ? 0.74 : 0.52,
    provider
  };
}
