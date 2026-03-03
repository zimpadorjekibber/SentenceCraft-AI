import type { WordPos } from './ai-types';

export interface UserStats {
  totalSentencesGenerated: number;
  totalAnalyses: number;
  totalDictionaryLookups: number;
  totalQuizzesTaken: number;
  totalQuizQuestionsAnswered: number;
  totalCorrectAnswers: number;
  tensesUsed: Record<string, number>;
  featuresUsed: Record<string, number>;
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string; // "YYYY-MM-DD"
  };
}

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: any; // Firestore Timestamp
  lastActiveAt: any;
  stats: UserStats;
}

export interface SavedSentence {
  id?: string;
  sentenceText: string;
  sentenceTagged: WordPos[];
  hindiTranslation: string | null;
  tense: string | null;
  source: 'generator' | 'analyzer' | 'hindi_helper' | 'dictionary';
  action: string | null;
  inputWords: Record<string, string> | null;
  isFavorite: boolean;
  createdAt: any;
}

export interface QuizQuestion {
  id: number;
  type: 'fill_blank' | 'identify_tense' | 'identify_voice' | 'identify_speech'
    | 'identify_modal' | 'identify_type' | 'correct_error' | 'translate' | 'transform';
  questionText: string;
  questionHindi?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  explanationHindi?: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export interface QuizResult {
  id?: string;
  tense?: string; // backward-compat: old records have this
  category?: string; // new: e.g. "tenses", "modals"
  topic?: string; // new: e.g. "present_indefinite", "can_could"
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  questions: QuizQuestion[];
  createdAt: any;
}

export const DEFAULT_USER_STATS: UserStats = {
  totalSentencesGenerated: 0,
  totalAnalyses: 0,
  totalDictionaryLookups: 0,
  totalQuizzesTaken: 0,
  totalQuizQuestionsAnswered: 0,
  totalCorrectAnswers: 0,
  tensesUsed: {},
  featuresUsed: {},
  streak: {
    current: 0,
    longest: 0,
    lastActiveDate: '',
  },
};
