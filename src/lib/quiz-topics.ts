// ─── Quiz Topics — Single Source of Truth ─────────────────────
// 12 categories, 47+ topics covering ALL English grammar

export type QuizQuestionType =
  | 'fill_blank'
  | 'identify_tense'
  | 'identify_voice'
  | 'identify_speech'
  | 'identify_modal'
  | 'identify_type'
  | 'correct_error'
  | 'translate'
  | 'transform';

export interface QuizTopic {
  id: string;
  label: string;
  labelHindi: string;
  labelTibetan?: string;
  questionTypes: QuizQuestionType[];
  promptTemplate: (difficulty: string, count: number) => string;
}

export interface QuizCategory {
  id: string;
  label: string;
  labelHindi: string;
  labelTibetan?: string;
  icon: string; // lucide icon name
  color: string; // tailwind color class for badge
  topics: QuizTopic[];
}

// ─── Shared base prompt builder ────────────────────────────────
function buildBasePrompt(
  topicName: string,
  difficulty: string,
  count: number,
  questionTypeInstructions: string,
  extraRules: string = ''
): string {
  const difficultyGuide: Record<string, string> = {
    easy: 'Use simple, common vocabulary. Short sentences. Clear, obvious answers.',
    medium: 'Use everyday vocabulary. Medium-length sentences. Some distractors in options.',
    hard: 'Use varied vocabulary. Longer sentences. Tricky distractors that test deep understanding.',
  };

  return `You are an expert English grammar quiz master for Indian students learning English.

Generate exactly ${count} quiz questions to test knowledge of "${topicName}".
Difficulty: ${difficulty} — ${difficultyGuide[difficulty] || difficultyGuide.medium}

Mix these question types:
${questionTypeInstructions}

For each question provide:
- "id": sequential number starting from 1
- "type": one of the question types listed above
- "questionText": the question in English
- "questionHindi": Hindi version/hint of the question (helpful for Indian students)
- "options": array of exactly 4 choices
- "correctAnswer": the exact string from options that is correct
- "explanation": brief English explanation of WHY this is correct
- "explanationHindi": same explanation in simple Hindi

IMPORTANT:
- correctAnswer MUST exactly match one of the options
- All questions must specifically test "${topicName}" knowledge
- Include Hindi translations/hints for every question
${extraRules}

Respond with ONLY a JSON object: { "questions": [ ... ] }`;
}

// ═══════════════════════════════════════════════════════════════
// CATEGORY 1: TENSES
// ═══════════════════════════════════════════════════════════════

const TENSE_NAMES = [
  { id: 'present_indefinite', label: 'Present Indefinite', labelHindi: 'सामान्य वर्तमान' },
  { id: 'present_continuous', label: 'Present Continuous', labelHindi: 'अपूर्ण वर्तमान' },
  { id: 'present_perfect', label: 'Present Perfect', labelHindi: 'पूर्ण वर्तमान' },
  { id: 'present_perfect_continuous', label: 'Present Perfect Continuous', labelHindi: 'पूर्ण अपूर्ण वर्तमान' },
  { id: 'past_indefinite', label: 'Past Indefinite', labelHindi: 'सामान्य भूतकाल' },
  { id: 'past_continuous', label: 'Past Continuous', labelHindi: 'अपूर्ण भूतकाल' },
  { id: 'past_perfect', label: 'Past Perfect', labelHindi: 'पूर्ण भूतकाल' },
  { id: 'past_perfect_continuous', label: 'Past Perfect Continuous', labelHindi: 'पूर्ण अपूर्ण भूतकाल' },
  { id: 'future_indefinite', label: 'Future Indefinite', labelHindi: 'सामान्य भविष्य' },
  { id: 'future_continuous', label: 'Future Continuous', labelHindi: 'अपूर्ण भविष्य' },
  { id: 'future_perfect', label: 'Future Perfect', labelHindi: 'पूर्ण भविष्य' },
  { id: 'future_perfect_continuous', label: 'Future Perfect Continuous', labelHindi: 'पूर्ण अपूर्ण भविष्य' },
];

const tenseQuestionTypes = `1. "fill_blank" — Fill in the blank with correct verb form. Example: "She ___ (play) cricket every day." Answer: "plays"
2. "identify_tense" — Give a sentence and ask which tense it is. Provide 4 tense options.
3. "correct_error" — Give a sentence with a grammar error. Ask to find the correct version from options.
4. "translate" — Give a Hindi sentence and ask for the correct English translation from 4 options.`;

const tensesCategory: QuizCategory = {
  id: 'tenses',
  label: 'Tenses',
  labelHindi: 'काल',
  labelTibetan: 'དུས',
  icon: 'Clock',
  color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  topics: TENSE_NAMES.map(t => ({
    id: t.id,
    label: t.label,
    labelHindi: t.labelHindi,
    questionTypes: ['fill_blank', 'identify_tense', 'correct_error', 'translate'] as QuizQuestionType[],
    promptTemplate: (difficulty: string, count: number) =>
      buildBasePrompt(t.label + ' Tense', difficulty, count, tenseQuestionTypes,
        `- For "identify_tense" type, all 4 options should be different tense names`),
  })),
};

// ═══════════════════════════════════════════════════════════════
// CATEGORY 2: MODALS
// ═══════════════════════════════════════════════════════════════

const MODAL_NAMES = [
  { id: 'can_could', label: 'Can / Could', labelHindi: 'सकना (योग्यता)' },
  { id: 'may_might', label: 'May / Might', labelHindi: 'संभावना / अनुमति' },
  { id: 'must_have_to', label: 'Must / Have to', labelHindi: 'आवश्यकता / बाध्यता' },
  { id: 'should_ought_to', label: 'Should / Ought to', labelHindi: 'चाहिए (सलाह)' },
  { id: 'will_would', label: 'Will / Would', labelHindi: 'इच्छा / विनम्रता' },
  { id: 'shall', label: 'Shall', labelHindi: 'प्रस्ताव / निर्णय' },
];

const modalQuestionTypes = `1. "fill_blank" — Fill in the blank with the correct modal verb. Example: "You ___ not park here." Answer: "must"
2. "identify_modal" — Give a sentence and ask which modal verb is used and why. Provide 4 options.
3. "correct_error" — Give a sentence with wrong modal usage. Ask to pick the correct version.
4. "translate" — Give a Hindi sentence and ask for the correct English translation using modals.`;

const modalsCategory: QuizCategory = {
  id: 'modals',
  label: 'Modals',
  labelHindi: 'सहायक क्रियाएं',
  labelTibetan: 'རོགས་བྱ་ཚིག',
  icon: 'KeyRound',
  color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  topics: MODAL_NAMES.map(m => ({
    id: m.id,
    label: m.label,
    labelHindi: m.labelHindi,
    questionTypes: ['fill_blank', 'identify_modal', 'correct_error', 'translate'] as QuizQuestionType[],
    promptTemplate: (difficulty: string, count: number) =>
      buildBasePrompt(`Modal Verbs: ${m.label}`, difficulty, count, modalQuestionTypes,
        `- Focus specifically on "${m.label}" modal usage
- For "identify_modal" type, options should explain WHY a particular modal is used (ability, permission, obligation, etc.)`),
  })),
};

// ═══════════════════════════════════════════════════════════════
// CATEGORY 3: ACTIVE & PASSIVE VOICE
// ═══════════════════════════════════════════════════════════════

const VOICE_TOPICS = [
  { id: 'active_to_passive', label: 'Active → Passive', labelHindi: 'कर्तृवाच्य → कर्मवाच्य' },
  { id: 'passive_to_active', label: 'Passive → Active', labelHindi: 'कर्मवाच्य → कर्तृवाच्य' },
  { id: 'voice_mixed', label: 'Mixed Voice Practice', labelHindi: 'मिश्रित वाच्य अभ्यास' },
];

const voiceQuestionTypes = `1. "identify_voice" — Give a sentence and ask whether it is Active or Passive voice. Provide 4 options with reasoning.
2. "transform" — Give an Active voice sentence and ask for its Passive form (or vice versa). Provide 4 options.
3. "correct_error" — Give a sentence with incorrect voice transformation. Ask to pick the correct version.
4. "fill_blank" — Give a sentence with blank in the verb form. Ask to fill with correct active/passive form.`;

const voiceCategory: QuizCategory = {
  id: 'voice',
  label: 'Active & Passive Voice',
  labelHindi: 'वाच्य',
  labelTibetan: 'སྒྲ',
  icon: 'ArrowLeftRight',
  color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  topics: VOICE_TOPICS.map(v => ({
    id: v.id,
    label: v.label,
    labelHindi: v.labelHindi,
    questionTypes: ['identify_voice', 'transform', 'correct_error', 'fill_blank'] as QuizQuestionType[],
    promptTemplate: (difficulty: string, count: number) =>
      buildBasePrompt(`Active & Passive Voice: ${v.label}`, difficulty, count, voiceQuestionTypes,
        `- Focus on "${v.label}" transformations
- Include voice changes across different tenses
- Show the helping verb (be-form) changes clearly in explanations`),
  })),
};

// ═══════════════════════════════════════════════════════════════
// CATEGORY 4: DIRECT & INDIRECT SPEECH
// ═══════════════════════════════════════════════════════════════

const SPEECH_TOPICS = [
  { id: 'direct_to_indirect', label: 'Direct → Indirect', labelHindi: 'प्रत्यक्ष → अप्रत्यक्ष कथन' },
  { id: 'indirect_to_direct', label: 'Indirect → Direct', labelHindi: 'अप्रत्यक्ष → प्रत्यक्ष कथन' },
  { id: 'speech_mixed', label: 'Mixed Speech Practice', labelHindi: 'मिश्रित कथन अभ्यास' },
];

const speechQuestionTypes = `1. "identify_speech" — Give a sentence and ask whether it is Direct or Indirect speech. Provide 4 options with reasoning.
2. "transform" — Give a Direct speech sentence and ask for its Indirect form (or vice versa). Provide 4 options.
3. "correct_error" — Give a sentence with incorrect speech conversion (wrong tense change, pronoun error). Ask to pick correct version.
4. "fill_blank" — Give a partially converted sentence with blank. Ask to fill correctly.`;

const speechCategory: QuizCategory = {
  id: 'speech',
  label: 'Direct & Indirect Speech',
  labelHindi: 'कथन',
  labelTibetan: 'བཤད་སྟངས',
  icon: 'MessageSquareQuote',
  color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  topics: SPEECH_TOPICS.map(s => ({
    id: s.id,
    label: s.label,
    labelHindi: s.labelHindi,
    questionTypes: ['identify_speech', 'transform', 'correct_error', 'fill_blank'] as QuizQuestionType[],
    promptTemplate: (difficulty: string, count: number) =>
      buildBasePrompt(`Direct & Indirect Speech: ${s.label}`, difficulty, count, speechQuestionTypes,
        `- Focus on "${s.label}" conversions
- Include tense changes (said → had said), pronoun changes, time/place word changes
- Show reporting verb changes in explanations`),
  })),
};

// ═══════════════════════════════════════════════════════════════
// CATEGORY 5: WH-QUESTIONS
// ═══════════════════════════════════════════════════════════════

const WH_TOPICS = [
  { id: 'what_which', label: 'What / Which', labelHindi: 'क्या / कौन सा' },
  { id: 'who_whom_whose', label: 'Who / Whom / Whose', labelHindi: 'कौन / किसको / किसका' },
  { id: 'where_when', label: 'Where / When', labelHindi: 'कहाँ / कब' },
  { id: 'why_how', label: 'Why / How', labelHindi: 'क्यों / कैसे' },
  { id: 'yes_no_questions', label: 'Yes/No Questions', labelHindi: 'हाँ/नहीं प्रश्न' },
];

const whQuestionTypes = `1. "fill_blank" — Fill in the blank with the correct WH-word. Example: "___ is your name?" Answer: "What"
2. "identify_type" — Give a question and ask which type of WH-question it is. Provide 4 options.
3. "correct_error" — Give a question with incorrect WH-word or word order. Ask to pick the correct version.
4. "translate" — Give a Hindi question and ask for the correct English WH-question translation.`;

const whCategory: QuizCategory = {
  id: 'wh_questions',
  label: 'WH-Questions',
  labelHindi: 'प्रश्न वाक्य',
  labelTibetan: 'དྲི་ཚིག',
  icon: 'HelpCircle',
  color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  topics: WH_TOPICS.map(w => ({
    id: w.id,
    label: w.label,
    labelHindi: w.labelHindi,
    questionTypes: ['fill_blank', 'identify_type', 'correct_error', 'translate'] as QuizQuestionType[],
    promptTemplate: (difficulty: string, count: number) =>
      buildBasePrompt(`WH-Questions: ${w.label}`, difficulty, count, whQuestionTypes,
        `- Focus on "${w.label}" question words
- Test correct word order in questions (auxiliary verb placement)
- Include questions in different tenses`),
  })),
};

// ═══════════════════════════════════════════════════════════════
// CATEGORY 6: CONDITIONALS
// ═══════════════════════════════════════════════════════════════

const CONDITIONAL_TOPICS = [
  { id: 'zero_conditional', label: 'Zero Conditional', labelHindi: 'शून्य शर्तसूचक (सत्य/तथ्य)' },
  { id: 'first_conditional', label: 'First Conditional', labelHindi: 'प्रथम शर्तसूचक (संभव)' },
  { id: 'second_conditional', label: 'Second Conditional', labelHindi: 'द्वितीय शर्तसूचक (अवास्तविक)' },
  { id: 'third_conditional', label: 'Third Conditional', labelHindi: 'तृतीय शर्तसूचक (असंभव)' },
];

const conditionalQuestionTypes = `1. "fill_blank" — Fill in the blank with the correct verb form in a conditional sentence. Example: "If it ___ (rain), we will stay home." Answer: "rains"
2. "identify_type" — Give a conditional sentence and ask which type it is (Zero, First, Second, Third). Provide 4 options.
3. "correct_error" — Give a conditional with wrong verb form. Ask to pick the correct version.
4. "translate" — Give a Hindi conditional sentence and ask for the correct English translation.`;

const conditionalsCategory: QuizCategory = {
  id: 'conditionals',
  label: 'Conditionals',
  labelHindi: 'शर्तसूचक वाक्य',
  labelTibetan: 'རྐྱེན་ཅན་ཚིག་གྲུབ',
  icon: 'GitBranch',
  color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  topics: CONDITIONAL_TOPICS.map(c => ({
    id: c.id,
    label: c.label,
    labelHindi: c.labelHindi,
    questionTypes: ['fill_blank', 'identify_type', 'correct_error', 'translate'] as QuizQuestionType[],
    promptTemplate: (difficulty: string, count: number) =>
      buildBasePrompt(`Conditional Sentences: ${c.label}`, difficulty, count, conditionalQuestionTypes,
        `- Focus specifically on "${c.label}" pattern
- Zero: If + present simple, present simple (facts/truth)
- First: If + present simple, will + base verb (real possibility)
- Second: If + past simple, would + base verb (unreal present)
- Third: If + past perfect, would have + past participle (unreal past)
- Explain the if-clause and result-clause verb forms clearly`),
  })),
};

// ═══════════════════════════════════════════════════════════════
// CATEGORY 7: ARTICLES
// ═══════════════════════════════════════════════════════════════

const ARTICLE_TOPICS = [
  { id: 'a_an', label: 'A / An', labelHindi: 'अनिश्चित उपपद' },
  { id: 'the', label: 'The', labelHindi: 'निश्चित उपपद' },
  { id: 'articles_mixed', label: 'Mixed Articles (A/An/The/No Article)', labelHindi: 'मिश्रित उपपद अभ्यास' },
];

const articleQuestionTypes = `1. "fill_blank" — Fill in the blank with the correct article (a, an, the, or no article). Example: "She is ___ engineer." Answer: "an"
2. "correct_error" — Give a sentence with incorrect article usage. Ask to pick the correct version.
3. "identify_type" — Give a sentence and ask why a particular article is used (specific, general, first mention, etc.).`;

const articlesCategory: QuizCategory = {
  id: 'articles',
  label: 'Articles',
  labelHindi: 'उपपद',
  labelTibetan: 'ཁྱད་ཚིག',
  icon: 'FileText',
  color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  topics: ARTICLE_TOPICS.map(a => ({
    id: a.id,
    label: a.label,
    labelHindi: a.labelHindi,
    questionTypes: ['fill_blank', 'correct_error', 'identify_type'] as QuizQuestionType[],
    promptTemplate: (difficulty: string, count: number) =>
      buildBasePrompt(`Articles: ${a.label}`, difficulty, count, articleQuestionTypes,
        `- Focus on "${a.label}" usage rules
- Include tricky cases: uncountable nouns, proper nouns, unique things, first/second mention
- "No article" should be an option where appropriate
- Hindi mein articles nahi hote — explain why English mein zaroori hain`),
  })),
};

// ═══════════════════════════════════════════════════════════════
// CATEGORY 8: PREPOSITIONS
// ═══════════════════════════════════════════════════════════════

const PREPOSITION_TOPICS = [
  { id: 'prep_time', label: 'Prepositions of Time (in/on/at)', labelHindi: 'समय के संबंधवाचक' },
  { id: 'prep_place', label: 'Prepositions of Place (in/on/at)', labelHindi: 'स्थान के संबंधवाचक' },
  { id: 'prep_direction', label: 'Prepositions of Direction (to/from/into)', labelHindi: 'दिशा के संबंधवाचक' },
  { id: 'prep_mixed', label: 'Mixed Prepositions', labelHindi: 'मिश्रित संबंधवाचक' },
];

const prepositionQuestionTypes = `1. "fill_blank" — Fill in the blank with the correct preposition. Example: "I was born ___ 1995." Answer: "in"
2. "correct_error" — Give a sentence with wrong preposition. Ask to pick the correct version.
3. "translate" — Give a Hindi sentence and ask for correct English translation focusing on preposition usage.`;

const prepositionsCategory: QuizCategory = {
  id: 'prepositions',
  label: 'Prepositions',
  labelHindi: 'संबंधवाचक',
  labelTibetan: 'སྔོན་ཚིག',
  icon: 'MapPin',
  color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  topics: PREPOSITION_TOPICS.map(p => ({
    id: p.id,
    label: p.label,
    labelHindi: p.labelHindi,
    questionTypes: ['fill_blank', 'correct_error', 'translate'] as QuizQuestionType[],
    promptTemplate: (difficulty: string, count: number) =>
      buildBasePrompt(`Prepositions: ${p.label}`, difficulty, count, prepositionQuestionTypes,
        `- Focus on "${p.label}" preposition rules
- Time: in (months/years/seasons), on (days/dates), at (exact time)
- Place: in (enclosed spaces), on (surfaces), at (specific points)
- Direction: to (destination), from (origin), into (entering)
- Hindi mein ek hi preposition ke liye English mein alag-alag use hota hai — explain this`),
  })),
};

// ═══════════════════════════════════════════════════════════════
// CATEGORY 9: CONJUNCTIONS
// ═══════════════════════════════════════════════════════════════

const CONJUNCTION_TOPICS = [
  { id: 'coordinating', label: 'Coordinating (and, but, or...)', labelHindi: 'समानाधिकरण (और, लेकिन, या)' },
  { id: 'subordinating', label: 'Subordinating (because, although...)', labelHindi: 'व्यधिकरण (क्योंकि, हालांकि)' },
  { id: 'correlative', label: 'Correlative (either...or, neither...nor)', labelHindi: 'सहसंबंधी (या तो...या, न तो...न)' },
];

const conjunctionQuestionTypes = `1. "fill_blank" — Fill in the blank with the correct conjunction. Example: "She was tired ___ she kept working." Answer: "but"
2. "correct_error" — Give a sentence with wrong conjunction usage. Ask to pick the correct version.
3. "identify_type" — Give a sentence and ask which type of conjunction is used and why.`;

const conjunctionsCategory: QuizCategory = {
  id: 'conjunctions',
  label: 'Conjunctions',
  labelHindi: 'समुच्चयबोधक',
  labelTibetan: 'སྦྲེལ་ཚིག',
  icon: 'Link',
  color: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  topics: CONJUNCTION_TOPICS.map(c => ({
    id: c.id,
    label: c.label,
    labelHindi: c.labelHindi,
    questionTypes: ['fill_blank', 'correct_error', 'identify_type'] as QuizQuestionType[],
    promptTemplate: (difficulty: string, count: number) =>
      buildBasePrompt(`Conjunctions: ${c.label}`, difficulty, count, conjunctionQuestionTypes,
        `- Focus on "${c.label}" conjunctions
- Coordinating: FANBOYS (for, and, nor, but, or, yet, so) — join equal clauses
- Subordinating: because, although, while, if, when, since, until, after, before
- Correlative: either...or, neither...nor, both...and, not only...but also
- Explain when to use comma with conjunctions`),
  })),
};

// ═══════════════════════════════════════════════════════════════
// CATEGORY 10: SUBJECT-VERB AGREEMENT
// ═══════════════════════════════════════════════════════════════

const SVA_TOPICS = [
  { id: 'sva_basic', label: 'Basic SVA Rules', labelHindi: 'बुनियादी कर्ता-क्रिया नियम' },
  { id: 'sva_tricky', label: 'Tricky SVA Cases', labelHindi: 'कठिन कर्ता-क्रिया मामले' },
];

const svaQuestionTypes = `1. "fill_blank" — Fill in the blank with the correct verb form. Example: "The team ___ (play/plays) well." Answer: "plays"
2. "correct_error" — Give a sentence with subject-verb disagreement. Ask to pick the correct version.
3. "identify_type" — Give a sentence and ask which SVA rule applies (collective noun, indefinite pronoun, etc.).`;

const svaCategory: QuizCategory = {
  id: 'subject_verb_agreement',
  label: 'Subject-Verb Agreement',
  labelHindi: 'कर्ता-क्रिया अनुरूपता',
  labelTibetan: 'བྱེད་པ་པོ་བྱ་ཚིག་མཐུན་པ',
  icon: 'Scale',
  color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  topics: SVA_TOPICS.map(s => ({
    id: s.id,
    label: s.label,
    labelHindi: s.labelHindi,
    questionTypes: ['fill_blank', 'correct_error', 'identify_type'] as QuizQuestionType[],
    promptTemplate: (difficulty: string, count: number) =>
      buildBasePrompt(`Subject-Verb Agreement: ${s.label}`, difficulty, count, svaQuestionTypes,
        `- Focus on "${s.label}"
- Basic rules: singular subject → singular verb, plural → plural
- Tricky cases: collective nouns (team, family), indefinite pronouns (everyone, nobody),
  compound subjects (A and B = plural, A or B = nearest), there is/are,
  each/every = singular, uncountable nouns
- Hindi mein verb subject ke gender se match hota hai, English mein number se — highlight this difference`),
  })),
};

// ═══════════════════════════════════════════════════════════════
// CATEGORY 11: PARTS OF SPEECH
// ═══════════════════════════════════════════════════════════════

const POS_TOPICS = [
  { id: 'nouns_pronouns', label: 'Nouns & Pronouns', labelHindi: 'संज्ञा और सर्वनाम' },
  { id: 'verbs_adverbs', label: 'Verbs & Adverbs', labelHindi: 'क्रिया और क्रिया विशेषण' },
  { id: 'adjectives', label: 'Adjectives', labelHindi: 'विशेषण' },
  { id: 'pos_mixed', label: 'All Parts of Speech', labelHindi: 'सभी शब्द भेद' },
];

const posQuestionTypes = `1. "identify_type" — Give a sentence and underline/bold a word. Ask which part of speech it is. Provide 4 options (Noun, Verb, Adjective, Adverb, Pronoun, Preposition, Conjunction, Interjection).
2. "fill_blank" — Give a sentence with a blank. Ask to fill with the correct type of word. Example: "The ___ boy ran fast." (adjective needed) Options: "tall", "quickly", "run", "there"
3. "correct_error" — Give a sentence where wrong part of speech is used. Ask to identify and fix.`;

const posCategory: QuizCategory = {
  id: 'parts_of_speech',
  label: 'Parts of Speech',
  labelHindi: 'शब्द भेद',
  labelTibetan: 'ཚིག་གི་རིགས',
  icon: 'Layers',
  color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  topics: POS_TOPICS.map(p => ({
    id: p.id,
    label: p.label,
    labelHindi: p.labelHindi,
    questionTypes: ['identify_type', 'fill_blank', 'correct_error'] as QuizQuestionType[],
    promptTemplate: (difficulty: string, count: number) =>
      buildBasePrompt(`Parts of Speech: ${p.label}`, difficulty, count, posQuestionTypes,
        `- Focus on "${p.label}"
- Mark the target word clearly in the question using UPPERCASE or quotes
- 8 parts of speech: Noun, Pronoun, Verb, Adverb, Adjective, Preposition, Conjunction, Interjection
- Include words that can be multiple POS depending on context (e.g., "run" can be noun or verb)
- Hindi mein bhi same categories hain — draw parallels`),
  })),
};

// ═══════════════════════════════════════════════════════════════
// CATEGORY 12: PUNCTUATION
// ═══════════════════════════════════════════════════════════════

const PUNCTUATION_TOPICS = [
  { id: 'comma_period', label: 'Comma & Period Rules', labelHindi: 'अल्प विराम और पूर्ण विराम' },
  { id: 'apostrophe_quotation', label: 'Apostrophe & Quotation Marks', labelHindi: 'ऊर्ध्व विराम और उद्धरण चिह्न' },
  { id: 'punctuation_mixed', label: 'All Punctuation', labelHindi: 'सभी विराम चिह्न' },
];

const punctuationQuestionTypes = `1. "correct_error" — Give a sentence with wrong or missing punctuation. Ask to pick the correctly punctuated version.
2. "fill_blank" — Give a sentence with missing punctuation mark. Ask which punctuation goes in the blank.
3. "identify_type" — Give a sentence and ask why a specific punctuation mark is used there. Provide 4 reasoning options.`;

const punctuationCategory: QuizCategory = {
  id: 'punctuation',
  label: 'Punctuation',
  labelHindi: 'विराम चिह्न',
  labelTibetan: 'ཚེག་ཤད',
  icon: 'PenTool',
  color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  topics: PUNCTUATION_TOPICS.map(p => ({
    id: p.id,
    label: p.label,
    labelHindi: p.labelHindi,
    questionTypes: ['correct_error', 'fill_blank', 'identify_type'] as QuizQuestionType[],
    promptTemplate: (difficulty: string, count: number) =>
      buildBasePrompt(`Punctuation: ${p.label}`, difficulty, count, punctuationQuestionTypes,
        `- Focus on "${p.label}" rules
- Comma: lists, compound sentences, introductory phrases, appositives
- Period: end of sentence, abbreviations
- Apostrophe: possession (dog's), contractions (don't)
- Quotation marks: direct speech, titles
- Also cover: semicolon, colon, question mark, exclamation mark
- Hindi mein punctuation rules similar hain but usage thoda different hai`),
  })),
};

// ═══════════════════════════════════════════════════════════════
// EXPORT: ALL CATEGORIES
// ═══════════════════════════════════════════════════════════════

export const QUIZ_CATEGORIES: QuizCategory[] = [
  tensesCategory,
  modalsCategory,
  voiceCategory,
  speechCategory,
  whCategory,
  conditionalsCategory,
  articlesCategory,
  prepositionsCategory,
  conjunctionsCategory,
  svaCategory,
  posCategory,
  punctuationCategory,
];

// Helper: find a topic by category+topic ID
export function findTopic(categoryId: string, topicId: string): QuizTopic | null {
  const cat = QUIZ_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return null;
  return cat.topics.find(t => t.id === topicId) || null;
}

// Helper: find category by ID
export function findCategory(categoryId: string): QuizCategory | null {
  return QUIZ_CATEGORIES.find(c => c.id === categoryId) || null;
}

// Helper: total topic count
export function getTotalTopicCount(): number {
  return QUIZ_CATEGORIES.reduce((sum, cat) => sum + cat.topics.length, 0);
}
