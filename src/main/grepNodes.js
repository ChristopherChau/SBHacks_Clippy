/**
 * Calculates a fuzzy match score between a query and a target string.
 * Returns a score > 0 if it matches, or -1 if no match.
 */
function fuzzyScore(query, target) {
  if (!query || !target) return -1

  const queryLower = query.toLowerCase()
  const targetLower = target.toLowerCase()

  // Exact match gets highest score
  if (targetLower === queryLower) return 1000

  // Substring match
  if (targetLower.includes(queryLower)) {
    return 500 - targetLower.indexOf(queryLower)
  }

  // Fuzzy match: all query chars must appear in order
  let queryIndex = 0
  let score = 0
  let lastMatchIndex = -1

  for (let i = 0; i < targetLower.length && queryIndex < queryLower.length; i++) {
    if (targetLower[i] === queryLower[queryIndex]) {
      // Bonus for consecutive matches
      score += lastMatchIndex === i - 1 ? 10 : 5

      // Bonus for word boundary matches
      if (i === 0 || ' -_'.includes(target[i - 1])) {
        score += 15
      }

      lastMatchIndex = i
      queryIndex++
    }
  }

  return queryIndex < queryLower.length ? -1 : score
}

/**
 * Fuzzy finder that takes a list of strings and returns matches for the input query.
 *
 * @param {string[]} strings - Array of strings to search
 * @param {string} query - The search string to match against
 * @returns {string[]} - Matching strings sorted by relevance (best matches first)
 */
export function fuzzyFind(strings, query) {
  if (!query || !query.trim()) {
    return strings
  }

  if (!Array.isArray(strings)) {
    return []
  }

  return strings
    .map((str) => ({ str, score: fuzzyScore(query.trim(), str) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ str }) => str)
}
