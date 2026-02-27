
// src/lib/detailed-tense-rules-data.ts

export const DETAILED_TENSE_RULES: Record<string, string> = {
  "Present Indefinite": `
<pos type="subject">Present Indefinite Tense</pos> (सामान्य वर्तमान काल) का प्रयोग सामान्य सत्य, आदतों, या नियमित रूप से होने वाली क्रियाओं को व्यक्त करने के लिए किया जाता है।
पहचान: वाक्य के अन्त में <pos type="other_grammatical_term">ता है, ती है, ते हैं</pos> आता है।

<pos type="headline">Structure (संरचना):</pos>
<pos type="rule_label_A">(A) Affirmative (सकारात्मक):</pos> <pos type="subject">Subject</pos> + <pos type="verb_form">V1 (Verb's base form)</pos><pos type="punctuation">(</pos><pos type="other_grammatical_term">+s/es with 3rd person singular</pos><pos type="punctuation">)</pos> + <pos type="object">Object</pos>.
   - Example: वह <pos type="verb">खेलता</pos> है। (He plays.)
   - Note: For <pos type="subject">He, She, It, Singular Noun</pos>, add <pos type="other_grammatical_term">'s' or 'es'</pos> to the <pos type="verb_form">V1</pos>.

<pos type="rule_label_N">(N) Negative (नकारात्मक):</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">do/does</pos> + <pos type="negation">not</pos> + <pos type="verb_form">V1</pos> + <pos type="object">Object</pos>.
   - Example: वह <pos type="negation">नहीं</pos> <pos type="verb">खेलता</pos> है। (He does not play.)
   - Note: Use <pos type="auxiliary">does not (doesn't)</pos> with <pos type="subject">He, She, It, Singular Noun</pos>. Use <pos type="auxiliary">do not (don't)</pos> with <pos type="subject">I, We, You, They, Plural Nouns</pos>.

<pos type="rule_label_I">(I) Interrogative (प्रश्नवाचक):</pos> <pos type="auxiliary">Do/Does</pos> + <pos type="subject">Subject</pos> + <pos type="verb_form">V1</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वह <pos type="verb">खेलता</pos> है<pos type="punctuation">?</pos> (Does he play?)

<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I) Negative Interrogative (नकारात्मक-प्रश्नवाचक):</pos> <pos type="auxiliary">Do/Does</pos> + <pos type="subject">Subject</pos> + <pos type="negation">not</pos> + <pos type="verb_form">V1</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वह <pos type="negation">नहीं</pos> <pos type="verb">खेलता</pos> है<pos type="punctuation">?</pos> (Does he not play?) Or Don't/Doesn't + Subject + V1 + Object?

<pos type="headline">Usage Examples (प्रयोग के उदाहरण):</pos>
- <pos type="other_grammatical_term">Habit (आदत):</pos> The sun <pos type="verb_form">rises</pos> in the east. (सूर्य पूर्व में <pos type="verb">उगता</pos> है।)
- <pos type="other_grammatical_term">General Truth (सामान्य सत्य):</pos> Water <pos type="verb_form">boils</pos> at 100 degrees Celsius. (पानी 100 डिग्री सेल्सियस पर <pos type="verb">उबलता</pos> है।)
- <pos type="other_grammatical_term">Regular Action (नियमित क्रिया):</pos> They <pos type="verb_form">go</pos> to school daily. (वे प्रतिदिन स्कूल <pos type="verb">जाते</pos> हैं।)
`,
  "Present Continuous": `
<pos type="subject">Present Continuous Tense</pos> (अपूर्ण वर्तमान काल) का प्रयोग उन क्रियाओं के लिए किया जाता है जो बोलते समय हो रही हैं या वर्तमान में अस्थायी रूप से चल रही हैं।
पहचान: वाक्य के अन्त में <pos type="other_grammatical_term">रहा है, रही है, रहे हैं, रहा हूँ</pos> आता है।

<pos type="headline">Structure (संरचना):</pos>
<pos type="rule_label_A">(A) Affirmative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">is/am/are</pos> + <pos type="verb_form">V1+ing (Present Participle)</pos> + <pos type="object">Object</pos>.
   - Example: वह <pos type="verb_form">खेल रहा</pos> है। (He is playing.)
   - <pos type="auxiliary">Am</pos> with <pos type="subject">I</pos>. <pos type="auxiliary">Is</pos> with <pos type="subject">He, She, It, Singular Noun</pos>. <pos type="auxiliary">Are</pos> with <pos type="subject">We, You, They, Plural Nouns</pos>.

<pos type="rule_label_N">(N) Negative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">is/am/are</pos> + <pos type="negation">not</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos>.
   - Example: वह <pos type="negation">नहीं</pos> <pos type="verb_form">खेल रहा</pos> है। (He is not playing.)

<pos type="rule_label_I">(I) Interrogative:</pos> <pos type="auxiliary">Is/Am/Are</pos> + <pos type="subject">Subject</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वह <pos type="verb_form">खेल रहा</pos> है<pos type="punctuation">?</pos> (Is he playing?)

<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I) Negative Interrogative:</pos> <pos type="auxiliary">Is/Am/Are</pos> + <pos type="subject">Subject</pos> + <pos type="negation">not</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वह <pos type="negation">नहीं</pos> <pos type="verb_form">खेल रहा</pos> है<pos type="punctuation">?</pos> (Is he not playing?)

<pos type="headline">Usage Examples (प्रयोग के उदाहरण):</pos>
- <pos type="other_grammatical_term">Action happening now (अभी हो रही क्रिया):</pos> She <pos type="auxiliary">is</pos> <pos type="verb_form">reading</pos> a book. (वह एक किताब <pos type="verb_form">पढ़ रही</pos> है।)
- <pos type="other_grammatical_term">Temporary action (अस्थायी क्रिया):</pos> I <pos type="auxiliary">am</pos> <pos type="verb_form">learning</pos> French these days. (मैं आजकल फ्रेंच <pos type="verb_form">सीख रहा</pos> हूँ।)
- <pos type="other_grammatical_term">Near future plan (निकट भविष्य की योजना):</pos> We <pos type="auxiliary">are</pos> <pos type="verb_form">going</pos> to the cinema tonight. (हम आज रात सिनेमा <pos type="verb_form">जा रहे</pos> हैं।)
`,
  // Add other tenses here following the same pattern
  "Present Perfect": `
<pos type="subject">Present Perfect Tense</pos> (पूर्ण वर्तमान काल) का प्रयोग उन क्रियाओं के लिए किया जाता है जो अभी-अभी समाप्त हुई हैं या जिनका प्रभाव वर्तमान में है।
पहचान: वाक्य के अन्त में <pos type="other_grammatical_term">चुका है, चुकी है, चुके हैं, लिया है, दिया है, किया है, या है, यी है, ये हैं</pos> आता है।

<pos type="headline">Structure (संरचना):</pos>
<pos type="rule_label_A">(A) Affirmative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">has/have</pos> + <pos type="verb_form">V3 (Past Participle)</pos> + <pos type="object">Object</pos>.
   - Example: वह <pos type="verb_form">खेल चुका</pos> है। / उसने <pos type="verb_form">खेल लिया</pos> है। (He has played.)
   - <pos type="auxiliary">Has</pos> with <pos type="subject">He, She, It, Singular Noun</pos>. <pos type="auxiliary">Have</pos> with <pos type="subject">I, We, You, They, Plural Nouns</pos>.

<pos type="rule_label_N">(N) Negative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">has/have</pos> + <pos type="negation">not</pos> + <pos type="verb_form">V3</pos> + <pos type="object">Object</pos>.
   - Example: वह <pos type="negation">नहीं</pos> <pos type="verb_form">खेला</pos> है। (He has not played.)

<pos type="rule_label_I">(I) Interrogative:</pos> <pos type="auxiliary">Has/Have</pos> + <pos type="subject">Subject</pos> + <pos type="verb_form">V3</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वह <pos type="verb_form">खेल चुका</pos> है<pos type="punctuation">?</pos> (Has he played?)

<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I) Negative Interrogative:</pos> <pos type="auxiliary">Has/Have</pos> + <pos type="subject">Subject</pos> + <pos type="negation">not</pos> + <pos type="verb_form">V3</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वह <pos type="negation">नहीं</pos> <pos type="verb_form">खेला</pos> है<pos type="punctuation">?</pos> (Has he not played?)

<pos type="headline">Usage Examples (प्रयोग के उदाहरण):</pos>
- <pos type="other_grammatical_term">Completed action with present relevance (वर्तमान प्रभाव के साथ पूर्ण क्रिया):</pos> I <pos type="auxiliary">have</pos> <pos type="verb_form">finished</pos> my work. (मैंने अपना काम <pos type="verb_form">पूरा कर लिया</pos> है।)
- <pos type="other_grammatical_term">Experience (अनुभव):</pos> She <pos type="auxiliary">has</pos> <pos type="verb_form">visited</pos> Paris. (वह पेरिस <pos type="verb_form">घूम चुकी</pos> है।)
`,
  "Present Perfect Continuous": `
<pos type="subject">Present Perfect Continuous Tense</pos> (पूर्ण निरंतर वर्तमान काल) का प्रयोग उन क्रियाओं के लिए किया जाता है जो भूतकाल में शुरू हुईं और अभी भी जारी हैं, और क्रिया की अवधि महत्वपूर्ण होती है।
पहचान: वाक्य के अन्त में <pos type="other_grammatical_term">से रहा है, से रही है, से रहे हैं</pos> आता है, और <pos type="other_grammatical_term">समय (Since/For)</pos> का उल्लेख होता है।

<pos type="headline">Structure (संरचना):</pos>
<pos type="rule_label_A">(A) Affirmative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">has/have</pos> + <pos type="auxiliary">been</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos> + <pos type="other_grammatical_term">since/for</pos> + <pos type="other_grammatical_term">Time</pos>.
   - Example: वह दो घंटे से <pos type="verb_form">खेल रहा</pos> है। (He has been playing for two hours.)
   - <pos type="other_grammatical_term">Since</pos> for point of time (निश्चित समय). <pos type="other_grammatical_term">For</pos> for period of time (समय अवधि).

<pos type="rule_label_N">(N) Negative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">has/have</pos> + <pos type="negation">not</pos> + <pos type="auxiliary">been</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos> + <pos type="other_grammatical_term">since/for</pos> + <pos type="other_grammatical_term">Time</pos>.
   - Example: वह सुबह से <pos type="negation">नहीं</pos> <pos type="verb_form">पढ़ रहा</pos> है। (He has not been reading since morning.)

<pos type="rule_label_I">(I) Interrogative:</pos> <pos type="auxiliary">Has/Have</pos> + <pos type="subject">Subject</pos> + <pos type="auxiliary">been</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos> + <pos type="other_grammatical_term">since/for</pos> + <pos type="other_grammatical_term">Time</pos><pos type="punctuation">?</pos>
   - Example: क्या तुम दो साल से यहाँ <pos type="verb_form">रह रहे</pos> हो<pos type="punctuation">?</pos> (Have you been living here for two years?)

<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I) Negative Interrogative:</pos> <pos type="auxiliary">Has/Have</pos> + <pos type="subject">Subject</pos> + <pos type="negation">not</pos> + <pos type="auxiliary">been</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos> + <pos type="other_grammatical_term">since/for</pos> + <pos type="other_grammatical_term">Time</pos><pos type="punctuation">?</pos>
   - Example: क्या वह सुबह से <pos type="negation">नहीं</pos> <pos type="verb_form">सो रहा</pos> है<pos type="punctuation">?</pos> (Has he not been sleeping since morning?)

<pos type="headline">Usage Examples (प्रयोग के उदाहरण):</pos>
- <pos type="other_grammatical_term">Action started in past and still continuing (भूतकाल में शुरू हुई और अभी भी जारी क्रिया):</pos> They <pos type="auxiliary">have been</pos> <pos type="verb_form">working</pos> on this project <pos type="other_grammatical_term">for</pos> three months. (वे तीन महीने से इस परियोजना पर <pos type="verb_form">काम कर रहे</pos> हैं।)
`,
  "Past Indefinite": `
<pos type="subject">Past Indefinite Tense</pos> (सामान्य भूतकाल) का प्रयोग भूतकाल में किसी समय पर समाप्त हुई क्रियाओं को व्यक्त करने के लिए किया जाता है।
पहचान: वाक्य के अन्त में <pos type="other_grammatical_term">ता था, ती थी, ते थे, या, यी, ये, आ, ई, ए</pos> आता है।

<pos type="headline">Structure (संरचना):</pos>
<pos type="rule_label_A">(A) Affirmative:</pos> <pos type="subject">Subject</pos> + <pos type="verb_form">V2 (Verb's 2nd form)</pos> + <pos type="object">Object</pos>.
   - Example: उसने <pos type="verb_form">खेला</pos>। (He played.)

<pos type="rule_label_N">(N) Negative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">did</pos> + <pos type="negation">not</pos> + <pos type="verb_form">V1 (Verb's base form)</pos> + <pos type="object">Object</pos>.
   - Example: उसने <pos type="negation">नहीं</pos> <pos type="verb">खेला</pos>। (He did not play.)
   - Note: <pos type="auxiliary">Did not</pos> के साथ <pos type="verb_form">V1</pos> का प्रयोग होता है।

<pos type="rule_label_I">(I) Interrogative:</pos> <pos type="auxiliary">Did</pos> + <pos type="subject">Subject</pos> + <pos type="verb_form">V1</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या उसने <pos type="verb">खेला</pos><pos type="punctuation">?</pos> (Did he play?)

<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I) Negative Interrogative:</pos> <pos type="auxiliary">Did</pos> + <pos type="subject">Subject</pos> + <pos type="negation">not</pos> + <pos type="verb_form">V1</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या उसने <pos type="negation">नहीं</pos> <pos type="verb">खेला</pos><pos type="punctuation">?</pos> (Did he not play?)

<pos type="headline">Usage Examples (प्रयोग के उदाहरण):</pos>
- <pos type="other_grammatical_term">Completed action in the past (भूतकाल में पूर्ण क्रिया):</pos> I <pos type="verb_form">visited</pos> them yesterday. (मैं कल उनसे <pos type="verb_form">मिला</pos> था।)
- <pos type="other_grammatical_term">Past habit (भूतकाल की आदत):</pos> She often <pos type="verb_form">came</pos> late. (वह अक्सर देर से <pos type="verb_form">आती</pos> थी।)
`,
  "Past Continuous": `
<pos type="subject">Past Continuous Tense</pos> (अपूर्ण भूतकाल) का प्रयोग भूतकाल में किसी समय जारी रहने वाली क्रियाओं को व्यक्त करने के लिए किया जाता है।
पहचान: वाक्य के अन्त में <pos type="other_grammatical_term">रहा था, रही थी, रहे थे</pos> आता है।

<pos type="headline">Structure (संरचना):</pos>
<pos type="rule_label_A">(A) Affirmative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">was/were</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos>.
   - Example: वह <pos type="verb_form">खेल रहा</pos> था। (He was playing.)
   - <pos type="auxiliary">Was</pos> with <pos type="subject">I, He, She, It, Singular Noun</pos>. <pos type="auxiliary">Were</pos> with <pos type="subject">We, You, They, Plural Nouns</pos>.

<pos type="rule_label_N">(N) Negative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">was/were</pos> + <pos type="negation">not</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos>.
   - Example: वह <pos type="negation">नहीं</pos> <pos type="verb_form">खेल रहा</pos> था। (He was not playing.)

<pos type="rule_label_I">(I) Interrogative:</pos> <pos type="auxiliary">Was/Were</pos> + <pos type="subject">Subject</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वह <pos type="verb_form">खेल रहा</pos> था<pos type="punctuation">?</pos> (Was he playing?)

<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I) Negative Interrogative:</pos> <pos type="auxiliary">Was/Were</pos> + <pos type="subject">Subject</pos> + <pos type="negation">not</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वह <pos type="negation">नहीं</pos> <pos type="verb_form">खेल रहा</pos> था<pos type="punctuation">?</pos> (Was he not playing?)

<pos type="headline">Usage Examples (प्रयोग के उदाहरण):</pos>
- <pos type="other_grammatical_term">Action in progress at a specific past time (भूतकाल में किसी विशिष्ट समय पर जारी क्रिया):</pos> They <pos type="auxiliary">were</pos> <pos type="verb_form">watching</pos> TV when I arrived. (जब मैं पहुँचा, वे टीवी <pos type="verb_form">देख रहे</pos> थे।)
`,
  "Past Perfect": `
<pos type="subject">Past Perfect Tense</pos> (पूर्ण भूतकाल) का प्रयोग भूतकाल में किसी अन्य क्रिया के होने से पहले ही समाप्त हो चुकी क्रिया को व्यक्त करने के लिए किया जाता है। (Two past actions).
पहचान: वाक्य के अन्त में <pos type="other_grammatical_term">चुका था, चुकी थी, चुके थे, या था, यी थी, ये थे</pos> आता है।

<pos type="headline">Structure (संरचना):</pos>
<pos type="rule_label_A">(A) Affirmative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">had</pos> + <pos type="verb_form">V3</pos> + <pos type="object">Object</pos>.
   - Example: रोगी के आने से पहले डॉक्टर <pos type="verb_form">जा चुका</pos> था। (The doctor had gone before the patient came.)

<pos type="rule_label_N">(N) Negative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">had</pos> + <pos type="negation">not</pos> + <pos type="verb_form">V3</pos> + <pos type="object">Object</pos>.
   - Example: मेरे स्टेशन पहुँचने से पहले ट्रेन <pos type="negation">नहीं</pos> <pos type="verb_form">गई</pos> थी। (The train had not left before I reached the station.)

<pos type="rule_label_I">(I) Interrogative:</pos> <pos type="auxiliary">Had</pos> + <pos type="subject">Subject</pos> + <pos type="verb_form">V3</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या तुम्हारे आने से पहले वह <pos type="verb_form">सो चुका</pos> था<pos type="punctuation">?</pos> (Had he slept before you came?)

<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I) Negative Interrogative:</pos> <pos type="auxiliary">Had</pos> + <pos type="subject">Subject</pos> + <pos type="negation">not</pos> + <pos type="verb_form">V3</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वर्षा होने से पहले तुम घर <pos type="negation">नहीं</pos> <pos type="verb_form">पहुँच चुके</pos> थे<pos type="punctuation">?</pos> (Had you not reached home before it rained?)

<pos type="headline">Usage Examples (प्रयोग के उदाहरण):</pos>
- <pos type="other_grammatical_term">Earlier of two past actions (दो भूतकाल की क्रियाओं में से पहले वाली):</pos> The patient <pos type="auxiliary">had</pos> <pos type="verb_form">died</pos> before the doctor <pos type="verb_form">arrived</pos>. (डॉक्टर के आने से पहले मरीज <pos type="verb_form">मर चुका</pos> था।)
`,
  "Past Perfect Continuous": `
<pos type="subject">Past Perfect Continuous Tense</pos> (पूर्ण निरंतर भूतकाल) का प्रयोग भूतकाल में किसी निश्चित समय से जारी रहने वाली क्रियाओं को व्यक्त करने के लिए किया जाता है जो किसी अन्य भूतकाल की क्रिया के होने तक जारी थीं।
पहचान: वाक्य के अन्त में <pos type="other_grammatical_term">से रहा था, से रही थी, से रहे थे</pos> आता है, और <pos type="other_grammatical_term">समय (Since/For)</pos> का उल्लेख होता है।

<pos type="headline">Structure (संरचना):</pos>
<pos type="rule_label_A">(A) Affirmative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">had</pos> + <pos type="auxiliary">been</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos> + <pos type="other_grammatical_term">since/for</pos> + <pos type="other_grammatical_term">Time</pos>.
   - Example: वह दो घंटे से <pos type="verb_form">पढ़ रहा</pos> था जब मैं पहुँचा। (He had been reading for two hours when I arrived.)

<pos type="rule_label_N">(N) Negative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">had</pos> + <pos type="negation">not</pos> + <pos type="auxiliary">been</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos> + <pos type="other_grammatical_term">since/for</pos> + <pos type="other_grammatical_term">Time</pos>.
   - Example: वे सुबह से <pos type="negation">नहीं</pos> <pos type="verb_form">खेल रहे</pos> थे। (They had not been playing since morning.)

<pos type="rule_label_I">(I) Interrogative:</pos> <pos type="auxiliary">Had</pos> + <pos type="subject">Subject</pos> + <pos type="auxiliary">been</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos> + <pos type="other_grammatical_term">since/for</pos> + <pos type="other_grammatical_term">Time</pos><pos type="punctuation">?</pos>
   - Example: क्या तुम चार साल से इस कंपनी में <pos type="verb_form">काम कर रहे</pos> थे<pos type="punctuation">?</pos> (Had you been working in this company for four years?)

<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I) Negative Interrogative:</pos> <pos type="auxiliary">Had</pos> + <pos type="subject">Subject</pos> + <pos type="negation">not</pos> + <pos type="auxiliary">been</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos> + <pos type="other_grammatical_term">since/for</pos> + <pos type="other_grammatical_term">Time</pos><pos type="punctuation">?</pos>
   - Example: क्या वह दो दिन से स्कूल <pos type="negation">नहीं</pos> <pos type="verb_form">आ रहा</pos> था<pos type="punctuation">?</pos> (Had he not been coming to school for two days?)

<pos type="headline">Usage Examples (प्रयोग के उदाहरण):</pos>
- <pos type="other_grammatical_term">Action in progress in the past for a duration before another past action (भूतकाल में किसी क्रिया के होने से पहले किसी अवधि तक जारी क्रिया):</pos> She <pos type="auxiliary">had been</pos> <pos type="verb_form">waiting</pos> for an hour when the bus finally <pos type="verb_form">arrived</pos>. (जब बस आखिरकार आई, वह एक घंटे से <pos type="verb_form">इंतजार कर रही</pos> थी।)
`,
  "Future Indefinite": `
<pos type="subject">Future Indefinite Tense</pos> (सामान्य भविष्य काल) का प्रयोग भविष्य में होने वाली क्रियाओं को व्यक्त करने के लिए किया जाता है।
पहचान: वाक्य के अन्त में <pos type="other_grammatical_term">गा, गी, गे</pos> आता है।

<pos type="headline">Structure (संरचना):</pos>
<pos type="rule_label_A">(A) Affirmative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">will/shall</pos> + <pos type="verb_form">V1</pos> + <pos type="object">Object</pos>.
   - Example: वह <pos type="verb">खेलेगा</pos>। (He will play.)
   - Note: Traditionally, <pos type="auxiliary">shall</pos> with <pos type="subject">I/We</pos>, <pos type="auxiliary">will</pos> with others. Modern English often uses <pos type="auxiliary">will</pos> for all.

<pos type="rule_label_N">(N) Negative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">will/shall</pos> + <pos type="negation">not</pos> + <pos type="verb_form">V1</pos> + <pos type="object">Object</pos>.
   - Example: वह <pos type="negation">नहीं</pos> <pos type="verb">खेलेगा</pos>। (He will not play.) (Won't, Shan't)

<pos type="rule_label_I">(I) Interrogative:</pos> <pos type="auxiliary">Will/Shall</pos> + <pos type="subject">Subject</pos> + <pos type="verb_form">V1</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वह <pos type="verb">खेलेगा</pos><pos type="punctuation">?</pos> (Will he play?)

<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I) Negative Interrogative:</pos> <pos type="auxiliary">Will/Shall</pos> + <pos type="subject">Subject</pos> + <pos type="negation">not</pos> + <pos type="verb_form">V1</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वह <pos type="negation">नहीं</pos> <pos type="verb">खेलेगा</pos><pos type="punctuation">?</pos> (Will he not play?)

<pos type="headline">Usage Examples (प्रयोग के उदाहरण):</pos>
- <pos type="other_grammatical_term">Future action (भविष्य की क्रिया):</pos> They <pos type="auxiliary">will</pos> <pos type="verb">come</pos> tomorrow. (वे कल <pos type="verb">आएंगे</pos>।)
- <pos type="other_grammatical_term">Prediction (भविष्यवाणी):</pos> It <pos type="auxiliary">will</pos> <pos type="verb">rain</pos> soon. (जल्द ही बारिश <pos type="verb">होगी</pos>।)
`,
  "Future Continuous": `
<pos type="subject">Future Continuous Tense</pos> (अपूर्ण भविष्य काल) का प्रयोग भविष्य में किसी समय जारी रहने वाली क्रियाओं को व्यक्त करने के लिए किया जाता है।
पहचान: वाक्य के अन्त में <pos type="other_grammatical_term">रहा होगा, रही होगी, रहे होंगे</pos> आता है।

<pos type="headline">Structure (संरचना):</pos>
<pos type="rule_label_A">(A) Affirmative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">will/shall</pos> + <pos type="auxiliary">be</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos>.
   - Example: वह <pos type="verb_form">खेल रहा</pos> होगा। (He will be playing.)

<pos type="rule_label_N">(N) Negative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">will/shall</pos> + <pos type="negation">not</pos> + <pos type="auxiliary">be</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos>.
   - Example: वह <pos type="negation">नहीं</pos> <pos type="verb_form">खेल रहा</pos> होगा। (He will not be playing.)

<pos type="rule_label_I">(I) Interrogative:</pos> <pos type="auxiliary">Will/Shall</pos> + <pos type="subject">Subject</pos> + <pos type="auxiliary">be</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वह <pos type="verb_form">खेल रहा</pos> होगा<pos type="punctuation">?</pos> (Will he be playing?)

<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I) Negative Interrogative:</pos> <pos type="auxiliary">Will/Shall</pos> + <pos type="subject">Subject</pos> + <pos type="negation">not</pos> + <pos type="auxiliary">be</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वह <pos type="negation">नहीं</pos> <pos type="verb_form">खेल रहा</pos> होगा<pos type="punctuation">?</pos> (Will he not be playing?)

<pos type="headline">Usage Examples (प्रयोग के उदाहरण):</pos>
- <pos type="other_grammatical_term">Action in progress at a specific future time (भविष्य में किसी विशिष्ट समय पर जारी क्रिया):</pos> At this time tomorrow, I <pos type="auxiliary">will be</pos> <pos type="verb_form">traveling</pos> to London. (कल इसी समय, मैं लंदन की <pos type="verb_form">यात्रा कर रहा</pos> होऊँगा।)
`,
  "Future Perfect": `
<pos type="subject">Future Perfect Tense</pos> (पूर्ण भविष्य काल) का प्रयोग भविष्य में किसी निश्चित समय तक समाप्त हो चुकी क्रिया को व्यक्त करने के लिए किया जाता है।
पहचान: वाक्य के अन्त में <pos type="other_grammatical_term">चुका होगा, चुकी होगी, चुके होंगे, चुकेगा, चुकेगी, चुकेंगे</pos> आता है।

<pos type="headline">Structure (संरचना):</pos>
<pos type="rule_label_A">(A) Affirmative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">will/shall</pos> + <pos type="auxiliary">have</pos> + <pos type="verb_form">V3</pos> + <pos type="object">Object</pos>.
   - Example: वह <pos type="verb_form">खेल चुका</pos> होगा। (He will have played.)

<pos type="rule_label_N">(N) Negative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">will/shall</pos> + <pos type="negation">not</pos> + <pos type="auxiliary">have</pos> + <pos type="verb_form">V3</pos> + <pos type="object">Object</pos>.
   - Example: वह <pos type="negation">नहीं</pos> <pos type="verb_form">खेल चुका</pos> होगा। (He will not have played.)

<pos type="rule_label_I">(I) Interrogative:</pos> <pos type="auxiliary">Will/Shall</pos> + <pos type="subject">Subject</pos> + <pos type="auxiliary">have</pos> + <pos type="verb_form">V3</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वह <pos type="verb_form">खेल चुका</pos> होगा<pos type="punctuation">?</pos> (Will he have played?)

<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I) Negative Interrogative:</pos> <pos type="auxiliary">Will/Shall</pos> + <pos type="subject">Subject</pos> + <pos type="negation">not</pos> + <pos type="auxiliary">have</pos> + <pos type="verb_form">V3</pos> + <pos type="object">Object</pos><pos type="punctuation">?</pos>
   - Example: क्या वह <pos type="negation">नहीं</pos> <pos type="verb_form">खेल चुका</pos> होगा<pos type="punctuation">?</pos> (Will he not have played?)

<pos type="headline">Usage Examples (प्रयोग के उदाहरण):</pos>
- <pos type="other_grammatical_term">Action completed by a certain future time (भविष्य में निश्चित समय तक पूर्ण क्रिया):</pos> By next year, I <pos type="auxiliary">will have</pos> <pos type="verb_form">graduated</pos>. (अगले साल तक, मैं <pos type="verb_form">स्नातक हो चुका</pos> होऊँगा।)
`,
  "Future Perfect Continuous": `
<pos type="subject">Future Perfect Continuous Tense</pos> (पूर्ण निरंतर भविष्य काल) का प्रयोग भविष्य में किसी निश्चित समय तक जारी रहने वाली क्रियाओं को व्यक्त करने के लिए किया जाता है, जिसमें क्रिया की अवधि का भी उल्लेख होता है।
पहचान: वाक्य के अन्त में <pos type="other_grammatical_term">से रहा होगा, से रही होगी, से रहे होंगे</pos> आता है, और <pos type="other_grammatical_term">समय (Since/For/From)</pos> का उल्लेख होता है।

<pos type="headline">Structure (संरचना):</pos>
<pos type="rule_label_A">(A) Affirmative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">will/shall</pos> + <pos type="auxiliary">have</pos> + <pos type="auxiliary">been</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos> + <pos type="other_grammatical_term">since/for/from</pos> + <pos type="other_grammatical_term">Time</pos>.
   - Example: वह दो घंटे से <pos type="verb_form">खेल रहा</pos> होगा। (He will have been playing for two hours.)

<pos type="rule_label_N">(N) Negative:</pos> <pos type="subject">Subject</pos> + <pos type="auxiliary">will/shall</pos> + <pos type="negation">not</pos> + <pos type="auxiliary">have</pos> + <pos type="auxiliary">been</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos> + <pos type="other_grammatical_term">since/for/from</pos> + <pos type="other_grammatical_term">Time</pos>.
   - Example: वे सुबह से <pos type="negation">नहीं</pos> <pos type="verb_form">पढ़ रहे</pos> होंगे। (They will not have been reading since morning.)

<pos type="rule_label_I">(I) Interrogative:</pos> <pos type="auxiliary">Will/Shall</pos> + <pos type="subject">Subject</pos> + <pos type="auxiliary">have</pos> + <pos type="auxiliary">been</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos> + <pos type="other_grammatical_term">since/for/from</pos> + <pos type="other_grammatical_term">Time</pos><pos type="punctuation">?</pos>
   - Example: क्या तुम अगले महीने तक दो साल से यह <pos type="verb_form">काम कर रहे</pos> होगे<pos type="punctuation">?</pos> (Will you have been doing this work for two years by next month?)

<pos type="rule_label_NI_N">(N</pos><pos type="rule_label_NI_I">I) Negative Interrogative:</pos> <pos type="auxiliary">Will/Shall</pos> + <pos type="subject">Subject</pos> + <pos type="negation">not</pos> + <pos type="auxiliary">have</pos> + <pos type="auxiliary">been</pos> + <pos type="verb_form">V1+ing</pos> + <pos type="object">Object</pos> + <pos type="other_grammatical_term">since/for/from</pos> + <pos type="other_grammatical_term">Time</pos><pos type="punctuation">?</pos>
   - Example: क्या वह सोमवार से स्कूल <pos type="negation">नहीं</pos> <pos type="verb_form">आ रहा</pos> होगा<pos type="punctuation">?</pos> (Will he not have been coming to school from Monday?)

<pos type="headline">Usage Examples (प्रयोग के उदाहरण):</pos>
- <pos type="other_grammatical_term">Action in progress for a duration up to a certain future time (भविष्य में निश्चित समय तक किसी अवधि के लिए जारी क्रिया):</pos> By 2025, we <pos type="auxiliary">will have been</pos> <pos type="verb_form">living</pos> here <pos type="other_grammatical_term">for</pos> ten years. (2025 तक, हम यहाँ दस साल से <pos type="verb_form">रह रहे</pos> होंगे।)
`,
};
