export function extractKeywords(text: string): string[] {
  // Simple placeholder keyword extractor — to be replaced with real logic
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const stop = new Set(["the", "and", "or", "to", "a", "in", "of", "for", "with", "on", "as", "is"]);

  const freq: Record<string, number> = {};
  for (const w of words) {
    if (w.length < 3) continue;
    if (stop.has(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map((e) => e[0]);
}
