const contractions: Record<string, string> = {
  "aren't": 'are not',
  "can't": 'cannot',
  "couldn't": 'could not',
  "didn't": 'did not',
  "doesn't": 'does not',
  "don't": 'do not',
  "hadn't": 'had not',
  "hasn't": 'has not',
  "haven't": 'have not',
  "isn't": 'is not',
  "mustn't": 'must not',
  "shouldn't": 'should not',
  "wasn't": 'was not',
  "weren't": 'were not',
  "won't": 'will not',
  "wouldn't": 'would not',
}

export function normalizeAnswer(value: string) {
  let normalized = value
    .trim()
    .toLocaleLowerCase('en')
    .replace(/[’‘]/g, "'")
    .replace(/[.!?]+$/g, '')
    .replace(/\s+/g, ' ')

  for (const [short, long] of Object.entries(contractions)) {
    normalized = normalized.replaceAll(short, long)
  }
  return normalized.replaceAll('can not', 'cannot')
}

export function isAcceptedAnswer(answer: string, solution: string) {
  return solution
    .split(/\s*[|/]\s*/)
    .some((option) => normalizeAnswer(answer) === normalizeAnswer(option))
}
