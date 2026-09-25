import { ArrowLeftRight, BookPlus, Camera, Check, Copy, ImagePlus, Languages, LoaderCircle, Send, Trash2, Volume2 } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { correctGermanVocabulary, translateLocally, translateOnline, translateWordsOnline, type TranslationDirection } from './translation'
import type { VocabularyWord } from './vocabularyData'

type TranslatorProps = {
  existingWords: VocabularyWord[]
  onAddToVocabulary: (words: VocabularyWord[]) => number
}

type WordCandidate = VocabularyWord & { existing: boolean }

export function Translator({ existingWords, onAddToVocabulary }: TranslatorProps) {
  const [direction, setDirection] = useState<TranslationDirection>('en-de')
  const [source, setSource] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [onlineResult, setOnlineResult] = useState('')
  const [translating, setTranslating] = useState(false)
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [extractingWords, setExtractingWords] = useState(false)
  const [candidates, setCandidates] = useState<WordCandidate[]>([])
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set())
  const sourceRef = useRef<HTMLTextAreaElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const localResult = translateLocally(source, direction)
  const hasCompleteLocalResult = localResult.exact || localResult.unknown.length === 0
  const translatedText = onlineResult || (hasCompleteLocalResult ? localResult.text : '')

  function swapDirection() {
    setDirection((current) => current === 'en-de' ? 'de-en' : 'en-de')
    setSource(translatedText.replace(/[‹›]/g, ''))
    setOnlineResult('')
    setError('')
    setSaveStatus('')
    setCandidates([])
  }

  function updateSource(value: string) {
    setSource(value)
    setOnlineResult('')
    setError('')
    setSaveStatus('')
    setCandidates([])
  }

  function selectDirection(nextDirection: TranslationDirection) {
    setDirection(nextDirection)
    setOnlineResult('')
    setError('')
    setSaveStatus('')
    setCandidates([])
  }

  async function prepareVocabularyWords() {
    const sourceWords = source.match(/[\p{L}]+(?:[’'-][\p{L}]+)*/gu) ?? []
    const uniqueWords = [...new Map(sourceWords.map((word) => [word.toLocaleLowerCase(), word])).values()].slice(0, 80)
    if (!uniqueWords.length) return

    setExtractingWords(true)
    setError('')
    setSaveStatus('')
    try {
      const translations = await translateWordsOnline(uniqueWords, direction)
      const existingEnglish = new Set(existingWords.map((word) => word.english.toLocaleLowerCase('en')))
      const candidateEnglish = new Set<string>()
      const nextCandidates: WordCandidate[] = []
      uniqueWords.forEach((word, index) => {
        const english = direction === 'en-de' ? word : translations[index]
        const german = correctGermanVocabulary(direction === 'en-de' ? translations[index] : word, english)
        const key = english.toLocaleLowerCase('en')
        if (candidateEnglish.has(key)) return
        candidateEnglish.add(key)
        nextCandidates.push({
          id: `personal-${Date.now()}-${index}`,
          english,
          german,
          englishDescription: 'Saved as a single word from the translation page.',
          germanDescription: 'Als einzelnes Wort aus der Übersetzungsseite übernommen.',
          level: 'A1',
          category: 'Eigene Vokabeln',
          existing: existingEnglish.has(key),
        })
      })
      setCandidates(nextCandidates)
      setSelectedWords(new Set(nextCandidates.filter((word) => !word.existing).map((word) => word.id)))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Die Wörter konnten nicht vorbereitet werden.')
    } finally {
      setExtractingWords(false)
    }
  }

  function saveSelectedWords() {
    const words = candidates
      .filter((word) => selectedWords.has(word.id))
      .map((word): VocabularyWord => ({
        id: word.id,
        english: word.english,
        german: word.german,
        englishDescription: word.englishDescription,
        germanDescription: word.germanDescription,
        level: word.level,
        category: word.category,
      }))
    const added = onAddToVocabulary(words)
    setSaveStatus(`${added} ${added === 1 ? 'Wort wurde' : 'Wörter wurden'} unter „Eigene Vokabeln“ gespeichert.`)
    setCandidates((current) => current.map((word) => selectedWords.has(word.id) ? { ...word, existing: true } : word))
    setSelectedWords(new Set())
  }

  function toggleWord(id: string) {
    setSelectedWords((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function updateCandidateGerman(id: string, german: string) {
    setCandidates((current) => current.map((word) => word.id === id ? { ...word, german } : word))
  }

  async function requestTranslation(text = source) {
    if (!text.trim()) return
    setTranslating(true)
    setError('')
    setSaveStatus('')
    setCandidates([])
    try {
      setOnlineResult(await translateOnline(text, direction))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Die Übersetzung ist fehlgeschlagen.')
    } finally {
      setTranslating(false)
    }
  }

  async function recognizeImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(URL.createObjectURL(file))
    setProgress(0)
    let worker: Awaited<ReturnType<typeof import('tesseract.js')['createWorker']>> | null = null
    try {
      const { createWorker } = await import('tesseract.js')
      worker = await createWorker(direction === 'en-de' ? 'eng' : 'deu', undefined, {
        logger: (message) => {
          if (message.status === 'recognizing text') setProgress(Math.round(message.progress * 100))
        },
      })
      const recognition = await worker.recognize(file)
      const recognizedText = recognition.data.text.trim()
      updateSource(recognizedText)
      if (recognizedText) await requestTranslation(recognizedText)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Das Bild konnte nicht verarbeitet werden.')
    } finally {
      await worker?.terminate()
      setProgress(null)
      event.target.value = ''
    }
  }

  function clear() {
    setSource('')
    setOnlineResult('')
    setError('')
    setSaveStatus('')
    setCandidates([])
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl('')
  }

  function speak(text: string, language: string) {
    if (!text.trim()) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language
    window.speechSynthesis.speak(utterance)
  }

  function speakSource() {
    const selectedText = sourceRef.current?.value.slice(sourceRef.current.selectionStart, sourceRef.current.selectionEnd) ?? ''
    speak(selectedText || source, direction === 'en-de' ? 'en-GB' : 'de-DE')
  }

  function speakTranslation() {
    const selectedText = window.getSelection()?.toString() ?? ''
    const text = resultRef.current?.contains(window.getSelection()?.anchorNode ?? null) ? selectedText : translatedText
    speak(text || translatedText, direction === 'en-de' ? 'de-DE' : 'en-GB')
  }

  return <main className="translator-page">
    <section className="translator-heading">
      <span>OFFLINE-WÖRTERBUCH & OCR</span>
      <h1>Übersetzen</h1>
      <p>Schreibe einen Text oder fotografiere ihn. Die Verarbeitung erfolgt lokal im Browser.</p>
    </section>

    <section className="translator-direction" aria-label="Übersetzungsrichtung">
      <button aria-pressed={direction === 'en-de'} className={direction === 'en-de' ? 'active' : ''} onClick={() => selectDirection('en-de')}><b>EN</b><span>Englisch</span></button>
      <button className="swap-button" onClick={swapDirection} title="Sprachen tauschen"><ArrowLeftRight size={19} /></button>
      <button aria-pressed={direction === 'de-en'} className={direction === 'de-en' ? 'active' : ''} onClick={() => selectDirection('de-en')}><b>DE</b><span>Deutsch</span></button>
    </section>

    <section className="translator-workspace">
      <div className="translation-pane source-pane">
        <div className="translation-pane-head"><span>{direction === 'en-de' ? 'Englisch' : 'Deutsch'}</span>{source && <div className="translation-output-actions"><button title="Eingabe oder markiertes Wort vorlesen" onClick={speakSource}><Volume2 size={17} /></button><button title="Text löschen" onClick={clear}><Trash2 size={16} /></button></div>}</div>
        <textarea ref={sourceRef} maxLength={5000} value={source} onChange={(event) => updateSource(event.target.value)} placeholder="Wort oder ganzen Satz eingeben ..." />
        <div className="photo-tools">
          <button className="primary translate-button" disabled={!source.trim() || translating} onClick={() => requestTranslation()}>{translating ? <LoaderCircle className="spin" size={17} /> : <Send size={17} />} {translating ? 'Übersetzt ...' : 'Lokal übersetzen'}</button>
          <label className="secondary"><Camera size={17} /> Foto aufnehmen<input type="file" accept="image/*" capture="environment" onChange={recognizeImage} /></label>
          <label className="text-button"><ImagePlus size={17} /> Bild auswählen<input type="file" accept="image/*" onChange={recognizeImage} /></label>
        </div>
        {imageUrl && <div className="ocr-preview"><img src={imageUrl} alt="Ausgewählter Text zur Erkennung" />{progress !== null && <div><LoaderCircle size={20} /><span>Text wird erkannt: {progress}%</span><progress value={progress} max="100" /></div>}</div>}
      </div>

      <div className="translation-pane result-pane">
        <div className="translation-pane-head"><span>{direction === 'en-de' ? 'Deutsch' : 'Englisch'}</span>{translatedText && <div className="translation-output-actions"><button title="Übersetzung oder markiertes Wort vorlesen" onClick={speakTranslation}><Volume2 size={17} /></button><button title="Übersetzung kopieren" onClick={() => navigator.clipboard.writeText(translatedText)}><Copy size={16} /></button></div>}</div>
        <div ref={resultRef} className={`translation-output ${!translatedText ? 'placeholder' : ''}`}>{translatedText || (source ? 'Für diesen Text wird die vollständige lokale Übersetzung vorbereitet.' : 'Die Übersetzung erscheint hier.')}</div>
        {error && <p className="translation-error">{error}</p>}
        {translatedText && <div className="save-translation"><button className="secondary" disabled={extractingWords} onClick={prepareVocabularyWords}>{extractingWords ? <LoaderCircle className="spin" size={17} /> : <BookPlus size={17} />}{extractingWords ? 'Wörter werden vorbereitet ...' : 'Einzelne Wörter auswählen'}</button></div>}
        {(translatedText || source) && <div className="translation-status"><Languages size={15} /><span>{onlineResult ? 'Lokal mit LibreTranslate übersetzt · nicht gespeichert' : hasCompleteLocalResult ? 'Passender Inhalt aus dem lokalen Wörterbuch' : 'Für eine vollständige Übersetzung „Lokal übersetzen“ wählen.'}</span></div>}
      </div>
    </section>

    {candidates.length > 0 && <section className="word-picker">
      <div className="word-picker-head"><div><span>NEUE VOKABELN</span><h2>Einzelne Wörter auswählen</h2><p>Doppelte Wörter sind bereits aussortiert und können nicht erneut gewählt werden.</p></div><strong>{selectedWords.size} ausgewählt</strong></div>
      <div className="word-candidate-grid">{candidates.map((word) => <article className={word.existing ? 'existing' : ''} key={word.id}>
        <input type="checkbox" disabled={word.existing} checked={selectedWords.has(word.id)} onChange={() => toggleWord(word.id)} />
        <div><strong>{word.english}</strong><input className="candidate-translation" value={word.german} disabled={word.existing} onChange={(event) => updateCandidateGerman(word.id, event.target.value)} aria-label={`Deutsche Übersetzung für ${word.english}`} /></div>
        {word.existing && <em>Vorhanden</em>}
      </article>)}</div>
      <div className="word-picker-actions">{saveStatus && <span><Check size={15} />{saveStatus}</span>}<button className="primary" disabled={!selectedWords.size} onClick={saveSelectedWords}><BookPlus size={17} /> Auswahl speichern</button></div>
    </section>}

    <section className="translator-note"><strong>Lokal & privat</strong><p>LibreTranslate und die Fotoerkennung laufen auf diesem Rechner. Eingaben verlassen das Gerät nicht und werden nicht in der App gespeichert. Vor der ersten Nutzung muss der lokale Dienst mit „npm run translate“ gestartet werden.</p></section>
  </main>
}
