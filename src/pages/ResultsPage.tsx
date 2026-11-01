import { useMemo, useRef, useEffect } from 'react';
import { useExam } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { calcAptitudeScore, calcPersonalityResult, calcTotalScore, PROFILE_DESCRIPTIONS, calcStreamRecommendation } from '../utils/scoring';
import StreamSection from '../components/StreamSection';
import { getBenchmarkData, getBenchmarkStats, calculatePercentile, getTopStudents, getPercentileLabel } from '../data/benchmark';
import { INDIAN_BOARDS } from '../data/boards';
import BellCurveChart from '../components/BellCurveChart';
import Leaderboard from '../components/Leaderboard';
import PrintReport from '../components/PrintReport';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Download, Home, TrendingUp, Trophy, Users, GraduationCap } from 'lucide-react';
import { saveResult } from '../api/results';
import { RiasecCode } from '../types';

const LOGO_URL = `${import.meta.env.BASE_URL}logo.svg`;

const RIASEC_LABELS: Record<RiasecCode, string> = {
  R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional',
};
const RIASEC_COLORS: Record<RiasecCode, string> = {
  R: 'bg-orange-100 text-orange-700', I: 'bg-blue-100 text-blue-700',
  A: 'bg-pink-100 text-pink-700', S: 'bg-green-100 text-green-700',
  E: 'bg-purple-100 text-purple-700', C: 'bg-slate-100 text-slate-700',
};
const profileColors: Record<string, string> = {
  Analytical: 'bg-blue-50 border-blue-200 text-blue-800',
  Creative: 'bg-violet-50 border-violet-200 text-violet-800',
  Operational: 'bg-emerald-50 border-emerald-200 text-emerald-800',
};

function ScoreBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-bold text-primary">{pct}%</span>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function ResultsPage() {
  const { state, setPage, resetExam } = useExam();
  const { handleLogoClick } = useAuth();
  const ids = state.questionIds;
  const hasSaved = useRef(false);

  const verbal = useMemo(() => calcAptitudeScore('verbal', state.answers, ids?.verbal ?? []), [state.answers, ids]);
  const numerical = useMemo(() => calcAptitudeScore('numerical', state.answers, ids?.numerical ?? []), [state.answers, ids]);
  const spatial = useMemo(() => calcAptitudeScore('spatial', state.answers, ids?.spatial ?? []), [state.answers, ids]);
  const personality = useMemo(() => calcPersonalityResult(state.answers, ids?.personality ?? []), [state.answers, ids]);
  const userTotal = useMemo(() => calcTotalScore(verbal, numerical, spatial, personality), [verbal, numerical, spatial, personality]);

  const benchmark = useMemo(() => getBenchmarkData(), []);
  const benchmarkStats = useMemo(() => getBenchmarkStats(benchmark), [benchmark]);
  const percentileResult = useMemo(() => calculatePercentile(userTotal, benchmark), [userTotal, benchmark]);
  const topStudents = useMemo(() => getTopStudents(benchmark, 10), [benchmark]);
  const percentileInfo = getPercentileLabel(percentileResult.percentile);
  const profileDesc = PROFILE_DESCRIPTIONS[personality.profile];
  const boardLabel = INDIAN_BOARDS.find(b => b.value === state.board)?.label || state.board;

  const isClass10 = state.educationLevel?.includes('10');
  const isClass12 = state.educationLevel?.includes('12');
  const showStream = isClass10 || isClass12;
  const streamRec = useMemo(
    () => showStream ? calcStreamRecommendation(verbal, numerical, spatial, personality) : null,
    [verbal, numerical, spatial, personality, showStream]
  );

  // Auto-save result to storage/database once
  useEffect(() => {
    if (hasSaved.current || !state.candidateId) return;
    hasSaved.current = true;
    saveResult({
      candidateId: state.candidateId,
      name: state.name || '',
      email: state.email || '',
      age: parseInt(state.age) || 0,
      board: state.board || '',
      region: state.region || '',
      educationLevel: state.educationLevel || '',
      totalScore: userTotal,
      verbalScore: verbal.percentage,
      numericalScore: numerical.percentage,
      spatialScore: spatial.percentage,
      profile: personality.profile,
      percentile: percentileResult.percentile,
      nationalRank: percentileResult.rank,
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const radarData = [
    { subject: 'Verbal', value: verbal.percentage },
    { subject: 'Numerical', value: numerical.percentage },
    { subject: 'Spatial', value: spatial.percentage },
    { subject: 'Interest', value: Math.max(personality.analytical, personality.creative, personality.operational) },
  ];

  return (
    <div className="min-h-screen bg-background print:bg-white">
      <PrintReport
        state={state} verbal={verbal} numerical={numerical} spatial={spatial}
        personality={personality} userTotal={userTotal}
        percentileResult={percentileResult} profile={personality.profile}
        streamRec={streamRec}
      />

      {/* Screen header */}
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm no-print">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={LOGO_URL}
              alt="LearnReady"
              style={{ height: '50px', width: 'auto' }}
              className="object-contain cursor-pointer select-none transition-transform active:scale-95"
              onClick={handleLogoClick}
              title="LearnReady"
            />
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={() => window.print()} className="cursor-pointer">
              <Download className="w-4 h-4 mr-1.5" />Download PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => { resetExam(); setPage('landing'); }} className="cursor-pointer">
              <Home className="w-4 h-4 mr-1.5" />New Assessment
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6 no-print">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Candidate Profile Report</p>
            <h1 className="text-2xl font-bold">{state.name || state.candidateId}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
              <span>ID: {state.candidateId}</span>
              {state.age && <span>Age {state.age}</span>}
              {state.region && <span>{state.region}</span>}
              {state.board && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />{boardLabel}
                </span>
              )}
            </div>
          </div>
          <Badge className={`${profileColors[personality.profile]} border text-sm px-4 py-2 font-semibold self-start`}>
            {personality.profile} Profile
          </Badge>
        </div>

        {/* Rank Banner */}
        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <Trophy className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground tabular-nums leading-none">#{percentileResult.rank.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground mt-0.5">out of {percentileResult.totalStudents.toLocaleString('en-IN')} candidates</p>
            </div>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-12" />
          <div className="flex flex-wrap justify-center sm:justify-start gap-5">
            <div className="text-center">
              <p className="text-2xl font-black text-primary">{ordinal(percentileResult.percentile)}</p>
              <p className="text-xs text-muted-foreground">Percentile</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${percentileInfo.color}`}>{percentileInfo.label}</p>
              <p className="text-xs text-muted-foreground">National Standing</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black">{userTotal}/100</p>
              <p className="text-xs text-muted-foreground">Composite Score</p>
            </div>
          </div>
        </div>

        {/* ── Class 10 / 12 Stream Section ── */}
        {streamRec && (
          <StreamSection stream={streamRec} educationLevel={state.educationLevel} />
        )}

        {/* Performance grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip formatter={(v: number) => [`${v}%`, 'Score']} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Domain Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScoreBar label={`Verbal Reasoning (${verbal.raw}/${verbal.total})`} pct={verbal.percentage} color="bg-blue-500" />
              <ScoreBar label={`Numerical Reasoning (${numerical.raw}/${numerical.total})`} pct={numerical.percentage} color="bg-emerald-500" />
              <ScoreBar label={`Spatial Reasoning (${spatial.raw}/${spatial.total})`} pct={spatial.percentage} color="bg-violet-500" />
              <Separator />
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Analytical', val: personality.analytical, color: 'text-blue-600' },
                  { label: 'Creative', val: personality.creative, color: 'text-violet-600' },
                  { label: 'Operational', val: personality.operational, color: 'text-emerald-600' },
                ].map(p => (
                  <div key={p.label} className={`p-2 rounded-lg bg-muted/60 ${personality.profile === p.label ? 'ring-2 ring-primary' : ''}`}>
                    <p className={`text-xl font-bold ${p.color}`}>{p.val}%</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bell Curve */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />National Score Distribution
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Benchmark μ = {benchmarkStats.mean}, σ = {benchmarkStats.std} &nbsp;|&nbsp;
              Your composite: <span className="font-semibold text-primary">{userTotal}</span> &nbsp;|&nbsp;
              National avg: <span className="font-semibold">{Math.round(benchmarkStats.mean)}</span>
            </p>
          </CardHeader>
          <CardContent>
            <BellCurveChart userScore={userTotal} mean={benchmarkStats.mean} std={benchmarkStats.std} />
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Users className="w-4 h-4" />National Leaderboard
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              You are ranked <span className="font-bold text-foreground">#{percentileResult.rank.toLocaleString('en-IN')}</span> out of&nbsp;
              <span className="font-bold text-foreground">{percentileResult.totalStudents.toLocaleString('en-IN')}</span> students
            </p>
          </CardHeader>
          <CardContent>
            <Leaderboard
              topStudents={topStudents} userRank={percentileResult.rank} userTotal={userTotal}
              candidateId={state.candidateId} name={state.name} region={state.region}
              educationLevel={state.educationLevel} totalStudents={percentileResult.totalStudents}
            />
          </CardContent>
        </Card>

        {/* Personality Profile */}
        <Card className={`border ${profileColors[personality.profile]}`}>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">Occupational Interest Profile</p>
              <h2 className="text-xl font-bold">{personality.profile} — {profileDesc.tagline}</h2>
              <p className="mt-2 text-sm opacity-80 leading-relaxed">{profileDesc.description}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-2">Recommended Career Domains</p>
              <p className="text-sm opacity-90 font-medium">{profileDesc.careers}</p>
            </div>
          </CardContent>
        </Card>

        {/* RIASEC Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">RIASEC Interest Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(RIASEC_LABELS) as RiasecCode[]).map(code => (
                <div key={code} className={`rounded-lg p-3 ${RIASEC_COLORS[code]}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{code}</span>
                    <span className="text-base font-bold">{personality.riasecScores[code]}%</span>
                  </div>
                  <p className="text-xs font-medium">{RIASEC_LABELS[code]}</p>
                  <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
                    <div className="h-full bg-current opacity-50 rounded-full" style={{ width: `${personality.riasecScores[code]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Click "Download PDF" to save a branded report with full question review and step-by-step solutions.
          Benchmark: 2,500 nationally simulated candidates using Normal Distribution (μ=50, σ=15).
        </p>
      </main>
    </div>
  );
}
