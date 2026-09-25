import { ArrowRight, Check, MessageCircle, RotateCcw } from 'lucide-react'
import { useState } from 'react'

type Dialog = {
  situation: string
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

const dialogs: Dialog[] = [
  { situation: 'Im Café', prompt: 'Could I have a coffee, please?', options: ['I have coffee yesterday.', 'Sure. Anything else?', 'You must coffee.'], answer: 1, explanation: '“Sure. Anything else?” ist eine natürliche, freundliche Antwort.' },
  { situation: 'Im Büro', prompt: 'Would you mind sending me the file?', options: ['Yes, I send file yesterday.', 'You send it yourself.', 'Not at all. I’ll send it now.'], answer: 2, explanation: '“Not at all” bedeutet hier höflich: Kein Problem.' },
  { situation: 'Small Talk', prompt: 'How was your weekend?', options: ['Pretty good, thanks. What about you?', 'I am weekend.', 'Yes, it was.'], answer: 0, explanation: 'Eine kurze Reaktion mit Rückfrage hält den Small Talk offen.' },
  { situation: 'Telefonat', prompt: 'Could you put me through to Ms Green?', options: ['I am putting yesterday.', 'You can telephone.', 'Certainly. I’ll connect you.'], answer: 2, explanation: '“Certainly. I’ll connect you.” passt zu einer höflichen Telefonantwort.' },
  { situation: 'Im Hotel', prompt: 'Is breakfast included in the price?', options: ['Yes, it is served from seven.', 'Breakfast included yesterday.', 'You include the price.'], answer: 0, explanation: 'Eine direkte, vollständige Antwort informiert freundlich über das Frühstück.' },
  { situation: 'Am Bahnhof', prompt: 'Which platform does the train leave from?', options: ['The train is very platform.', 'Platform five, near the main entrance.', 'You leave the train.'], answer: 1, explanation: 'Die passende Antwort nennt direkt das Gleis und einen Orientierungspunkt.' },
  { situation: 'Im Team', prompt: 'Could you give me a hand with this report?', options: ['Of course. What do you need?', 'I gave hands yesterday.', 'The report is hand.'], answer: 0, explanation: '“Of course. What do you need?” ist eine natürliche Zusage mit Rückfrage.' },
  { situation: 'Termin vereinbaren', prompt: 'Would Tuesday afternoon work for you?', options: ['Tuesday is afternoon yesterday.', 'You work the appointment.', 'Yes, that suits me perfectly.'], answer: 2, explanation: '“That suits me perfectly” bestätigt höflich, dass der Termin passt.' },
  { situation: 'Nach dem Weg fragen', prompt: 'Excuse me, is there a pharmacy nearby?', options: ['Yes, it’s next to the bank.', 'The pharmacy nearby yesterday.', 'You are a pharmacy.'], answer: 0, explanation: 'Die Antwort bestätigt den Ort und gibt eine hilfreiche Wegbeschreibung.' },
  { situation: 'Verabschiedung', prompt: 'Thanks for your help. See you tomorrow!', options: ['Tomorrow helped yesterday.', 'You’re welcome. See you then!', 'You must see tomorrow.'], answer: 1, explanation: '“You’re welcome” und “See you then” sind passende höfliche Abschiedsformeln.' },
]

export function DialogPractice() {
  const [dialogIndex, setDialogIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const dialog = dialogs[dialogIndex]
  const finished = dialogIndex === dialogs.length - 1 && selected !== null

  function chooseOption(index: number) {
    if (selected !== null) return
    setSelected(index)
    if (index === dialog.answer) setScore((current) => current + 1)
  }

  function nextDialog() {
    setDialogIndex((current) => (current + 1) % dialogs.length)
    setSelected(null)
  }

  function reset() {
    setDialogIndex(0)
    setSelected(null)
    setScore(0)
  }

  return <main className="dialog-page">
    <section className="dialog-heading">
      <div><span>ALLTAGSSPRACHE</span><h1>Mini-Dialoge</h1><p>Wähle die Antwort, die im echten Gespräch natürlich klingt.</p></div>
      <div className="dialog-score"><strong>{score}/{dialogs.length}</strong><span>richtig</span></div>
    </section>
    <section className="dialog-card">
      <div className="dialog-card-top"><span><MessageCircle size={16} /> {dialog.situation}</span><small>{dialogIndex + 1} / {dialogs.length}</small></div>
      <div className="dialog-bubble"><small>DEIN GESPRÄCHSPARTNER</small><strong>{dialog.prompt}</strong></div>
      <div className="dialog-options">{dialog.options.map((option, index) => <button key={option} className={selected === null ? '' : index === dialog.answer ? 'correct' : selected === index ? 'wrong' : ''} onClick={() => chooseOption(index)}><b>{String.fromCharCode(65 + index)}</b><span>{option}</span>{selected !== null && index === dialog.answer && <Check size={17} />}</button>)}</div>
      {selected !== null && <div className={`dialog-feedback ${selected === dialog.answer ? 'correct' : 'wrong'}`}><strong>{selected === dialog.answer ? 'Sehr gut!' : 'Noch einmal ansehen'}</strong><p>{dialog.explanation}</p></div>}
      <div className="dialog-actions">{finished && <button className="text-button" onClick={reset}><RotateCcw size={16} /> Neu starten</button>}{selected !== null && <button className="primary" onClick={nextDialog}>{finished ? 'Von vorn' : 'Nächster Dialog'} <ArrowRight size={16} /></button>}</div>
    </section>
  </main>
}
