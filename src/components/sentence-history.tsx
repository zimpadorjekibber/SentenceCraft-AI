'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/auth-context';
import { getSentenceHistory, toggleFavorite } from '@/lib/firestore-service';
import type { SavedSentence } from '@/types/firestore-types';
import { Heart, Clock, ChevronDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNativeLanguage } from '@/context/language-context';
import type { DocumentSnapshot } from 'firebase/firestore';

interface SentenceHistoryProps {
  filterTense?: string;
  filterSource?: string;
  maxHeight?: string;
}

export function SentenceHistory({ filterTense, filterSource, maxHeight = '400px' }: SentenceHistoryProps) {
  const { user } = useAuth();
  const { t } = useNativeLanguage();
  const [sentences, setSentences] = useState<SavedSentence[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadSentences = useCallback(async (append = false) => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await getSentenceHistory(user.uid, {
        limitCount: 15,
        startAfterDoc: append ? lastDoc ?? undefined : undefined,
        tense: filterTense,
        source: filterSource,
      });
      if (append) {
        setSentences(prev => [...prev, ...result.sentences]);
      } else {
        setSentences(result.sentences);
      }
      setLastDoc(result.lastDoc);
      setHasMore(result.sentences.length === 15);
    } catch (e) {
      console.error('Error loading history:', e);
    } finally {
      setLoading(false);
    }
  }, [user, lastDoc, filterTense, filterSource]);

  useEffect(() => {
    loadSentences(false);
  }, [user, filterTense, filterSource]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleFavorite = useCallback(async (sentenceId: string, current: boolean) => {
    if (!user || !sentenceId) return;
    await toggleFavorite(user.uid, sentenceId, !current);
    setSentences(prev => prev.map(s => s.id === sentenceId ? { ...s, isFavorite: !current } : s));
  }, [user]);

  if (!user) {
    return <p className="text-sm text-muted-foreground text-center py-4">{t({ hi: 'Login karein history dekhne ke liye.', bo: 'ལོ་རྒྱུས་བལྟ་བར་ login བྱོས།' })}</p>;
  }

  if (sentences.length === 0 && !loading) {
    return <p className="text-sm text-muted-foreground text-center py-4">{t({ hi: 'Koi sentence history nahi hai. Sentences generate karein!', bo: 'ཚིག་གྲུབ་ལོ་རྒྱུས་མེད། ཚིག་གྲུབ་བཟོས།' })}</p>;
  }

  return (
    <ScrollArea style={{ maxHeight }}>
      <div className="space-y-2 pr-2">
        {sentences.map((s) => (
          <div key={s.id} className="flex items-start gap-2 p-2.5 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium truncate">{s.sentenceText}</p>
              {s.hindiTranslation && (
                <p className="text-xs text-muted-foreground truncate">{s.hindiTranslation}</p>
              )}
              <div className="flex items-center gap-1.5 flex-wrap">
                {s.tense && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{s.tense}</Badge>}
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{s.source?.replace('_', ' ')}</Badge>
                {s.createdAt && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDistanceToNow(s.createdAt.toDate ? s.createdAt.toDate() : new Date(s.createdAt), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
              onClick={() => s.id && handleToggleFavorite(s.id, s.isFavorite)}
            >
              <Heart className={`h-4 w-4 ${s.isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </Button>
          </div>
        ))}
        {hasMore && (
          <Button variant="ghost" size="sm" className="w-full" onClick={() => loadSentences(true)} disabled={loading}>
            <ChevronDown className="mr-1 h-4 w-4" />
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        )}
      </div>
    </ScrollArea>
  );
}
