import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Eraser, Mic, MicOff, Play, RotateCcw, Volume2 } from 'lucide-react'
import type { Topic } from './data'

type SpeechMode = 'read' | 'dictate'
type Level = 'A1' | 'A2' | 'B1' | 'B2'
type RecognitionResult = { 0: { transcript: string }; isFinal: boolean; length: number }
type RecognitionEvent = { results: ArrayLike<RecognitionResult> }
type RecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  lang: string
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type RecognitionConstructor = new () => RecognitionInstance

function getRecognitionConstructor() {
  const speechWindow = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
}

function words(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9']+/g, ' ').split(/\s+/).filter(Boolean)
}

function getCompleteText(topic: Topic) {
  return topic.exercises.map(({ before, answer, after }) => {
    const sentence = `${before}${answer}${after}`
      .replace(/\s+/g, ' ')
      .replace(/\s+([?.!,])/g, '$1')
      .trim()
    return sentence.replace(/^([a-z])/, (_, firstLetter: string) => firstLetter.toUpperCase())
  }).join('\n')
}

function formatRecognizedText(transcript: string) {
  const text = transcript.replace(/\s+/g, ' ').trim()
  return text.replace(/^([a-z])/, (_, firstLetter: string) => firstLetter.toUpperCase())
}

function addReferencePunctuation(transcript: string, referenceText: string) {
  const formatted = formatRecognizedText(transcript)
  const punctuation = referenceText.match(/[?.!]\s*$/)?.[0].trim() ?? ''
  return punctuation && formatted && !/[?.!]$/.test(formatted) ? `${formatted}${punctuation}` : formatted
}

  function countInOrderMatches(targetWords: string[], spokenWords: string[]) {
    const table = Array.from({ length: targetWords.length + 1 }, () => Array(spokenWords.length + 1).fill(0))
    for (let targetIndex = 1; targetIndex <= targetWords.length; targetIndex += 1) {
      for (let spokenIndex = 1; spokenIndex <= spokenWords.length; spokenIndex += 1) {
        table[targetIndex][spokenIndex] = targetWords[targetIndex - 1] === spokenWords[spokenIndex - 1]
          ? table[targetIndex - 1][spokenIndex - 1] + 1
          : Math.max(table[targetIndex - 1][spokenIndex], table[targetIndex][spokenIndex - 1])
      }
    }
    return table[targetWords.length][spokenWords.length]
  }

export function SpeechPractice({ topics }: { topics: Topic[] }) {
  const [mode, setMode] = useState<SpeechMode>('read')
  const [level, setLevel] = useState<Level>('A1')
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const levelTopics = topics.filter((topic) => topic.level === level)
  const [selectedTopicName, setSelectedTopicName] = useState(levelTopics[0]?.name ?? '')
  const selectedTopic = levelTopics.find((topic) => topic.name === selectedTopicName) ?? levelTopics[0]
  const [targetText, setTargetText] = useState(selectedTopic ? getCompleteText(selectedTopic) : '')
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState('')
  const recognitionRef = useRef<RecognitionInstance | null>(null)

  const targetSentences = useMemo(() => targetText.split('\n').map((line) => line.trim()).filter(Boolean), [targetText])
  const sentencePractice = mode === 'read' && targetSentences.length > 0
  const currentSentence = targetSentences[Math.min(sentenceIndex, Math.max(targetSentences.length - 1, 0))] ?? ''
  const comparisonText = sentencePractice ? currentSentence : targetText
  const targetWords = useMemo(() => words(comparisonText), [comparisonText])
  const spokenWords = useMemo(() => words(transcript), [transcript])
    const matchingWordCount = useMemo(() => countInOrderMatches(targetWords, spokenWords), [spokenWords, targetWords])
    const accuracy = targetWords.length ? Math.round((matchingWordCount / targetWords.length) * 100) : 0
  const formattedTranscript = useMemo(() => sentencePractice ? addReferencePunctuation(transcript, currentSentence) : formatRecognizedText(transcript), [currentSentence, sentencePractice, transcript])

  useEffect(() => () => recognitionRef.current?.stop(), [])

  function speakText() {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(sentencePractice ? currentSentence : targetText)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }

  function startListening() {
    const Recognition = getRecognitionConstructor()
    if (!Recognition) {
      setSpeechError('Dein Browser unterstützt keine Spracheingabe. Nutze Chrome oder Edge mit Mikrofonfreigabe.')
      return
    }
    const recognition = new Recognition()
    recognition.lang = 'en-US'
    recognition.continuous = !sentencePractice
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event) => {
      const text = Array.from(event.results).map((result) => result[0].transcript).join(' ')
      setTranscript(text.trim())
    }
    recognition.onerror = () => {
      setSpeechError('Die Spracheingabe konnte nicht gestartet werden. Prüfe die Mikrofonfreigabe.')
      setIsListening(false)
    }
    recognition.onend = () => setIsListening(false)
    recognitionRef.current = recognition
    setSpeechError('')
    setTranscript('')
    setIsListening(true)
    recognition.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  function selectTopic(nextTopicName: string) {
    const nextTopic = levelTopics.find((topic) => topic.name === nextTopicName)
    setSelectedTopicName(nextTopicName)
    if (nextTopic) setTargetText(getCompleteText(nextTopic))
    setTranscript('')
    setSentenceIndex(0)
  }

  function selectLevel(nextLevel: Level) {
    const nextTopic = topics.find((topic) => topic.level === nextLevel)
    setLevel(nextLevel)
    setSelectedTopicName(nextTopic?.name ?? '')
    if (mode === 'read') setTargetText(nextTopic ? getCompleteText(nextTopic) : '')
    setTranscript('')
    setSentenceIndex(0)
  }

  function switchMode(nextMode: SpeechMode) {
    setMode(nextMode)
    setTranscript('')
    setSentenceIndex(0)
    if (nextMode === 'dictate') setTargetText('')
    if (nextMode === 'read' && !targetText.trim() && selectedTopic) setTargetText(getCompleteText(selectedTopic))
  }

  return <main className="speech-page">
    <section className="speech-heading">
      <div><span>SPRECHEN & DIKTIEREN</span><h1>Sprich Englisch. Sieh, was ankommt.</h1><p>Lies einen Text vor oder diktiere frei. Die Browser-Erkennung zeigt dir sofort, welche Wörter angekommen sind.</p></div>
      <div className="speech-mode-tabs" role="tablist" aria-label="Übungsmodus">
        <button className={mode === 'read' ? 'active' : ''} onClick={() => switchMode('read')}><Volume2 size={17} /> Vorlesen</button>
        <button className={mode === 'dictate' ? 'active' : ''} onClick={() => switchMode('dictate')}><Mic size={17} /> Diktieren</button>
      </div>
    </section>

    <section className="speech-workspace">
      <div className="speech-controls">
        <div className="speech-control-head"><span>{mode === 'read' ? '1. Thema und Text auswählen' : '1. Deinen Text eingeben'}</span><strong>{mode === 'read' ? 'ENGLISCH' : 'OPTIONAL'}</strong></div>
        {mode === 'read' ? <><div className="speech-levels" role="tablist" aria-label="Niveau auswählen">{(['A1', 'A2', 'B1', 'B2'] as Level[]).map((item) => <button key={item} className={level === item ? 'active' : ''} onClick={() => selectLevel(item)}>{item}</button>)}</div><select className="speech-topic-select" value={selectedTopicName} onChange={(event) => selectTopic(event.target.value)} aria-label="Thema auswählen">{levelTopics.map((topic) => <option key={topic.name} value={topic.name}>{topic.name} · {topic.exercises.length} Sätze</option>)}</select><p className="speech-hint">Alle {selectedTopic?.exercises.length ?? 0} vollständigen Sätze aus dem Lückentext werden nacheinander vorgelesen.</p></> : <p className="speech-hint">Füge einen englischen Text ein, den du üben möchtest. So kann die Erkennung deine Wörter vergleichen.</p>}
        <textarea value={targetText} onChange={(event) => setTargetText(event.target.value)} aria-label="Übungstext" placeholder="Englischen Übungstext eingeben ..." />
        <div className="speech-actions"><button className="secondary" onClick={speakText}><Play size={17} /> Vorlesen lassen</button><button className={isListening ? 'recording' : 'primary'} onClick={isListening ? stopListening : startListening}>{isListening ? <MicOff size={17} /> : <Mic size={17} />}{isListening ? 'Aufnahme stoppen' : mode === 'read' ? 'Jetzt vorlesen' : 'Diktat starten'}</button></div>
        {speechError && <p className="speech-error">{speechError}</p>}
      </div>

      <div className="speech-result">
        <div className="speech-control-head"><span>2. Deine erkannte Sprache</span><strong>{isListening ? 'HÖRT ZU ...' : sentencePractice ? `SATZ ${sentenceIndex + 1} / ${targetSentences.length}` : 'ERGEBNIS'}</strong></div>
        <div className="transcript-box" aria-live="polite">{transcript ? formattedTranscript : <span className="transcript-placeholder">{isListening ? 'Sprich jetzt deutlich ...' : 'Dein gesprochener Text erscheint hier.'}</span>}</div>
        {transcript && <div className="speech-feedback">{targetWords.length ? <><div className="speech-score"><strong>{accuracy}%</strong><span>Worttreffer</span></div><div><h3>{accuracy >= 80 ? 'Sehr gut angekommen.' : 'Das kannst du verbessern.'}</h3><p>{accuracy >= 80 ? 'Deine Aussprache wurde größtenteils richtig erkannt. Wiederhole den Text noch einmal etwas flüssiger.' : 'Sprich langsamer und betone jedes Wort. Wörter, die nicht an der erwarteten Stelle erkannt wurden, sind wahrscheinlich noch unklar.'}</p></div></> : <div><h3>Dein Diktat wurde erkannt.</h3><p>Der Text steht oben. Für eine Aussprachebewertung kannst du links zusätzlich einen Referenztext eingeben.</p></div>}</div>}
        <div className="speech-result-actions"><button className="text-button" onClick={() => setTranscript('')}><Eraser size={16} /> Löschen</button>{transcript && <button className="text-button" onClick={startListening}><RotateCcw size={16} /> Noch einmal</button>}{sentencePractice && sentenceIndex < targetSentences.length - 1 && <button className="primary" onClick={() => { setSentenceIndex((index) => index + 1); setTranscript('') }}>Nächster Satz</button>}</div>
      </div>
    </section>
    <section className="speech-note"><Check size={18} /><p><strong>Wichtig:</strong> Die Ausgabe zeigt nur Wörter und Satzzeichen, die der Browser tatsächlich erkannt hat. Punkte werden nicht künstlich ergänzt. Die Browser-Erkennung bewertet, was sie versteht, und ersetzt kein phonetisches Aussprachegutachten.</p></section>
  </main>
}