import { useState, type DragEvent } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import type { LearningError, LearningRecord } from './learning'

type Tense = 'simple' | 'progressive' | 'perfect' | 'perfect-progressive' | 'past' | 'past-progressive' | 'past-perfect' | 'past-perfect-progressive' | 'will' | 'future-progressive' | 'future-perfect' | 'future-perfect-progressive' | 'going-to'
type PuzzleCard = { id: string; text: string; type: string; tense: Tense }

const tenseNames: Record<Tense, string> = {
  simple: 'Simple Present',
  progressive: 'Present Progressive',
  perfect: 'Present Perfect',
  'perfect-progressive': 'Present Perfect Progressive',
  past: 'Simple Past',
  'past-progressive': 'Past Progressive',
  'past-perfect': 'Past Perfect',
  'past-perfect-progressive': 'Past Perfect Progressive',
  will: 'Will-Future',
  'future-progressive': 'Future Progressive',
  'future-perfect': 'Future Perfect',
  'future-perfect-progressive': 'Future Perfect Progressive',
  'going-to': 'Going-to Future',
}

const standardTenses: Tense[] = ['simple', 'progressive', 'perfect', 'perfect-progressive', 'past', 'past-progressive', 'past-perfect', 'past-perfect-progressive', 'will', 'future-progressive', 'future-perfect', 'future-perfect-progressive']
const tenseOrder: Tense[] = [...standardTenses, 'going-to']
const cardsByTense: Record<Tense, PuzzleCard[]> = {
  simple: [
    { id: 'always', text: 'always / often', type: 'Signalwörter', tense: 'simple' },
    { id: 'habits', text: 'Gewohnheiten und Routinen', type: 'Verwendung', tense: 'simple' },
    { id: 'facts', text: 'Allgemeingültige Fakten', type: 'Verwendung', tense: 'simple' },
    { id: 'train', text: 'The train leaves at nine.', type: 'Beispielsatz', tense: 'simple' },
    { id: 'tea', text: 'I drink tea every morning.', type: 'Beispielsatz', tense: 'simple' },
  ],
  progressive: [
    { id: 'now', text: 'now / right now', type: 'Signalwörter', tense: 'progressive' },
    { id: 'actions', text: 'Handlungen im Moment', type: 'Verwendung', tense: 'progressive' },
    { id: 'temporary', text: 'Vorübergehende Situationen', type: 'Verwendung', tense: 'progressive' },
    { id: 'reading', text: 'I am reading now.', type: 'Beispielsatz', tense: 'progressive' },
    { id: 'friends', text: 'She is staying with friends this week.', type: 'Beispielsatz', tense: 'progressive' },
  ],
  past: [
    { id: 'yesterday', text: 'yesterday / last week', type: 'Signalwörter', tense: 'past' },
    { id: 'completed', text: 'Abgeschlossene Handlung zu einem bestimmten Zeitpunkt in der Vergangenheit', type: 'Verwendung', tense: 'past' },
    { id: 'sequence', text: 'Aufeinanderfolgende Handlungen in der Vergangenheit', type: 'Verwendung', tense: 'past' },
    { id: 'visited', text: 'We visited York last year.', type: 'Beispielsatz', tense: 'past' },
    { id: 'went', text: 'She went home yesterday.', type: 'Beispielsatz', tense: 'past' },
  ],
  'past-progressive': [
    { id: 'while', text: 'while + was/were ...-ing', type: 'Signal & Satzmuster', tense: 'past-progressive' },
    { id: 'ongoing-past', text: 'Eine Handlung lief zu einem Zeitpunkt in der Vergangenheit gerade ab', type: 'Verwendung', tense: 'past-progressive' },
    { id: 'interrupted', text: 'Eine laufende Handlung wurde durch ein Ereignis unterbrochen', type: 'Verwendung', tense: 'past-progressive' },
    { id: 'was-reading', text: 'I was reading at eight.', type: 'Beispielsatz', tense: 'past-progressive' },
    { id: 'were-sleeping', text: 'They were sleeping when I called.', type: 'Beispielsatz', tense: 'past-progressive' },
  ],
  perfect: [
    { id: 'ever-yet', text: 'ever / yet', type: 'Signalwörter', tense: 'perfect' },
    { id: 'experience', text: 'Erfahrung ohne Angabe eines abgeschlossenen Zeitpunkts', type: 'Verwendung', tense: 'perfect' },
    { id: 'present-result', text: 'Vergangenes Ereignis mit Ergebnis in der Gegenwart', type: 'Verwendung', tense: 'perfect' },
    { id: 'has-arrived', text: 'She has just arrived.', type: 'Beispielsatz', tense: 'perfect' },
    { id: 'have-visited', text: 'I have visited York.', type: 'Beispielsatz', tense: 'perfect' },
  ],
  'perfect-progressive': [
    { id: 'since-been', text: 'since morning + has been ...-ing', type: 'Signal & Satzmuster', tense: 'perfect-progressive' },
    { id: 'duration-now', text: 'Dauer einer Handlung von früher bis jetzt betonen', type: 'Verwendung', tense: 'perfect-progressive' },
    { id: 'recent-result', text: 'Sichtbare Folge einer gerade beendeten längeren Tätigkeit', type: 'Verwendung', tense: 'perfect-progressive' },
    { id: 'studying-hours', text: 'I have been studying for two hours.', type: 'Beispielsatz', tense: 'perfect-progressive' },
    { id: 'working-since', text: 'She has been working since morning.', type: 'Beispielsatz', tense: 'perfect-progressive' },
  ],
  'past-perfect': [
    { id: 'had-before', text: 'had + 3. Verbform ... before', type: 'Signal & Satzmuster', tense: 'past-perfect' },
    { id: 'earlier-past', text: 'Etwas war vor einem anderen vergangenen Ereignis schon abgeschlossen', type: 'Verwendung', tense: 'past-perfect' },
    { id: 'past-order', text: 'Reihenfolge zweier abgeschlossener Ereignisse in der Vergangenheit klären', type: 'Verwendung', tense: 'past-perfect' },
    { id: 'had-left', text: 'She had left before I arrived.', type: 'Beispielsatz', tense: 'past-perfect' },
    { id: 'had-finished', text: 'We had finished when the phone rang.', type: 'Beispielsatz', tense: 'past-perfect' },
  ],
  'past-perfect-progressive': [
    { id: 'had-been-for', text: 'had been ...-ing for hours before ...', type: 'Signal & Satzmuster', tense: 'past-perfect-progressive' },
    { id: 'duration-before-past', text: 'Dauer einer Handlung bis zu einem vergangenen Ereignis betonen', type: 'Verwendung', tense: 'past-perfect-progressive' },
    { id: 'past-cause', text: 'Längere frühere Tätigkeit als Ursache eines vergangenen Zustands', type: 'Verwendung', tense: 'past-perfect-progressive' },
    { id: 'had-been-waiting', text: 'I had been waiting for an hour when she arrived.', type: 'Beispielsatz', tense: 'past-perfect-progressive' },
    { id: 'had-been-working', text: 'They had been working all day before they rested.', type: 'Beispielsatz', tense: 'past-perfect-progressive' },
  ],
  will: [
    { id: 'will-pattern', text: 'I think ... will ...', type: 'Signal & Satzmuster', tense: 'will' },
    { id: 'spontaneous', text: 'Spontane Entscheidung im Gespräch', type: 'Verwendung', tense: 'will' },
    { id: 'promise', text: 'Versprechen oder Angebot für die Zukunft', type: 'Verwendung', tense: 'will' },
    { id: 'will-help', text: 'I will help you.', type: 'Beispielsatz', tense: 'will' },
    { id: 'will-rain', text: 'It will probably rain.', type: 'Beispielsatz', tense: 'will' },
  ],
  'future-progressive': [
    { id: 'will-be-time', text: 'this time tomorrow + will be ...-ing', type: 'Signal & Satzmuster', tense: 'future-progressive' },
    { id: 'ongoing-future', text: 'Handlung läuft zu einem zukünftigen Zeitpunkt gerade ab', type: 'Verwendung', tense: 'future-progressive' },
    { id: 'future-schedule', text: 'Beschäftigung während eines bestimmten Zeitraums in der Zukunft', type: 'Verwendung', tense: 'future-progressive' },
    { id: 'will-be-travelling', text: 'This time tomorrow, I will be travelling.', type: 'Beispielsatz', tense: 'future-progressive' },
    { id: 'will-be-working', text: 'She will be working at eight.', type: 'Beispielsatz', tense: 'future-progressive' },
  ],
  'future-perfect': [
    { id: 'will-have-by', text: 'by Friday + will have + 3. Verbform', type: 'Signal & Satzmuster', tense: 'future-perfect' },
    { id: 'finished-by', text: 'Handlung wird bis zu einem Zeitpunkt in der Zukunft abgeschlossen sein', type: 'Verwendung', tense: 'future-perfect' },
    { id: 'future-result', text: 'Ergebnis wird bis zu einer zukünftigen Frist vorliegen', type: 'Verwendung', tense: 'future-perfect' },
    { id: 'will-have-finished', text: 'I will have finished by Friday.', type: 'Beispielsatz', tense: 'future-perfect' },
    { id: 'will-have-left', text: 'She will have left by noon.', type: 'Beispielsatz', tense: 'future-perfect' },
  ],
  'future-perfect-progressive': [
    { id: 'will-have-been-for', text: 'by next year + will have been ...-ing for ...', type: 'Signal & Satzmuster', tense: 'future-perfect-progressive' },
    { id: 'duration-by-future', text: 'Dauer einer Handlung bis zu einem zukünftigen Zeitpunkt betonen', type: 'Verwendung', tense: 'future-perfect-progressive' },
    { id: 'looking-back-future', text: 'Von einer zukünftigen Frist aus auf die Dauer einer Tätigkeit zurückblicken', type: 'Verwendung', tense: 'future-perfect-progressive' },
    { id: 'will-have-been-working', text: 'By June, I will have been working here for five years.', type: 'Beispielsatz', tense: 'future-perfect-progressive' },
    { id: 'will-have-been-studying', text: 'She will have been studying for three hours by noon.', type: 'Beispielsatz', tense: 'future-perfect-progressive' },
  ],
  'going-to': [
    { id: 'going-pattern', text: 'am/is/are going to + Verb', type: 'Satzmuster', tense: 'going-to' },
    { id: 'planned', text: 'Schon vorher geplantes Vorhaben', type: 'Verwendung', tense: 'going-to' },
    { id: 'visible', text: 'Vorhersage aufgrund sichtbarer Anzeichen', type: 'Verwendung', tense: 'going-to' },
    { id: 'study', text: 'I am going to study tonight.', type: 'Beispielsatz', tense: 'going-to' },
    { id: 'clouds', text: 'Look at those clouds! It is going to rain.', type: 'Beispielsatz', tense: 'going-to' },
  ],
}

function shuffleCards(cards: PuzzleCard[]) {
  const shuffled = [...cards]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]]
  }
  return shuffled
}

type Props = {
  currentTopic: string
  onRecordResult: (record: LearningRecord) => void
  onAddErrors: (errors: LearningError[]) => void
}

function initialSelection(currentTopic: string): Tense[] {
  if (currentTopic === 'Present Perfect or Simple Past') return ['past', 'perfect']
  const currentTense = tenseOrder.find((tense) => tenseNames[tense] === currentTopic)
  if (!currentTense || currentTense === 'simple' || currentTense === 'progressive') return ['simple', 'progressive']
  return ['simple', currentTense]
}

export function TensePuzzle({ currentTopic, onRecordResult, onAddErrors }: Props) {
  const [selectedTenses, setSelectedTenses] = useState<Tense[]>(() => initialSelection(currentTopic))
  const [started, setStarted] = useState(false)
  const [order, setOrder] = useState<PuzzleCard[]>([])
  const [placements, setPlacements] = useState<Record<string, Tense | null>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [evaluated, setEvaluated] = useState(false)
  const cards = selectedTenses.flatMap((tense) => cardsByTense[tense])
  const placedCount = cards.filter(({ id }) => placements[id]).length
  const correctCount = cards.filter(({ id, tense }) => placements[id] === tense).length

  function toggleTense(tense: Tense) {
    setSelectedTenses((current) => current.includes(tense) ? current.filter((item) => item !== tense) : tenseOrder.filter((item) => item === tense || current.includes(item)))
  }

  function start() {
    if (selectedTenses.length < 2) return
    setOrder(shuffleCards(cards))
    setPlacements({})
    setSelectedId(null)
    setEvaluated(false)
    setStarted(true)
  }

  function place(cardId: string, destination: Tense | null) {
    if (evaluated || !cards.some(({ id }) => id === cardId)) return
    setPlacements((current) => ({ ...current, [cardId]: destination }))
    setSelectedId(null)
  }

  function handleDrop(event: DragEvent, destination: Tense | null) {
    event.preventDefault()
    place(event.dataTransfer.getData('text/plain'), destination)
  }

  function evaluate() {
    if (evaluated || placedCount !== cards.length) return
    const now = Date.now()
    onRecordResult({ id: `tense-puzzle-${now}`, kind: 'grammar', score: correctCount, total: cards.length, topicName: selectedTenses.map((tense) => tenseNames[tense]).join(' / '), createdAt: now })
    onAddErrors(cards.filter(({ id, tense }) => placements[id] !== tense).map(({ id, text, tense }) => ({
      id: `tense-puzzle-${now}-${id}`, kind: 'grammar', prompt: text, solution: tenseNames[tense],
      context: 'Zeitformen-Puzzle', hint: 'Signalwort, Verwendung oder Beispielsatz zuordnen', createdAt: now,
    })))
    setEvaluated(true)
  }

  function restart() {
    setOrder(shuffleCards(cards))
    setPlacements({})
    setSelectedId(null)
    setEvaluated(false)
  }

  function renderCard(card: PuzzleCard) {
    const placement = placements[card.id]
    const result = evaluated && placement ? (placement === card.tense ? 'correct' : 'wrong') : ''
    return <button
      key={card.id}
      type="button"
      className={`tense-card ${selectedId === card.id ? 'selected' : ''} ${result}`}
      draggable={!evaluated}
      aria-pressed={selectedId === card.id}
      aria-label={`${card.type}: ${card.text}${evaluated && placement ? ` – ${placement === card.tense ? 'richtig' : `falsch, richtig ist ${tenseNames[card.tense]}`}` : ''}`}
      onClick={() => { if (!evaluated) setSelectedId(selectedId === card.id ? null : card.id) }}
      onDragStart={(event) => { setSelectedId(card.id); event.dataTransfer.setData('text/plain', card.id); event.dataTransfer.effectAllowed = 'move' }}
      onDragEnd={() => setSelectedId(null)}
    >
      <small>{card.type}</small><span>{card.text}</span>
      {evaluated && placement && <em>{placement === card.tense ? '✓ Richtig' : `✗ → ${tenseNames[card.tense]}`}</em>}
    </button>
  }

  return <section className="tense-puzzle" aria-labelledby="tense-puzzle-title">
    <div className="tense-puzzle-heading">
      <div><span>ZEITFORMEN · ZUORDNEN</span><h2 id="tense-puzzle-title">Welches Kärtchen gehört wohin?</h2>
        <p>Wähle die Zeitformen, die du vergleichen möchtest. Ordne anschließend Hinweise, Verwendungen und Beispielsätze zu.</p></div>
      {started && <strong>{evaluated ? `${correctCount} / ${cards.length} richtig` : `${placedCount} / ${cards.length} zugeordnet`}</strong>}
    </div>
    {!started ? <div className="tense-selection">
      <h3>Welche Zeitformen möchtest du üben?</h3>
      <p>Wähle mindestens zwei. Pro Zeitform erhältst du fünf Kärtchen.</p>
      <strong className="tense-selection-label">12 Standard-Zeitformen</strong>
      <div className="tense-selection-grid">{standardTenses.map((tense) => <label key={tense} className={selectedTenses.includes(tense) ? 'checked' : ''}>
        <input type="checkbox" checked={selectedTenses.includes(tense)} onChange={() => toggleTense(tense)} />
        <span>{tenseNames[tense]}</span>
      </label>)}</div>
      <strong className="tense-selection-label">Weitere Zukunftsform</strong>
      <div className="tense-selection-grid"><label className={selectedTenses.includes('going-to') ? 'checked' : ''}>
        <input type="checkbox" checked={selectedTenses.includes('going-to')} onChange={() => toggleTense('going-to')} />
        <span>Going-to Future</span>
      </label></div>
      <div className="tense-selection-actions"><button type="button" className="secondary" onClick={() => setSelectedTenses([...standardTenses])}>Alle 12 Standardformen auswählen</button>
        <span>{standardTenses.filter((tense) => selectedTenses.includes(tense)).length} von 12 Standardformen{selectedTenses.includes('going-to') ? ' + Going-to' : ''}</span>
        <button type="button" className="primary" disabled={selectedTenses.length < 2} onClick={start}>Puzzle starten</button></div>
      {selectedTenses.length < 2 && <p role="status">Bitte wähle mindestens zwei Zeitformen aus.</p>}
      <p className="tense-selection-note">Ein Signalwort ist nur ein Hinweis: Mehrere Zeitformen können ähnliche Zeitangaben verwenden. Entscheidend ist oft die Bedeutung oder Verbform.</p>
    </div> : <>
    <p className="tense-puzzle-instruction">Ziehe die Kärtchen in die passende Zeitform-Kachel. Auf dem Handy: Kärtchen antippen, dann „Hier ablegen“ wählen. Tippe ein Kärtchen erneut an, um es zu verschieben.</p>
    <div className="tense-bank" onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, null)}>
      <div className="tense-zone-heading"><strong>Deine Kärtchen</strong><span>{cards.length - placedCount} übrig</span></div>
      <div className="tense-cards">{order.filter(({ id }) => !placements[id]).map(renderCard)}</div>
      {!placedCount && !selectedId && <span className="tense-bank-hint">Wähle ein Kärtchen oder ziehe es in eine Kachel.</span>}
      {selectedId && placements[selectedId] && <button type="button" className="tense-return" onClick={() => place(selectedId, null)}>Ausgewähltes Kärtchen zurücklegen</button>}
    </div>
    <div className="tense-zones">
      {tenseOrder.filter((tense) => selectedTenses.includes(tense)).map((tense) => <div key={tense} className={`tense-zone ${tense}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, tense)}>
        <div className="tense-zone-heading"><div><small>ZEITFORM-KACHEL</small><h3>{tenseNames[tense]}</h3></div>
          <button type="button" disabled={!selectedId || evaluated} onClick={() => { if (selectedId) place(selectedId, tense) }}>Hier ablegen</button></div>
        <div className="tense-cards">{order.filter(({ id }) => placements[id] === tense).map(renderCard)}</div>
        {!order.some(({ id }) => placements[id] === tense) && <span className="tense-empty">Kärtchen hierher ziehen oder oben auswählen</span>}
      </div>)}
    </div>
    <div className="tense-puzzle-actions">
      {evaluated && <p role="status">{correctCount === cards.length ? 'Super! Alle Kärtchen richtig zugeordnet.' : 'Die falschen Kärtchen zeigen ihre richtige Zeitform. Versuch es noch einmal!'}</p>}
      <button type="button" className="text-button" onClick={() => { setStarted(false); setSelectedId(null) }}>Zeiten ändern</button>
      <button type="button" className="secondary" onClick={restart}><RotateCcw size={16} /> {evaluated ? 'Noch einmal' : 'Neu mischen'}</button>
      {!evaluated && <button type="button" className="primary" disabled={placedCount !== cards.length} onClick={evaluate}><Check size={16} /> Zuordnung prüfen</button>}
    </div>
    </>}
  </section>
}