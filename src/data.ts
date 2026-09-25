export type Exercise = {
  before: string
  answer: string
  after: string
  hint: string
}

export type Topic = {
  name: string
  level: string
  category: string
  summary: string
  structure: string
  usage: string[]
  signalWords: string[]
  examples: string[]
  exercises: Exercise[]
}

const exercise = (before: string, answer: string, after: string, hint: string): Exercise => ({ before, answer, after, hint })

export const topics: Topic[] = [
  {
    name: 'Simple Present', level: 'A1', category: 'Zeitformen',
    summary: 'Das Simple Present beschreibt Gewohnheiten, Fakten und regelmäßig wiederkehrende Handlungen.',
    structure: 'I / you / we / they + Verb · he / she / it + Verb-s',
    usage: ['Gewohnheiten und Routinen', 'Allgemeingültige Fakten', 'Fahrpläne und feste Abläufe'],
    signalWords: ['always', 'usually', 'often', 'sometimes', 'never', 'every day'],
    examples: ['I drink tea every morning.', 'She works in London.', 'The train leaves at nine.'],
    exercises: [
      exercise('Emma ', 'walks', ' to school every day.', 'walk'), exercise('They ', 'play', ' tennis on Saturdays.', 'play'),
      exercise('My brother ', 'watches', ' TV after dinner.', 'watch'), exercise('We often ', 'visit', ' our grandparents.', 'visit'),
      exercise('The shop ', 'opens', ' at eight o’clock.', 'open'), exercise('I never ', 'drink', ' coffee in the evening.', 'drink'),
      exercise('Sarah ', 'studies', ' English at school.', 'study'), exercise('Dogs ', 'need', ' plenty of exercise.', 'need'),
      exercise('He usually ', 'finishes', ' work at five.', 'finish'), exercise('You ', 'speak', ' English very well.', 'speak'),
    ],
  },
  {
    name: 'Present Progressive', level: 'A1', category: 'Zeitformen',
    summary: 'Das Present Progressive beschreibt Handlungen, die gerade jetzt stattfinden.',
    structure: 'am / is / are + Verb-ing',
    usage: ['Handlungen im Moment', 'Vorübergehende Situationen', 'Fest vereinbarte Zukunftspläne'],
    signalWords: ['now', 'right now', 'at the moment', 'look!', 'listen!'],
    examples: ['I am reading now.', 'She is staying with friends.', 'We are meeting tonight.'],
    exercises: [
      exercise('Look! The baby ', 'is sleeping', '.', 'sleep'), exercise('I ', 'am writing', ' an email right now.', 'write'),
      exercise('They ', 'are waiting', ' for the bus.', 'wait'), exercise('Mia ', 'is wearing', ' a blue jacket today.', 'wear'),
      exercise('We ', 'are learning', ' English at the moment.', 'learn'), exercise('Listen! Someone ', 'is singing', '.', 'sing'),
      exercise('You ', 'are standing', ' on my foot.', 'stand'), exercise('The dog ', 'is running', ' in the garden.', 'run'),
      exercise('I ', 'am not working', ' this week.', 'not work'), exercise('Tom and Ana ', 'are cooking', ' dinner.', 'cook'),
    ],
  },
  {
    name: 'Simple Past', level: 'A2', category: 'Zeitformen',
    summary: 'Das Simple Past wird für abgeschlossene Handlungen in der Vergangenheit verwendet.',
    structure: 'Verb-ed · unregelmäßige zweite Verbform',
    usage: ['Abgeschlossene Ereignisse', 'Aufeinanderfolgende Handlungen', 'Vergangene Zustände'],
    signalWords: ['yesterday', 'last week', 'ago', 'in 2020', 'then'],
    examples: ['We visited York.', 'She went home.', 'I lived there for a year.'],
    exercises: [
      exercise('We ', 'visited', ' London last year.', 'visit'), exercise('She ', 'went', ' home early.', 'go'),
      exercise('I ', 'watched', ' a film yesterday.', 'watch'), exercise('They ', 'bought', ' a new car.', 'buy'),
      exercise('Leo ', 'finished', ' his homework.', 'finish'), exercise('The train ', 'arrived', ' ten minutes late.', 'arrive'),
      exercise('You ', 'told', ' me the truth.', 'tell'), exercise('We ', 'had', ' breakfast at seven.', 'have'),
      exercise('My parents ', 'met', ' in Berlin.', 'meet'), exercise('It ', 'rained', ' all afternoon.', 'rain'),
    ],
  },
  {
    name: 'Will-Future', level: 'A2', category: 'Zeitformen',
    summary: 'Das Will-Future drückt spontane Entscheidungen, Versprechen und Vermutungen aus.',
    structure: 'will + Grundform des Verbs',
    usage: ['Spontane Entscheidungen', 'Versprechen und Angebote', 'Vermutungen über die Zukunft'],
    signalWords: ['tomorrow', 'next week', 'probably', 'I think', 'perhaps'],
    examples: ['I will help you.', 'It will probably rain.', 'We will call tomorrow.'],
    exercises: [
      exercise('I think it ', 'will rain', ' tomorrow.', 'rain'), exercise('Don’t worry, I ', 'will help', ' you.', 'help'),
      exercise('She ', 'will probably arrive', ' late.', 'probably arrive'), exercise('We ', 'will call', ' you tonight.', 'call'),
      exercise('They ', 'will enjoy', ' the concert.', 'enjoy'), exercise('I ', 'will open', ' the window.', 'open'),
      exercise('You ', 'will love', ' this book.', 'love'), exercise('He ', 'will not forget', ' your birthday.', 'not forget'),
      exercise('The team ', 'will win', ' the match.', 'win'), exercise('Perhaps we ', 'will meet', ' again.', 'meet'),
    ],
  },
  {
    name: 'Personal Pronouns', level: 'A1', category: 'Pronomen',
    summary: 'Personalpronomen ersetzen Personen oder Dinge und vermeiden Wiederholungen im Satz.',
    structure: 'Subjekt: I, you, he, she, it, we, they · Objekt: me, you, him, her, it, us, them',
    usage: ['Subjektpronomen stehen vor dem Verb', 'Objektpronomen stehen nach Verben oder Präpositionen', 'It wird für Dinge und Tiere verwendet'],
    signalWords: ['I / me', 'he / him', 'she / her', 'we / us', 'they / them'],
    examples: ['Emma is here. She is here.', 'I know Tom. I know him.', 'The books are new. They are new.'],
    exercises: [
      exercise('Anna is my sister. ', 'She', ' lives in London.', 'she'), exercise('Tom is friendly. I like ', 'him', '.', 'he'),
      exercise('Ben and I are classmates. ', 'We', ' study together.', 'we'), exercise('The children are outside. Can you see ', 'them', '?', 'they'),
      exercise('This is my new phone. ', 'It', ' is very fast.', 'it'), exercise('My name is Alex. ', 'I', ' am from Bristol.', 'I'),
      exercise('Lisa is calling. Please talk to ', 'her', '.', 'she'), exercise('Sam and Mia are late. ', 'They', ' missed the bus.', 'they'),
      exercise('Our teacher helps ', 'us', ' with the exercise.', 'we'), exercise('Are you ready? I am waiting for ', 'you', '.', 'you'),
    ],
  },
]

const paletteDefinitions = [
  ['#ff6b91', '#ffb07c', '#ffe26f'], ['#f2b8c7', '#f9d8df', '#ef8dab'], ['#8bc6a4', '#4d7d6a', '#293b64'],
  ['#c2cf72', '#789264', '#f4e8cb'], ['#dabbe8', '#9c72c3', '#f3eaf8'], ['#f1bbc8', '#ff768f', '#fff0b8'],
  ['#a78bc3', '#69498b', '#e9dced'], ['#ff826c', '#ebb258', '#278b87'], ['#354267', '#687197', '#ed6c62'],
  ['#bea8d6', '#dfd2ea', '#8e74ad'], ['#ffd916', '#38c79a', '#ef5681'], ['#08acd3', '#62d1ba', '#ffd3c7'],
  ['#aa162b', '#e56562', '#f2d3ce'], ['#2e3438', '#929c9e', '#e6e8e6'], ['#fa826c', '#efbc67', '#4f886b'],
  ['#554279', '#a892c5', '#ddd4ea'], ['#9363bd', '#23a886', '#f4c44d'], ['#f4f1eb', '#f7b3a8', '#fa472c'],
  ['#3f51b5', '#38c9c2', '#ffd43b'], ['#ef476f', '#f78c6b', '#ffd166'], ['#184e77', '#1a759f', '#76c893'],
  ['#6d597a', '#b56576', '#eaac8b'], ['#006d77', '#83c5be', '#ffddd2'], ['#b23a48', '#e07a5f', '#f2cc8f'],
  ['#264653', '#2a9d8f', '#e9c46a'], ['#5f0f40', '#9a031e', '#fb8b24'], ['#344e41', '#a3b18a', '#dad7cd'],
  ['#1d3557', '#457b9d', '#a8dadc'], ['#6a4c93', '#1982c4', '#8ac926'], ['#7f5539', '#b08968', '#ddb892'],
  ['#cb4b64', '#86bd4e', '#eadb78'], ['#dfa64c', '#3e2d1f', '#b95750'], ['#e53c32', '#cfaa31', '#5b7024'],
  ['#9d9b70', '#c55f54', '#3b4f3e'], ['#ff403d', '#f7dc57', '#9bd45a'], ['#16b8cd', '#8ecf3f', '#f25e82'],
  ['#fa5909', '#ffba38', '#91c936'], ['#ca493d', '#e4d27c', '#167c73'], ['#a58e97', '#d1504d', '#91bdc6'],
  ['#e59382', '#e8b96c', '#f3d799'], ['#e86a39', '#f8d45f', '#b9d889'], ['#f46b43', '#f8e2e1', '#e8eb9c'],
  ['#5d6c29', '#a6d949', '#1d1d1d'], ['#cb350d', '#e8c04a', '#536541'], ['#4d5960', '#e5e5b1', '#78c5c6'],
]

function getPaletteHue(color: string) {
  const red = Number.parseInt(color.slice(1, 3), 16) / 255
  const green = Number.parseInt(color.slice(3, 5), 16) / 255
  const blue = Number.parseInt(color.slice(5, 7), 16) / 255
  const maximum = Math.max(red, green, blue)
  const minimum = Math.min(red, green, blue)
  const difference = maximum - minimum
  const lightness = (maximum + minimum) / 2
  const saturation = difference === 0 ? 0 : difference / (1 - Math.abs(2 * lightness - 1))
  let hue = 0

  if (difference !== 0) {
    if (maximum === red) hue = 60 * (((green - blue) / difference) % 6)
    else if (maximum === green) hue = 60 * ((blue - red) / difference + 2)
    else hue = 60 * ((red - green) / difference + 4)
  }

  return { hue: hue < 0 ? hue + 360 : hue, saturation, lightness }
}

function getPaletteOrder(colors: string[]) {
  const { hue, saturation, lightness } = getPaletteHue(colors[0])
  if (saturation < 0.16) return lightness > 0.7 ? -100 : -50
  if (hue >= 20 && hue < 80) return hue
  if (hue < 20 || hue >= 330) return 100 + hue / 360
  if (hue >= 260 && hue < 330) return 200 + hue / 360
  if (hue >= 180 && hue < 260) return 300 + hue / 360
  return 400 + hue / 360
}

export const palettes = [...paletteDefinitions].sort((left, right) => getPaletteOrder(left) - getPaletteOrder(right))

export function getPaletteIndexFromLegacyIndex(index: number) {
  const colors = paletteDefinitions[index]
  return colors ? palettes.findIndex((palette) => palette.join() === colors.join()) : 7
}

