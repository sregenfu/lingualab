import { Check, CircleAlert, RotateCcw, Volume2 } from 'lucide-react'
import { useState } from 'react'
import { isAcceptedAnswer } from './answerUtils'
import type { LearningError } from './learning'

type MistakePracticeProps = {
  errors: LearningError[]
  onResolve: (id: string) => void
  onClear: () => void
}

export function MistakePractice({ errors, onResolve, onClear }: MistakePracticeProps) {
  const [answer, setAnswer] = useState('')
  const [evaluated, setEvaluated] = useState(false)
  const current = errors[0]
  const correct = current ? isAcceptedAnswer(answer, current.solution) : false

  function checkAnswer() {
    if (answer.trim()) setEvaluated(true)
  }

  function nextError() {
    if (current && correct) onResolve(current.id)
    setAnswer('')
    setEvaluated(false)
  }

  if (!current) return <main className="mistakes-page">
    <section className="mistakes-empty"><Check size={38} /><span>FEHLERTRAINING</span><h1>Alles aufgearbeitet</h1><p>Im Moment liegen keine offenen Fehler vor. Neue falsche Antworten aus Tests erscheinen automatisch hier.</p></section>
  </main>

  return <main className="mistakes-page">
    <section className="mistakes-heading"><div><span>FEHLERTRAINING · {errors.length} OFFEN</span><h1>Schwachstellen gezielt üben</h1><p>Beantworte die Aufgabe noch einmal. Eine richtige Antwort entfernt sie aus deiner Fehlerliste.</p></div><button className="text-button" onClick={onClear}><RotateCcw size={16} /> Liste leeren</button></section>
    <section className={`mistake-card ${evaluated ? (correct ? 'correct' : 'wrong') : ''}`}>
      <div className="mistake-card-head"><span>{current.context}</span><small>{current.kind === 'grammar' ? 'GRAMMATIK' : 'WORTSCHATZ'}</small></div>
      <p>{current.prompt}</p>
      <div className="mistake-answer"><input value={answer} disabled={evaluated} onChange={(event) => setAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') checkAnswer() }} placeholder={current.hint ?? 'Deine Antwort'} autoFocus />{current.kind !== 'grammar' && <button className="speak-button" title="Englische Aussprache anhören" onClick={() => speak(current.prompt)}><Volume2 size={18} /></button>}</div>
      {evaluated && <div className="mistake-feedback">{correct ? <><Check size={18} /> Richtig. Gut zurückgeholt.</> : <><CircleAlert size={18} /> Lösung: <strong>{current.solution}</strong></>}</div>}
    </section>
    <div className="mistake-actions">{!evaluated ? <button className="primary" disabled={!answer.trim()} onClick={checkAnswer}><Check size={17} /> Prüfen</button> : <button className="primary" onClick={nextError}>{correct ? 'Nächste Aufgabe' : 'Noch einmal versuchen'} <Check size={17} /></button>}</div>
  </main>
}

function speak(text: string) {
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-GB'
  window.speechSynthesis.speak(utterance)
}