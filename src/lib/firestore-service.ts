import {
  doc, setDoc, getDoc, updateDoc, collection, addDoc,
  query, orderBy, limit, startAfter, where, getDocs,
  serverTimestamp, increment, Timestamp,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, UserStats, SavedSentence, QuizResult, DEFAULT_USER_STATS } from '@/types/firestore-types';
import { DEFAULT_USER_STATS as defaultStats } from '@/types/firestore-types';

// ─── User Profile ───────────────────────────────────────────

export async function createOrUpdateUserProfile(
  uid: string,
  data: { displayName: string; email: string; photoURL: string }
): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // First-time user — create full profile
    const profile: UserProfile = {
      ...data,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
      stats: { ...defaultStats },
    };
    await setDoc(ref, profile);
  } else {
    // Returning user — update last active + name/photo if changed
    await updateDoc(ref, {
      displayName: data.displayName,
      photoURL: data.photoURL,
      lastActiveAt: serverTimestamp(),
    });
  }
}

export async function getUserStats(uid: string): Promise<UserStats | null> {
  if (!db) return null;
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return (snap.data() as UserProfile).stats ?? null;
}

// ─── Streak ─────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function updateStreak(uid: string): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const stats = (snap.data() as UserProfile).stats;
  const today = todayStr();

  if (stats.streak.lastActiveDate === today) return; // Already counted today

  let newCurrent: number;
  if (stats.streak.lastActiveDate === yesterdayStr()) {
    newCurrent = stats.streak.current + 1;
  } else {
    newCurrent = 1; // Streak broken or first day
  }

  const newLongest = Math.max(stats.streak.longest, newCurrent);

  await updateDoc(ref, {
    'stats.streak.current': newCurrent,
    'stats.streak.longest': newLongest,
    'stats.streak.lastActiveDate': today,
    lastActiveAt: serverTimestamp(),
  });
}

// ─── Sentence Saving ────────────────────────────────────────

export async function saveSentence(
  uid: string,
  data: Omit<SavedSentence, 'id' | 'createdAt'>
): Promise<string | null> {
  if (!db) return null;
  const colRef = collection(db, 'users', uid, 'sentences');
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function toggleFavorite(
  uid: string,
  sentenceId: string,
  isFavorite: boolean
): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', uid, 'sentences', sentenceId);
  await updateDoc(ref, { isFavorite });
}

export async function getSentenceHistory(
  uid: string,
  options: { limitCount?: number; startAfterDoc?: DocumentSnapshot; tense?: string; source?: string } = {}
): Promise<{ sentences: SavedSentence[]; lastDoc: DocumentSnapshot | null }> {
  if (!db) return { sentences: [], lastDoc: null };

  const { limitCount = 20, startAfterDoc, tense, source } = options;
  const colRef = collection(db, 'users', uid, 'sentences');

  const constraints: any[] = [orderBy('createdAt', 'desc')];
  if (tense) constraints.push(where('tense', '==', tense));
  if (source) constraints.push(where('source', '==', source));
  if (startAfterDoc) constraints.push(startAfter(startAfterDoc));
  constraints.push(limit(limitCount));

  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);

  const sentences: SavedSentence[] = snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
  } as SavedSentence));

  const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  return { sentences, lastDoc };
}

export async function getFavoriteSentences(uid: string): Promise<SavedSentence[]> {
  if (!db) return [];
  const colRef = collection(db, 'users', uid, 'sentences');
  const q = query(colRef, where('isFavorite', '==', true), orderBy('createdAt', 'desc'), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SavedSentence));
}

// ─── Stats Incrementing ─────────────────────────────────────

export async function incrementStat(
  uid: string,
  field: keyof Pick<UserStats, 'totalSentencesGenerated' | 'totalAnalyses' | 'totalDictionaryLookups' | 'totalQuizzesTaken' | 'totalQuizQuestionsAnswered' | 'totalCorrectAnswers'>,
  amount: number = 1
): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    [`stats.${field}`]: increment(amount),
    lastActiveAt: serverTimestamp(),
  });
}

export async function incrementTenseUsage(uid: string, tenseName: string): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    [`stats.tensesUsed.${tenseName}`]: increment(1),
  });
}

export async function incrementFeatureUsage(uid: string, featureName: string): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    [`stats.featuresUsed.${featureName}`]: increment(1),
  });
}

// ─── Quiz Results ───────────────────────────────────────────

export async function saveQuizResult(
  uid: string,
  data: Omit<QuizResult, 'id' | 'createdAt'>
): Promise<string | null> {
  if (!db) return null;
  const colRef = collection(db, 'users', uid, 'quizResults');
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getQuizHistory(
  uid: string,
  options: { limitCount?: number; tense?: string; category?: string; topic?: string } = {}
): Promise<QuizResult[]> {
  if (!db) return [];
  const { limitCount = 20, tense, category, topic } = options;
  const colRef = collection(db, 'users', uid, 'quizResults');

  const constraints: any[] = [orderBy('createdAt', 'desc')];
  if (tense) constraints.push(where('tense', '==', tense));
  if (category) constraints.push(where('category', '==', category));
  if (topic) constraints.push(where('topic', '==', topic));
  constraints.push(limit(limitCount));

  const q = query(colRef, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as QuizResult));
}
