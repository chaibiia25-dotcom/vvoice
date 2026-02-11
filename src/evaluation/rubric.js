export function evaluateResponse({ factuality, relevance, fluency, uncertainty }) {
  const normalize = (value) => Math.min(10, Math.max(0, Number(value || 0)));

  const score = {
    factuality: normalize(factuality),
    relevance: normalize(relevance),
    fluency: normalize(fluency),
    uncertainty: normalize(uncertainty)
  };

  return {
    ...score,
    global: Number(((score.factuality + score.relevance + score.fluency + score.uncertainty) / 4).toFixed(2))
  };
}
