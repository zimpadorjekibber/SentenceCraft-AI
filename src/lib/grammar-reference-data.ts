// src/lib/grammar-reference-data.ts
// Grammar Reference: Definitions and Types of all 8 Parts of Speech

export interface PosType {
  name: string;
  nameHindi: string;
  description: string;
  descriptionHindi: string;
  examples: string;
}

export interface GrammarPosTopic {
  id: string;
  name: string;
  nameHindi: string;
  emoji: string;
  definition: string;
  definitionHindi: string;
  color: string;        // Tailwind bg class for card
  borderColor: string;  // Tailwind border class
  textColor: string;    // Tailwind text class
  types: PosType[];
}

export const GRAMMAR_REFERENCE_DATA: GrammarPosTopic[] = [
  {
    id: "noun",
    name: "Noun",
    nameHindi: "संज्ञा",
    emoji: "📦",
    definition: "A noun is a word that names a person, place, thing, or idea.",
    definitionHindi: "संज्ञा वह शब्द है जो किसी व्यक्ति, स्थान, वस्तु या भाव का नाम बताता है।",
    color: "bg-blue-500 dark:bg-blue-600",
    borderColor: "border-blue-500",
    textColor: "text-blue-700 dark:text-blue-300",
    types: [
      {
        name: "Proper Noun",
        nameHindi: "व्यक्तिवाचक संज्ञा",
        description: "Names a specific person, place, or thing. Always capitalized.",
        descriptionHindi: "किसी विशेष व्यक्ति, स्थान या वस्तु का नाम।",
        examples: "India, Ram, Taj Mahal, Monday",
      },
      {
        name: "Common Noun",
        nameHindi: "जातिवाचक संज्ञा",
        description: "Names a general person, place, or thing.",
        descriptionHindi: "किसी जाति या वर्ग का सामान्य नाम।",
        examples: "boy, city, dog, book, teacher",
      },
      {
        name: "Collective Noun",
        nameHindi: "समूहवाचक संज्ञा",
        description: "Names a group or collection of people/things.",
        descriptionHindi: "व्यक्तियों या वस्तुओं के समूह का नाम।",
        examples: "team, family, flock, army, class",
      },
      {
        name: "Material Noun",
        nameHindi: "द्रव्यवाचक संज्ञा",
        description: "Names a material or substance that things are made of.",
        descriptionHindi: "उस पदार्थ का नाम जिससे चीज़ें बनती हैं।",
        examples: "gold, iron, water, wood, rice",
      },
      {
        name: "Abstract Noun",
        nameHindi: "भाववाचक संज्ञा",
        description: "Names an idea, feeling, quality, or state that cannot be touched.",
        descriptionHindi: "जिसे छू नहीं सकते — भाव, गुण, या अवस्था का नाम।",
        examples: "love, happiness, courage, freedom, childhood",
      },
    ],
  },
  {
    id: "pronoun",
    name: "Pronoun",
    nameHindi: "सर्वनाम",
    emoji: "👤",
    definition: "A pronoun is a word used in place of a noun to avoid repetition.",
    definitionHindi: "सर्वनाम वह शब्द है जो संज्ञा के स्थान पर प्रयोग होता है।",
    color: "bg-purple-500 dark:bg-purple-600",
    borderColor: "border-purple-500",
    textColor: "text-purple-700 dark:text-purple-300",
    types: [
      {
        name: "Personal Pronoun",
        nameHindi: "पुरुषवाचक सर्वनाम",
        description: "Refers to specific people or things.",
        descriptionHindi: "किसी विशेष व्यक्ति या वस्तु की ओर संकेत करता है।",
        examples: "I, you, he, she, it, we, they",
      },
      {
        name: "Possessive Pronoun",
        nameHindi: "अधिकारवाचक सर्वनाम",
        description: "Shows ownership or possession.",
        descriptionHindi: "अधिकार या स्वामित्व बताता है।",
        examples: "mine, yours, his, hers, ours, theirs",
      },
      {
        name: "Reflexive Pronoun",
        nameHindi: "निजवाचक सर्वनाम",
        description: "Refers back to the subject of the sentence.",
        descriptionHindi: "जब कर्ता खुद पर क्रिया करता है।",
        examples: "myself, yourself, himself, herself, ourselves",
      },
      {
        name: "Demonstrative Pronoun",
        nameHindi: "संकेतवाचक सर्वनाम",
        description: "Points to a specific person or thing.",
        descriptionHindi: "किसी विशेष व्यक्ति या वस्तु की ओर इशारा करता है।",
        examples: "this, that, these, those",
      },
      {
        name: "Interrogative Pronoun",
        nameHindi: "प्रश्नवाचक सर्वनाम",
        description: "Used to ask questions.",
        descriptionHindi: "प्रश्न पूछने के लिए प्रयोग होता है।",
        examples: "who, whom, whose, which, what",
      },
      {
        name: "Relative Pronoun",
        nameHindi: "संबंधवाचक सर्वनाम",
        description: "Connects a clause to a noun it refers to.",
        descriptionHindi: "दो वाक्यों को जोड़ता है और संज्ञा से संबंध बताता है।",
        examples: "who, whom, whose, which, that",
      },
      {
        name: "Indefinite Pronoun",
        nameHindi: "अनिश्चयवाचक सर्वनाम",
        description: "Refers to non-specific people or things.",
        descriptionHindi: "किसी अनिश्चित व्यक्ति या वस्तु के लिए।",
        examples: "someone, anyone, everyone, nobody, each",
      },
    ],
  },
  {
    id: "verb",
    name: "Verb",
    nameHindi: "क्रिया",
    emoji: "⚡",
    definition: "A verb is a word that shows an action, state, or occurrence.",
    definitionHindi: "क्रिया वह शब्द है जो किसी काम का होना या करना बताता है।",
    color: "bg-red-500 dark:bg-red-600",
    borderColor: "border-red-500",
    textColor: "text-red-700 dark:text-red-300",
    types: [
      {
        name: "Transitive Verb",
        nameHindi: "सकर्मक क्रिया",
        description: "Needs an object to complete the meaning. (What? / Whom?)",
        descriptionHindi: "जिसे पूरा अर्थ देने के लिए कर्म (object) चाहिए।",
        examples: "eat (an apple), read (a book), play (cricket)",
      },
      {
        name: "Intransitive Verb",
        nameHindi: "अकर्मक क्रिया",
        description: "Does NOT need an object. The action is complete by itself.",
        descriptionHindi: "जिसे कर्म की ज़रूरत नहीं — क्रिया अपने आप पूरी है।",
        examples: "sleep, run, laugh, cry, go, sit",
      },
      {
        name: "Auxiliary (Helping) Verb",
        nameHindi: "सहायक क्रिया",
        description: "Helps the main verb to form tenses, questions, or negatives.",
        descriptionHindi: "मुख्य क्रिया की मदद करती है — Tense, प्रश्न या नकारात्मक बनाने में।",
        examples: "is, am, are, was, were, has, have, had, do, does, did",
      },
      {
        name: "Modal Verb",
        nameHindi: "विधि सूचक क्रिया",
        description: "Shows ability, possibility, permission, or obligation.",
        descriptionHindi: "योग्यता, संभावना, अनुमति या बाध्यता बताती है।",
        examples: "can, could, may, might, shall, should, will, would, must",
      },
    ],
  },
  {
    id: "adjective",
    name: "Adjective",
    nameHindi: "विशेषण",
    emoji: "🎨",
    definition: "An adjective is a word that describes or modifies a noun or pronoun.",
    definitionHindi: "विशेषण वह शब्द है जो संज्ञा या सर्वनाम की विशेषता बताता है।",
    color: "bg-emerald-500 dark:bg-emerald-600",
    borderColor: "border-emerald-500",
    textColor: "text-emerald-700 dark:text-emerald-300",
    types: [
      {
        name: "Adjective of Quality",
        nameHindi: "गुणवाचक विशेषण",
        description: "Describes the quality or kind of a noun. (How is it?)",
        descriptionHindi: "संज्ञा का गुण, दोष या स्वभाव बताता है।",
        examples: "good, beautiful, tall, brave, kind, lazy",
      },
      {
        name: "Adjective of Quantity",
        nameHindi: "परिमाणवाचक विशेषण",
        description: "Shows how much of a thing. (How much?)",
        descriptionHindi: "कितनी मात्रा है, यह बताता है।",
        examples: "some, much, little, enough, whole, half",
      },
      {
        name: "Adjective of Number",
        nameHindi: "संख्यावाचक विशेषण",
        description: "Shows how many or in what order. (How many?)",
        descriptionHindi: "कितने या किस क्रम में — यह बताता है।",
        examples: "one, two, first, second, few, many, several",
      },
      {
        name: "Demonstrative Adjective",
        nameHindi: "संकेतवाचक विशेषण",
        description: "Points out which noun is meant.",
        descriptionHindi: "किस संज्ञा की बात हो रही है — यह इशारा करता है।",
        examples: "this book, that pen, these boys, those girls",
      },
      {
        name: "Interrogative Adjective",
        nameHindi: "प्रश्नवाचक विशेषण",
        description: "Used with a noun to ask a question.",
        descriptionHindi: "संज्ञा के साथ प्रश्न पूछने के लिए।",
        examples: "which book?, what color?, whose pen?",
      },
    ],
  },
  {
    id: "adverb",
    name: "Adverb",
    nameHindi: "क्रिया विशेषण",
    emoji: "🏃",
    definition: "An adverb modifies a verb, adjective, or another adverb. It tells how, when, where, or how much.",
    definitionHindi: "क्रिया विशेषण क्रिया, विशेषण या अन्य क्रिया विशेषण की विशेषता बताता है।",
    color: "bg-amber-500 dark:bg-amber-600",
    borderColor: "border-amber-500",
    textColor: "text-amber-700 dark:text-amber-300",
    types: [
      {
        name: "Adverb of Time",
        nameHindi: "कालवाचक क्रिया विशेषण",
        description: "Tells WHEN an action happens.",
        descriptionHindi: "क्रिया कब होती है — यह बताता है।",
        examples: "now, today, yesterday, soon, already, yet",
      },
      {
        name: "Adverb of Place",
        nameHindi: "स्थानवाचक क्रिया विशेषण",
        description: "Tells WHERE an action happens.",
        descriptionHindi: "क्रिया कहाँ होती है — यह बताता है।",
        examples: "here, there, everywhere, inside, outside, above",
      },
      {
        name: "Adverb of Manner",
        nameHindi: "रीतिवाचक क्रिया विशेषण",
        description: "Tells HOW an action is done.",
        descriptionHindi: "क्रिया कैसे होती है — यह बताता है।",
        examples: "slowly, quickly, carefully, loudly, happily",
      },
      {
        name: "Adverb of Frequency",
        nameHindi: "आवृत्तिवाचक क्रिया विशेषण",
        description: "Tells HOW OFTEN an action happens.",
        descriptionHindi: "क्रिया कितनी बार होती है — यह बताता है।",
        examples: "always, never, often, sometimes, usually, rarely",
      },
      {
        name: "Adverb of Degree",
        nameHindi: "परिमाणवाचक क्रिया विशेषण",
        description: "Tells HOW MUCH or to what extent.",
        descriptionHindi: "कितना या किस हद तक — यह बताता है।",
        examples: "very, too, quite, almost, enough, extremely",
      },
    ],
  },
  {
    id: "preposition",
    name: "Preposition",
    nameHindi: "पूर्वसर्ग",
    emoji: "📍",
    definition: "A preposition shows the relationship of a noun/pronoun to another word in the sentence.",
    definitionHindi: "पूर्वसर्ग संज्ञा/सर्वनाम का वाक्य के अन्य शब्दों से संबंध बताता है।",
    color: "bg-rose-500 dark:bg-rose-600",
    borderColor: "border-rose-500",
    textColor: "text-rose-700 dark:text-rose-300",
    types: [
      {
        name: "Preposition of Time",
        nameHindi: "समय का पूर्वसर्ग",
        description: "Shows WHEN something happens.",
        descriptionHindi: "समय बताता है — कब?",
        examples: "at 5 PM, on Monday, in March, during summer, since 2020",
      },
      {
        name: "Preposition of Place",
        nameHindi: "स्थान का पूर्वसर्ग",
        description: "Shows WHERE something is located.",
        descriptionHindi: "स्थान बताता है — कहाँ?",
        examples: "at school, on the table, in the box, under the bed",
      },
      {
        name: "Preposition of Direction",
        nameHindi: "दिशा का पूर्वसर्ग",
        description: "Shows movement towards a direction.",
        descriptionHindi: "दिशा या गति बताता है — किधर?",
        examples: "to the park, into the room, through the tunnel, across the river",
      },
      {
        name: "Preposition of Agent/Instrument",
        nameHindi: "कर्ता/साधन का पूर्वसर्ग",
        description: "Shows by whom or with what an action is done.",
        descriptionHindi: "किसके द्वारा या किससे — यह बताता है।",
        examples: "by the teacher, with a pen, by hand",
      },
    ],
  },
  {
    id: "conjunction",
    name: "Conjunction",
    nameHindi: "समुच्चयबोधक",
    emoji: "🔗",
    definition: "A conjunction joins words, phrases, or clauses together.",
    definitionHindi: "समुच्चयबोधक दो शब्दों, वाक्यांशों या वाक्यों को जोड़ता है।",
    color: "bg-teal-500 dark:bg-teal-600",
    borderColor: "border-teal-500",
    textColor: "text-teal-700 dark:text-teal-300",
    types: [
      {
        name: "Coordinating Conjunction",
        nameHindi: "समानाधिकरण समुच्चयबोधक",
        description: "Joins equal parts (word + word, clause + clause). Remember: FANBOYS.",
        descriptionHindi: "दो समान भागों को जोड़ता है। याद रखें: FANBOYS",
        examples: "for, and, nor, but, or, yet, so (FANBOYS)",
      },
      {
        name: "Subordinating Conjunction",
        nameHindi: "व्यधिकरण समुच्चयबोधक",
        description: "Joins a dependent clause to an independent clause.",
        descriptionHindi: "एक आश्रित उपवाक्य को मुख्य वाक्य से जोड़ता है।",
        examples: "because, although, if, when, while, since, until, after",
      },
      {
        name: "Correlative Conjunction",
        nameHindi: "सहसंबंधी समुच्चयबोधक",
        description: "Work in pairs to join equal parts.",
        descriptionHindi: "जोड़े में काम करते हैं।",
        examples: "either...or, neither...nor, both...and, not only...but also",
      },
    ],
  },
  {
    id: "interjection",
    name: "Interjection",
    nameHindi: "विस्मयादिबोधक",
    emoji: "😲",
    definition: "An interjection is a word that expresses a sudden feeling or emotion.",
    definitionHindi: "विस्मयादिबोधक वह शब्द है जो अचानक भावना या संवेग को व्यक्त करता है।",
    color: "bg-pink-500 dark:bg-pink-600",
    borderColor: "border-pink-500",
    textColor: "text-pink-700 dark:text-pink-300",
    types: [
      {
        name: "Joy / खुशी",
        nameHindi: "खुशी का विस्मयादिबोधक",
        description: "Expresses happiness or excitement.",
        descriptionHindi: "खुशी या उत्साह व्यक्त करता है।",
        examples: "Hurray! Wow! Yippee! Bravo!",
      },
      {
        name: "Sorrow / दुख",
        nameHindi: "दुख का विस्मयादिबोधक",
        description: "Expresses sadness or grief.",
        descriptionHindi: "दुख या शोक व्यक्त करता है।",
        examples: "Alas! Oh no! Ouch!",
      },
      {
        name: "Surprise / आश्चर्य",
        nameHindi: "आश्चर्य का विस्मयादिबोधक",
        description: "Expresses surprise or wonder.",
        descriptionHindi: "आश्चर्य या अचंभा व्यक्त करता है।",
        examples: "Oh! What! Really! Gosh!",
      },
      {
        name: "Greeting / अभिवादन",
        nameHindi: "अभिवादन का विस्मयादिबोधक",
        description: "Used for greeting or calling attention.",
        descriptionHindi: "अभिवादन या ध्यान आकर्षित करने के लिए।",
        examples: "Hello! Hi! Hey! Welcome!",
      },
    ],
  },
];
