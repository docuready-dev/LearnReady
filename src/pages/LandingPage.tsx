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
import { Clock, BarChart3, Brain, ArrowRight, RotateCcw, GraduationCap, Zap, BookOpen, CheckCircle2, User, LogIn, UserPlus, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TestMode } from '../types';
import { INDIAN_BOARDS } from '../data/boards';
import PaymentModal from '../components/PaymentModal';

const LOGO_URL = `${import.meta.env.BASE_URL}logo.svg`;
const DRAFT_FORM_KEY = 'learnready_landing_draft';

const REGIONS = ['North India', 'Northeast India', 'East India', 'Central India', 'West India', 'South India', 'International'];
const EDUCATION_LEVELS = ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'Undergraduate', 'Graduate'];
const QUICK_ELIGIBLE = ['Class 9', 'Class 10'];

const SECTIONS_INFO = [
  { label: 'Verbal Ability', desc: 'English comprehension, vocabulary, and logical analogies', cls: 'bg-muted/50 text-foreground border-border' },
  { label: 'Numerical Reasoning', desc: 'Basic arithmetic, data interpretation, and number patterns', cls: 'bg-muted/50 text-foreground border-border' },
  { label: 'Spatial Logic', desc: 'Geometric patterns, shapes, and 3D visualization', cls: 'bg-muted/50 text-foreground border-border' },
  { label: 'Career Interests', desc: 'Holland RIASEC survey to identify your preferred career streams', cls: 'bg-muted/50 text-foreground border-border' },
];

const MODES: { id: TestMode; icon: any; title: string; time: string; questions: string; desc: string; badge: string }[] = [
  {
    id: 'full',
    icon: BookOpen,
    title: 'Full Assessment',
    time: '90 minutes',
    questions: '65 questions',
    desc: 'Comprehensive assessment with detailed national ranking and stream recommendations',
    badge: 'Recommended',
  },
  {
    id: 'quick',
    icon: Zap,
    title: 'Quick Test',
    time: '30 minutes',
    questions: '30 questions',
    desc: 'Shorter test covering all 4 sections with fewer questions per section',
    badge: 'Express',
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
          educationLevel: (p.educationLevel || state.educationLevel || user?.grade || '').replace(/\s*\(Current\)/gi, '').trim(),
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
      educationLevel: (state.educationLevel || user?.grade || '').replace(/\s*\(Current\)/gi, '').trim(),
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
        educationLevel: (p.educationLevel || user.grade || '').replace(/\s*\(Current\)/gi, '').trim(),
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
    const minutes = Math.floor((diff % (60 * 1000)) / (60 * 1000));
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
    if (!form.age || isNaN(+form.age) || +form.age < 12 || +form.age > 25) e.age = 'Enter a valid age between 12 and 25';
    if (!form.region) e.region = 'Select your region';
    if (!form.educationLevel) e.educationLevel = 'Select your class/level';
    if (!form.board) e.board = 'Select your educational board';
    if (!form.candidateId.trim()) e.candidateId = 'Roll number or Candidate ID required';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Enter a valid email address';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid 10-digit mobile number';
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
    <div className="min-h-screen bg-background flex flex-col font-delight text-left">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card px-4 py-3 text-left">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-left">
            <img
              src={LOGO_URL}
              alt="LearnReady"
              style={{ height: '48px', width: 'auto' }}
              className="object-contain cursor-pointer select-none transition-transform active:scale-95"
              onClick={handleLogoClick}
              title="LearnReady Assessment"
            />
          </div>

          <div className="flex items-center gap-3 text-left">
            <Badge variant="outline" className="text-muted-foreground border-border bg-muted/40 hidden md:flex items-center gap-1.5 py-1 px-3 text-xs font-medium">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span>Indian Boards 2026-27</span>
            </Badge>

            {user ? (
              <div className="flex items-center gap-2.5 text-left">
                {user.isPaidPro ? (
                  <Badge className="bg-emerald-600 text-white border-0 text-xs py-1 px-3 hidden sm:flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Pro Member</span>
                  </Badge>
                ) : trialTimeLeft ? (
                  <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 text-xs py-1 px-3 hidden sm:flex items-center gap-1.5 font-medium dark:bg-amber-950/40 dark:text-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Trial: {trialTimeLeft.days}d {trialTimeLeft.hours}h left</span>
                  </Badge>
                ) : null}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage('profile')}
                  className="font-delight text-sm h-10 px-4 font-medium border-border text-foreground hover:bg-muted cursor-pointer flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">My Profile & Results</span>
                  <span className="sm:hidden">Profile</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="text-sm text-muted-foreground hover:text-foreground h-10 px-3 cursor-pointer"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => setPage('login')}
                className="font-delight text-sm font-semibold text-white bg-primary hover:bg-primary/90 h-10 px-4 cursor-pointer flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Register</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-card py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-left">
        <div className="max-w-5xl mx-auto space-y-6 text-left">
          <div className="space-y-3 text-left">
            <h1 className="font-delight text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight text-left">
              Aptitude Assessment & Stream Selection Guide
            </h1>

            <p className="font-delight text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl text-left">
              Choosing between Science, Commerce, and Humanities is a crucial decision for Class 9 and 10 students. LearnReady evaluates your skills in English, Mathematics, and Logic alongside your career interests to give you an objective recommendation on which stream fits your natural strengths.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 text-left">
            <Button
              size="lg"
              onClick={handleHeroBegin}
              className="font-delight text-base h-11 px-7 font-semibold bg-primary hover:bg-primary/90 text-white cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Begin Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            {user ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setPage('profile')}
                className="font-delight text-base h-11 px-5 font-medium border-border text-foreground hover:bg-muted cursor-pointer flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>View My Profile & Past Results</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setAuthTab('register');
                  setPage('login');
                }}
                className="font-delight text-base h-11 px-5 font-medium border-border text-foreground hover:bg-muted cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Create Student Account (7-Day Trial)</span>
              </Button>
            )}
          </div>

          {/* Simple, Professional 4-Column Feature Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-border/80 text-left">
            <div className="space-y-1 text-left">
              <h3 className="font-delight text-sm font-bold text-foreground text-left">4 Assessment Areas</h3>
              <p className="font-delight text-xs sm:text-sm text-muted-foreground leading-relaxed text-left">
                Verbal ability, numerical reasoning, spatial logic, and career interest profiling.
              </p>
            </div>

            <div className="space-y-1 text-left">
              <h3 className="font-delight text-sm font-bold text-foreground text-left">Flexible Test Formats</h3>
              <p className="font-delight text-xs sm:text-sm text-muted-foreground leading-relaxed text-left">
                Choose between a 30-minute Express Test or a full 90-minute Diagnostic session.
              </p>
            </div>

            <div className="space-y-1 text-left">
              <h3 className="font-delight text-sm font-bold text-foreground text-left">National Benchmarking</h3>
              <p className="font-delight text-xs sm:text-sm text-muted-foreground leading-relaxed text-left">
                See how your scores compare to students across CBSE, ICSE, and State Boards.
              </p>
            </div>

            <div className="space-y-1 text-left">
              <h3 className="font-delight text-sm font-bold text-foreground text-left">7-Day Free Trial</h3>
              <p className="font-delight text-xs sm:text-sm text-muted-foreground leading-relaxed text-left">
                Complete assessment and stream report included. Question banks available for ₹899.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Begin Assessment Section */}
      <section id="begin-assessment" className="flex-1 py-12 px-4 sm:px-6 lg:px-8 text-left">
        <div className="w-full max-w-2xl mx-auto space-y-7 text-left">
          {/* Section Header */}
          <div className="text-left space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary text-left">Student Information</span>
            <h2 className="font-delight text-2xl sm:text-3xl font-bold text-foreground tracking-tight text-left">
              Start Your Assessment
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground text-left leading-relaxed">
              Enter your details below to set up your test. Every session is randomised from our question repository.
            </p>
          </div>

          {/* Test Sections Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {SECTIONS_INFO.map(s => (
              <div key={s.label} className={`rounded-xl border p-4 text-left ${s.cls}`}>
                <p className="font-bold text-sm text-foreground text-left">{s.label}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-left leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Session Timing Meta */}
          <div className="flex items-center justify-start gap-6 text-sm text-muted-foreground flex-wrap text-left">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" />{displayTime}</span>
            <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-primary" />{displayQuestions}</span>
            <span className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-primary" />Unique question set</span>
          </div>

          {/* 7-Day Free Trial / Pro Membership Dashboard Banner (When Signed In) */}
          {user && (
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 text-left space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3 text-left">
                <div className="flex items-center gap-3 text-left">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    user.isPaidPro ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-muted text-foreground'
                  }`}>
                    {user.isPaidPro ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 text-left">
                      <h3 className="text-base font-bold text-foreground text-left">
                        {user.isPaidPro ? 'Pro Member (Unlimited Access)' : '7-Day Free Trial Active'}
                      </h3>
                      {user.isPaidPro ? (
                        <Badge className="bg-emerald-600 text-white text-xs px-2 py-0.5">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          {trialTimeLeft?.isExpired ? 'Trial Finished' : 'Trial Period'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 text-left">
                      {user.isPaidPro
                        ? 'Full access to all diagnostic tests and chapter-wise question banks.'
                        : 'Access to diagnostic tests, score reports, and stream recommendations.'}
                    </p>
                  </div>
                </div>

                {!user.isPaidPro && trialTimeLeft && (
                  <div className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-left sm:text-right shrink-0">
                    <span className="text-xs font-medium text-muted-foreground block text-left sm:text-right">Trial Time Remaining</span>
                    <span className="text-sm font-mono font-bold text-foreground block text-left sm:text-right">
                      {trialTimeLeft.days}d {trialTimeLeft.hours}h {trialTimeLeft.minutes}m
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-left">
                <p className="text-xs sm:text-sm text-muted-foreground text-left leading-relaxed">
                  {user.isPaidPro
                    ? 'All subjects\' chapter-wise question banks with verified step-by-step answer keys are available in your Profile.'
                    : 'Unlock all subjects\' chapter-wise question banks with verified answer keys for a one-time fee of ₹899.'}
                </p>
                <div className="flex items-center gap-2 shrink-0 text-left">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs sm:text-sm font-medium h-9 px-3.5 cursor-pointer border-border text-foreground hover:bg-muted"
                    onClick={() => setPage('profile')}
                  >
                    View in Profile
                  </Button>
                  {!user.isPaidPro && (
                    <Button
                      size="sm"
                      className="text-xs sm:text-sm h-9 px-3.5 cursor-pointer font-semibold bg-primary hover:bg-primary/90 text-white"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      Get Question Banks (₹899)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <Card className="border-border text-left">
            <CardContent className="pt-6 space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground text-left">Full Name <span className="text-destructive">*</span></Label>
                  <Input id="name" placeholder="e.g. Arjun Sharma" value={form.name} onChange={e => setField('name', e.target.value)} className="h-11 text-sm text-left" />
                  {errors.name && <p className="text-xs text-destructive text-left">{errors.name}</p>}
                </div>
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="age" className="text-sm font-semibold text-foreground text-left">Age <span className="text-destructive">*</span></Label>
                  <Input id="age" type="number" placeholder="e.g. 15" min={12} max={25} value={form.age} onChange={e => setField('age', e.target.value)} className="h-11 text-sm text-left" />
                  {errors.age && <p className="text-xs text-destructive text-left">{errors.age}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="space-y-1.5 text-left">
                  <Label className="text-sm font-semibold text-foreground text-left">Region <span className="text-destructive">*</span></Label>
                  <Select value={form.region} onValueChange={v => setField('region', v)}>
                    <SelectTrigger className="h-11 text-sm text-left"><SelectValue placeholder="Select region" /></SelectTrigger>
                    <SelectContent>{REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.region && <p className="text-xs text-destructive text-left">{errors.region}</p>}
                </div>
                <div className="space-y-1.5 text-left">
                  <Label className="text-sm font-semibold text-foreground text-left">Class / Level <span className="text-destructive">*</span></Label>
                  <Select value={form.educationLevel} onValueChange={v => setField('educationLevel', v)}>
                    <SelectTrigger className="h-11 text-sm text-left"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>{EDUCATION_LEVELS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.educationLevel && <p className="text-xs text-destructive text-left">{errors.educationLevel}</p>}
                </div>
              </div>

              {/* Test Format Selector: visible only for Class 9 & 10 */}
              {isQuickEligible && (
                <div className="space-y-2 text-left">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-foreground text-left">
                    <span>Assessment Format</span>
                    <Badge variant="outline" className="text-xs font-normal border-border bg-muted/50">Class 9 and 10</Badge>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
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
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/40 hover:bg-muted/30'
                          )}
                        >
                          {selected && (
                            <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-primary" />
                          )}
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2.5', selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <p className="font-semibold text-sm sm:text-base text-foreground text-left">{m.title}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 text-left leading-relaxed">{m.desc}</p>
                          <div className="flex items-center gap-3 mt-2.5 flex-wrap text-left">
                            <span className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />{m.time}
                            </span>
                            <span className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                              <BarChart3 className="w-3.5 h-3.5" />{m.questions}
                            </span>
                          </div>
                          <Badge variant="outline" className="mt-2 text-xs font-medium">{m.badge}</Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Board Selection */}
              <div className="space-y-1.5 text-left">
                <Label className="flex items-center gap-1.5 text-sm font-semibold text-foreground text-left">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Educational Board <span className="text-destructive">*</span>
                </Label>
                <Select value={form.board} onValueChange={v => setField('board', v)}>
                  <SelectTrigger className="w-full h-11 text-sm text-left">
                    <SelectValue placeholder="Select your educational board" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_BOARDS.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.board && <p className="text-xs text-destructive text-left">{errors.board}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="candidateId" className="text-sm font-semibold text-foreground text-left">Roll No. / Student ID <span className="text-destructive">*</span></Label>
                  <Input id="candidateId" placeholder="e.g. 23CBSE001" value={form.candidateId} onChange={e => setField('candidateId', e.target.value)} className="h-11 text-sm text-left" />
                  {errors.candidateId && <p className="text-xs text-destructive text-left">{errors.candidateId}</p>}
                </div>
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="phone" className="text-sm font-semibold text-foreground text-left">Mobile Number <span className="text-destructive">*</span></Label>
                  <Input id="phone" type="tel" placeholder="e.g. 9876543210" value={form.phone} onChange={e => setField('phone', e.target.value)} className="h-11 text-sm text-left" />
                  {errors.phone && <p className="text-xs text-destructive text-left">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground text-left">Email Address <span className="text-destructive">*</span></Label>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setField('email', e.target.value)} className="h-11 text-sm text-left" />
                {errors.email && <p className="text-xs text-destructive text-left">{errors.email}</p>}
              </div>

              {hasExistingExam ? (
                <div className="flex gap-2.5 pt-2 text-left">
                  <Button className="flex-1 cursor-pointer font-semibold text-base h-11" onClick={() => {
                    if (!user) {
                      setShowAuthPrompt(true);
                      return;
                    }
                    setPage('exam');
                  }}>
                    <ArrowRight className="w-4 h-4 mr-2" />Resume Assessment
                  </Button>
                  <Button variant="outline" className="cursor-pointer h-11 px-4" onClick={() => resetExam()}>
                    <RotateCcw className="w-4 h-4 mr-1.5" />Restart
                  </Button>
                </div>
              ) : (
                <Button className="w-full cursor-pointer font-semibold text-base h-11 bg-primary hover:bg-primary/90 text-white" size="lg" onClick={handleStart}>
                  Begin Assessment <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>

          <p className="text-left text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Your progress is automatically saved to your browser during the test.
          </p>
        </div>
      </section>

      {/* Auth Prompt Alert Modal */}
      <AlertDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <AlertDialogContent className="sm:max-w-md text-left">
          <AlertDialogHeader className="text-left space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1 text-left">
              <UserCheck className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="font-delight text-xl font-bold text-left">Sign In or Register to Continue</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground text-left leading-relaxed">
              Please sign in or create a student account to record your test scores and view your personalised stream recommendations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2.5 pt-3 text-left">
            <Button
              className="w-full flex items-center justify-center gap-2 cursor-pointer font-semibold h-11 text-sm bg-primary hover:bg-primary/90 text-white"
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
              className="w-full flex items-center justify-center gap-2 border-border text-foreground hover:bg-muted cursor-pointer font-semibold h-11 text-sm"
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
              className="w-full text-xs sm:text-sm text-muted-foreground hover:text-foreground mt-1 cursor-pointer h-9"
              onClick={() => setShowAuthPrompt(false)}
            >
              Cancel
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Existing Exam Confirmation Modal */}
      <AlertDialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <AlertDialogContent className="text-left">
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle className="font-delight font-bold text-lg text-left">Start a new assessment?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground text-left leading-relaxed">
              You already have a test session in progress. Starting a new session will erase your previous answers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="text-left">
            <AlertDialogCancel onClick={() => setPage('exam')} className="cursor-pointer">Resume existing</AlertDialogCancel>
            <AlertDialogAction onClick={() => { resetExam(); doStart(); }} className="cursor-pointer">Start fresh</AlertDialogAction>
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
