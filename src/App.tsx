import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import {
  ArrowLeft, BookOpen, CalendarDays, Check, ChevronRight, ClipboardCheck, Clock3, FileText,
  CircleHelp, Home, Languages, Maximize2, MessageCircle, Mic2, Palette, PencilLine, Plus, ScanText, Search, Sparkles, SquareStack, Trash2, X,
} from 'lucide-react'
import { getPaletteIndexFromLegacyIndex, palettes, topics, type Topic } from './data'
import { catalogTopics } from './catalog'
import { TopicForm } from './TopicForm'
import { Vocabulary, type VocabularyMode } from './Vocabulary'
import { Translator } from './Translator'
import { TestGenerator } from './TestGenerator'
import type { LearningError, LearningRecord } from './learning'
import { Help } from './Help'
import { MistakePractice } from './MistakePractice'
import type { VocabularyWord } from './vocabularyData'
import { vocabularySets } from './vocabularySets'
import { isAcceptedAnswer } from './answerUtils'
import { correctGermanVocabulary } from './translation'
import { SpeechPractice } from './SpeechPractice'
import { DialogPractice } from './DialogPractice'
import './App.css'

type View = 'home' | 'create' | 'lesson' | 'saved' | 'vocabulary' | 'translator' | 'test-generator' | 'mistakes' | 'help' | 'speech' | 'dialogs'
type Level = 'A1' | 'A2' | 'B1' | 'B2'
type TopicArea = 'grammar' | 'communication' | 'language'
type CardTheme = 'silver' | 'dark'
type TopicPresentation = 'page' | 'window'

type SavedLesson = {
  id: number
  topic: string
  date: string
  answers: string[]
  score: number | null
}
type StudyPlanEntry = { date: string; topicName: string }

const topicAreas: { id: TopicArea; label: string; description: string }[] = [
  { id: 'grammar', label: 'Grammatik', description: 'Zeitformen, Satzbau und sichere Grundlagen' },
  { id: 'communication', label: 'Alltag & Kommunikation', description: 'Natürlich sprechen, reagieren und schreiben' },
  { id: 'language', label: 'Wortschatz & Aussprache', description: 'Wortfallen erkennen und verständlich sprechen' },
]
const levels: Level[] = ['A1', 'A2', 'B1', 'B2']
type TextColorKey = 'body' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type TextColors = Record<TextColorKey, string>

const textColorKeys: { key: TextColorKey; label: string }[] = [
  { key: 'body', label: 'Normaler Text' },
  { key: 'h1', label: 'H1' },
  { key: 'h2', label: 'H2' },
  { key: 'h3', label: 'H3' },
  { key: 'h4', label: 'H4' },
  { key: 'h5', label: 'H5' },
  { key: 'h6', label: 'H6' },
]

const defaultTextColors: TextColors = {
  body: 'auto', h1: 'auto', h2: 'auto', h3: 'auto', h4: 'auto', h5: 'auto', h6: 'auto',
}

function getTopicArea(category: string): TopicArea {
  if (category === 'Kommunikation' || category === 'Natürliche Kommunikation') return 'communication'
  if (category === 'Wortschatz' || category === 'Aussprache') return 'language'
  return 'grammar'
}

function isLightColor(color: string) {
  const hex = color.slice(1)
  const red = Number.parseInt(hex.slice(0, 2), 16)
  const green = Number.parseInt(hex.slice(2, 4), 16)
  const blue = Number.parseInt(hex.slice(4, 6), 16)
  return red * 0.299 + green * 0.587 + blue * 0.114 > 155
}

function getDateKey(offset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

function getLearningStreak() {
  let streak = 0
  while (localStorage.getItem(`lingua-daily-${getDateKey(-streak)}`) === 'done') streak += 1
  return streak
}

function createStudyPlan(): StudyPlanEntry[] {
  const a1Topics = [...topics, ...catalogTopics].filter((topic, index, list) => topic.level === 'A1' && list.findIndex((item) => item.name === topic.name) === index)
  return Array.from({ length: 14 }, (_, index) => ({ date: getDateKey(index), topicName: a1Topics[index % a1Topics.length]?.name ?? topics[0].name }))
}

function isPlanDateComplete(date: string) {
  return localStorage.getItem(`lingua-daily-${date}`) === 'done'
}

function normalizeStudyPlan(plan: StudyPlanEntry[]) {
  const today = getDateKey()
  const overdue = plan.filter((entry) => entry.date < today && !isPlanDateComplete(entry.date))
  if (!overdue.length) return plan
  const overdueNames = new Set(overdue.map((entry) => entry.topicName))
  const future = plan.filter((entry) => entry.date >= today && !overdueNames.has(entry.topicName))
  return [...overdue.map((entry) => ({ ...entry, date: today })), ...future]
    .sort((first, second) => first.date.localeCompare(second.date))
    .slice(0, 14)
}

function addDaysToDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function App() {
  const [view, setView] = useState<View>('home')
  const [query, setQuery] = useState('')
  const [quickLevel, setQuickLevel] = useState<Level>('A1')
  const [topicArea, setTopicArea] = useState<TopicArea>('grammar')
  const [topic, setTopic] = useState<Topic>(topics[0])
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(''))
  const [evaluated, setEvaluated] = useState(false)
  const [palette, setPalette] = useState(() => {
    const savedPalette = Number(localStorage.getItem('lingua-palette') ?? 7)
    return localStorage.getItem('lingua-palette-order') === 'hue-v1' ? savedPalette : getPaletteIndexFromLegacyIndex(savedPalette)
  })
  const [backgroundTone, setBackgroundTone] = useState<'paper' | 'gradient' | '0' | '1' | '2'>(() => {
    const saved = localStorage.getItem('lingua-background-tone')
    return saved === 'gradient' || saved === '0' || saved === '1' || saved === '2' ? saved : 'paper'
  })
  const [textColors, setTextColors] = useState<TextColors>(() => ({
    ...defaultTextColors,
    ...JSON.parse(localStorage.getItem('lingua-text-colors') ?? '{}'),
  }))
  const [showPalettes, setShowPalettes] = useState(false)
  const [saved, setSaved] = useState<SavedLesson[]>(() => JSON.parse(localStorage.getItem('lingua-lessons') ?? '[]'))
  const [customTopics, setCustomTopics] = useState<Topic[]>(() => JSON.parse(localStorage.getItem('lingua-topics') ?? '[]'))
  const [personalWords, setPersonalWords] = useState<VocabularyWord[]>(() => (JSON.parse(localStorage.getItem('lingua-personal-vocabulary') ?? '[]') as VocabularyWord[]).map((word) => ({ ...word, german: correctGermanVocabulary(word.german) })))
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>(() => JSON.parse(localStorage.getItem('lingua-learning-records') ?? '[]'))
  const [learningErrors, setLearningErrors] = useState<LearningError[]>(() => JSON.parse(localStorage.getItem('lingua-learning-errors') ?? '[]'))
  const [vocabularyMode, setVocabularyMode] = useState<VocabularyMode>('notebook')
  const [cardTheme, setCardTheme] = useState<CardTheme>(() => localStorage.getItem('lingua-card-theme') === 'silver' ? 'silver' : 'dark')
  const [topicPresentation, setTopicPresentation] = useState<TopicPresentation>(() => localStorage.getItem('lingua-topic-presentation') === 'window' ? 'window' : 'page')
  const [previewTopic, setPreviewTopic] = useState<Topic | null>(null)
  const [dailyCompleted, setDailyCompleted] = useState(() => localStorage.getItem(`lingua-daily-${getDateKey()}`) === 'done')
  const [learningStreak, setLearningStreak] = useState(getLearningStreak)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(getDateKey())
  const [clockNow, setClockNow] = useState(() => new Date())
  const [studyPlan] = useState<StudyPlanEntry[]>(() => {
    const stored = JSON.parse(localStorage.getItem('lingua-study-plan') ?? 'null') as StudyPlanEntry[] | null
    return normalizeStudyPlan(stored?.length ? stored : createStudyPlan())
  })

  useEffect(() => {
    localStorage.setItem('lingua-palette', String(palette))
    localStorage.setItem('lingua-palette-order', 'hue-v1')
    document.documentElement.style.setProperty('--accent', palettes[palette][0])
    document.documentElement.style.setProperty('--accent-2', palettes[palette][1])
    document.documentElement.style.setProperty('--accent-3', palettes[palette][2])
    document.documentElement.style.setProperty('--on-accent', isLightColor(palettes[palette][0]) ? 'var(--ink)' : '#ffffff')
    document.documentElement.style.setProperty('--on-accent-3', isLightColor(palettes[palette][2]) ? 'var(--ink)' : '#ffffff')
    document.documentElement.style.setProperty('--theme-strong', palettes[palette][0])
    document.documentElement.style.setProperty('--on-theme-strong', isLightColor(palettes[palette][0]) ? 'var(--ink)' : '#ffffff')
  }, [palette])

  const backgroundColor = backgroundTone === 'paper' ? '#fbfcfa' : palettes[palette][Number(backgroundTone)]
  const backgroundGradient = `linear-gradient(135deg, ${palettes[palette][0]} 0%, ${palettes[palette][1]} 52%, ${palettes[palette][2]} 100%)`
  const hasDarkBackground = backgroundTone !== 'paper' && backgroundTone !== 'gradient' && !isLightColor(backgroundColor)

  useEffect(() => {
    const automaticColor = hasDarkBackground ? '#ffffff' : '#1e2930'
    textColorKeys.forEach(({ key }) => {
      document.documentElement.style.setProperty(`--text-${key}`, textColors[key] === 'auto' ? automaticColor : textColors[key])
    })
    localStorage.setItem('lingua-text-colors', JSON.stringify(textColors))
  }, [hasDarkBackground, textColors])

  useEffect(() => {
    localStorage.setItem('lingua-background-tone', backgroundTone)
    document.documentElement.style.setProperty('--paper', backgroundTone === 'gradient' ? '#fbfcfa' : backgroundColor)
    document.documentElement.style.setProperty('--paper-gradient', backgroundTone === 'gradient' ? backgroundGradient : 'none')
  }, [backgroundColor, backgroundGradient, backgroundTone])

  useEffect(() => localStorage.setItem('lingua-lessons', JSON.stringify(saved)), [saved])
  useEffect(() => localStorage.setItem('lingua-topics', JSON.stringify(customTopics)), [customTopics])
  useEffect(() => localStorage.setItem('lingua-personal-vocabulary', JSON.stringify(personalWords)), [personalWords])
  useEffect(() => localStorage.setItem('lingua-learning-records', JSON.stringify(learningRecords)), [learningRecords])
  useEffect(() => localStorage.setItem('lingua-learning-errors', JSON.stringify(learningErrors)), [learningErrors])
  useEffect(() => localStorage.setItem('lingua-card-theme', cardTheme), [cardTheme])
  useEffect(() => localStorage.setItem('lingua-topic-presentation', topicPresentation), [topicPresentation])
  
  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const allTopics = [...topics, ...catalogTopics, ...customTopics]
  const completedTopicNames = useMemo(() => new Set([
    ...learningRecords.filter((record) => record.score > 0 && record.topicName).map((record) => record.topicName as string),
    ...saved.map((lesson) => lesson.topic),
  ]), [learningRecords, saved])
  const visibleStudyPlan = useMemo(() => {
    const currentPlan = [...studyPlan]
    const planComplete = currentPlan.length > 0 && currentPlan.every((entry) => completedTopicNames.has(entry.topicName) || isPlanDateComplete(entry.date))
    if (!planComplete) return currentPlan
    const plannedNames = new Set(currentPlan.map((entry) => entry.topicName))
    const nextTopics = [...topics, ...catalogTopics]
      .filter((topic, index, list) => ['A1', 'A2'].includes(topic.level) && !completedTopicNames.has(topic.name) && !plannedNames.has(topic.name) && list.findIndex((item) => item.name === topic.name) === index)
      .slice(0, 14)
    if (!nextTopics.length) return currentPlan
    const lastDate = currentPlan[currentPlan.length - 1].date
    return [...currentPlan, ...nextTopics.map((topic, index) => ({ date: addDaysToDateKey(lastDate, index + 1), topicName: topic.name }))]
  }, [completedTopicNames, studyPlan])
  useEffect(() => localStorage.setItem('lingua-study-plan', JSON.stringify(visibleStudyPlan)), [visibleStudyPlan])
  const todayPlan = visibleStudyPlan.find((entry) => entry.date >= getDateKey() && !completedTopicNames.has(entry.topicName) && !isPlanDateComplete(entry.date)) ?? visibleStudyPlan.find((entry) => entry.date === getDateKey()) ?? visibleStudyPlan[0]
  const dailyTopic = allTopics.find(({ name }) => name === todayPlan?.topicName) ?? topics[0]
  const dailyTopicCompleted = dailyCompleted || completedTopicNames.has(dailyTopic.name)
  const planTopics = visibleStudyPlan.map((entry) => ({ ...entry, topic: allTopics.find(({ name }) => name === entry.topicName) ?? topics[0], completed: isPlanDateComplete(entry.date) || completedTopicNames.has(entry.topicName) }))
  const quickTopics = [...topics, ...catalogTopics].filter(({ level, category }) => level === quickLevel && getTopicArea(category) === topicArea)
  const selectedTopicArea = topicAreas.find(({ id }) => id === topicArea) ?? topicAreas[0]
  const filteredTopics = allTopics.filter(({ name, category }) =>
    `${name} ${category}`.toLowerCase().includes(query.toLowerCase()),
  )
  const score = topic.exercises.filter((item, index) =>
    isAcceptedAnswer(answers[index], item.answer),
  ).length
  const completedQuestions = learningRecords.reduce((total, record) => total + record.total, 0)
  const correctQuestions = learningRecords.reduce((total, record) => total + record.score, 0)
  const accuracy = completedQuestions ? Math.round((correctQuestions / completedQuestions) * 100) : 0
  const errorInsights = [...new Set(learningErrors.map((error) => error.context))].slice(0, 3)
  const experiencePoints = correctQuestions * 10 + learningRecords.length * 25 + learningStreak * 15
  const badges = [
    { label: 'Erster Schritt', unlocked: learningRecords.length > 0 },
    { label: '100 Aufgaben', unlocked: completedQuestions >= 100 },
    { label: '7-Tage-Serie', unlocked: learningStreak >= 7 },
  ]

  function startLesson(selected: Topic) {
    setTopic(selected)
    setAnswers(Array(10).fill(''))
    setEvaluated(false)
    setQuery('')
    setView('lesson')
  }

  function openTopic(selected: Topic) {
    if (topicPresentation === 'window') {
      setPreviewTopic(selected)
      return
    }
    startLesson(selected)
  }

  function renderTopicActions(selected: Topic) {
    return <div className="topic-card-actions" aria-label={`${selected.name} öffnen`}>
      <button type="button" title="Als Fenster öffnen" aria-label={`${selected.name} als Fenster öffnen`} onClick={(event) => { event.stopPropagation(); setPreviewTopic(selected) }}><SquareStack size={14} /></button>
      <button type="button" title="Als ganze Seite öffnen" aria-label={`${selected.name} als ganze Seite öffnen`} onClick={(event) => { event.stopPropagation(); startLesson(selected) }}><Maximize2 size={14} /></button>
    </div>
  }

  function topicCardProps(selected: Topic) {
    return {
      role: 'button' as const,
      tabIndex: 0,
      onClick: () => openTopic(selected),
      onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openTopic(selected)
        }
      },
    }
  }

  function saveLesson() {
    const date = new Intl.DateTimeFormat('de-DE').format(new Date())
    setSaved((current) => [{
      id: Date.now(), topic: topic.name, date, answers, score: evaluated ? score : null,
    }, ...current])
    setView('saved')
  }

  function updateAnswer(index: number, value: string) {
    setAnswers((current) => current.map((answer, currentIndex) => currentIndex === index ? value : answer))
    setEvaluated(false)
  }

  function saveCustomTopic(createdTopic: Topic) {
    setCustomTopics((current) => [
      ...current.filter(({ name }) => name.toLowerCase() !== createdTopic.name.toLowerCase()),
      createdTopic,
    ])
    startLesson(createdTopic)
  }

  function addPersonalWords(words: VocabularyWord[]) {
    const existingEnglish = new Set(
      [...vocabularySets.flatMap((set) => set.words), ...personalWords]
        .map((word) => word.english.trim().toLowerCase()),
    )
    const uniqueWords = words.filter((word) => {
      const key = word.english.trim().toLowerCase()
      if (existingEnglish.has(key)) return false
      existingEnglish.add(key)
      return true
    })
    if (uniqueWords.length) setPersonalWords((current) => [...current, ...uniqueWords])
    return uniqueWords.length
  }

  function recordLearning(record: LearningRecord) {
    setLearningRecords((current) => [record, ...current].slice(0, 50))
  }

  function addLearningErrors(errors: LearningError[]) {
    if (!errors.length) return
    setLearningErrors((current) => [
      ...errors.filter((error) => !current.some((existing) => existing.kind === error.kind && existing.prompt === error.prompt && existing.solution === error.solution)),
      ...current,
    ].slice(0, 50))
  }

  function openVocabulary(mode: VocabularyMode) {
    setVocabularyMode(mode)
    setView('vocabulary')
  }

  function selectTopicArea(nextArea: TopicArea) {
    setTopicArea(nextArea)
    const hasCurrentLevel = [...topics, ...catalogTopics].some(({ level, category }) => level === quickLevel && getTopicArea(category) === nextArea)
    if (!hasCurrentLevel) {
      const firstAvailableLevel = levels.find((level) => [...topics, ...catalogTopics].some((topic) => topic.level === level && getTopicArea(topic.category) === nextArea))
      if (firstAvailableLevel) setQuickLevel(firstAvailableLevel)
    }
  }

  function evaluateLesson() {
    if (!evaluated) {
      recordLearning({ id: `lesson-${Date.now()}`, kind: 'grammar', score, total: topic.exercises.length, topicName: topic.name, createdAt: Date.now() })
      addLearningErrors(topic.exercises.filter((item, index) => !isAcceptedAnswer(answers[index], item.answer)).map((item) => ({
        id: `lesson-error-${Date.now()}-${item.answer}`, kind: 'grammar' as const, prompt: `${item.before} _____ ${item.after}`, solution: item.answer, context: topic.name, hint: item.hint, createdAt: Date.now(),
      })))
    }
    if (topic.name === dailyTopic.name) {
      setDailyCompleted(true)
      localStorage.setItem(`lingua-daily-${getDateKey()}`, 'done')
      setLearningStreak(getLearningStreak())
    }
    setEvaluated(true)
  }

  const calendarToday = new Date()
  const calendarMonthStart = new Date(calendarToday.getFullYear(), calendarToday.getMonth(), 1)
  const calendarFirstWeekday = (calendarMonthStart.getDay() + 6) % 7
  const calendarDaysInMonth = new Date(calendarToday.getFullYear(), calendarToday.getMonth() + 1, 0).getDate()
  const calendarMonthName = new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(calendarToday)
  const clockHours = clockNow.getHours() % 12
  const clockMinutes = clockNow.getMinutes()
  const clockTimeLabel = clockNow.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const selectedPlan = planTopics.find((entry) => entry.date === selectedCalendarDate)
  const selectedCalendarCompleted = localStorage.getItem(`lingua-daily-${selectedCalendarDate}`) === 'done' || Boolean(selectedPlan?.completed)

  return (
    <div className={`app-shell ${hasDarkBackground ? 'dark-background' : ''}`}>
      <aside className="global-study-tools" aria-label="Lernwerkzeuge">
        <section className="global-calendar">
          <div className="global-tool-title"><CalendarDays size={15} /><span>{calendarMonthName}</span><small>{calendarToday.getFullYear()}</small></div>
          <div className="global-calendar-weekdays">{['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => <span key={day}>{day}</span>)}</div>
          <div className="global-calendar-days">{Array.from({ length: calendarFirstWeekday + calendarDaysInMonth }, (_, index) => index < calendarFirstWeekday ? <i key={`empty-${index}`} /> : (() => { const day = index - calendarFirstWeekday + 1; const dateKey = getDateKey(day - calendarToday.getDate()); const planEntry = planTopics.find((entry) => entry.date === dateKey); const completed = planEntry?.completed ?? isPlanDateComplete(dateKey); return <button className={`${selectedCalendarDate === dateKey ? 'selected' : ''} ${completed ? 'completed' : 'open'}`} key={dateKey} title={planEntry?.topic.name ?? 'Kein Plan'} onClick={() => setSelectedCalendarDate(dateKey)} aria-label={`${day}. ${calendarMonthName}: ${completed ? 'erledigt' : 'offen'}${planEntry ? `, ${planEntry.topic.name}` : ''}`}><span>{day}</span><b>{completed ? '✓' : '·'}</b></button> })())}</div>
          <div className="calendar-legend"><span><b className="legend-done">✓</b> erledigt</span><span><b className="legend-open">·</b> offen</span></div>
          <small className="calendar-selected-date">{selectedCalendarDate} · {selectedCalendarCompleted ? 'Übung erledigt' : 'Übung offen'}{selectedPlan ? ` · ${selectedPlan.topic.name}` : ''}</small>
        </section>
        <button className="global-dialog-clock" onClick={() => setView('dialogs')} title="Mini-Dialoge öffnen">
          <span className="global-tool-title"><Clock3 size={15} /> Dialog-Uhr</span>
          <span className="global-clock-face"><i style={{ transform: `rotate(${clockHours * 30 + clockMinutes / 2}deg)` }} /><b style={{ transform: `rotate(${clockMinutes * 6}deg)` }} /><em>12</em><em>3</em><em>6</em><em>9</em></span>
          <strong>{clockTimeLabel}</strong><small>2 Min. Dialog · Jetzt üben</small>
        </button>
      </aside>
      <header className="topbar">
        <button className="brand" onClick={() => setView('home')} aria-label="Startseite">
          <span className="brand-mark"><BookOpen size={23} /></span>
          <span>Lingua<span>Lab</span></span>
        </button>
        <nav aria-label="Hauptnavigation">
          <button aria-label="Lernen" className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>
            <Home size={18} /> <span>Lernen</span>
          </button>
          <button aria-label="Vokabeln" className={view === 'vocabulary' ? 'active' : ''} onClick={() => openVocabulary('notebook')}>
            <Languages size={18} /> <span>Vokabeln</span>
          </button>
          <button aria-label="Übersetzen" className={view === 'translator' ? 'active' : ''} onClick={() => setView('translator')}>
            <ScanText size={18} /> <span className="desktop-nav-label">Übersetzen</span><span className="mobile-nav-label">Übersetz.</span>
          </button>
          <button aria-label="Testgenerator" className={view === 'test-generator' ? 'active' : ''} onClick={() => setView('test-generator')}>
            <ClipboardCheck size={18} /> <span className="desktop-nav-label">Test</span><span className="mobile-nav-label">Test</span>
          </button>
          <button aria-label="Sprechen und Diktieren" className={view === 'speech' ? 'active' : ''} onClick={() => setView('speech')}>
            <Mic2 size={18} /> <span>Sprechen</span>
          </button>
          <button aria-label="Mini-Dialoge" className={view === 'dialogs' ? 'active' : ''} onClick={() => setView('dialogs')}>
            <MessageCircle size={18} /> <span>Dialoge</span>
          </button>
          <button aria-label={`Gespeichert ${saved.length}`} className={view === 'saved' ? 'active' : ''} onClick={() => setView('saved')}>
            <FileText size={18} /> <span className="desktop-nav-label">Gespeichert</span><span className="mobile-nav-label">Ablage</span> <span className="count">{saved.length}</span>
          </button>
          <button aria-label="Hilfe" className={view === 'help' ? 'active' : ''} onClick={() => setView('help')}>
            <CircleHelp size={18} /> <span>Hilfe</span>
          </button>
        </nav>
        <div className="palette-wrap">
          <button className="icon-button" title="Farbpalette wählen" onClick={() => setShowPalettes(!showPalettes)}>
            <Palette size={20} />
          </button>
          {showPalettes && <div className="palette-panel">
            <div className="palette-title"><strong>Farbpalette</strong><button onClick={() => setShowPalettes(false)} aria-label="Schließen"><X size={17} /></button></div>
            <div className="background-picker"><strong>Hintergrund dieser Palette</strong><div className="background-grid"><button className={backgroundTone === 'paper' ? 'selected' : ''} onClick={() => setBackgroundTone('paper')} title="Standardhintergrund"><span>Standard</span>{backgroundTone === 'paper' && <Check size={14} />}</button><button className={`gradient-swatch ${backgroundTone === 'gradient' ? 'selected' : ''}`} onClick={() => setBackgroundTone('gradient')} title="Farbverlauf aus dieser Palette" style={{ background: backgroundGradient }}><span>Verlauf</span>{backgroundTone === 'gradient' && <Check size={14} />}</button>{palettes[palette].map((color, index) => <button key={color} className={backgroundTone === String(index) ? 'selected' : ''} onClick={() => setBackgroundTone(String(index) as '0' | '1' | '2')} title={`Farbe ${index + 1} als Hintergrund`} style={{ background: color }}>{backgroundTone === String(index) && <Check className={isLightColor(color) ? 'on-light-color' : 'on-dark-color'} size={14} />}</button>)}</div></div>
            <div className="text-color-picker">
              <strong>Schriftfarben nach Größe</strong>
              <div className="text-color-list">
                {textColorKeys.map(({ key, label }) => <div className="text-color-row" key={key}>
                  <span>{label}</span>
                  <div className="text-color-actions">
                    <button className={textColors[key] === 'auto' ? 'selected' : ''} onClick={() => setTextColors((current) => ({ ...current, [key]: 'auto' }))} title="Automatische Kontrastfarbe">Auto</button>
                    <button className={`color-swatch dark ${textColors[key] === '#1e2930' ? 'selected' : ''}`} onClick={() => setTextColors((current) => ({ ...current, [key]: '#1e2930' }))} title="Dunkle Schriftfarbe" aria-label={`${label}: dunkle Schriftfarbe`} />
                    <button className={`color-swatch light ${textColors[key] === '#ffffff' ? 'selected' : ''}`} onClick={() => setTextColors((current) => ({ ...current, [key]: '#ffffff' }))} title="Helle Schriftfarbe" aria-label={`${label}: helle Schriftfarbe`} />
                    <input type="color" value={textColors[key] === 'auto' ? (hasDarkBackground ? '#ffffff' : '#1e2930') : textColors[key]} onChange={(event) => setTextColors((current) => ({ ...current, [key]: event.target.value }))} title={`${label} auswählen`} aria-label={`${label} auswählen`} />
                  </div>
                </div>)}
              </div>
            </div>
            <div className="palette-grid">{palettes.map((colors, index) => (
              <button key={colors.join()} className={palette === index ? 'selected' : ''} onClick={() => setPalette(index)} title={`Palette ${index + 1}`}>
                {colors.map((color) => <i key={color} style={{ background: color }} />)}
                {palette === index && <Check className={isLightColor(colors[2]) ? 'on-light-color' : 'on-dark-color'} size={14} />}
              </button>
            ))}</div>
          </div>}
        </div>
      </header>

      {view === 'home' && <main className={`home-page home-tone-${backgroundTone}`}>
        <section className="intro">
          <div className="eyebrow"><Sparkles size={15} /> DEIN ENGLISCH-TRAINER</div>
          <h1>Was möchtest du<br /><em>heute lernen?</em></h1>
          <p>Wähle einen Lernbereich und erhalte eine kompakte Erklärung mit einer passenden Übung.</p>
          <div className="search-box">
            <Search size={21} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Thema suchen, z. B. Simple Present" />
            <span>ENTER</span>
          </div>
          {!query && <button className="catalog-open" onClick={() => setView('create')}><BookOpen size={16} /> Themenkatalog öffnen</button>}
          {query && <div className="search-results">
            {filteredTopics.map((item) => <button key={item.name} onClick={() => startLesson(item)}>
              <span>{item.name}<small>{item.category} · {item.level}</small></span><ChevronRight size={18} />
            </button>)}
            {!filteredTopics.length && <p>Kein passendes Thema gefunden.</p>}
            <button className="create-result" onClick={() => setView('create')}>
              <span><Plus size={17} /> „{query}“ im Themenkatalog suchen</span><ChevronRight size={18} />
            </button>
          </div>}
        </section>
        <section className="learning-dashboard">
          <div className="daily-plan"><div><span>DEIN NÄCHSTER SCHRITT</span><h2>Kurze Einheit, echter Fortschritt</h2><p>Beginne mit fälligen Vokabeln und arbeite danach offene Fehler auf.</p></div><div className="daily-actions"><button className="primary" onClick={() => openVocabulary('review')}><Clock3 size={17} /> Tageswiederholung</button><button className="secondary" onClick={() => setView('mistakes')}><ClipboardCheck size={17} /> {learningErrors.length} Fehler üben</button><button className="secondary" onClick={() => openVocabulary('sentences')}><PencilLine size={17} /> Eigene Sätze</button></div></div>
          <div className="progress-strip"><div><strong>{learningRecords.length}</strong><span>Abgeschlossene Einheiten</span></div><div><strong>{completedQuestions}</strong><span>Beantwortete Aufgaben</span></div><div><strong>{accuracy}%</strong><span>Trefferquote</span></div><div><strong>{learningErrors.length}</strong><span>Offene Fehler</span></div><div><strong>{learningStreak}</strong><span>Tage Lernserie</span></div></div>
        </section>
        <section className="daily-topic">
          <div className="daily-topic-icon"><CalendarDays size={23} /></div>
          <div className="daily-topic-content">
            <span>THEMA DES TAGES · {dailyTopicCompleted ? 'ERLEDIGT' : '3 KURZE AUFGABEN'}</span>
            <h2>{dailyTopic.name}</h2>
            <p>{dailyTopic.summary}</p>
            <div className="daily-topic-progress"><span>Heute: {dailyTopicCompleted ? '3' : '0'} / 3 Aufgaben</span><div><i style={{ width: dailyTopicCompleted ? '100%' : '0%' }} /></div></div>
            <div className="daily-topic-preview">{dailyTopic.exercises.slice(0, 3).map((exercise, index) => <span key={`${exercise.before}-${index}`}>{exercise.before} _____ {exercise.after}</span>)}</div>
          </div>
          <button className="primary" onClick={() => startLesson(dailyTopic)}>{dailyTopicCompleted ? 'Noch einmal üben' : 'Jetzt starten'} <ChevronRight size={16} /></button>
        </section>
        <section className="study-plan-panel">
          <div className="study-plan-heading"><div><span>DEIN LERNPLAN</span><h2>A1 Schritt für Schritt</h2><p>Ein Thema pro Lerntag. Offene Themen werden automatisch weitergeschoben.</p></div><strong>14 Tage</strong></div>
          <div className="study-plan-list">{planTopics.map((entry) => <button className={entry.completed ? 'completed' : ''} key={entry.date} onClick={() => startLesson(entry.topic)} title={`${entry.topic.name} am ${entry.date} öffnen`}><span>{new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' }).format(new Date(`${entry.date}T12:00:00`))}</span><strong>{entry.topic.name}</strong><small>{entry.completed ? 'Erledigt' : 'Offen · Übung öffnen'}</small></button>)}</div>
        </section>
        {learningErrors.length > 0 && <section className="error-insight">
          <div className="error-insight-icon"><ClipboardCheck size={21} /></div>
          <div><span>DEINE FEHLERANALYSE</span><h2>{learningErrors.length} offene {learningErrors.length === 1 ? 'Aufgabe' : 'Aufgaben'}</h2><p>Besonders oft zu üben: {errorInsights.join(' · ')}</p></div>
          <button className="secondary" onClick={() => setView('mistakes')}>Fehler üben <ChevronRight size={16} /></button>
        </section>}
        <section className="achievement-strip">
          <div className="xp-total"><span>DEIN LERNLEVEL</span><strong>{experiencePoints} XP</strong><small>Weiter so, Satz für Satz.</small></div>
          <div className="badge-list">{badges.map((badge) => <span className={badge.unlocked ? 'unlocked' : ''} key={badge.label}>{badge.unlocked ? '✓' : '○'} {badge.label}</span>)}</div>
        </section>
        <section className="topic-section">
          <div className="section-heading">
            <div><span>THEMEN NACH LERNBEREICH</span><h2>{selectedTopicArea.label}</h2><p>{selectedTopicArea.description}</p></div>
            <div className="topic-filters">
              <div className="topic-area-tabs" role="group" aria-label="Lernbereich auswählen">{topicAreas.map((area) => <button aria-pressed={topicArea === area.id} className={topicArea === area.id ? 'active' : ''} key={area.id} onClick={() => selectTopicArea(area.id)}>{area.label}</button>)}</div>
              <div className="quick-levels" aria-label="Schwierigkeit auswählen">{levels.map((level) => <button aria-pressed={quickLevel === level} className={quickLevel === level ? 'active' : ''} key={level} onClick={() => setQuickLevel(level)}>{level}</button>)}</div>
              <div className="card-options" aria-label="Kartenoptionen">
                <div className="card-option-group"><Palette size={14} /><button className={cardTheme === 'silver' ? 'active' : ''} onClick={() => setCardTheme('silver')}>Silber</button><button className={cardTheme === 'dark' ? 'active' : ''} onClick={() => setCardTheme('dark')}>Dark</button></div>
                <div className="card-option-group"><ScanText size={14} /><button className={topicPresentation === 'page' ? 'active' : ''} onClick={() => setTopicPresentation('page')}>Seite</button><button className={topicPresentation === 'window' ? 'active' : ''} onClick={() => setTopicPresentation('window')}>Fenster</button></div>
              </div>
            </div>
          </div>
          <div className={`topic-grid card-theme-${cardTheme}`}>{quickTopics.map((item, index) => <div className="topic-card" key={item.name} {...topicCardProps(item)}>
            <div className={`topic-icon topic-icon-${index}`}><Clock3 size={22} /></div>
            <span className="level">{item.level}</span>
            <h3>{item.name}</h3><p>{item.summary}</p>
            <div className="topic-card-footer"><span>Übung starten <ChevronRight size={16} /></span>{renderTopicActions(item)}</div>
          </div>)}</div>
          {!quickTopics.length && <div className="topic-empty"><BookOpen size={26} /><p>Für {selectedTopicArea.label} auf Niveau {quickLevel} kommt bald ein neues Thema hinzu. Wähle ein anderes Niveau oder einen anderen Bereich.</p></div>}
        </section>
        {customTopics.length > 0 && <section className="topic-section custom-collection">
          <div className="section-heading">
            <div><span>MEINE THEMENSAMMLUNG</span><h2>Eigene Themen</h2></div>
            <p>{customTopics.length} {customTopics.length === 1 ? 'Thema' : 'Themen'} selbst erstellt</p>
          </div>
          <div className="topic-grid">{customTopics.map((item, index) => <div className="custom-card-wrap" key={item.name}>
            <div className={`topic-card card-theme-${cardTheme}`} {...topicCardProps(item)}>
              <div className={`topic-icon topic-icon-${index % 4}`}><PencilLine size={22} /></div>
              <span className="level">{item.level}</span>
              <h3>{item.name}</h3><p>{item.summary}</p>
              <div className="topic-card-footer"><span>Übung starten <ChevronRight size={16} /></span>{renderTopicActions(item)}</div>
            </div>
            <button className="custom-topic-delete" title={`${item.name} löschen`} onClick={() => setCustomTopics((current) => current.filter(({ name }) => name !== item.name))}><Trash2 size={16} /></button>
          </div>)}</div>
        </section>}
      </main>}

      {view === 'create' && <TopicForm initialName={query} onCancel={() => setView('home')} onSave={saveCustomTopic} />}

      {view === 'vocabulary' && <Vocabulary initialMode={vocabularyMode} personalWords={personalWords} onDeletePersonalWord={(id) => setPersonalWords((current) => current.filter((word) => word.id !== id))} onRecordResult={recordLearning} onAddErrors={addLearningErrors} />}

      {view === 'translator' && <Translator existingWords={[...vocabularySets.flatMap((set) => set.words), ...personalWords]} onAddToVocabulary={addPersonalWords} />}

      {view === 'test-generator' && <TestGenerator topics={allTopics} personalWords={personalWords} onRecordResult={recordLearning} onAddErrors={addLearningErrors} />}

      {view === 'speech' && <SpeechPractice topics={allTopics} />}

      {view === 'dialogs' && <DialogPractice />}

      {view === 'mistakes' && <MistakePractice errors={learningErrors} onResolve={(id) => setLearningErrors((current) => current.filter((error) => error.id !== id))} onClear={() => setLearningErrors([])} />}

      {view === 'help' && <Help onStartReview={() => openVocabulary('review')} onStartMistakes={() => setView('mistakes')} onStartSentences={() => openVocabulary('sentences')} />}

      {previewTopic && <div className="topic-modal-backdrop" role="presentation" onMouseDown={() => setPreviewTopic(null)}>
        <section className={`topic-modal card-theme-${cardTheme}`} role="dialog" aria-modal="true" aria-labelledby="topic-preview-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className="topic-modal-close" aria-label="Fenster schließen" onClick={() => setPreviewTopic(null)}><X size={20} /></button>
          <div className="topic-modal-icon"><Clock3 size={28} /></div>
          <span className="topic-modal-kicker">{previewTopic.category} · NIVEAU {previewTopic.level}</span>
          <h2 id="topic-preview-title">{previewTopic.name}</h2>
          <p>{previewTopic.summary}</p>
          <div className="topic-modal-structure"><small>STRUKTUR</small><strong>{previewTopic.structure}</strong></div>
          <div className="topic-modal-actions"><button className="secondary" onClick={() => setPreviewTopic(null)}>Schließen</button><button className="primary" onClick={() => { startLesson(previewTopic); setPreviewTopic(null) }}><BookOpen size={16} /> Lernseite öffnen</button></div>
        </section>
      </div>}

      {view === 'lesson' && <main className="lesson-page">
        <button className="back" onClick={() => setView('home')}><ArrowLeft size={17} /> Zur Themenauswahl</button>
        <section className="lesson-hero">
          <div><span>{topic.category} · Niveau {topic.level}</span><h1>{topic.name}</h1><p>{topic.summary}</p></div>
          <div className="formula"><small>STRUKTUR</small><strong>{topic.structure}</strong></div>
        </section>
        <div className="lesson-columns">
          <section className="info-panel">
            <h2>Das Wichtigste</h2><h3>Wann benutzt man es?</h3>
            <ul>{topic.usage.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
            <h3>Signalwörter</h3><div className="chips">{topic.signalWords.map((word) => <span key={word}>{word}</span>)}</div>
            <h3>Beispiele</h3>{topic.examples.map((example) => <blockquote key={example}>{example}</blockquote>)}
          </section>
          <section className="exercise-panel">
            <div className="exercise-title"><div><span>10 SÄTZE</span><h2>Lückentext</h2></div>{evaluated && <strong className="score">{score}/10 richtig</strong>}</div>
            <p>Setze die passende Form in die Lücke ein.</p>
            <div className="sentences">{topic.exercises.map((item, index) => {
              const correct = isAcceptedAnswer(answers[index], item.answer)
              return <label className={evaluated ? (correct ? 'correct' : 'wrong') : ''} key={`${item.before}-${index}`}>
                <b>{index + 1}</b><span>{item.before}<input value={answers[index]} onChange={(event) => updateAnswer(index, event.target.value)} placeholder={item.hint} />{item.after}</span>
                {evaluated && (correct ? <Check size={17} /> : <small>{item.answer}</small>)}
              </label>
            })}</div>
            <div className="exercise-actions">
              <button className="text-button" onClick={() => { setAnswers(Array(10).fill('')); setEvaluated(false) }}><X size={17} /> Verwerfen</button>
              <button className="secondary" onClick={saveLesson}><FileText size={17} /> Speichern</button>
              <button className="primary" disabled={answers.some((answer) => !answer.trim())} onClick={evaluateLesson}><Check size={17} /> Auswerten</button>
            </div>
          </section>
        </div>
      </main>}

      {view === 'saved' && <main className="saved-page">
        <div className="saved-heading">
          <div><span>DEINE SAMMLUNG</span><h1>Gespeicherte Übungen</h1><p>Alle Lückentexte und Ergebnisse an einem Ort.</p></div>
          <button className="primary" onClick={() => setView('home')}><Plus size={18} /> Neue Übung</button>
        </div>
        {saved.length ? <div className="saved-grid">{saved.map((lesson) => <article className="saved-card" key={lesson.id}>
          <div className="saved-card-top"><span><FileText size={21} /></span><button title="Löschen" onClick={() => setSaved((current) => current.filter(({ id }) => id !== lesson.id))}><Trash2 size={18} /></button></div>
          <small>{lesson.date}</small><h2>{lesson.topic}</h2>
          <div className="result-row"><span>{lesson.score === null ? 'Noch nicht ausgewertet' : `${lesson.score} von 10 richtig`}</span>{lesson.score !== null && <strong>{lesson.score * 10}%</strong>}</div>
          <button className="open-button" onClick={() => {
            setTopic(allTopics.find(({ name }) => name === lesson.topic) ?? topics[0])
            setAnswers(lesson.answers); setEvaluated(lesson.score !== null); setView('lesson')
          }}>Öffnen <ChevronRight size={16} /></button>
        </article>)}</div> : <div className="empty-state">
          <FileText size={35} /><h2>Noch nichts gespeichert</h2><p>Deine gespeicherten Übungen erscheinen hier als Kacheln.</p>
          <button className="primary" onClick={() => setView('home')}>Thema auswählen</button>
        </div>}
      </main>}
      <footer><span>LinguaLab</span><p>Englisch lernen, Satz für Satz.</p></footer>
    </div>
  )
}

export default App
