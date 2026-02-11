const supportedProviders = ['mock', 'openai', 'anthropic', 'gemini', 'local'];

export function assertProvider(providerName) {
  if (!supportedProviders.includes(providerName)) {
    throw new Error(`Provider LLM non supporté: ${providerName}`);
  }
}

export async function streamLlmResponse({ provider, prompt, context = [] }) {
  assertProvider(provider);

  const joinedContext = context.slice(-6).map((item) => item.content).join(' | ');
  const deterministic = `Réponse(${provider}) à: ${prompt}${joinedContext ? ` | ctx: ${joinedContext}` : ''}`;

  // Simule un streaming token-by-token
  const chunks = deterministic.match(/.{1,24}/g) || [];
  return chunks;
}
