import { useState, useEffect } from 'react';
import { useExam } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Clock, BarChart3, Brain, ArrowRight, RotateCcw, GraduationCap, Zap, BookOpen, CheckCircle2, User, LogIn, UserPlus, UserCheck, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TestMode } from '../types';
import { INDIAN_BOARDS } from '../data/boards';
import PaymentModal from '../components/PaymentModal';

const LOGO_URL = `${import.meta.env.BASE_URL}logo.svg`;
const DRAFT_FORM_KEY = 'learnready_landing_draft';

const REGIONS = ['North India', 'Northeast India', 'East India', 'Central India', 'West India', 'South India', 'International'];
const EDUCATION_LEVELS = ['Class 9', 'Class 10 (Current)', 'Class 11', 'Class 12', 'Undergraduate', 'Graduate'];
const QUICK_ELIGIBLE = ['Class 9', 'Class 10 (Current)'];

const SECTIONS_INFO = [
  { label: 'Verbal Reasoning', desc: 'Analogies, vocabulary and analytical comprehension', cls: 'bg-blue-50/70 text-blue-800 border-blue-200' },
  { label: 'Numerical Reasoning', desc: 'Arithmetic logic, data interpretation and numerical sequences', cls: 'bg-emerald-50/70 text-emerald-800 border-emerald-200' },
  { label: 'Spatial Reasoning', desc: '3D mental rotation, geometric patterns and spatial visualization', cls: 'bg-violet-50/70 text-violet-800 border-violet-200' },
  { label: 'Occupational Interests', desc: 'Holland RIASEC career interest battery and vocational profiling', cls: 'bg-amber-50/70 text-amber-800 border-amber-200' },
];

const MODES: { id: TestMode; icon: any; title: string; time: string; questions: string; desc: string; badge: string; badgeCls: string }[] = [
  {
    id: 'full',
    icon: BookOpen,
    title: 'Full Assessment',
    time: '90 minutes',
    questions: '65 questions',
    desc: 'Complete diagnostic with detailed national benchmarking and stream recommendations',
    badge: 'Recommended',
    badgeCls: 'bg-primary/10 text-primary border-primary/30',
  },
  {
    id: 'quick',
    icon: Zap,
    title: 'Quick Test',
    time: '30 minutes',
    questions: '30 questions',
    desc: 'Shorter session with same 4 sections and fewer questions per section',
    badge: 'Express',
    badgeCls: 'bg-amber-50 text-amber-700 border-amber-300',
  },
];

export default function LandingPage() {
  const { startExam, setPage, state, resetExam } = useExam();
  const { user, logout, setAuthTab, handleLogoClick } = useAuth();
  const [form, setFormState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_FORM_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        return {
          name: p.name || state.name || user?.name || '',
          age: p.age || state.age || '',
          region: p.region || state.region || '',
          educationLevel: p.educationLevel || state.educationLevel || user?.grade || '',
          board: p.board || state.board || user?.board || '',
          candidateId: p.candidateId || state.candidateId || '',
          email: p.email || state.email || user?.email || '',
          phone: p.phone || state.phone || user?.phone || '',
        };
      }
    } catch {}
    return {
      name: state.name || user?.name || '',
      age: state.age || '',
      region: state.region || '',
      educationLevel: state.educationLevel || user?.grade || '',
      board: state.board || user?.board || '',
      candidateId: state.candidateId || '',
      email: state.email || user?.email || '',
      phone: state.phone || user?.phone || '',
    };
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_FORM_KEY, JSON.stringify(form));
    } catch {}
  }, [form]);

  useEffect(() => {
    if (user) {
      setFormState(p => ({
        ...p,
        name: p.name || user.name || '',
        email: p.email || user.email || '',
        phone: p.phone || user.phone || '',
        educationLevel: p.educationLevel || user.grade || '',
        board: p.board || user.board || '',
      }));
    }
  }, [user]);

  const [testMode, setTestMode] = useState<TestMode>('full');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const hasExistingExam = state.startTime > 0 && !state.completed;

  // Real-time trial countdown timer
  const [trialTimeLeft, setTrialTimeLeft] = useState<{
    diff: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(() => {
    if (!user || user.isPaidPro) return null;
    const end = user.trialEndsAt || (user.registeredAt ? user.registeredAt + 7 * 24 * 60 * 60 * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000);
    const diff = Math.max(0, end - Date.now());
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);
    return { diff, days, hours, minutes, seconds, isExpired: diff === 0 };
  });

  useEffect(() => {
    if (!user || user.isPaidPro) {
      setTrialTimeLeft(null);
      return;
    }

    function calculateTime() {
      const end = user!.trialEndsAt || (user!.registeredAt ? user!.registeredAt + 7 * 24 * 60 * 60 * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000);
      const diff = Math.max(0, end - Date.now());
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);
      setTrialTimeLeft({ diff, days, hours, minutes, seconds, isExpired: diff === 0 });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const isQuickEligible = QUICK_ELIGIBLE.includes(form.educationLevel);

  function setField(key: string, value: string) {
    setFormState(p => ({ ...p, [key]: value }));
    if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
    if (key === 'educationLevel' && !QUICK_ELIGIBLE.includes(value)) {
      setTestMode('full');
    }
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.age || isNaN(+form.age) || +form.age < 12 || +form.age > 25) e.age = 'Valid age (12 to 25) required';
    if (!form.region) e.region = 'Select your region';
    if (!form.educationLevel) e.educationLevel = 'Select your class/level';
    if (!form.board) e.board = 'Select your educational board';
    if (!form.candidateId.trim()) e.candidateId = 'Roll number / Candidate ID required';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email required';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) e.phone = 'Valid 10-digit mobile number required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function doStart() {
    const effectiveMode = isQuickEligible ? testMode : 'full';
    startExam(form.candidateId.trim(), form.email.trim(), form.name.trim(), form.age, form.region, form.educationLevel, form.board, effectiveMode, form.phone.trim());
    setPage('exam');
  }

  function handleStart() {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    if (!validate()) return;
    if (hasExistingExam) {
      setShowResumeDialog(true);
      return;
    }
    doStart();
  }

  function scrollToAssessment() {
    const el = document.getElementById('begin-assessment');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleHeroBegin() {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    scrollToAssessment();
  }

  const displayTime = isQuickEligible && testMode === 'quick' ? '30 minutes' : '90 minutes';
  const displayQuestions = isQuickEligible && testMode === 'quick' ? '30 questions' : '65 questions';

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm px-4 py-2.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="LearnReady"
              style={{ height: '48px', width: 'auto' }}
              className="object-contain cursor-pointer select-none transition-transform active:scale-95"
              onClick={handleLogoClick}
              title="LearnReady Assessment"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 hidden md:flex items-center gap-1.5 py-1 px-3 text-xs font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-primary" />
              <span>Indian Boards 2026-27</span>
            </Badge>

            {user ? (
              <div className="flex items-center gap-2">
                {user.isPaidPro ? (
                  <Badge className="bg-emerald-600 text-white border-0 text-xs py-1 px-2.5 hidden sm:flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pro Member</span>
                  </Badge>
                ) : trialTimeLeft ? (
                  <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 text-xs py-1 px-2.5 hidden sm:flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>Trial: {trialTimeLeft.days}d {trialTimeLeft.hours}h {trialTimeLeft.minutes}m</span>
                  </Badge>
                ) : null}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage('profile')}
                  className="font-delight text-xs h-9 px-3.5 font-semibold border-primary/30 text-primary hover:bg-primary/5 cursor-pointer flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">My Profile & Results</span>
                  <span className="sm:hidden">Profile</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="text-xs text-muted-foreground hover:text-foreground h-9 px-2.5 cursor-pointer"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => setPage('login')}
                className="font-delight text-xs font-bold text-white bg-primary hover:bg-primary/90 h-9 px-4 cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-blue-50/60 via-background to-background dark:from-blue-950/20 dark:via-background dark:to-background py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6 text-left">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span>Standardized Secondary Diagnostic • Academic Session 2026-27</span>
          </div>

          {/* Hero Headline in Delight Font */}
          <div className="space-y-4">
            <h1 className="font-delight text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.15]">
              Discover Your Academic Strengths.
              <span className="block text-primary mt-1">Choose Your Stream with Confidence.</span>
            </h1>

            {/* Concise Explanation of Assessment & WebApp in Delight Font */}
            <p className="font-delight text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-4xl text-left sm:text-justify">
              LearnReady is an intelligent diagnostic assessment and career orientation web application crafted for Class 9 to 12 students across CBSE, ICSE, and State Boards. Through calibrated, uniquely randomised questions in Verbal, Numerical, and Spatial reasoning combined with RIASEC vocational interest profiling, LearnReady pinpoints your core aptitudes and provides clear, data-driven recommendations for Science (PCM/PCB), Commerce, and Humanities.
            </p>
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={handleHeroBegin}
              className="font-delight text-base h-12 px-7 font-bold shadow-md hover:shadow-lg transition-all cursor-pointer bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2.5"
            >
              <span>Begin Assessment</span>
              <ArrowRight className="w-5 h-5" />
            </Button>

            {user ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setPage('profile')}
                className="font-delight text-base h-12 px-6 font-semibold border-primary/30 text-primary hover:bg-primary/5 cursor-pointer flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>My Profile & Diagnostic Results</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setAuthTab('register');
                  setPage('login');
                }}
                className="font-delight text-base h-12 px-6 font-semibold border-primary/30 text-primary hover:bg-primary/5 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Start 7-Day Free Trial</span>
              </Button>
            )}
          </div>

          {/* 4 Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-4">
            <div className="rounded-xl border border-border bg-card/80 p-4 space-y-1.5 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <h3 className="font-delight text-sm font-bold text-foreground">Tripartite Aptitude</h3>
              </div>
              <p className="font-delight text-xs text-muted-foreground leading-relaxed text-left sm:text-justify pt-1">
                Evaluates Verbal logic, Numerical reasoning, and Spatial 3D visualization through balanced, calibrated problem sets.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/80 p-4 space-y-1.5 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="font-delight text-sm font-bold text-foreground">RIASEC Stream Fit</h3>
              </div>
              <p className="font-delight text-xs text-muted-foreground leading-relaxed text-left sm:text-justify pt-1">
                Maps authentic personal interests against Science (PCM/PCB), Commerce, and Humanities career trajectories.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/80 p-4 space-y-1.5 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="font-delight text-sm font-bold text-foreground">National Norms</h3>
              </div>
              <p className="font-delight text-xs text-muted-foreground leading-relaxed text-left sm:text-justify pt-1">
                Every session is uniquely randomised, benchmarking candidate scores against continuous national percentile cohorts.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/80 p-4 space-y-1.5 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-delight text-sm font-bold text-foreground">7-Day Free Trial</h3>
              </div>
              <p className="font-delight text-xs text-muted-foreground leading-relaxed text-left sm:text-justify pt-1">
                Includes full access to the diagnostic battery and detailed stream analysis, with chapterwise question banks for ₹899.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Begin Assessment Section */}
      <section id="begin-assessment" className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl mx-auto space-y-7">
          {/* Section Header */}
          <div className="text-left space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Candidate Registration</span>
            <h2 className="font-delight text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Begin Your Diagnostic Assessment
            </h2>
            <p className="text-sm text-muted-foreground text-left sm:text-justify leading-relaxed">
              Complete your candidate details below to configure your uniquely randomised diagnostic battery. Each session is benchmarked against Indian secondary educational cohorts.
            </p>
          </div>

          {/* Battery Sections Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SECTIONS_INFO.map(s => (
              <div key={s.label} className={`rounded-lg border p-3 ${s.cls}`}>
                <p className="font-semibold text-sm text-left">{s.label}</p>
                <p className="text-xs opacity-85 mt-0.5 text-left text-justify">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Session Timing Meta */}
          <div className="flex items-center justify-start gap-6 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" />{displayTime}</span>
            <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-primary" />{displayQuestions}</span>
            <span className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-primary" />Unique Randomisation</span>
          </div>

          {/* 7-Day Free Trial / Pro Membership Dashboard Banner (When Signed In) */}
          {user && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    user.isPaidPro ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}>
                    {user.isPaidPro ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        {user.isPaidPro ? 'Pro Membership Active' : '7-Day Free Candidate Trial'}
                      </h3>
                      {user.isPaidPro ? (
                        <Badge className="bg-emerald-600 text-white text-2xs">Lifetime Access</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 text-2xs">
                          {trialTimeLeft?.isExpired ? 'Trial Expired' : 'Active'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-2xs text-muted-foreground mt-0.5">
                      {user.isPaidPro
                        ? 'Full access to all diagnostic batteries and chapterwise question banks.'
                        : 'Unrestricted access to all diagnostic batteries, percentile scoring, and stream fit analysis.'}
                    </p>
                  </div>
                </div>

                {!user.isPaidPro && trialTimeLeft && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-1.5 text-center sm:text-right shrink-0">
                    <span className="text-2xs font-semibold uppercase text-amber-800 dark:text-amber-300 tracking-wider block">Trial Countdown</span>
                    <span className="text-xs font-mono font-bold text-amber-950 dark:text-amber-100">
                      {trialTimeLeft.days}d {trialTimeLeft.hours}h {trialTimeLeft.minutes}m {trialTimeLeft.seconds}s
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
                <p className="text-xs text-muted-foreground text-left sm:text-justify leading-relaxed">
                  {user.isPaidPro
                    ? 'All subjects\' chapterwise question banks with verified step-by-step answer keys are available in your Profile section.'
                    : 'After your 7-day trial, unlock all subjects\' chapterwise question banks with verified step-by-step answer keys for a one-time fee of ₹899/- INR.'}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs cursor-pointer border-primary/30 text-primary hover:bg-primary/5"
                    onClick={() => setPage('profile')}
                  >
                    View in Profile
                  </Button>
                  {!user.isPaidPro && (
                    <Button
                      size="sm"
                      className="text-xs cursor-pointer font-semibold bg-gradient-to-r from-primary to-blue-700 text-white flex items-center gap-1.5 shadow-sm"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Unlock Banks (₹899)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <Card className="shadow-sm border-border">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                  <Input id="name" placeholder="e.g. Arjun Sharma" value={form.name} onChange={e => setField('name', e.target.value)} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="age">Age <span className="text-destructive">*</span></Label>
                  <Input id="age" type="number" placeholder="e.g. 15" min={12} max={25} value={form.age} onChange={e => setField('age', e.target.value)} />
                  {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Region <span className="text-destructive">*</span></Label>
                  <Select value={form.region} onValueChange={v => setField('region', v)}>
                    <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.region && <p className="text-xs text-destructive">{errors.region}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Class / Level <span className="text-destructive">*</span></Label>
                  <Select value={form.educationLevel} onValueChange={v => setField('educationLevel', v)}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>{EDUCATION_LEVELS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.educationLevel && <p className="text-xs text-destructive">{errors.educationLevel}</p>}
                </div>
              </div>

              {/* Test Format Selector: visible only for Class 9 & 10 */}
              {isQuickEligible && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    Assessment Format
                    <Badge variant="outline" className="text-xs font-normal border-primary/30 text-primary bg-primary/5 ml-1">Class 9 and 10</Badge>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MODES.map(m => {
                      const Icon = m.icon;
                      const selected = testMode === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setTestMode(m.id)}
                          className={cn(
                            'relative p-4 rounded-xl border-2 text-left transition-all focus:outline-none cursor-pointer',
                            selected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/40 hover:bg-muted/30'
                          )}
                        >
                          {selected && (
                            <CheckCircle2 className="absolute top-2.5 right-2.5 w-4 h-4 text-primary" />
                          )}
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2.5', selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <p className="font-semibold text-sm text-foreground">{m.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />{m.time}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <BarChart3 className="w-3 h-3" />{m.questions}
                            </span>
                          </div>
                          <Badge variant="outline" className={cn('mt-2 text-xs', m.badgeCls)}>{m.badge}</Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Board Selection */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  Educational Board <span className="text-destructive">*</span>
                </Label>
                <Select value={form.board} onValueChange={v => setField('board', v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your educational board (mandatory)" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_BOARDS.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.board && <p className="text-xs text-destructive">{errors.board}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="candidateId">Roll No. / Candidate ID <span className="text-destructive">*</span></Label>
                  <Input id="candidateId" placeholder="e.g. 23CBSE001" value={form.candidateId} onChange={e => setField('candidateId', e.target.value)} />
                  {errors.candidateId && <p className="text-xs text-destructive">{errors.candidateId}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Mobile Number <span className="text-destructive">*</span></Label>
                  <Input id="phone" type="tel" placeholder="e.g. 9876543210" value={form.phone} onChange={e => setField('phone', e.target.value)} />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setField('email', e.target.value)} />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              {hasExistingExam ? (
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 cursor-pointer font-bold text-base h-11" onClick={() => {
                    if (!user) {
                      setShowAuthPrompt(true);
                      return;
                    }
                    setPage('exam');
                  }}>
                    <ArrowRight className="w-4 h-4 mr-2" />Resume Assessment
                  </Button>
                  <Button variant="outline" className="cursor-pointer h-11" onClick={() => resetExam()}>
                    <RotateCcw className="w-4 h-4 mr-1" />Restart
                  </Button>
                </div>
              ) : (
                <Button className="w-full cursor-pointer font-bold text-base h-12 shadow-sm" size="lg" onClick={handleStart}>
                  Begin Assessment <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>

          <p className="text-left text-xs text-muted-foreground text-justify">
            Each diagnostic assessment generates a unique question set from our calibrated national question bank. Session progress is stored locally in real-time.
          </p>
        </div>
      </section>

      {/* Auth Prompt Alert Modal */}
      <AlertDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="text-center sm:text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-1">
              <UserCheck className="w-6 h-6" />
            </div>
            <AlertDialogTitle className="font-delight text-xl font-bold">Sign In or Register Required</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground text-justify sm:text-left">
              No active student account was detected. Please sign in or register to record your diagnostic answers, benchmark your national percentile, and access your personalized stream recommendations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2.5 pt-3">
            <Button
              className="w-full flex items-center justify-center gap-2 cursor-pointer font-semibold"
              size="lg"
              onClick={() => {
                setShowAuthPrompt(false);
                setAuthTab('login');
                setPage('login');
              }}
            >
              <LogIn className="w-4 h-4" />
              Sign In to Existing Account
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-primary/30 text-primary hover:bg-primary/5 cursor-pointer font-semibold"
              size="lg"
              onClick={() => {
                setShowAuthPrompt(false);
                setAuthTab('register');
                setPage('login');
              }}
            >
              <UserPlus className="w-4 h-4" />
              Register New Student Account
            </Button>
            <Button
              variant="ghost"
              className="w-full text-xs text-muted-foreground hover:text-foreground mt-1 cursor-pointer"
              onClick={() => setShowAuthPrompt(false)}
            >
              Cancel and Stay on Overview
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Existing Exam Confirmation Modal */}
      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-delight font-bold">Start a new assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              You have an assessment in progress. Starting fresh will erase your current progress and generate a new unique question set.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPage('exam')}>Resume existing</AlertDialogCancel>
            <AlertDialogAction onClick={() => { resetExam(); doStart(); }}>Start fresh</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Chapterwise Question Bank ₹899 Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onSuccess={() => {
          setShowPaymentModal(false);
          setPage('profile');
        }}
      />
    </div>
  );
}
