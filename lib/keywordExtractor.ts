/**
 * Extracts relevant keywords and phrases (including bigrams, trigrams, hyphenated words)
 * from the input text for ATS or matching purposes.
 * Returns keywords ranked by frequency and phrase importance.
 * Applies advanced normalization and filtering.
 */
const ADDITIONAL_GENERIC = [
  'preferred', 'should', 'candidate', 'experience', 'knowledge', 'ability', 'strong', 'ready', 'features'
];

const STOPWORDS = [
  "the", "and", "or", "to", "a", "in", "of", "for", "with", "on", "as", "is",
  ...ADDITIONAL_GENERIC
];

// Helper: Normalize punctuation, preserve hyphens, strip trailing period/comma, lowercase.
function normalizeTokens(text: string): string[] {
  return text
    .replace(/[.,]+(?=\s|$)/g, '') // remove trailing periods and commas
    .replace(/[^a-zA-Z0-9-\s]/g, ' ') // keep hyphens and alphanums
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

// Helper: Determines if a word is a stopword or too short.
function isUsable(word: string, stopwords: Set<string>) {
  return word.length > 2 && !stopwords.has(word);
}

// Helper: Collect unigram, bigram, trigram counts
function collectNgramCounts(tokens: string[], stopwords: Set<string>): Record<string, number> {
  const counts: Record<string, number> = {};
  // Unigrams
  for (const t of tokens) {
    if (isUsable(t, stopwords)) {
      counts[t] = (counts[t] || 0) + 1;
    }
  }
  // Bigrams/trigrams
  for (let i = 0; i < tokens.length; ++i) {
    // bigram: both must be usable
    if (i + 1 < tokens.length && isUsable(tokens[i], stopwords) && isUsable(tokens[i + 1], stopwords)) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`;
      counts[bigram] = (counts[bigram] || 0) + 1;
    }
    // trigram: all must be usable
    if (i + 2 < tokens.length &&
      isUsable(tokens[i], stopwords) &&
      isUsable(tokens[i + 1], stopwords) &&
      isUsable(tokens[i + 2], stopwords)
    ) {
      const trigram = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
      counts[trigram] = (counts[trigram] || 0) + 1;
    }
  }
  return counts;
}

/**
 * Main keyword extraction:
 * Returns up to 20 keywords/phrases ranked by relevance (frequency, phrase > single-word).
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];

  const stopwords = new Set(STOPWORDS);
  const tokens = normalizeTokens(text);

  const freq = collectNgramCounts(tokens, stopwords);

  // Custom ranking: longer phrases with freq >=2 are prioritized, else by count
  const keywordsSorted = Object.entries(freq)
    .sort((a, b) => {
      // phrase length priority, then count
      const lenA = a[0].split(' ').length;
      const lenB = b[0].split(' ').length;
      if (lenA !== lenB) return lenB - lenA;
      return b[1] - a[1];
    })
    .slice(0, 20)
    .map(e => e[0]);

  return keywordsSorted;
}

/*
 * Keywords Report utility implementing:
 * - coveragePercent
 * - missingTop (top 10 missing from reference)
 * - missingSupported/missingUnsupported ("supported" = present in text)
 */
export function keywordsReport({
  reference, // array of reference (job) keywords
  found      // array of keywords extracted from resume
}: {
  reference: string[],
  found: string[]
}) {
  // Normalize for matching
  function norm(s: string) {
    return s.replace(/[.,]+$/g, '').toLowerCase();
  }
  const normRef = reference.map(norm);
  const normFound = found.map(norm);

  // Compute which reference keywords are supported by found
  const missing: string[] = [];
  const supported: string[] = [];
  const unsupported: string[] = [];

  for (let i = 0; i < normRef.length; ++i) {
    if (normFound.includes(normRef[i])) {
      supported.push(reference[i]);
    } else {
      missing.push(reference[i]);
    }
  }

  // Of the missing, which are top (ranked by appearance order, first 10)
  const missingTop = missing.slice(0, 10);

  // For unsupported, require word does not exist even partially in the found
  for (let i = 0; i < missing.length; ++i) {
    const kw = missing[i];
    const partFound = normFound.some(fk => fk.includes(norm(kw)) || norm(kw).includes(fk));
    if (partFound) {
      supported.push(kw);
    } else {
      unsupported.push(kw);
    }
  }

  const coveragePercent = reference.length === 0
    ? 100
    : Math.round((supported.length / reference.length) * 100);

  return {
    coveragePercent,
    missingTop,
    missingSupported: supported.filter(k => missingTop.includes(k)),
    missingUnsupported: unsupported
  };
}