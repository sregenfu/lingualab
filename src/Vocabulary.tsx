import { BookMarked, Check, CircleCheck, Eye, EyeOff, Languages, PenLine, RotateCcw, Search, Target, Trash2, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createLearningError, createLearningRecord, type LearningError, type LearningRecord } from './learning'
import type { VocabularyWord } from './vocabularyData'
import { vocabularySets } from './vocabularySets'
import { isAcceptedAnswer } from './answerUtils'

export type VocabularyMode = 'notebook' | 'practice' | 'test' | 'review' | 'sentences'
type Direction = 'en-de' | 'de-en'
type TestResult = { score: number; total: number; direction: Direction; date: string }
type ReviewRating = 'hard' | 'good' | 'easy'
type ReviewProgress = Record<string, { dueAt: number }>
type SentenceNote = { text: string; updatedAt: number }
type VocabularyProps = {
  personalWords: VocabularyWord[]
  onDeletePersonalWord: (id: string) => void
  initialMode?: VocabularyMode
  onRecordResult: (record: LearningRecord) => void
  onAddErrors: (errors: LearningError[]) => void
}

const modes: { id: VocabularyMode; label: string; icon: typeof BookMarked }[] = [
  { id: 'notebook', label: 'Vokabelheft', icon: BookMarked },
  { id: 'practice', label: 'Vokabeln üben', icon: Languages },
  { id: 'test', label: 'Vokabeltest', icon: Target },
  { id: 'review', label: 'Tageswiederholung', icon: CircleCheck },
  { id: 'sentences', label: 'Eigene Sätze', icon: PenLine },
]

const getCurrentTime = () => Date.now()

export function Vocabulary({ personalWords, onDeletePersonalWord, initialMode, onRecordResult, onAddErrors }: VocabularyProps) {
  const [mode, setMode] = useState<VocabularyMode>(initialMode ?? 'notebook')
  const [direction, setDirection] = useState<Direction>(() => (localStorage.getItem('lingua-vocabulary-direction') as Direction) || 'en-de')
  const [setId, setSetId] = useState(() => localStorage.getItem('lingua-vocabulary-set') || vocabularySets[0].id)
  const [search, setSearch] = useState('')
  const [testPage, setTestPage] = useState(0)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [evaluated, setEvaluated] = useState(false)
  const [lastResult, setLastResult] = useState<TestResult | null>(() => JSON.parse(localStorage.getItem('lingua-vocabulary-result') ?? 'null'))
  const [reviewProgress, setReviewProgress] = useState<ReviewProgress>(() => JSON.parse(localStorage.getItem('lingua-vocabulary-review') ?? '{}'))
  const [reviewWords, setReviewWords] = useState<VocabularyWord[]>([])
  const [reviewIndex, setReviewIndex] = useState(0)
  const [reviewAnswer, setReviewAnswer] = useState('')
  const [reviewEvaluated, setReviewEvaluated] = useState(false)
  const [reviewCorrect, setReviewCorrect] = useState(0)
  const [sentenceNotes, setSentenceNotes] = useState<Record<string, SentenceNote>>(() => JSON.parse(localStorage.getItem('lingua-vocabulary-sentences') ?? '{}'))

  useEffect(() => localStorage.setItem('lingua-vocabulary-direction', direction), [direction])
  useEffect(() => localStorage.setItem('lingua-vocabulary-set', setId), [setId])
  useEffect(() => localStorage.setItem('lingua-vocabulary-review', JSON.stringify(reviewProgress)), [reviewProgress])
  useEffect(() => localStorage.setItem('lingua-vocabulary-sentences', JSON.stringify(sentenceNotes)), [sentenceNotes])

  const personalSet = {
    id: 'personal', title: 'Eigene Vokabeln', description: 'Wörter und Sätze aus der Übersetzungsseite', level: 'A1' as const, words: personalWords,
  }
  const availableSets = personalWords.length ? [personalSet, ...vocabularySets] : vocabularySets
  const selectedSet = availableSets.find((set) => set.id === setId) ?? availableSets[0]
  const allWords = availableSets.flatMap((set) => set.words)
  const words = selectedSet.words.filter((word) => {
    const content = `${word.english} ${word.german} ${word.englishDescription} ${word.germanDescription}`.toLowerCase()
    return content.includes(search.toLowerCase())
  })
  const testStart = (testPage * 10) % Math.max(words.length, 1)
  const testWords = [...words.slice(testStart), ...words.slice(0, testStart)].slice(0, 10)
  const activeWords = mode === 'test' ? testWords : words
  const score = testWords.filter((word) => isAcceptedAnswer(answers[word.id] ?? '', getAnswer(word, direction))).length
  const currentReviewWord = reviewWords[reviewIndex]
  const reviewIsCorrect = currentReviewWord ? isAcceptedAnswer(reviewAnswer, getAnswer(currentReviewWord, direction)) : false

  function changeMode(nextMode: VocabularyMode) {
    setMode(nextMode)
    setRevealed(new Set())
    setAnswers({})
    setEvaluated(false)
    if (nextMode === 'review') startReview()
  }

  function changeDirection(nextDirection: Direction) {
    setDirection(nextDirection)
    setRevealed(new Set())
    setAnswers({})
    setEvaluated(false)
  }

  function toggleReveal(id: string) {
    setRevealed((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function reset() {
    setAnswers({})
    setRevealed(new Set())
    setEvaluated(false)
  }

  function changeSet(nextSetId: string) {
    setSetId(nextSetId)
    setSearch('')
    setTestPage(0)
    reset()
  }

  function newTest() {
    setTestPage((current) => current + 1)
    reset()
  }

  function evaluateTest() {
    const result = { score, total: testWords.length, direction, date: new Intl.DateTimeFormat('de-DE').format(new Date()) }
    setEvaluated(true)
    setLastResult(result)
    localStorage.setItem('lingua-vocabulary-result', JSON.stringify(result))
    onRecordResult(createLearningRecord('vocabulary', score, testWords.length))
    onAddErrors(testWords.filter((word) => !isAcceptedAnswer(answers[word.id] ?? '', getAnswer(word, direction))).map((word) =>
      createLearningError('vocabulary', direction === 'en-de' ? word.english : word.german, getAnswer(word, direction), word.category),
    ))
  }

  function startReview() {
    const now = getCurrentTime()
    setReviewWords(allWords.filter((word) => !reviewProgress[word.id] || reviewProgress[word.id].dueAt <= now).slice(0, 10))
    setReviewIndex(0)
    setReviewAnswer('')
    setReviewEvaluated(false)
    setReviewCorrect(0)
  }

  function evaluateReview() {
    if (!reviewAnswer.trim()) return
    setReviewEvaluated(true)
    if (reviewIsCorrect) setReviewCorrect((current) => current + 1)
  }

  function rateReview(rating: ReviewRating) {
    if (!currentReviewWord) return
    const daysUntilNextReview = rating === 'hard' ? 1 : rating === 'good' ? 3 : 7
    setReviewProgress((current) => ({
      ...current,
      [currentReviewWord.id]: { dueAt: getCurrentTime() + daysUntilNextReview * 24 * 60 * 60 * 1000 },
    }))
    if (!reviewIsCorrect) onAddErrors([createLearningError('review', direction === 'en-de' ? currentReviewWord.english : currentReviewWord.german, getAnswer(currentReviewWord, direction), currentReviewWord.category)])
    if (reviewIndex === reviewWords.length - 1) onRecordResult(createLearningRecord('review', reviewCorrect + (reviewIsCorrect ? 1 : 0), reviewWords.length))
    setReviewIndex((current) => current + 1)
    setReviewAnswer('')
    setReviewEvaluated(false)
  }

  function saveSentence(wordId: string, text: string) {
    setSentenceNotes((current) => ({ ...current, [wordId]: { text, updatedAt: getCurrentTime() } }))
  }

  return <main className="vocabulary-page">
    <section className="vocabulary-heading">
      <div><span>WORTSCHATZ</span><h1>Vokabeln trainieren</h1><p>Lerne Bedeutungen im Kontext und prüfe deinen Wortschatz.</p></div>
      <div className="vocabulary-stats"><strong>{vocabularySets.reduce((total, set) => total + set.words.length, personalWords.length)}</strong><span>Wörter in {availableSets.length} Themen</span></div>
    </section>

    <section className="vocabulary-controls">
      <div className="direction-control">
        <span>Sprachrichtung</span>
        <div role="group" aria-label="Sprachrichtung">
          <button aria-pressed={direction === 'en-de'} className={direction === 'en-de' ? 'active' : ''} onClick={() => changeDirection('en-de')}><span>EN</span> Englisch → Deutsch</button>
          <button aria-pressed={direction === 'de-en'} className={direction === 'de-en' ? 'active' : ''} onClick={() => changeDirection('de-en')}><span>DE</span> Deutsch → Englisch</button>
        </div>
      </div>
      <div className="vocabulary-modes" role="tablist" aria-label="Vokabelmodus">
        {modes.map(({ id, label, icon: Icon }) => <button role="tab" aria-selected={mode === id} className={mode === id ? 'active' : ''} key={id} onClick={() => changeMode(id)}><Icon size={17} />{label}</button>)}
      </div>
    </section>

    <section className="vocabulary-toolbar">
      <label className="set-select"><span>Thema</span><select value={selectedSet.id} onChange={(event) => changeSet(event.target.value)}>{availableSets.map((set) => <option key={set.id} value={set.id}>{set.title} · {set.id === 'personal' ? 'Persönlich' : set.level}</option>)}</select></label>
      <div className="vocabulary-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Vokabel suchen" /></div>
      <span>{words.length} {words.length === 1 ? 'Wort' : 'Wörter'}</span>
    </section>

    <section className="set-summary"><div><strong>{selectedSet.title}</strong><span>{selectedSet.id === 'personal' ? 'Persönlich' : `Niveau ${selectedSet.level}`}</span></div><p>{selectedSet.description}</p></section>

    {mode === 'notebook' && <section className="vocabulary-list">
      <div className="vocabulary-list-head"><span>Wort & Beschreibung</span><span>Übersetzung</span></div>
      {activeWords.map((word, index) => <VocabularyRow key={word.id} word={word} index={index} direction={direction} revealed={revealed.has(word.id)} onReveal={() => toggleReveal(word.id)} onDelete={selectedSet.id === 'personal' ? () => onDeletePersonalWord(word.id) : undefined} />)}
    </section>}

    {mode === 'practice' && <section className="vocabulary-list practice-list">
      <div className="mode-intro"><div><span>OHNE DRUCK ÜBEN</span><h2>Übersetzung eintragen</h2></div><p>Schreibe deine Antwort und decke danach die Lösung auf.</p></div>
      {activeWords.map((word, index) => <VocabularyRow key={word.id} word={word} index={index} direction={direction} revealed={revealed.has(word.id)} answer={answers[word.id] ?? ''} onAnswer={(value) => setAnswers((current) => ({ ...current, [word.id]: value }))} onReveal={() => toggleReveal(word.id)} onDelete={selectedSet.id === 'personal' ? () => onDeletePersonalWord(word.id) : undefined} />)}
      <div className="vocabulary-actions"><button className="secondary" onClick={reset}><RotateCcw size={16} /> Zurücksetzen</button></div>
    </section>}

    {mode === 'test' && <section className="vocabulary-list test-list">
      <div className="mode-intro"><div><span>{testWords.length} {testWords.length === 1 ? 'AUFGABE' : 'AUFGABEN'}</span><h2>Vokabeltest</h2></div>{evaluated ? <strong className="vocabulary-score">{score}/{testWords.length} richtig</strong> : lastResult && <small className="last-result">Zuletzt: {lastResult.score}/{lastResult.total} · {lastResult.date}</small>}</div>
      {testWords.map((word, index) => {
        const correct = isAcceptedAnswer(answers[word.id] ?? '', getAnswer(word, direction))
        return <VocabularyRow key={word.id} word={word} index={index} direction={direction} answer={answers[word.id] ?? ''} onAnswer={(value) => { setAnswers((current) => ({ ...current, [word.id]: value })); setEvaluated(false) }} evaluated={evaluated} correct={correct} />
      })}
      <div className="vocabulary-actions"><button className="text-button" onClick={newTest}><RotateCcw size={16} /> Neue 10 Vokabeln</button><button className="primary" disabled={!testWords.length || testWords.some((word) => !answers[word.id]?.trim())} onClick={evaluateTest}><Check size={17} /> Auswerten</button></div>
    </section>}

    {mode === 'review' && <section className="vocabulary-list review-list">
      {currentReviewWord ? <>
        <div className="mode-intro"><div><span>TAGESWIEDERHOLUNG · {reviewIndex + 1}/{reviewWords.length}</span><h2>Erst erinnern, dann prüfen</h2></div><p>Deine Einschätzung legt den nächsten Wiederholungstermin fest.</p></div>
        <div className={`review-card ${reviewEvaluated ? (reviewIsCorrect ? 'correct' : 'wrong') : ''}`}>
          <span>{direction === 'en-de' ? 'ENGLISCH → DEUTSCH' : 'DEUTSCH → ENGLISCH'}</span>
          <div className="review-word"><strong>{direction === 'en-de' ? currentReviewWord.english : currentReviewWord.german}</strong><button className="speak-button" title="Englische Aussprache anhören" onClick={() => speak(currentReviewWord.english)}><Volume2 size={18} /></button></div>
          <p>{direction === 'en-de' ? currentReviewWord.englishDescription : currentReviewWord.germanDescription}</p>
          <input value={reviewAnswer} disabled={reviewEvaluated} onChange={(event) => setReviewAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') evaluateReview() }} placeholder={direction === 'en-de' ? 'Deutsche Übersetzung' : 'English translation'} autoFocus />
          {reviewEvaluated && <div className="review-feedback">{reviewIsCorrect ? <><Check size={18} /> Richtig</> : <>Lösung: <strong>{getAnswer(currentReviewWord, direction)}</strong></>}</div>}
        </div>
        <div className="vocabulary-actions review-actions">
          {!reviewEvaluated ? <button className="primary" disabled={!reviewAnswer.trim()} onClick={evaluateReview}><Check size={17} /> Prüfen</button> : <><span>Wann möchtest du dieses Wort wiederholen?</span><button className="review-hard" onClick={() => rateReview('hard')}>Schwer · morgen</button><button className="review-good" onClick={() => rateReview('good')}>Gut · in 3 Tagen</button><button className="review-easy" onClick={() => rateReview('easy')}>Leicht · in 7 Tagen</button></>}
        </div>
      </> : <div className="review-complete"><CircleCheck size={36} /><span>TAGESWIEDERHOLUNG</span><h2>{reviewWords.length ? 'Für heute erledigt' : 'Keine Vokabeln fällig'}</h2><p>{reviewWords.length ? `${reviewCorrect}/${reviewWords.length} Antworten waren richtig. Die nächsten Wörter warten zu ihrem Wiederholungstermin.` : 'Komm später wieder oder lerne neue Wörter im Vokabelheft.'}</p><button className="primary" onClick={() => setMode('practice')}><Languages size={17} /> Vokabeln üben</button></div>}
    </section>}

    {mode === 'sentences' && <section className="vocabulary-list sentence-list">
      <div className="mode-intro"><div><span>AKTIV ANWENDEN</span><h2>Eigene Sätze schreiben</h2></div><p>Nutze jedes englische Wort in einem kurzen, sinnvollen Satz.</p></div>
      {words.map((word) => <article className="sentence-row" key={word.id}>
        <div><div className="sentence-word"><strong>{word.english}</strong><button className="speak-button" title="Englische Aussprache anhören" onClick={() => speak(word.english)}><Volume2 size={17} /></button></div><p>{word.englishDescription}</p></div>
        <textarea value={sentenceNotes[word.id]?.text ?? ''} onChange={(event) => saveSentence(word.id, event.target.value)} placeholder={`Write a sentence with “${word.english}”`} aria-label={`Eigener Satz mit ${word.english}`} />
      </article>)}
      <div className="vocabulary-actions"><span>Deine Sätze werden automatisch auf diesem Gerät gespeichert.</span></div>
    </section>}

    {mode !== 'review' && !activeWords.length && <div className="empty-state"><Search size={35} /><h2>Keine Vokabel gefunden</h2><p>Ändere den Suchbegriff oder das Sprachniveau.</p></div>}
  </main>
}

type VocabularyRowProps = {
  word: VocabularyWord
  index: number
  direction: Direction
  revealed?: boolean
  answer?: string
  evaluated?: boolean
  correct?: boolean
  onAnswer?: (value: string) => void
  onReveal?: () => void
  onDelete?: () => void
}

function VocabularyRow({ word, index, direction, revealed, answer, evaluated, correct, onAnswer, onReveal, onDelete }: VocabularyRowProps) {
  const prompt = direction === 'en-de' ? word.english : word.german
  const description = direction === 'en-de' ? word.englishDescription : word.germanDescription
  const solution = getAnswer(word, direction)

  return <article className={`vocabulary-row ${evaluated ? (correct ? 'correct' : 'wrong') : ''}`}>
    <span className="vocabulary-number">{index + 1}</span>
    <div className="vocabulary-prompt"><div><strong>{prompt}</strong><button className="speak-button" title="Englische Aussprache anhören" onClick={() => speak(word.english)}><Volume2 size={16} /></button><span>{word.category === 'Eigene Vokabeln' ? word.category : `${word.level} · ${word.category}`}</span></div><p>{description}</p></div>
    {onAnswer && <input className="vocabulary-answer" value={answer} onChange={(event) => onAnswer(event.target.value)} placeholder={direction === 'en-de' ? 'Deutsche Übersetzung' : 'English translation'} />}
    {onReveal ? <button className={`translation-card ${revealed ? 'revealed' : ''}`} onClick={onReveal} aria-label={revealed ? 'Übersetzung verdecken' : 'Übersetzung aufdecken'}>
      {revealed ? <><span>{solution}</span><EyeOff size={16} /></> : <><span>Aufdecken</span><Eye size={16} /></>}
    </button> : evaluated ? <div className="test-result">{correct ? <><Check size={17} /> Richtig</> : <><span>{solution}</span></>}</div> : null}
    {onDelete && <button className="vocabulary-delete" title={`${word.english} löschen`} onClick={onDelete}><Trash2 size={16} /></button>}
  </article>
}

function getAnswer(word: VocabularyWord, direction: Direction) {
  return direction === 'en-de' ? word.german : word.english
}

function speak(text: string) {
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-GB'
  window.speechSynthesis.speak(utterance)
}
