import { ArrowLeft, BookOpen, Check, ChevronRight, Search } from 'lucide-react'
import { useState } from 'react'
import { catalogTopics } from './catalog'
import type { Topic } from './data'

type TopicFormProps = {
  initialName: string
  onCancel: () => void
  onSave: (topic: Topic) => void
}

type Level = 'A1' | 'A2' | 'B1' | 'B2'
const levels: Level[] = ['A1', 'A2', 'B1', 'B2']
const matchesSearch = (topic: Topic, query: string) => {
  const content = `${topic.name} ${topic.category} ${topic.summary} ${topic.structure} ${topic.signalWords.join(' ')}`.toLowerCase()
  const terms = query.toLowerCase().split(/[\s,;]+/).filter(Boolean)
  return terms.every((term) => content.includes(term))
}

export function TopicForm({ initialName, onCancel, onSave }: TopicFormProps) {
  const initialMatches = catalogTopics.filter((topic) => matchesSearch(topic, initialName))
  const [search, setSearch] = useState(initialMatches.length ? initialName : '')
  const [selected, setSelected] = useState<Topic>(initialMatches[0] ?? catalogTopics[0])
  const [level, setLevel] = useState<Level>((initialMatches[0]?.level as Level) ?? 'A1')
  const filtered = catalogTopics.filter((item) => item.level === level && matchesSearch(item, search))

  function selectLevel(nextLevel: Level) {
    const firstTopic = catalogTopics.find((item) => item.level === nextLevel)
    setLevel(nextLevel)
    setSearch('')
    if (firstTopic) setSelected(firstTopic)
  }

  return <main className="create-page">
    <button className="back" type="button" onClick={onCancel}><ArrowLeft size={17} /> Zurück zur Suche</button>
    <div className="create-heading">
      <span>LOKALER THEMENKATALOG</span>
      <h1>Wissen auswählen</h1>
      <p>Alle Themen enthalten eine Erklärung, Beispiele und zehn fertige Lückensätze.</p>
    </div>
    <div className="level-picker" aria-label="Schwierigkeitsgrad">
      <span>Schwierigkeit</span>
      <div>{levels.map((item) => <button className={level === item ? 'active' : ''} key={item} onClick={() => selectLevel(item)}>{item}</button>)}</div>
      <small>{level === 'A1' ? 'Grundlagen' : level === 'A2' ? 'Aufbau' : level === 'B1' ? 'Fortgeschritten' : 'Selbstständig'}</small>
    </div>
    <div className="catalog-search"><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Themen auf Niveau ${level} durchsuchen`} /><span>{filtered.length} Themen</span></div>
    <div className="catalog-layout">
      <section className="catalog-list" aria-label="Verfügbare Themen">
        {filtered.map((item) => <button className={selected.name === item.name ? 'selected' : ''} key={item.name} onClick={() => setSelected(item)}>
          <span className="catalog-book"><BookOpen size={18} /></span>
          <span><strong>{item.name}</strong><small>{item.category} · Niveau {item.level}</small></span>
          <ChevronRight size={17} />
        </button>)}
        {!filtered.length && <div className="catalog-empty"><Search size={25} /><strong>Kein Thema auf {level} gefunden</strong><p>Ändere den Suchbegriff oder wähle eine andere Schwierigkeit.</p></div>}
      </section>
      <section className="catalog-preview">
        <div className="catalog-preview-head"><span>{selected.category} · {selected.level}</span><h2>{selected.name}</h2><p>{selected.summary}</p></div>
        <div className="catalog-rule"><small>STRUKTUR</small><strong>{selected.structure}</strong></div>
        <h3>Das lernst du</h3>
        <ul>{selected.usage.map((item) => <li key={item}><Check size={15} /> {item}</li>)}</ul>
        <h3>Beispiele</h3>
        {selected.examples.map((example) => <blockquote key={example}>{example}</blockquote>)}
        <div className="catalog-meta"><span><b>10</b> Lückensätze</span><span><b>{selected.signalWords.length}</b> wichtige Formen</span></div>
        <button className="primary catalog-save" onClick={() => onSave(selected)}><Check size={17} /> In meine Sammlung übernehmen</button>
      </section>
    </div>
    <div className="create-note">
      <BookOpen size={16} /><span>Der Katalog funktioniert vollständig offline und benötigt keinen API-Key.</span>
    </div>
  </main>
}
