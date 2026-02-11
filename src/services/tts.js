export async function synthesizeSpeech({ provider, text }) {
  // Stub: on renvoie une pseudo sortie audio encodée
  const payload = `[${provider}] ${text}`;
  return {
    audioBase64: Buffer.from(payload, 'utf8').toString('base64'),
    durationMs: Math.max(220, text.length * 35)
  };
}
