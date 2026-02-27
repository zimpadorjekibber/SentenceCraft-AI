
// src/lib/tense-rules-data.ts

export const TENSE_RULES: Record<string, string> = {
  "Present Indefinite": `
<pos type="rule_label_A">(A)</pos> <pos type="subject">S</pos>+<pos type="verb_form">V1</pos><pos type="punctuation">(</pos><pos type="other_grammatical_term">+s/es for 3rd P</pos><pos type="punctuation">)</pos>+<pos type="object">O</pos>
<pos type="rule_label_N">(N)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Do/Does</pos>+<pos type="negation">Not</pos>+<pos type="verb_form">V1</pos>+<pos type="object">O</pos>
<pos type="rule_label_I">(I)</pos> <pos type="auxiliary">Do/Does</pos>+<pos type="subject">S</pos>+<pos type="verb_form">V1</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I)</pos> <pos type="auxiliary">Do/Does</pos>+<pos type="subject">S</pos>+<pos type="negation">Not</pos>+<pos type="verb_form">V1</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
`,
  "Present Continuous": `
<pos type="rule_label_A">(A)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Is/Am/Are</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>
<pos type="rule_label_N">(N)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Is/Am/Are</pos>+<pos type="negation">Not</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>
<pos type="rule_label_I">(I)</pos> <pos type="auxiliary">Is/Am/Are</pos>+<pos type="subject">S</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I)</pos> <pos type="auxiliary">Is/Am/Are</pos>+<pos type="subject">S</pos>+<pos type="negation">Not</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
`,
  "Present Perfect": `
<pos type="rule_label_A">(A)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Has/Have</pos>+<pos type="verb_form">V3</pos>+<pos type="object">O</pos>
<pos type="rule_label_N">(N)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Has/Have</pos>+<pos type="negation">Not</pos>+<pos type="verb_form">V3</pos>+<pos type="object">O</pos>
<pos type="rule_label_I">(I)</pos> <pos type="auxiliary">Has/Have</pos>+<pos type="subject">S</pos>+<pos type="verb_form">V3</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I)</pos> <pos type="auxiliary">Has/Have</pos>+<pos type="subject">S</pos>+<pos type="negation">Not</pos>+<pos type="verb_form">V3</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
`,
  "Present Perfect Continuous": `
<pos type="rule_label_A">(A)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Has/Have</pos>+<pos type="auxiliary">Been</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>+<pos type="other_grammatical_term">Since/For</pos>+<pos type="other_grammatical_term">Time</pos>
<pos type="rule_label_N">(N)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Has/Have</pos>+<pos type="negation">Not</pos>+<pos type="auxiliary">Been</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>+<pos type="other_grammatical_term">Since/For</pos>+<pos type="other_grammatical_term">Time</pos>
<pos type="rule_label_I">(I)</pos> <pos type="auxiliary">Has/Have</pos>+<pos type="subject">S</pos>+<pos type="auxiliary">Been</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>+<pos type="other_grammatical_term">Since/For</pos>+<pos type="other_grammatical_term">Time</pos><pos type="punctuation">?</pos>
<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I)</pos> <pos type="auxiliary">Has/Have</pos>+<pos type="subject">S</pos>+<pos type="negation">Not</pos>+<pos type="auxiliary">Been</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>+<pos type="other_grammatical_term">Since/For</pos>+<pos type="other_grammatical_term">Time</pos><pos type="punctuation">?</pos>
`,
  "Past Indefinite": `
<pos type="rule_label_A">(A)</pos> <pos type="subject">S</pos>+<pos type="verb_form">V2</pos>+<pos type="object">O</pos>
<pos type="rule_label_N">(N)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Did</pos>+<pos type="negation">Not</pos>+<pos type="verb_form">V1</pos>+<pos type="object">O</pos>
<pos type="rule_label_I">(I)</pos> <pos type="auxiliary">Did</pos>+<pos type="subject">S</pos>+<pos type="verb_form">V1</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I)</pos> <pos type="auxiliary">Did</pos>+<pos type="subject">S</pos>+<pos type="negation">Not</pos>+<pos type="verb_form">V1</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
`,
  "Past Continuous": `
<pos type="rule_label_A">(A)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Was/Were</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>
<pos type="rule_label_N">(N)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Was/Were</pos>+<pos type="negation">Not</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>
<pos type="rule_label_I">(I)</pos> <pos type="auxiliary">Was/Were</pos>+<pos type="subject">S</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I)</pos> <pos type="auxiliary">Was/Were</pos>+<pos type="subject">S</pos>+<pos type="negation">Not</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
`,
  "Past Perfect": `
<pos type="rule_label_A">(A)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Had</pos>+<pos type="verb_form">V3</pos>+<pos type="object">O</pos>
<pos type="rule_label_N">(N)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Had</pos>+<pos type="negation">Not</pos>+<pos type="verb_form">V3</pos>+<pos type="object">O</pos>
<pos type="rule_label_I">(I)</pos> <pos type="auxiliary">Had</pos>+<pos type="subject">S</pos>+<pos type="verb_form">V3</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I)</pos> <pos type="auxiliary">Had</pos>+<pos type="subject">S</pos>+<pos type="negation">Not</pos>+<pos type="verb_form">V3</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
`,
  "Past Perfect Continuous": `
<pos type="rule_label_A">(A)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Had</pos>+<pos type="auxiliary">Been</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>+<pos type="other_grammatical_term">Since/For</pos>+<pos type="other_grammatical_term">Time</pos>
<pos type="rule_label_N">(N)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Had</pos>+<pos type="negation">Not</pos>+<pos type="auxiliary">Been</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>+<pos type="other_grammatical_term">Since/For</pos>+<pos type="other_grammatical_term">Time</pos>
<pos type="rule_label_I">(I)</pos> <pos type="auxiliary">Had</pos>+<pos type="subject">S</pos>+<pos type="auxiliary">Been</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>+<pos type="other_grammatical_term">Since/For</pos>+<pos type="other_grammatical_term">Time</pos><pos type="punctuation">?</pos>
<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I)</pos> <pos type="auxiliary">Had</pos>+<pos type="subject">S</pos>+<pos type="negation">Not</pos>+<pos type="auxiliary">Been</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>+<pos type="other_grammatical_term">Since/For</pos>+<pos type="other_grammatical_term">Time</pos><pos type="punctuation">?</pos>
`,
  "Future Indefinite": `
<pos type="rule_label_A">(A)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Will/Shall</pos>+<pos type="verb_form">V1</pos>+<pos type="object">O</pos>
<pos type="rule_label_N">(N)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Will/Shall</pos>+<pos type="negation">Not</pos>+<pos type="verb_form">V1</pos>+<pos type="object">O</pos>
<pos type="rule_label_I">(I)</pos> <pos type="auxiliary">Will/Shall</pos>+<pos type="subject">S</pos>+<pos type="verb_form">V1</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I)</pos> <pos type="auxiliary">Will/Shall</pos>+<pos type="subject">S</pos>+<pos type="negation">Not</pos>+<pos type="verb_form">V1</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
`,
  "Future Continuous": `
<pos type="rule_label_A">(A)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Will/Shall</pos>+<pos type="auxiliary">Be</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>
<pos type="rule_label_N">(N)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Will/Shall</pos>+<pos type="negation">Not</pos>+<pos type="auxiliary">Be</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>
<pos type="rule_label_I">(I)</pos> <pos type="auxiliary">Will/Shall</pos>+<pos type="subject">S</pos>+<pos type="auxiliary">Be</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I)</pos> <pos type="auxiliary">Will/Shall</pos>+<pos type="subject">S</pos>+<pos type="negation">Not</pos>+<pos type="auxiliary">Be</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
`,
  "Future Perfect": `
<pos type="rule_label_A">(A)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Will/Shall</pos>+<pos type="auxiliary">Have</pos>+<pos type="verb_form">V3</pos>+<pos type="object">O</pos>
<pos type="rule_label_N">(N)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Will/Shall</pos>+<pos type="negation">Not</pos>+<pos type="auxiliary">Have</pos>+<pos type="verb_form">V3</pos>+<pos type="object">O</pos>
<pos type="rule_label_I">(I)</pos> <pos type="auxiliary">Will/Shall</pos>+<pos type="subject">S</pos>+<pos type="auxiliary">Have</pos>+<pos type="verb_form">V3</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I)</pos> <pos type="auxiliary">Will/Shall</pos>+<pos type="subject">S</pos>+<pos type="negation">Not</pos>+<pos type="auxiliary">Have</pos>+<pos type="verb_form">V3</pos>+<pos type="object">O</pos><pos type="punctuation">?</pos>
`,
  "Future Perfect Continuous": `
<pos type="rule_label_A">(A)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Will/Shall</pos>+<pos type="auxiliary">Have</pos>+<pos type="auxiliary">Been</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>+<pos type="other_grammatical_term">Since/For</pos>+<pos type="other_grammatical_term">Time</pos>
<pos type="rule_label_N">(N)</pos> <pos type="subject">S</pos>+<pos type="auxiliary">Will/Shall</pos>+<pos type="negation">Not</pos>+<pos type="auxiliary">Have</pos>+<pos type="auxiliary">Been</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>+<pos type="other_grammatical_term">Since/For</pos>+<pos type="other_grammatical_term">Time</pos>
<pos type="rule_label_I">(I)</pos> <pos type="auxiliary">Will/Shall</pos>+<pos type="subject">S</pos>+<pos type="auxiliary">Have</pos>+<pos type="auxiliary">Been</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>+<pos type="other_grammatical_term">Since/For</pos>+<pos type="other_grammatical_term">Time</pos><pos type="punctuation">?</pos>
<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I)</pos> <pos type="auxiliary">Will/Shall</pos>+<pos type="subject">S</pos>+<pos type="negation">Not</pos>+<pos type="auxiliary">Have</pos>+<pos type="auxiliary">Been</pos>+<pos type="verb_form">V1+ing</pos>+<pos type="object">O</pos>+<pos type="other_grammatical_term">Since/For</pos>+<pos type="other_grammatical_term">Time</pos><pos type="punctuation">?</pos>
`,
};
