const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function translateOne(text, source, target) {
  const url = new URL('https://api.mymemory.translated.net/get')
  url.searchParams.set('q', text)
  url.searchParams.set('langpair', `${source}|${target}`)
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'LinguaLab/1.0' } })
  if (!response.ok) throw new Error(`Übersetzungsdienst antwortet mit ${response.status}.`)
  const data = await response.json()
  const translated = data?.responseData?.translatedText || data?.matches?.[0]?.translation
  if (!translated) throw new Error('Keine Übersetzung erhalten.')
  return translated
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/translate') {
      return new Response('LinguaLab translation worker', { status: 200, headers: corsHeaders })
    }

    try {
      const body = await request.json()
      const source = body.source === 'de' ? 'de' : 'en'
      const target = body.target === 'en' ? 'en' : 'de'
      const translatedText = Array.isArray(body.q)
        ? await Promise.all(body.q.map((text) => translateOne(String(text), source, target)))
        : await translateOne(String(body.q ?? ''), source, target)
      return Response.json({ translatedText }, { headers: corsHeaders })
    } catch (error) {
      return Response.json({ error: error instanceof Error ? error.message : 'Übersetzung fehlgeschlagen.' }, { status: 502, headers: corsHeaders })
    }
  },
}
