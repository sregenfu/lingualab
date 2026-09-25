import { CalendarCheck, CircleAlert, CircleHelp, Languages, PenLine, Volume2 } from 'lucide-react'

type HelpProps = {
  onStartReview: () => void
  onStartMistakes: () => void
  onStartSentences: () => void
}

export function Help({ onStartReview, onStartMistakes, onStartSentences }: HelpProps) {
  return <main className="help-page">
    <section className="help-heading"><span>HILFE & LERNPLAN</span><h1>So lernst du mit LinguaLab</h1><p>Nutze kurze, regelmäßige Einheiten. Erst erinnern, dann prüfen und Fehler gezielt wiederholen.</p></section>
    <section className="help-routine">
      <div><b>01</b><CalendarCheck size={22} /><h2>Heute wiederholen</h2><p>Starte mit den fälligen Vokabeln. Nach jeder Antwort wählst du, wann das Wort erneut erscheinen soll.</p><button className="secondary" onClick={onStartReview}>Tageswiederholung öffnen</button></div>
      <div><b>02</b><CircleAlert size={22} /><h2>Fehler aufarbeiten</h2><p>Falsche Antworten aus Tests werden gesammelt. Eine richtige Wiederholung entfernt sie wieder aus der Liste.</p><button className="secondary" onClick={onStartMistakes}>Fehlertraining öffnen</button></div>
      <div><b>03</b><PenLine size={22} /><h2>Selbst anwenden</h2><p>Schreibe zu neuen Wörtern eigene englische Sätze. So verknüpfst du Bedeutung, Form und Kontext.</p><button className="secondary" onClick={onStartSentences}>Eigene Sätze öffnen</button></div>
    </section>
    <section className="help-details">
      <article><Languages size={20} /><div><h2>Vokabeln und Tests</h2><p>Wähle die Sprachrichtung und ein Thema. Im Test schreibst du die Lösung ohne Hinweise. Ergebnisse erscheinen in deinem Fortschritt.</p></div></article>
      <article><Volume2 size={20} /><div><h2>Aussprache</h2><p>Das Lautsprecher-Symbol spricht englische Wörter und Aufgaben vor. Dein Browser verwendet dafür eine installierte englische Stimme.</p></div></article>
      <article><CircleHelp size={20} /><div><h2>Lernprinzip</h2><p>Direktes Feedback hilft beim Einordnen, aber entscheidend sind aktives Abrufen und Wiederholungen mit Abstand. Kurze tägliche Einheiten sind wirksamer als seltenes langes Lernen.</p></div></article>
    </section>
  </main>
}