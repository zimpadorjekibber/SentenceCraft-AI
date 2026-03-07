'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { isAdminEmail, getAdminDashboardData, type AdminDashboardData, type AdminUserRow } from '@/lib/admin-firestore-service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import {
  Users, Activity, Flame, BookOpen, GraduationCap, Target,
  TrendingUp, BarChart3, ShieldAlert, ArrowLeft, RefreshCw,
  BookA, FlaskConical, Trophy
} from 'lucide-react';
import Link from 'next/link';

function formatDate(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(date: Date | null): string {
  if (!date) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function StatCard({ icon: Icon, label, value, subtext, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
            {subtext && <p className="text-[10px] text-muted-foreground/70">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TenseBar({ name, count, maxCount }: { name: string; count: number; maxCount: number }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-40 truncate" title={name}>{name}</span>
      <div className="flex-grow">
        <Progress value={pct} className="h-2.5" />
      </div>
      <span className="text-xs font-semibold w-10 text-right">{count}</span>
    </div>
  );
}

function UserRow({ user, rank }: { user: AdminUserRow; rank?: number }) {
  const quizAccuracy = user.totalQuizQuestionsAnswered > 0
    ? Math.round((user.totalCorrectAnswers / user.totalQuizQuestionsAnswered) * 100)
    : 0;

  return (
    <TableRow>
      {rank !== undefined && <TableCell className="font-bold text-center">{rank}</TableCell>}
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.photoURL} alt={user.displayName} />
            <AvatarFallback className="text-[10px]">{user.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-tight">{user.displayName}</p>
            <p className="text-[10px] text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className="text-xs">
          <Flame className="h-3 w-3 mr-1 text-orange-500" />
          {user.streakCurrent}d
        </Badge>
      </TableCell>
      <TableCell className="text-center text-sm">{user.totalSentences}</TableCell>
      <TableCell className="text-center text-sm">{user.totalAnalyses}</TableCell>
      <TableCell className="text-center text-sm">{user.totalDictionaryLookups}</TableCell>
      <TableCell className="text-center text-sm">{user.totalQuizzesTaken}</TableCell>
      <TableCell className="text-center">
        {user.totalQuizQuestionsAnswered > 0 ? (
          <Badge variant={quizAccuracy >= 70 ? 'default' : 'secondary'} className="text-xs">
            {quizAccuracy}%
          </Badge>
        ) : '—'}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
      <TableCell className="text-xs text-muted-foreground">{formatDateTime(user.lastActiveAt)}</TableCell>
    </TableRow>
  );
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminDashboardData();
      setData(result);
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isAdminEmail(user.email)) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [user, authLoading]);

  // ─── Auth Loading ────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  // ─── Not Logged In ───────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-sm">
          <CardContent className="p-8 text-center space-y-4">
            <ShieldAlert className="h-12 w-12 mx-auto text-red-500" />
            <h2 className="text-xl font-bold">Login Required</h2>
            <p className="text-sm text-muted-foreground">Please login to access the admin dashboard.</p>
            <Link href="/">
              <Button><ArrowLeft className="mr-2 h-4 w-4" /> Go to App</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Access Denied ───────────────────────────────
  if (!isAdminEmail(user.email)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-sm">
          <CardContent className="p-8 text-center space-y-4">
            <ShieldAlert className="h-12 w-12 mx-auto text-red-500" />
            <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
            <p className="text-sm text-muted-foreground">
              You don&apos;t have admin access. Contact the administrator.
            </p>
            <p className="text-xs text-muted-foreground/60">Logged in as: {user.email}</p>
            <Link href="/">
              <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to App</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Loading / Error ─────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <LoadingSpinner />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-sm">
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-red-500 font-semibold">Error: {error || 'No data'}</p>
            <Button onClick={fetchData}><RefreshCw className="mr-2 h-4 w-4" /> Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Dashboard ───────────────────────────────────
  const maxTenseCount = data.topTenses.length > 0 ? data.topTenses[0].count : 1;
  const maxFeatureCount = data.topFeatures.length > 0 ? data.topFeatures[0].count : 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" /> Admin Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">SentenceCraft AI — User Analytics</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">

        {/* ─── Overview Stats ─────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon={Users} label="Total Users" value={data.totalUsers} color="bg-blue-500" />
          <StatCard icon={Activity} label="Active Today" value={data.activeToday} color="bg-green-500" />
          <StatCard icon={TrendingUp} label="This Week" value={data.activeThisWeek} color="bg-emerald-500" />
          <StatCard icon={BookOpen} label="Total Sentences" value={data.totalSentencesGlobal} color="bg-purple-500" />
          <StatCard icon={GraduationCap} label="Quizzes Taken" value={data.totalQuizzesGlobal} color="bg-amber-500" />
          <StatCard icon={Target} label="Quiz Accuracy" value={`${data.avgQuizAccuracy}%`} subtext={`${data.totalCorrectAnswersGlobal}/${data.totalQuizQuestionsGlobal} correct`} color="bg-pink-500" />
        </div>

        {/* ─── Activity + Tenses Row ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Most Practiced Tenses */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" /> Most Practiced Tenses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {data.topTenses.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
              ) : (
                data.topTenses.slice(0, 12).map((t) => (
                  <TenseBar key={t.name} name={t.name} count={t.count} maxCount={maxTenseCount} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Most Used Features */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-green-500" /> Most Used Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {data.topFeatures.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
              ) : (
                data.topFeatures.slice(0, 10).map((f) => (
                  <TenseBar key={f.name} name={f.name} count={f.count} maxCount={maxFeatureCount} />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Top Users Cards ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Top by Streak */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" /> Top Users by Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.topUsersByStreak.map((u, i) => (
                <div key={u.uid} className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                  <span className="text-lg font-bold text-muted-foreground w-6 text-center">{i + 1}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={u.photoURL} />
                    <AvatarFallback className="text-xs">{u.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="text-sm font-medium">{u.displayName}</p>
                    <p className="text-[10px] text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge variant="outline" className="font-bold">
                    <Flame className="h-3 w-3 mr-1 text-orange-500" /> {u.streakCurrent}d
                  </Badge>
                </div>
              ))}
              {data.topUsersByStreak.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
              )}
            </CardContent>
          </Card>

          {/* Top by Sentences */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" /> Top Users by Practice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.topUsersBySentences.map((u, i) => (
                <div key={u.uid} className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                  <span className="text-lg font-bold text-muted-foreground w-6 text-center">{i + 1}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={u.photoURL} />
                    <AvatarFallback className="text-xs">{u.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="text-sm font-medium">{u.displayName}</p>
                    <p className="text-[10px] text-muted-foreground">{u.totalSentences} sentences • {u.totalQuizzesTaken} quizzes</p>
                  </div>
                  <Badge className="font-bold">{u.totalSentences + u.totalAnalyses}</Badge>
                </div>
              ))}
              {data.topUsersBySentences.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Global Stats Summary ───────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" /> Platform Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{data.totalSentencesGlobal}</p>
                <p className="text-[10px] text-muted-foreground">Sentences Generated</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <p className="text-xl font-bold text-green-600 dark:text-green-400">{data.totalAnalysesGlobal}</p>
                <p className="text-[10px] text-muted-foreground">Analyses Done</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{data.totalQuizzesGlobal}</p>
                <p className="text-[10px] text-muted-foreground">Quizzes Completed</p>
              </div>
              <div className="p-3 bg-pink-50 dark:bg-pink-950/30 rounded-lg">
                <p className="text-xl font-bold text-pink-600 dark:text-pink-400">{data.activeThisMonth}</p>
                <p className="text-[10px] text-muted-foreground">Active This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── All Users Table ────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" /> All Users ({data.totalUsers})
            </CardTitle>
            <CardDescription className="text-xs">Complete list of registered users</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-10">#</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-center">Streak</TableHead>
                  <TableHead className="text-center">Sentences</TableHead>
                  <TableHead className="text-center">Analyses</TableHead>
                  <TableHead className="text-center">Dictionary</TableHead>
                  <TableHead className="text-center">Quizzes</TableHead>
                  <TableHead className="text-center">Accuracy</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.users.map((u, i) => (
                  <UserRow key={u.uid} user={u} rank={i + 1} />
                ))}
                {data.users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
