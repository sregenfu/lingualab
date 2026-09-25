import { BookOpen, Check, ClipboardCheck, Languages, RotateCcw, Shuffle, X } from 'lucide-react'
import { useState } from 'react'
import type { Exercise, Topic } from './data'
import type { VocabularyWord } from './vocabularyData'
import { vocabularySets, type VocabularySet } from './vocabularySets'
import { isAcceptedAnswer } from './answerUtils'
import { createLearningError, createLearningRecord, type LearningError, type LearningRecord } from './learning'

type Level = 'A1' | 'A2' | 'B1' | 'B2'
type Phase = 'setup' | 'test' | 'result'
type TestType = 'grammar' | 'vocabulary'
type Direction = 'en-de' | 'de-en'

type TestQuestion = Exercise & {
  id: string
  topic: string
}

type TestGeneratorProps = {
  topics: Topic[]
  personalWords: VocabularyWord[]
  onRecordResult: (record: LearningRecord) => void
  onAddErrors: (errors: LearningError[]) => void
}

const levels: Level[] = ['A1', 'A2', 'B1', 'B2']
const amounts = [10, 20, 30]

function shuffle<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

function getGrade(percent: number) {
  if (percent >= 92) return { grade: 1, label: 'Sehr gut' }
  if (percent >= 81) return { grade: 2, label: 'Gut' }
  if (percent >= 67) return { grade: 3, label: 'Befriedigend' }
  if (percent >= 50) return { grade: 4, label: 'Ausreichend' }
  if (percent >= 30) return { grade: 5, label: 'Mangelhaft' }
  return { grade: 6, label: 'Ungenügend' }
}

export function TestGenerator({ topics, personalWords, onRecordResult, onAddErrors }: TestGeneratorProps) {
  const [testType, setTestType] = useState<TestType>('grammar')
  const [direction, setDirection] = useState<Direction>('en-de')
  const [level, setLevel] = useState<Level>('A1')
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
  const [amount, setAmount] = useState(10)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<Phase>('setup')

  const personalSet: VocabularySet = { id: 'personal', title: 'Eigene Vokabeln', description: 'Wörter aus der Übersetzungsseite', level: 'A1', words: personalWords }
  const availableVocabularySets = personalWords.length ? [personalSet, ...vocabularySets] : vocabularySets
  const levelTopics = [...new Map(
    topics.filter((topic) => topic.level === level).map((topic) => [topic.name, topic]),
  ).values()]
  const selectableSources = testType === 'grammar'
    ? levelTopics.map((topic) => ({ id: topic.name, title: topic.name, category: topic.category, count: topic.exercises.length }))
    : availableVocabularySets.map((set) => ({ id: set.id, title: set.title, category: set.id === 'personal' ? 'Persönlich' : `Niveau ${set.level}`, count: set.words.length }))
  const selectedSources = selectableSources.filter((source) => selectedTopics.has(source.id))
  const availableQuestions = selectedSources.reduce((total, source) => total + source.count, 0)
  const answered = questions.filter((question) => answers[question.id]?.trim()).length
  const score = questions.filter((question) => isAcceptedAnswer(answers[question.id] ?? '', question.answer)).length
  const percent = questions.length ? Math.round((score / questions.length) * 100) : 0
  const result = getGrade(percent)

  function changeLevel(nextLevel: Level) {
    setLevel(nextLevel)
    setSelectedTopics(new Set())
  }

  function changeTestType(nextType: TestType) {
    setTestType(nextType)
    setSelectedTopics(new Set())
    setQuestions([])
    setAnswers({})
  }

  function toggleTopic(name: string) {
    setSelectedTopics((current) => {
      const next = new Set(current)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function selectAll() {
    setSelectedTopics(new Set(selectableSources.map((source) => source.id)))
  }

  function generateTest() {
    const groups: TestQuestion[][] = testType === 'grammar'
      ? levelTopics.filter((topic) => selectedTopics.has(topic.name)).map((topic) => topic.exercises.map((exercise, index) => ({
        ...exercise, id: `${topic.name}-${index}`, topic: topic.name,
      })))
      : availableVocabularySets.filter((set) => selectedTopics.has(set.id)).map((set) => set.words.map((word) => {
        const prompt = direction === 'en-de' ? word.english : word.german
        const description = direction === 'en-de' ? word.englishDescription : word.germanDescription
        return {
          id: `${set.id}-${word.id}`,
          topic: set.title,
          before: `${prompt} — ${description}: `,
          after: '',
          answer: direction === 'en-de' ? word.german : word.english,
          hint: direction === 'en-de' ? 'Deutsche Übersetzung' : 'English translation',
        }
      }))
    const guaranteed = amount >= groups.length ? groups.flatMap((group) => shuffle(group).slice(0, 1)) : []
    const guaranteedIds = new Set(guaranteed.map((question) => question.id))
    const remaining = shuffle(groups.flat().filter((question) => !guaranteedIds.has(question.id)))
    setQuestions(shuffle([...guaranteed, ...remaining.slice(0, Math.max(0, amount - guaranteed.length))]))
    setAnswers({})
    setPhase('test')
  }

  function resetTest() {
    setQuestions([])
    setAnswers({})
    setPhase('setup')
  }

  function finishTest() {
    onRecordResult(createLearningRecord(testType === 'grammar' ? 'grammar' : 'vocabulary', score, questions.length))
    onAddErrors(questions.filter((question) => !isAcceptedAnswer(answers[question.id] ?? '', question.answer)).map((question) =>
      createLearningError(testType === 'grammar' ? 'grammar' : 'vocabulary', `${question.before}_____ ${question.after}`, question.answer, question.topic),
    ))
    setPhase('result')
  }

  if (phase === 'setup') return <main className="test-generator-page">
    <section className="test-generator-heading">
      <span>PRÜFUNG ERSTELLEN</span><h1>Testgenerator</h1>
      <p>Wähle Testart, Themen und Umfang. Daraus entsteht dein persönlicher gemischter Test.</p>
    </section>

    <section className="test-setup">
      <div className="test-step"><b>01</b><div><h2>Testart</h2><p>Grammatik oder Wortschatz prüfen.</p></div></div>
      <div className="test-type-picker" role="group" aria-label="Testart">
        <button aria-pressed={testType === 'grammar'} className={testType === 'grammar' ? 'active' : ''} onClick={() => changeTestType('grammar')}><BookOpen size={19} /><span><strong>Grammatik</strong><small>Lückensätze nach Niveau</small></span></button>
        <button aria-pressed={testType === 'vocabulary'} className={testType === 'vocabulary' ? 'active' : ''} onClick={() => changeTestType('vocabulary')}><Languages size={19} /><span><strong>Vokabeln</strong><small>Alle Themen und eigene Wörter</small></span></button>
      </div>
    </section>

    {testType === 'grammar' ? <section className="test-setup">
      <div className="test-step"><b>02</b><div><h2>Schwierigkeit</h2><p>Bestimmt die verfügbaren Themen und das Satzniveau.</p></div></div>
      <div className="test-levels" role="group" aria-label="Testschwierigkeit">{levels.map((item) => <button aria-pressed={level === item} className={level === item ? 'active' : ''} key={item} onClick={() => changeLevel(item)}>{item}<small>{item === 'A1' ? 'Grundlagen' : item === 'A2' ? 'Aufbau' : item === 'B1' ? 'Fortgeschritten' : 'Selbstständig'}</small></button>)}</div>
    </section> : <section className="test-setup">
      <div className="test-step"><b>02</b><div><h2>Sprachrichtung</h2><p>Bestimmt Frage und erwartete Übersetzung.</p></div></div>
      <div className="test-direction-picker" role="group" aria-label="Vokabeltest Sprachrichtung">
        <button aria-pressed={direction === 'en-de'} className={direction === 'en-de' ? 'active' : ''} onClick={() => setDirection('en-de')}>Englisch → Deutsch</button>
        <button aria-pressed={direction === 'de-en'} className={direction === 'de-en' ? 'active' : ''} onClick={() => setDirection('de-en')}>Deutsch → Englisch</button>
      </div>
    </section>}

    <section className="test-setup">
      <div className="test-step"><b>03</b><div><h2>Themen auswählen</h2><p>Mehrere Themen ergeben einen abwechslungsreichen Test.</p></div><button className="text-button" onClick={selectAll}><Check size={15} /> Alle wählen</button></div>
      <div className="test-topic-grid">{selectableSources.map((source) => <label key={source.id}>
        <input type="checkbox" checked={selectedTopics.has(source.id)} onChange={() => toggleTopic(source.id)} />
        <span><strong>{source.title}</strong><small>{source.category} · {source.count} Aufgaben</small></span>
      </label>)}</div>
    </section>

    <section className="test-setup">
      <div className="test-step"><b>04</b><div><h2>Testumfang</h2><p>Die Aufgaben werden zufällig aus deiner Auswahl gemischt.</p></div></div>
      <div className="amount-picker" role="group" aria-label="Anzahl der Aufgaben">{amounts.map((item) => <button aria-pressed={amount === item} className={amount === item ? 'active' : ''} disabled={item > availableQuestions && availableQuestions > 0} key={item} onClick={() => setAmount(item)}><strong>{item}</strong><span>Aufgaben</span></button>)}</div>
      <div className="test-start"><span>{selectedSources.length} Themen · {Math.min(amount, availableQuestions)} Aufgaben verfügbar</span><button className="primary" disabled={!selectedSources.length} onClick={generateTest}><Shuffle size={17} /> Test generieren</button></div>
    </section>
  </main>

  return <main className="generated-test-page">
    <section className="generated-test-head">
      <div><span>{testType === 'grammar' ? level : direction === 'en-de' ? 'EN → DE' : 'DE → EN'} · {questions.length} {questions.length === 1 ? 'AUFGABE' : 'AUFGABEN'}</span><h1>{phase === 'result' ? 'Dein Ergebnis' : testType === 'grammar' ? 'Gemischter Grammatiktest' : 'Gemischter Vokabeltest'}</h1><p>{selectedSources.map((source) => source.title).join(' · ')}</p></div>
      {phase === 'result' && <div className="grade-badge"><small>NOTE</small><strong>{result.grade}</strong><span>{result.label}</span></div>}
    </section>

    {phase === 'result' && <section className="test-summary">
      <div><strong>{score}/{questions.length}</strong><span>Richtig</span></div>
      <div><strong>{percent}%</strong><span>Ergebnis</span></div>
      <div><strong>{questions.length - score}</strong><span>Fehler</span></div>
    </section>}

    <section className="generated-questions">{questions.map((question, index) => {
      const correct = isAcceptedAnswer(answers[question.id] ?? '', question.answer)
      return <label className={phase === 'result' ? (correct ? 'correct' : 'wrong') : ''} key={question.id}>
        <span className="question-number">{index + 1}</span>
        <div><small>{question.topic}</small><p>{question.before}<input disabled={phase === 'result'} value={answers[question.id] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))} placeholder={question.hint} />{question.after}</p></div>
        {phase === 'result' && (correct ? <Check size={18} /> : <span className="correct-answer"><X size={15} /> {question.answer}</span>)}
      </label>
    })}</section>

    <div className="generated-test-actions">
      <button className="text-button" onClick={resetTest}><RotateCcw size={16} /> Neue Auswahl</button>
      {phase === 'test' ? <><span>{answered}/{questions.length} beantwortet</span><button className="primary" disabled={answered !== questions.length} onClick={finishTest}><ClipboardCheck size={17} /> Test benoten</button></> : <button className="primary" onClick={generateTest}><Shuffle size={17} /> Neuer Test</button>}
    </div>
  </main>
}
