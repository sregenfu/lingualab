import type { VocabularyWord } from './vocabularyData'
import type { VocabularySet } from './vocabularySets'

type Entry = [string, string, string]

const set = (id: string, title: string, description: string, level: VocabularySet['level'], entries: Entry[]): VocabularySet => ({
  id, title, description, level,
  words: entries.map(([english, german, englishDescription], index): VocabularyWord => ({
    id: `${id}-${index}`, english, german, englishDescription,
    germanDescription: `Das englische Wort oder die englische Wendung für „${german}“.`,
    level, category: title,
  })),
})

export const advancedVocabularySets: VocabularySet[] = [
  set('modal-verbs', 'Modal Verbs', 'Fähigkeiten, Pflichten, Erlaubnisse und Ratschläge', 'A2', [
    ['can', 'können', 'used to express ability or possibility'], ['could', 'könnte / konnte', 'used for past ability or polite possibility'],
    ['must', 'müssen', 'used for a strong obligation'], ['mustn’t', 'nicht dürfen', 'used to express a prohibition'],
    ['have to', 'müssen', 'used for an external obligation'], ['don’t have to', 'nicht müssen', 'used when something is not necessary'],
    ['should', 'sollte', 'used to give advice'], ['shouldn’t', 'sollte nicht', 'used to advise against something'],
    ['may', 'dürfen / möglicherweise', 'used for permission or possibility'], ['might', 'vielleicht', 'used for a less certain possibility'],
    ['need to', 'müssen / brauchen', 'used when an action is necessary'], ['be allowed to', 'dürfen', 'to have permission to do something'],
    ['ability', 'Fähigkeit', 'the skill needed to do something'], ['permission', 'Erlaubnis', 'the right to do something'],
    ['obligation', 'Verpflichtung', 'something that you must do'], ['prohibition', 'Verbot', 'a rule that does not allow something'],
    ['advice', 'Rat', 'an opinion about what someone should do'], ['necessary', 'notwendig', 'needed in order to achieve something'],
    ['possible', 'möglich', 'able to happen or be done'], ['certain', 'sicher', 'known to be true or definite'],
  ]),
  set('comparisons-quantities', 'Comparisons and Quantities', 'Vergleiche sowie zählbare und nicht zählbare Mengen', 'A2', [
    ['bigger', 'größer', 'larger in size than something else'], ['smaller', 'kleiner', 'less large than something else'],
    ['better', 'besser', 'of a higher quality than something else'], ['worse', 'schlechter', 'of a lower quality than something else'],
    ['faster', 'schneller', 'moving at a higher speed'], ['slower', 'langsamer', 'moving at a lower speed'],
    ['the best', 'am besten', 'better than everyone or everything else'], ['the most', 'am meisten', 'the greatest amount or degree'],
    ['than', 'als', 'used after a comparative adjective'], ['as ... as', 'so ... wie', 'used when two things are equal'],
    ['many', 'viele', 'a large number of countable things'], ['much', 'viel', 'a large amount of something uncountable'],
    ['some', 'einige / etwas', 'an unspecified number or amount'], ['any', 'irgendwelche / etwas', 'an amount often used in questions and negatives'],
    ['a few', 'ein paar', 'a small number of countable things'], ['a little', 'ein wenig', 'a small amount of something uncountable'],
    ['enough', 'genug', 'as much or as many as needed'], ['too much', 'zu viel', 'more of an uncountable thing than needed'],
    ['too many', 'zu viele', 'more countable things than needed'], ['amount', 'Menge', 'a quantity of something'],
  ]),
  set('conditionals', 'Conditional Sentences', 'Bedingungen, Folgen und hypothetische Situationen', 'B1', [
    ['if', 'wenn / falls', 'used to introduce a condition'], ['unless', 'wenn nicht', 'used to mean if something does not happen'],
    ['condition', 'Bedingung', 'something that must happen before another thing'], ['consequence', 'Folge', 'a result of an action or condition'],
    ['likely', 'wahrscheinlich', 'expected to happen'], ['unlikely', 'unwahrscheinlich', 'not expected to happen'],
    ['possible', 'möglich', 'able to happen'], ['hypothetical', 'hypothetisch', 'imagined rather than real'],
    ['provided that', 'vorausgesetzt, dass', 'only if a particular condition is met'], ['as long as', 'solange', 'on the condition that something happens'],
    ['in case', 'für den Fall, dass', 'as preparation for a possible event'], ['otherwise', 'sonst', 'used to describe a different result'],
    ['would', 'würde', 'used for imagined situations'], ['would have', 'hätte / wäre', 'used for an unreal past result'],
    ['regret', 'Bedauern', 'sadness about a past action'], ['choice', 'Wahl', 'an act of selecting between possibilities'],
    ['result', 'Ergebnis', 'what happens because of something'], ['situation', 'Situation', 'the conditions at a particular time'],
    ['imagine', 'sich vorstellen', 'to form a picture or idea in your mind'], ['prevent', 'verhindern', 'to stop something from happening'],
  ]),
  set('reported-speech', 'Reported Speech and Connectors', 'Aussagen wiedergeben und Gedanken logisch verbinden', 'B1', [
    ['say', 'sagen', 'to express something using words'], ['tell', 'erzählen / sagen', 'to give information to a person'],
    ['report', 'berichten', 'to give information about an event'], ['mention', 'erwähnen', 'to speak briefly about something'],
    ['explain', 'erklären', 'to make something clear'], ['promise', 'versprechen', 'to say that you will certainly do something'],
    ['claim', 'behaupten', 'to say something is true without proof'], ['admit', 'zugeben', 'to agree that something is true'],
    ['deny', 'bestreiten', 'to say that something is not true'], ['suggest', 'vorschlagen', 'to offer an idea for consideration'],
    ['according to', 'laut / gemäß', 'as stated by a person or source'], ['although', 'obwohl', 'used to introduce a contrast'],
    ['however', 'jedoch', 'used to introduce a contrasting statement'], ['therefore', 'deshalb', 'for that reason'],
    ['because', 'weil', 'for the reason that'], ['in addition', 'zusätzlich', 'used to add another point'],
    ['on the other hand', 'andererseits', 'used to present a different view'], ['previously', 'zuvor', 'at an earlier time'],
    ['the day before', 'am Tag zuvor', 'the previous day'], ['the following day', 'am folgenden Tag', 'the next day from a past viewpoint'],
  ]),
]
