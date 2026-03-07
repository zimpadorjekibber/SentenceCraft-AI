import {
  collection, getDocs, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile } from '@/types/firestore-types';

// ─── Types ───────────────────────────────────────────────────

export interface AdminUserRow {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: Date | null;
  lastActiveAt: Date | null;
  totalSentences: number;
  totalAnalyses: number;
  totalDictionaryLookups: number;
  totalQuizzesTaken: number;
  totalQuizQuestionsAnswered: number;
  totalCorrectAnswers: number;
  streakCurrent: number;
  streakLongest: number;
  lastActiveDate: string;
  tensesUsed: Record<string, number>;
  featuresUsed: Record<string, number>;
}

export interface AdminDashboardData {
  totalUsers: number;
  activeToday: number;
  activeThisWeek: number;
  activeThisMonth: number;
  totalSentencesGlobal: number;
  totalAnalysesGlobal: number;
  totalQuizzesGlobal: number;
  totalQuizQuestionsGlobal: number;
  totalCorrectAnswersGlobal: number;
  avgQuizAccuracy: number;
  topTenses: { name: string; count: number }[];
  topFeatures: { name: string; count: number }[];
  topUsersByStreak: AdminUserRow[];
  topUsersBySentences: AdminUserRow[];
  users: AdminUserRow[];
}

// ─── Admin Email Check ───────────────────────────────────────

const ADMIN_EMAILS = ['tashizomkibber@gmail.com'];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// ─── Helper ──────────────────────────────────────────────────

function toDate(ts: any): Date | null {
  if (!ts) return null;
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts?.seconds) return new Timestamp(ts.seconds, ts.nanoseconds || 0).toDate();
  if (ts instanceof Date) return ts;
  return null;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── Fetch All Users ─────────────────────────────────────────

export async function getAdminDashboardData(): Promise<AdminDashboardData | null> {
  if (!db) return null;

  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('lastActiveAt', 'desc'));
  const snap = await getDocs(q);

  const today = todayStr();
  const weekAgo = daysAgo(7);
  const monthAgo = daysAgo(30);

  const users: AdminUserRow[] = [];
  let activeToday = 0;
  let activeThisWeek = 0;
  let activeThisMonth = 0;
  let totalSentencesGlobal = 0;
  let totalAnalysesGlobal = 0;
  let totalQuizzesGlobal = 0;
  let totalQuizQuestionsGlobal = 0;
  let totalCorrectAnswersGlobal = 0;
  const tenseAgg: Record<string, number> = {};
  const featureAgg: Record<string, number> = {};

  snap.docs.forEach((doc) => {
    const data = doc.data() as UserProfile;
    const stats = data.stats || {};
    const lastActive = toDate(data.lastActiveAt);
    const created = toDate(data.createdAt);

    const row: AdminUserRow = {
      uid: doc.id,
      displayName: data.displayName || 'Unknown',
      email: data.email || '',
      photoURL: data.photoURL || '',
      createdAt: created,
      lastActiveAt: lastActive,
      totalSentences: stats.totalSentencesGenerated || 0,
      totalAnalyses: stats.totalAnalyses || 0,
      totalDictionaryLookups: stats.totalDictionaryLookups || 0,
      totalQuizzesTaken: stats.totalQuizzesTaken || 0,
      totalQuizQuestionsAnswered: stats.totalQuizQuestionsAnswered || 0,
      totalCorrectAnswers: stats.totalCorrectAnswers || 0,
      streakCurrent: stats.streak?.current || 0,
      streakLongest: stats.streak?.longest || 0,
      lastActiveDate: stats.streak?.lastActiveDate || '',
      tensesUsed: stats.tensesUsed || {},
      featuresUsed: stats.featuresUsed || {},
    };

    users.push(row);

    // Activity tracking
    if (row.lastActiveDate === today) activeToday++;
    if (lastActive && lastActive >= weekAgo) activeThisWeek++;
    if (lastActive && lastActive >= monthAgo) activeThisMonth++;

    // Global aggregation
    totalSentencesGlobal += row.totalSentences;
    totalAnalysesGlobal += row.totalAnalyses;
    totalQuizzesGlobal += row.totalQuizzesTaken;
    totalQuizQuestionsGlobal += row.totalQuizQuestionsAnswered;
    totalCorrectAnswersGlobal += row.totalCorrectAnswers;

    // Tense aggregation
    if (stats.tensesUsed) {
      Object.entries(stats.tensesUsed).forEach(([tense, count]) => {
        tenseAgg[tense] = (tenseAgg[tense] || 0) + (count as number);
      });
    }

    // Feature aggregation
    if (stats.featuresUsed) {
      Object.entries(stats.featuresUsed).forEach(([feature, count]) => {
        featureAgg[feature] = (featureAgg[feature] || 0) + (count as number);
      });
    }
  });

  // Sort tenses by usage
  const topTenses = Object.entries(tenseAgg)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Sort features by usage
  const topFeatures = Object.entries(featureAgg)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Top users
  const topUsersByStreak = [...users]
    .sort((a, b) => b.streakCurrent - a.streakCurrent)
    .slice(0, 5);

  const topUsersBySentences = [...users]
    .sort((a, b) => b.totalSentences - a.totalSentences)
    .slice(0, 5);

  // Quiz accuracy
  const avgQuizAccuracy = totalQuizQuestionsGlobal > 0
    ? Math.round((totalCorrectAnswersGlobal / totalQuizQuestionsGlobal) * 100)
    : 0;

  return {
    totalUsers: users.length,
    activeToday,
    activeThisWeek,
    activeThisMonth,
    totalSentencesGlobal,
    totalAnalysesGlobal,
    totalQuizzesGlobal,
    totalQuizQuestionsGlobal,
    totalCorrectAnswersGlobal,
    avgQuizAccuracy,
    topTenses,
    topFeatures,
    topUsersByStreak,
    topUsersBySentences,
    users,
  };
}
