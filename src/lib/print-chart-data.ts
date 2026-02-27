// src/lib/print-chart-data.ts

export const TIME_PERIODS = [
  { name: "Present", cue: "है, हैं, हो" },
  { name: "Past", cue: "था, थे, थी" },
  { name: "Future", cue: "गा, गे, गी" },
];

export const TENSE_ASPECTS = [
  { name: "Indefinite", cue: "ता, ते, ती" },
  { name: "Continuous", cue: "रहा, रही, रहे" },
  { name: "Perfect", cue: "चुका, चुके, चुकी" },
  { name: "Perfect Continuous", cue: "(समय) से - रहा, रही, रहे" },
];

export interface TenseRuleSet {
  A: string;
  N: string;
  I: string;
  NI: string;
}

export const CHART_RULES: Record<string, Record<string, TenseRuleSet>> = {
  "Present": {
    "Indefinite": {
      A: "S+V1(+s/es for 3rd P)+O",
      N: "S+Do/Does+Not+V1+O",
      I: "Do/Does+S+V1+O+?",
      NI: "Do/Does+S+Not+V1+O+?",
    },
    "Continuous": {
      A: "S+is/am/are+V1+ing+O",
      N: "S+is/am/are+not+V1+ing+O",
      I: "Is/am/are+S+V1+ing+O+?",
      NI: "Is/am/are+S+not+V1+ing+O+?",
    },
    "Perfect": {
      A: "S+has/have+V3+O",
      N: "S+has/have+not+V3+O",
      I: "Has/have+S+V3+O+?",
      NI: "Has/have+S+not+V3+O+?",
    },
    "Perfect Continuous": {
      A: "S+has/have+been+V1+ing+O+Since/for",
      N: "S+has/have+not+been+V1+ing+O+Since/for",
      I: "Has/have+S+been+V1+ing+O+Since/for?",
      NI: "Has/have+S+not+been+V1+ing+O+Since/for?",
    },
  },
  "Past": {
    "Indefinite": {
      A: "S+V2+O",
      N: "S+Did+not+V1+O",
      I: "Did+S+V1+O+?",
      NI: "Did+S+not+V1+O+?",
    },
    "Continuous": {
      A: "S+was/were+V1+ing+O",
      N: "S+was/were+not+V1+ing+O",
      I: "Was/were+S+V1+ing+O+?",
      NI: "Was/were+S+not+V1+ing+O+?",
    },
    "Perfect": {
      A: "S+had+V3+O",
      N: "S+had+not+V3+O",
      I: "Had+S+V3+O+?",
      NI: "Had+S+not+V3+O+?",
    },
    "Perfect Continuous": {
      A: "S+had+been+V1+ing+O+Since/for",
      N: "S+had+not+been+V1+ing+O+Since/for",
      I: "Had+S+been+V1+ing+O+Since/for?",
      NI: "Had+S+not+been+V1+ing+O+Since/for?",
    },
  },
  "Future": {
    "Indefinite": {
      A: "S+will/shall+V1+O",
      N: "S+will/shall+not+V1+O",
      I: "Will/shall+S+V1+O+?",
      NI: "Will/shall+S+not+V1+O+?",
    },
    "Continuous": {
      A: "S+will/shall+be+V1+ing+O",
      N: "S+will/shall+not+be+V1+ing+O",
      I: "Will/shall+S+be+V1+ing+O+?",
      NI: "Will/shall+S+not+be+V1+ing+O+?",
    },
    "Perfect": {
      A: "S+will/shall+have+V3+O",
      N: "S+will/shall+not+have+V3+O",
      I: "Will/shall+S+have+V3+O+?",
      NI: "Will/shall+S+not+have+V3+O+?",
    },
    "Perfect Continuous": {
      A: "S+will/shall+have+been+V1+ing+O+Since/for",
      N: "S+will/shall+not+have+been+V1+ing+O+Since/for",
      I: "Will/shall+S+have+been+V1+ing+O+Since/for?",
      NI: "Will/shall+S+not+have+been+V1+ing+O+Since/for?",
    },
  },
};
