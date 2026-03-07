'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { generateQuizQuestions } from '@/lib/quiz-generator';
import { saveQuizResult, incrementStat, updateStreak } from '@/lib/firestore-service';
import { QUIZ_CATEGORIES, findTopic } from '@/lib/quiz-topics';
import type { QuizCategory, QuizTopic } from '@/lib/quiz-topics';
import type { QuizQuestion } from '@/types/firestore-types';
import type { AiProvider } from '@/components/api-key-dialog';
import { useNativeLanguage } from '@/context/language-context';
import {
  GraduationCap, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy,
  ArrowLeft, BookOpen, ChevronRight,
  // Category icons — imported by name from lucide-react
  Clock, KeyRound, ArrowLeftRight, MessageSquareQuote, HelpCircle,
  GitBranch, FileText, MapPin, Link, Scale, Layers, PenTool,
} from 'lucide-react';

// ─── Icon Map ───────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Clock, KeyRound, ArrowLeftRight, MessageSquareQuote, HelpCircle,
  GitBranch, FileText, MapPin, Link, Scale, Layers, PenTool,
};

interface PracticeQuizProps {
  apiKey: string | null;
  aiProvider: AiProvider;
}

type SetupStep = 'category' | 'topic' | 'settings';
type QuizState = 'setup' | 'loading' | 'in_progress' | 'reviewing' | 'results';

export function PracticeQuiz({ apiKey, aiProvider }: PracticeQuizProps) {
  const { user, refreshStats } = useAuth();
  const { toast } = useToast();
  const { nativeLanguage, t } = useNativeLanguage();
  const getNativeLabel = (hindi: string, tibetan?: string) => nativeLanguage === 'bo' ? (tibetan || hindi) : hindi;

  // Setup flow state
  const [setupStep, setSetupStep] = useState<SetupStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null);

  // Quiz state
  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalCorrect = questions.filter(q => q.isCorrect).length;

  // ─── Handlers ─────────────────────────────────────────────────

  const handleSelectCategory = useCallback((cat: QuizCategory) => {
    setSelectedCategory(cat);
    setSelectedTopic(null);
    setSetupStep('topic');
  }, []);

  const handleSelectTopic = useCallback((topic: QuizTopic) => {
    setSelectedTopic(topic);
    setSetupStep('settings');
  }, []);

  const handleBackToCategories = useCallback(() => {
    setSetupStep('category');
    setSelectedCategory(null);
    setSelectedTopic(null);
  }, []);

  const handleBackToTopics = useCallback(() => {
    setSetupStep('topic');
    setSelectedTopic(null);
  }, []);

  const handleStartQuiz = useCallback(async () => {
    if (!apiKey || !selectedTopic) {
      toast({ title: 'API Key Missing', description: 'Please set your API key in settings.', variant: 'destructive' });
      return;
    }
    setQuizState('loading');
    try {
      const qs = await generateQuizQuestions(apiKey, aiProvider, selectedTopic, difficulty, questionCount, nativeLanguage);
      if (qs.length === 0) throw new Error('No questions generated');
      setQuestions(qs);
      setCurrentIndex(0);
      setSelectedAnswer('');
      setIsAnswerChecked(false);
      setQuizState('in_progress');
    } catch (e: any) {
      toast({ title: 'Quiz Error', description: e.message || 'Could not generate quiz.', variant: 'destructive' });
      setQuizState('setup');
    }
  }, [apiKey, aiProvider, selectedTopic, difficulty, questionCount, toast]);

  const handleCheckAnswer = useCallback(() => {
    if (!selectedAnswer || !currentQuestion) return;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const updated = [...questions];
    updated[currentIndex] = { ...updated[currentIndex], userAnswer: selectedAnswer, isCorrect };
    setQuestions(updated);
    setIsAnswerChecked(true);
  }, [selectedAnswer, currentQuestion, questions, currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer('');
      setIsAnswerChecked(false);
    } else {
      // Quiz complete
      setQuizState('results');
      const correct = questions.filter(q => q.isCorrect).length;
      // Save to Firestore
      if (user && selectedCategory && selectedTopic) {
        saveQuizResult(user.uid, {
          category: selectedCategory.id,
          topic: selectedTopic.id,
          tense: selectedCategory.id === 'tenses' ? selectedTopic.label : undefined,
          totalQuestions: questions.length,
          correctAnswers: correct,
          score: Math.round((correct / questions.length) * 100),
          questions,
        }).catch(() => {});
        incrementStat(user.uid, 'totalQuizzesTaken').catch(() => {});
        incrementStat(user.uid, 'totalQuizQuestionsAnswered', questions.length).catch(() => {});
        incrementStat(user.uid, 'totalCorrectAnswers', correct).catch(() => {});
        updateStreak(user.uid).catch(() => {});
        refreshStats().catch(() => {});
      }
    }
  }, [currentIndex, questions, user, selectedCategory, selectedTopic, refreshStats]);

  const handleRetake = useCallback(() => {
    setQuizState('setup');
    setSetupStep('category');
    setSelectedCategory(null);
    setSelectedTopic(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer('');
    setIsAnswerChecked(false);
  }, []);

  const handleRetakeSameTopic = useCallback(() => {
    setQuizState('setup');
    setSetupStep('settings');
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer('');
    setIsAnswerChecked(false);
  }, []);

  // ─── Topic label for display ──────────────────────────────────
  const topicBadgeLabel = selectedCategory && selectedTopic
    ? `${selectedCategory.label} › ${selectedTopic.label}`
    : '';

  // ═══════════════════════════════════════════════════════════════
  // SETUP — Step 1: Category Selection
  // ═══════════════════════════════════════════════════════════════
  if (quizState === 'setup' && setupStep === 'category') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Practice Quiz / {t({ hi: 'अभ्यास क्विज़', bo: 'སྦྱོང་བརྡར་དྲི་བ' })}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t({ hi: 'Category चुनें — Tenses से लेकर Punctuation तक, सब कुछ practice करें!', bo: 'རིགས་དབྱེ་འདེམས་རོགས — Tenses ནས Punctuation བར་སྦྱོང་བརྡར་བྱེད།' })}
        </p>

        {!apiKey && (
          <Card className="border-destructive">
            <CardContent className="pt-4">
              <p className="text-sm text-destructive">API Key set karein pehle (Settings mein jaayein).</p>
            </CardContent>
          </Card>
        )}

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {QUIZ_CATEGORIES.map(cat => {
            const IconComp = ICON_MAP[cat.icon] || BookOpen;
            return (
              <Card
                key={cat.id}
                className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                onClick={() => handleSelectCategory(cat)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className={`p-2.5 rounded-xl ${cat.color} transition-transform group-hover:scale-110`}>
                    <IconComp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm leading-tight">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">{getNativeLabel(cat.labelHindi, cat.labelTibetan)}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-1.5">
                    {cat.topics.length} {cat.topics.length === 1 ? 'topic' : 'topics'}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // SETUP — Step 2: Topic Selection
  // ═══════════════════════════════════════════════════════════════
  if (quizState === 'setup' && setupStep === 'topic' && selectedCategory) {
    const IconComp = ICON_MAP[selectedCategory.icon] || BookOpen;
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBackToCategories} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${selectedCategory.color}`}>
              <IconComp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">{selectedCategory.label}</h2>
              <p className="text-xs text-muted-foreground">{getNativeLabel(selectedCategory.labelHindi, selectedCategory.labelTibetan)}</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{t({ hi: 'Topic चुनें जिसकी practice करनी है:', bo: 'སྦྱོང་བརྡར་བྱེད་འདོད་པའི་བརྗོད་གཞི་འདེམས་རོགས།' })}</p>

        {/* Topic buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {selectedCategory.topics.map(topic => (
            <Button
              key={topic.id}
              variant="outline"
              className="h-auto py-3 px-4 justify-between text-left whitespace-normal"
              onClick={() => handleSelectTopic(topic)}
            >
              <div>
                <p className="font-medium text-sm">{topic.label}</p>
                <p className="text-xs text-muted-foreground">{getNativeLabel(topic.labelHindi, topic.labelTibetan)}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 ml-2 text-muted-foreground" />
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // SETUP — Step 3: Settings (Difficulty + Count)
  // ═══════════════════════════════════════════════════════════════
  if (quizState === 'setup' && setupStep === 'settings' && selectedCategory && selectedTopic) {
    const IconComp = ICON_MAP[selectedCategory.icon] || BookOpen;
    return (
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBackToTopics} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${selectedCategory.color}`}>
              <IconComp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">{selectedTopic.label}</h2>
              <p className="text-xs text-muted-foreground">{selectedCategory.label} › {getNativeLabel(selectedTopic.labelHindi, selectedTopic.labelTibetan)}</p>
            </div>
          </div>
        </div>

        {/* Difficulty & Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Difficulty / {t({ hi: 'कठिनाई', bo: 'དཀའ་ཚད' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={difficulty} onValueChange={(v) => setDifficulty(v as any)} className="space-y-2">
                {(['easy', 'medium', 'hard'] as const).map(d => (
                  <div key={d} className="flex items-center space-x-2">
                    <RadioGroupItem value={d} id={`diff-${d}`} />
                    <Label htmlFor={`diff-${d}`} className="capitalize">{d} ({d === 'easy' ? t({ hi: 'आसान', bo: 'སླ་པོ' }) : d === 'medium' ? t({ hi: 'मध्यम', bo: 'འབྲིང' }) : t({ hi: 'कठिन', bo: 'དཀའ་པོ' })})</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Questions / {t({ hi: 'सवाल', bo: 'དྲི་བ' })}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={String(questionCount)} onValueChange={(v) => setQuestionCount(Number(v))} className="space-y-2">
                {[3, 5, 10].map(n => (
                  <div key={n} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(n)} id={`count-${n}`} />
                    <Label htmlFor={`count-${n}`}>{n} questions</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Question types badge row */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Question types:</span>
          {selectedTopic.questionTypes.map(qt => (
            <Badge key={qt} variant="secondary" className="text-[10px]">
              {qt.replace(/_/g, ' ')}
            </Badge>
          ))}
        </div>

        <Button onClick={handleStartQuiz} disabled={!apiKey} className="w-full" size="lg">
          <GraduationCap className="mr-2 h-5 w-5" />
          Start Quiz / {t({ hi: 'क्विज़ शुरू करें', bo: 'དྲི་བ་འགོ་བཙུགས' })}
        </Button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // LOADING
  // ═══════════════════════════════════════════════════════════════
  if (quizState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Generating quiz questions... / {t({ hi: 'सवाल बना रहे हैं...', bo: 'དྲི་བ་བཟོ་བཞིན་པ...' })}</p>
        <Badge variant="outline">{topicBadgeLabel} — {difficulty}</Badge>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // IN PROGRESS
  // ═══════════════════════════════════════════════════════════════
  if (quizState === 'in_progress' && currentQuestion) {
    return (
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <Badge variant="outline" className="text-xs">{topicBadgeLabel}</Badge>
          </div>
          <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className={isAnswerChecked ? (currentQuestion.isCorrect ? 'border-green-500' : 'border-red-500') : ''}>
          <CardHeader>
            <Badge className="w-fit mb-2" variant="secondary">{currentQuestion.type.replace(/_/g, ' ')}</Badge>
            <CardTitle className="text-lg leading-relaxed">{currentQuestion.questionText}</CardTitle>
            {currentQuestion.questionHindi && (
              <CardDescription className="text-base mt-1">{currentQuestion.questionHindi}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Options */}
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={isAnswerChecked}>
              {currentQuestion.options.map((opt, i) => {
                let optionClass = '';
                if (isAnswerChecked) {
                  if (opt === currentQuestion.correctAnswer) optionClass = 'border-green-500 bg-green-50 dark:bg-green-950';
                  else if (opt === selectedAnswer && !currentQuestion.isCorrect) optionClass = 'border-red-500 bg-red-50 dark:bg-red-950';
                }
                return (
                  <div key={i} className={`flex items-center space-x-3 p-3 rounded-lg border ${optionClass}`}>
                    <RadioGroupItem value={opt} id={`opt-${i}`} />
                    <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer text-sm">{opt}</Label>
                    {isAnswerChecked && opt === currentQuestion.correctAnswer && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                    {isAnswerChecked && opt === selectedAnswer && !currentQuestion.isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                  </div>
                );
              })}
            </RadioGroup>

            {/* Explanation (after check) */}
            {isAnswerChecked && (
              <div className="p-4 rounded-lg bg-muted space-y-1">
                <p className="text-sm font-medium">{currentQuestion.isCorrect ? '✅ Correct!' : '❌ Incorrect'}</p>
                <p className="text-sm">{currentQuestion.explanation}</p>
                {currentQuestion.explanationHindi && (
                  <p className="text-sm text-muted-foreground">{currentQuestion.explanationHindi}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isAnswerChecked ? (
            <Button onClick={handleCheckAnswer} disabled={!selectedAnswer} className="flex-1">
              Check Answer / {t({ hi: 'जवाब देखें', bo: 'ལན་ལྟ་བ' })}
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              {currentIndex < questions.length - 1 ? (
                <><ArrowRight className="mr-2 h-4 w-4" />Next Question</>
              ) : (
                <><Trophy className="mr-2 h-4 w-4" />See Results / {t({ hi: 'नतीजे देखें', bo: 'འབྲས་བུ་ལྟ་བ' })}</>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════════════════════════
  if (quizState === 'results') {
    const score = Math.round((totalCorrect / questions.length) * 100);
    const emoji = score >= 80 ? '🎉' : score >= 50 ? '👍' : '💪';
    return (
      <div className="space-y-6">
        {/* Score Card */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-6 space-y-3">
            <p className="text-5xl">{emoji}</p>
            <h2 className="text-3xl font-bold">{totalCorrect}/{questions.length}</h2>
            <p className="text-lg text-muted-foreground">Score: {score}%</p>
            <Badge variant="outline" className="text-base px-3 py-1">{topicBadgeLabel}</Badge>
            <Progress value={score} className="h-3 mt-4" />
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review / {t({ hi: 'समीक्षा', bo: 'བསྐྱར་ཞིབ' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div key={i} className={`p-3 rounded-lg border ${q.isCorrect ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'}`}>
                    <div className="flex items-start gap-2">
                      {q.isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" /> : <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />}
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{q.questionText}</p>
                        {!q.isCorrect && (
                          <p className="text-xs text-muted-foreground">Your answer: {q.userAnswer} → Correct: {q.correctAnswer}</p>
                        )}
                        <p className="text-xs text-muted-foreground">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleRetakeSameTopic} variant="outline" className="flex-1">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Topic / {t({ hi: 'फिर से', bo: 'བསྐྱར་དུ' })}
          </Button>
          <Button onClick={handleRetake} variant="outline" className="flex-1">
            <BookOpen className="mr-2 h-4 w-4" />
            New Topic / {t({ hi: 'नया विषय', bo: 'བརྗོད་གཞི་གསར་པ' })}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
