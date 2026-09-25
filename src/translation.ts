import { vocabularySets } from './vocabularySets'

export type TranslationDirection = 'en-de' | 'de-en'

const phrasePairs: [string, string][] = [
  ['Good morning!', 'Guten Morgen!'],
  ['Good evening!', 'Guten Abend!'],
  ['How are you?', 'Wie geht es dir?'],
  ['Thank you very much.', 'Vielen Dank.'],
  ['You are welcome.', 'Gern geschehen.'],
  ['What is your name?', 'Wie heißt du?'],
  ['Where do you live?', 'Wo wohnst du?'],
  ['I do not understand.', 'Ich verstehe nicht.'],
  ['Could you help me?', 'Könntest du mir helfen?'],
  ['How much does it cost?', 'Wie viel kostet es?'],
  ['The lesson starts at nine o’clock.', 'Der Unterricht beginnt um neun Uhr.'],
  ['I usually get up in the morning.', 'Ich stehe normalerweise morgens auf.'],
  ['She has lived here since 2020.', 'Sie lebt seit 2020 hier.'],
  ['We will wait until six o’clock.', 'Wir werden bis sechs Uhr warten.'],
  ['The keys are on the table.', 'Die Schlüssel liegen auf dem Tisch.'],
  ['The cat is under the chair.', 'Die Katze ist unter dem Stuhl.'],
  ['I am learning English at the moment.', 'Ich lerne im Moment Englisch.'],
  ['If I had more time, I would travel.', 'Wenn ich mehr Zeit hätte, würde ich reisen.'],
  ['The results will be announced tomorrow.', 'Die Ergebnisse werden morgen bekannt gegeben.'],
  ['I wish I had more free time.', 'Ich wünschte, ich hätte mehr Freizeit.'],
]

const additionalPairs: [string, string][] = [
  ['and', 'und'], ['or', 'oder'], ['but', 'aber'], ['because', 'weil'], ['with', 'mit'], ['without', 'ohne'],
  ['hello', 'hallo'], ['goodbye', 'auf Wiedersehen'], ['please', 'bitte'], ['thanks', 'danke'],
  ['house', 'Haus'], ['room', 'Zimmer'], ['kitchen', 'Küche'], ['school', 'Schule'], ['teacher', 'Lehrer'],
  ['book', 'Buch'], ['car', 'Auto'], ['dog', 'Hund'], ['cat', 'Katze'], ['food', 'Essen'], ['water', 'Wasser'],
  ['person', 'Person'], ['people', 'Menschen'], ['man', 'Mann'], ['woman', 'Frau'], ['child', 'Kind'],
  ['today', 'heute'], ['tomorrow', 'morgen'], ['yesterday', 'gestern'], ['day', 'Tag'], ['week', 'Woche'], ['year', 'Jahr'],
  ['is', 'ist'], ['are', 'sind'], ['was', 'war'], ['have', 'haben'], ['has', 'hat'], ['do', 'tun'],
]

const vocabularyPairs = vocabularySets.flatMap((set) => set.words.map((word): [string, string] => [word.english, word.german.split('/')[0].trim()]))
const allPairs = [...vocabularyPairs, ...additionalPairs]

const dictionaries = {
  'en-de': new Map(allPairs.map(([english, german]) => [english.toLocaleLowerCase('en'), german])),
  'de-en': new Map(allPairs.map(([english, german]) => [german.toLocaleLowerCase('de'), english])),
}

const phrases = {
  'en-de': new Map(phrasePairs.map(([english, german]) => [english.toLocaleLowerCase('en'), german])),
  'de-en': new Map(phrasePairs.map(([english, german]) => [german.toLocaleLowerCase('de'), english])),
}

export type TranslationResult = {
  text: string
  unknown: string[]
  exact: boolean
}

type LibreTranslateResponse = { translatedText?: string | string[]; error?: string }
const translationApiBase = import.meta.env.VITE_TRANSLATE_API_URL ?? '/api'

async function requestLibreTranslate(q: string | string[], direction: TranslationDirection): Promise<string | string[]> {
  const [source, target] = direction.split('-')
  if (typeof q === 'string') {
    const memoryUrl = new URL('https://api.mymemory.translated.net/get')
    memoryUrl.searchParams.set('q', q)
    memoryUrl.searchParams.set('langpair', `${source}|${target}`)
    try {
      const memoryResponse = await fetch(memoryUrl)
      const memoryData = await memoryResponse.json() as { responseData?: { translatedText?: string } }
      if (memoryResponse.ok && memoryData.responseData?.translatedText) return memoryData.responseData.translatedText
    } catch {
      // Fall back to the configured local or worker endpoint.
    }
  }
  let response: Response
  try {
    response = await fetch(`${translationApiBase}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, source, target, format: 'text' }),
    })
  } catch {
    throw new Error('LibreTranslate läuft nicht. Starte es mit „npm run translate“.')
  }

  const data = await response.json().catch(() => ({})) as LibreTranslateResponse
  if (!response.ok || !data.translatedText) {
    throw new Error(data.error || 'LibreTranslate läuft nicht. Starte es mit „npm run translate“.')
  }
  return data.translatedText
}

export async function translateOnline(input: string, direction: TranslationDirection): Promise<string> {
  const translated = await requestLibreTranslate(input.trim(), direction)
  if (typeof translated !== 'string') throw new Error('Die Satzübersetzung hat ein unerwartetes Format.')
  return translated.trim()
}

export async function translateWordsOnline(words: string[], direction: TranslationDirection): Promise<string[]> {
  if (!words.length) return []
  const translated = await requestLibreTranslate(words, direction)
  if (!Array.isArray(translated)) throw new Error('Die Wortübersetzung hat ein unerwartetes Format.')
  return translated.map((word) => word.trim())
}

export function correctGermanVocabulary(value: string, english = '') {
  const nounTranslations: Record<string, string> = {
    person: 'Person',
    people: 'Menschen',
    man: 'Mann',
    woman: 'Frau',
    child: 'Kind',
    language: 'Sprache',
    languages: 'Sprachen',
    talent: 'Talent',
  }
  const corrections: Record<string, string> = {
    menschen: 'Menschen',
  }
  return nounTranslations[english.trim().toLocaleLowerCase('en')] ?? corrections[value.trim().toLocaleLowerCase('de')] ?? value.trim()
}

export function translateLocally(input: string, direction: TranslationDirection): TranslationResult {
  const trimmed = input.trim()
  if (!trimmed) return { text: '', unknown: [], exact: false }

  const exact = phrases[direction].get(trimmed.toLocaleLowerCase(direction === 'en-de' ? 'en' : 'de'))
  if (exact) return { text: exact, unknown: [], exact: true }

  const dictionary = dictionaries[direction]
  const unknown = new Set<string>()
  const text = trimmed.replace(/[\p{L}’'-]+/gu, (token) => {
    const translated = dictionary.get(token.toLocaleLowerCase(direction === 'en-de' ? 'en' : 'de'))
    if (!translated) {
      unknown.add(token)
      return `‹${token}›`
    }
    return /^[A-ZÄÖÜ]/.test(token) ? translated.charAt(0).toLocaleUpperCase() + translated.slice(1) : translated
  })

  return { text, unknown: [...unknown], exact: false }
}
