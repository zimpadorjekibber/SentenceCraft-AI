// src/lib/native-labels.ts
// Centralized translation map for common UI labels in Hindi and Tibetan

import type { NativeLanguage } from '@/context/language-context';

/** Part of Speech labels used across components */
export const POS_LABELS: Record<string, Record<NativeLanguage, string>> = {
  Noun:         { hi: "संज्ञा",           bo: "མིང་ཚིག" },
  Pronoun:      { hi: "सर्वनाम",          bo: "མིང་ཚབ" },
  Verb:         { hi: "क्रिया",           bo: "བྱ་ཚིག" },
  Adjective:    { hi: "विशेषण",          bo: "རྒྱན་ཚིག" },
  Adverb:       { hi: "क्रियाविशेषण",     bo: "བསྣན་ཚིག" },
  Preposition:  { hi: "सम्बन्धबोधक",     bo: "སྦྱོར་ཚིག" },
  Conjunction:  { hi: "समुच्चयबोधक",     bo: "སྦྲེལ་ཚིག" },
  Determiner:   { hi: "निर्धारक",         bo: "ངེས་ཚིག" },
  Interjection: { hi: "विस्मयादिबोधक",   bo: "ངོ་མཚར་ཚིག" },
  Subject:      { hi: "कर्ता",            bo: "བྱེད་པ་པོ" },
  Object:       { hi: "कर्म",             bo: "ལས་ཡུལ" },
  Auxiliary:    { hi: "सहायक क्रिया",     bo: "གྲོགས་བྱ་ཚིག" },
};

/** Input field labels for the sentence builder form */
export const INPUT_FIELD_LABELS: Record<string, Record<NativeLanguage, string>> = {
  subject:      { hi: "कर्ता",            bo: "བྱེད་པ་པོ" },
  verb:         { hi: "क्रिया",           bo: "བྱ་ཚིག" },
  object:       { hi: "कर्म",             bo: "ལས་ཡུལ" },
  adjective:    { hi: "विशेषण",          bo: "རྒྱན་ཚིག" },
  adverb:       { hi: "क्रियाविशेषण",     bo: "བསྣན་ཚིག" },
  preposition:  { hi: "सम्बन्धबोधक",     bo: "སྦྱོར་ཚིག" },
  conjunction:  { hi: "समुच्चयबोधक",     bo: "སྦྲེལ་ཚིག" },
  determiner:   { hi: "निर्धारक",         bo: "ངེས་ཚིག" },
  interjection: { hi: "विस्मयादिबोधक",   bo: "ངོ་མཚར་ཚིག" },
  otherWords:   { hi: "अन्य शब्द",       bo: "གཞན་ཚིག" },
};

/** Input field descriptions */
export const INPUT_FIELD_DESCRIPTIONS: Record<string, Record<NativeLanguage, string>> = {
  subject:      { hi: "काम करने वाला (Who/What)", bo: "ལས་བྱེད་མཁན། (Who/What)" },
  verb:         { hi: "काम (Action word)",        bo: "བྱ་བ། (Action word)" },
  object:       { hi: "जिस पर काम हो (Receives action)", bo: "ལས་ཀྱི་ཡུལ། (Receives action)" },
  adjective:    { hi: "कैसा/कैसी (Describes noun)", bo: "ཇི་ལྟ་བུ། (Describes noun)" },
  adverb:       { hi: "कैसे/कब/कहाँ (Describes verb)", bo: "ཇི་ལྟར། (Describes verb)" },
  preposition:  { hi: "स्थिति/दिशा (Position word)", bo: "གནས་སྟངས། (Position word)" },
  conjunction:  { hi: "जोड़ने वाला (Joining word)", bo: "སྦྲེལ་བ། (Joining word)" },
  determiner:   { hi: "a, an, the, this, that",    bo: "a, an, the, this, that" },
  interjection: { hi: "भावना (Emotion word)",      bo: "ཚོར་བ། (Emotion word)" },
  otherWords:   { hi: "बाकी शब्द जो ऊपर fit न हों", bo: "གོང་གི་ནང་མ་ཚུད་པའི་ཚིག" },
};

/** Grammar type labels (Affirmative, Negative, etc.) */
export const GRAMMAR_TYPE_LABELS_NATIVE: Record<string, Record<NativeLanguage, string>> = {
  affirmative:            { hi: "सकारात्मक",           bo: "ཡིན་པ" },
  negative:               { hi: "नकारात्मक",           bo: "མིན་པ" },
  interrogative:          { hi: "प्रश्नवाचक",          bo: "དྲི་བ" },
  negative_interrogative: { hi: "नकारात्मक प्रश्नवाचक", bo: "མིན་པའི་དྲི་བ" },
};

/** Tense suffix identifiers for each tense (पहचान / ངོས་འཛིན) */
export const TENSE_NATIVE_SUFFIXES: Record<string, Record<NativeLanguage, string>> = {
  "Present Indefinite":          { hi: "ता है, ती है, ते हैं",                        bo: "གི་ཡོད, ཀྱི་ཡོད, ཡིན" },
  "Present Continuous":          { hi: "रहा है, रही है, रहे हैं, रहा हूँ",              bo: "བཞིན་པ་ཡིན, བཞིན་ཡོད" },
  "Present Perfect":             { hi: "चुका है, चुकी है, चुके हैं, या है, यी है, ये हैं", bo: "ཟིན་ཡོད, ཟིན་པ་ཡིན" },
  "Present Perfect Continuous":  { hi: "से रहा है, से रही है, से रहे हैं",               bo: "ནས་བཞིན་པ་ཡིན" },
  "Past Indefinite":             { hi: "ता था, ती थी, ते थे, या, यी, ये",              bo: "པ་རེད, བྱུང" },
  "Past Continuous":             { hi: "रहा था, रही थी, रहे थे",                      bo: "བཞིན་པ་ཡིན་པ་རེད" },
  "Past Perfect":                { hi: "चुका था, चुकी थी, चुके थे, या था, यी थी, ये थे", bo: "ཟིན་པ་རེད, ཟིན་བྱུང" },
  "Past Perfect Continuous":     { hi: "से रहा था, से रही थी, से रहे थे",               bo: "ནས་བཞིན་པ་ཡིན་པ་རེད" },
  "Future Indefinite":           { hi: "गा, गी, गे",                                 bo: "གི་རེད, ཡིན" },
  "Future Continuous":           { hi: "रहा होगा, रही होगी, रहे होंगे",                 bo: "བཞིན་པ་ཡིན་གི་རེད" },
  "Future Perfect":              { hi: "चुका होगा, चुकी होगी, चुके होंगे",               bo: "ཟིན་ཡོང་གི་རེད" },
  "Future Perfect Continuous":   { hi: "से रहा होगा, से रही होगी, से रहे होंगे",          bo: "ནས་བཞིན་པ་ཡིན་གི་རེད" },
};

/** Tense time tips (educational notes about when to use time references) */
export const TENSE_TIME_TIPS_NATIVE: Record<string, { label: string; tip: string; nativeTip: Record<NativeLanguage, string> }> = {
  "Present Perfect Continuous": {
    label: "Time Reference Required",
    tip: "This tense MUST have a time reference: use 'since' (point in time) or 'for' (duration).",
    nativeTip: {
      hi: "इस tense में 'since' (समय बिंदु, जैसे: since morning) या 'for' (अवधि, जैसे: for 2 hours) लगाना ज़रूरी है।",
      bo: "འདི་ནང་ 'since' (དུས་ཚོད་ཀྱི་ཚེག་མ) དང་ 'for' (དུས་ཡུན) བེད་སྤྱོད་བྱེད་དགོས།",
    },
  },
  "Past Perfect Continuous": {
    label: "Time Reference Required",
    tip: "This tense MUST have a time reference: use 'since' or 'for' to show duration.",
    nativeTip: {
      hi: "इस tense में 'since' या 'for' से समय अवधि बतानी ज़रूरी है। जैसे: since childhood, for three years.",
      bo: "འདི་ནང་ 'since' དང་ 'for' བེད་སྤྱོད་བྱས་ནས་དུས་ཡུན་བསྟན་དགོས།",
    },
  },
  "Future Perfect Continuous": {
    label: "Time Reference Required",
    tip: "This tense MUST have a time duration with a deadline: use 'for...by...'.",
    nativeTip: {
      hi: "इस tense में 'for...by...' pattern ज़रूरी है। जैसे: for two hours by evening.",
      bo: "འདི་ནང་ 'for...by...' རྣམ་པ་བེད་སྤྱོད་བྱེད་དགོས།",
    },
  },
  "Present Perfect": {
    label: "Time Tip",
    tip: "Often uses: since, for, already, just, yet, ever, never.",
    nativeTip: {
      hi: "अक्सर since, for, already, just, yet, ever, never जैसे शब्दों के साथ आता है।",
      bo: "since, for, already, just, yet, ever, never སོགས་ཀྱི་ཚིག་དང་མཉམ་དུ་བེད་སྤྱོད་བྱེད།",
    },
  },
  "Past Perfect": {
    label: "Time Tip",
    tip: "Often uses: before, by the time, already, after — to show sequence of past events.",
    nativeTip: {
      hi: "बीते हुए कामों का क्रम बताने के लिए before, by the time, already, after का उपयोग होता है।",
      bo: "before, by the time, already, after བེད་སྤྱོད་བྱས་ནས་སྔོན་མའི་བྱ་བའི་གོ་རིམ་བསྟན།",
    },
  },
  "Future Perfect": {
    label: "Time Tip",
    tip: "Often uses: by + time (by tomorrow, by next week) to show a deadline.",
    nativeTip: {
      hi: "किसी deadline तक काम पूरा होने के लिए 'by' का उपयोग होता है। जैसे: by tomorrow, by next month.",
      bo: "'by' བེད་སྤྱོད་བྱས་ནས་དུས་ཚོད་ཀྱི་མཐའ་མ་བསྟན། དཔེར་ན: by tomorrow.",
    },
  },
};

/** Form helper text */
export const FORM_HELPER_TEXT: Record<NativeLanguage, string> = {
  hi: "Fields marked with * are required. Optional fields छोड़ सकते हैं।",
  bo: "* ཡོད་པའི་ས་ཆ་བེད་སྤྱོད་བྱེད་དགོས། གཞན་པ་བསྐྱུར་ཆོག",
};

/** Spoken mode labels */
export const SPOKEN_LABEL: Record<NativeLanguage, string> = {
  hi: "बोलचाल",
  bo: "སྐད་ཆ",
};

/** "What changed" label for spoken mode comparison */
export const SPOKEN_DIFF_LABEL: Record<NativeLanguage, string> = {
  hi: "क्या बदला?",
  bo: "ཅི་ཞིག་བསྒྱུར་བ།",
};

/** Language display info */
export const LANGUAGE_OPTIONS: Array<{ code: NativeLanguage; name: string; nativeName: string }> = [
  { code: 'hi', name: 'Hindi',   nativeName: 'हिन्दी' },
  { code: 'bo', name: 'Tibetan', nativeName: 'བོད་སྐད' },
];
