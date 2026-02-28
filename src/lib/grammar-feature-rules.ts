// src/lib/grammar-feature-rules.ts

export const GRAMMAR_FEATURE_RULES: Record<string, string> = {
  "Active and Passive Voice": `
**Active Voice (कर्तृवाच्य):**
- The <pos type="subject">subject</pos> performs the action of the <pos type="verb">verb</pos>.
- Structure: <pos type="subject">Subject</pos> + <pos type="verb">Verb</pos> + <pos type="object">Object</pos>.
- Example: <pos type="subject">The cat</pos> <pos type="verb">chased</pos> <pos type="object">the mouse</pos>.

**Passive Voice (कर्मवाच्य):**
- The <pos type="subject">subject</pos> receives the action of the <pos type="verb">verb</pos>.
- Structure: <pos type="object">Object (of active sentence)</pos> + <pos type="auxiliary">Auxiliary Verb (form of 'to be')</pos> + <pos type="verb_form">Past Participle (V3) of main verb</pos> + <pos type="preposition">by</pos> + <pos type="subject">Subject (of active sentence)</pos>.
- Example: <pos type="subject">The mouse</pos> <pos type="auxiliary">was</pos> <pos type="verb_form">chased</pos> <pos type="preposition">by</pos> <pos type="object">the cat</pos>.

**Key Points for Transformation:**
1. The <pos type="object">object</pos> of the active sentence becomes the <pos type="subject">subject</pos> of the passive sentence.
2. The <pos type="subject">subject</pos> of the active sentence becomes the <pos type="object">object</pos> of the passive sentence (or is sometimes omitted).
3. The <pos type="verb_form">main verb</pos> is changed to its <pos type="verb_form">Past Participle (V3)</pos> form.
4. An appropriate <pos type="auxiliary">auxiliary verb</pos> (is, am, are, was, were, been, being) is used before the <pos type="verb_form">main verb</pos>, according to the tense.
5. The <pos type="preposition">preposition 'by'</pos> is typically used before the new <pos type="object">object</pos> in the passive sentence.
`,
  "Direct and Indirect Speech": `
**Direct Speech (प्रत्यक्ष कथन):**
- Reports the exact words of the speaker.
- Example: He <pos type="verb">said</pos>, <pos type="punctuation_mark">"</pos>I <pos type="auxiliary">am</pos> <pos type="verb_form">going</pos>.<pos type="punctuation_mark">"</pos>

**Indirect Speech (अप्रत्यक्ष कथन):**
- Reports what the speaker said in our own words.
- Example: He <pos type="verb">said</pos> <pos type="conjunction">that</pos> he <pos type="auxiliary">was</pos> <pos type="verb_form">going</pos>.

**Key Changes:**
1. **Reporting Verb:** said to -> told, said -> said.
2. **Tense Change:** Present Simple -> Past Simple, Present Continuous -> Past Continuous, etc.
3. **Pronoun Change:** 'I' changes to 'he/she' based on the speaker.
4. **Time Change:** 'today' -> 'that day', 'now' -> 'then'.
`,
  "Modals": `
**Modal Verbs (सहायक क्रियाएँ):**
Express ability, possibility, permission, or obligation.
- <pos type="auxiliary">Can</pos>: Ability (योग्यता) - I can swim.
- <pos type="auxiliary">Could</pos>: Past ability/Polite request - Could you help me?
- <pos type="auxiliary">May</pos>: Permission/Possibility - May I come in?
- <pos type="auxiliary">Must</pos>: Strong obligation - You must study.
- <pos type="auxiliary">Should</pos>: Advice - You should eat healthy.
`,
  "Questions": `
**Types of Questions:**
1. **Yes/No Questions:** Start with <pos type="auxiliary">auxiliary verbs</pos>.
   - Example: <pos type="auxiliary">Are</pos> you happy?
2. **WH-Questions:** Start with <pos type="other_grammatical_term">What, Why, When, How</pos>, etc.
   - Example: <pos type="other_grammatical_term">Where</pos> <pos type="auxiliary">do</pos> you live?
`,
  "Conditionals": `
**Conditional Sentences (शर्तसूचक वाक्य):**
Used to talk about situations and their results.

1. **Zero Conditional (General Truth):**
   - Structure: If + <pos type="tense_marker">Present Simple</pos>, <pos type="tense_marker">Present Simple</pos>.
   - Example: If you heat ice, it melts.

2. **First Conditional (Real Possibility):**
   - Structure: If + <pos type="tense_marker">Present Simple</pos>, <pos type="auxiliary">will</pos> + <pos type="verb_form">V1</pos>.
   - Example: If it rains, I will stay home.

3. **Second Conditional (Imaginary/Unlikely):**
   - Structure: If + <pos type="tense_marker">Past Simple</pos>, <pos type="auxiliary">would</pos> + <pos type="verb_form">V1</pos>.
   - Example: If I won the lottery, I would buy a car.

4. **Third Conditional (Past Impossible):**
   - Structure: If + <pos type="tense_marker">Past Perfect</pos>, <pos type="auxiliary">would have</pos> + <pos type="verb_form">V3</pos>.
   - Example: If I had studied harder, I would have passed.
`,
  "Articles": `
**Articles (A, An, The):**
Used to define a noun as specific or unspecific.

1. **Indefinite Articles (A, An):**
   - <pos type="determiner">A</pos>: Used before consonant sounds. (e.g., a book, a university)
   - <pos type="determiner">An</pos>: Used before vowel sounds. (e.g., an apple, an hour)

2. **Definite Article (The):**
   - <pos type="determiner">The</pos>: Used for specific things already mentioned or unique things.
   - Example: <pos type="determiner">The</pos> sun rises in <pos type="determiner">the</pos> east.

**Rules:**
- Use 'The' for rivers, oceans, mountain ranges, and holy books.
- Do not use articles for proper nouns (names), languages, or most countries.
`,
  "Punctuation": `
**Punctuation Marks (विराम चिह्न):**

1. **Period / Full Stop (.)** - पूर्ण विराम:
   - Used at the end of a declarative sentence (statement).
   - Example: He <pos type="verb">goes</pos> to school<pos type="punctuation_mark">.</pos>

2. **Question Mark (?)** - प्रश्नवाचक चिह्न:
   - Used at the end of a question.
   - Example: <pos type="auxiliary">Do</pos> you <pos type="verb">like</pos> tea<pos type="punctuation_mark">?</pos>

3. **Exclamation Mark (!)** - विस्मयादिबोधक चिह्न:
   - Used to express strong emotion or surprise.
   - Example: <pos type="interjection">Wow</pos><pos type="punctuation_mark">!</pos> That is amazing<pos type="punctuation_mark">!</pos>

4. **Comma (,)** - अल्प विराम:
   - Used to separate items in a list, after introductory words, and before conjunctions in compound sentences.
   - Example: I bought apples<pos type="punctuation_mark">,</pos> bananas<pos type="punctuation_mark">,</pos> and oranges<pos type="punctuation_mark">.</pos>

5. **Apostrophe (')** - ऊर्ध्व विराम:
   - Used for contractions (don't, can't) and possessives (Ram's book).
   - Example: It<pos type="punctuation_mark">'</pos>s Ram<pos type="punctuation_mark">'</pos>s book<pos type="punctuation_mark">.</pos>

6. **Quotation Marks (" ")** - उद्धरण चिह्न:
   - Used for direct speech and titles.
   - Example: He said<pos type="punctuation_mark">,</pos> <pos type="punctuation_mark">"</pos>I am happy<pos type="punctuation_mark">.</pos><pos type="punctuation_mark">"</pos>

**Key Rules:**
- Always capitalize the first letter of a sentence.
- Use a comma before coordinating conjunctions (and, but, or) in compound sentences.
- Use a comma after introductory phrases (However, Moreover, In fact).
- End every sentence with appropriate punctuation (. ? !).
`,
};
