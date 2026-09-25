export type VocabularyWord = {
  id: string
  english: string
  german: string
  englishDescription: string
  germanDescription: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  category: string
}

export const vocabularyWords: VocabularyWord[] = [
  { id: 'achieve', english: 'achieve', german: 'erreichen', englishDescription: 'to succeed in doing something after making an effort', germanDescription: 'etwas durch Anstrengung erfolgreich schaffen', level: 'B1', category: 'Lernen' },
  { id: 'advice', english: 'advice', german: 'Rat', englishDescription: 'an opinion that helps someone decide what to do', germanDescription: 'eine Empfehlung, die bei einer Entscheidung hilft', level: 'A2', category: 'Alltag' },
  { id: 'although', english: 'although', german: 'obwohl', englishDescription: 'used to introduce a fact that makes another fact surprising', germanDescription: 'leitet einen Gegensatz oder eine überraschende Einschränkung ein', level: 'B1', category: 'Verknüpfungen' },
  { id: 'appointment', english: 'appointment', german: 'Termin', englishDescription: 'an arranged time to meet someone', germanDescription: 'eine vereinbarte Zeit für ein Treffen', level: 'A2', category: 'Alltag' },
  { id: 'available', english: 'available', german: 'verfügbar', englishDescription: 'ready to be used or able to be contacted', germanDescription: 'nutzbar, vorhanden oder erreichbar', level: 'B1', category: 'Alltag' },
  { id: 'borrow', english: 'borrow', german: 'ausleihen', englishDescription: 'to take something for a short time and return it later', germanDescription: 'etwas vorübergehend nehmen und später zurückgeben', level: 'A2', category: 'Alltag' },
  { id: 'challenge', english: 'challenge', german: 'Herausforderung', englishDescription: 'a difficult task that tests your ability', germanDescription: 'eine schwierige Aufgabe, die Fähigkeiten auf die Probe stellt', level: 'B1', category: 'Lernen' },
  { id: 'comfortable', english: 'comfortable', german: 'bequem', englishDescription: 'making you feel physically relaxed', germanDescription: 'körperlich angenehm und entspannt', level: 'A2', category: 'Eigenschaften' },
  { id: 'decision', english: 'decision', german: 'Entscheidung', englishDescription: 'a choice made after thinking about possibilities', germanDescription: 'eine Wahl nach dem Abwägen von Möglichkeiten', level: 'A2', category: 'Alltag' },
  { id: 'environment', english: 'environment', german: 'Umwelt', englishDescription: 'the natural world in which people, animals and plants live', germanDescription: 'die natürliche Welt, in der Menschen, Tiere und Pflanzen leben', level: 'B1', category: 'Natur' },
  { id: 'experience', english: 'experience', german: 'Erfahrung', englishDescription: 'knowledge gained by doing or seeing something', germanDescription: 'Wissen, das man durch Erleben oder Handeln gewinnt', level: 'B1', category: 'Lernen' },
  { id: 'improve', english: 'improve', german: 'verbessern', englishDescription: 'to make something better or become better', germanDescription: 'etwas besser machen oder besser werden', level: 'A2', category: 'Lernen' },
  { id: 'journey', english: 'journey', german: 'Reise', englishDescription: 'the act of travelling from one place to another', germanDescription: 'das Reisen von einem Ort zu einem anderen', level: 'A2', category: 'Reisen' },
  { id: 'neighbour', english: 'neighbour', german: 'Nachbar', englishDescription: 'a person who lives near you', germanDescription: 'eine Person, die in der Nähe wohnt', level: 'A1', category: 'Menschen' },
  { id: 'opportunity', english: 'opportunity', german: 'Gelegenheit', englishDescription: 'a situation that makes it possible to do something', germanDescription: 'eine günstige Möglichkeit, etwas zu tun', level: 'B1', category: 'Alltag' },
  { id: 'probably', english: 'probably', german: 'wahrscheinlich', englishDescription: 'used when something is likely to happen or be true', germanDescription: 'wenn etwas voraussichtlich geschieht oder zutrifft', level: 'A2', category: 'Verknüpfungen' },
  { id: 'reliable', english: 'reliable', german: 'zuverlässig', englishDescription: 'able to be trusted to work well or behave as expected', germanDescription: 'vertrauenswürdig und erwartungsgemäß funktionierend', level: 'B2', category: 'Eigenschaften' },
  { id: 'require', english: 'require', german: 'erfordern', englishDescription: 'to need something or make it necessary', germanDescription: 'etwas benötigen oder notwendig machen', level: 'B2', category: 'Arbeit' },
  { id: 'schedule', english: 'schedule', german: 'Zeitplan', englishDescription: 'a plan showing when activities will happen', germanDescription: 'ein Plan, der Zeiten für Aktivitäten festlegt', level: 'B1', category: 'Arbeit' },
  { id: 'suitable', english: 'suitable', german: 'geeignet', englishDescription: 'right or appropriate for a particular purpose', germanDescription: 'für einen bestimmten Zweck passend', level: 'B2', category: 'Eigenschaften' },
]
