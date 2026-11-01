import React, { useState } from 'react';
import { useAuth, ADMIN_EMAIL } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { INDIAN_BOARDS } from '../data/boards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  School,
  Home,
  Brain,
  BarChart3,
  BookOpen,
  Phone,
  GraduationCap,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

const LOGO_URL = `${import.meta.env.BASE_URL}logo.svg`;

const EDUCATION_LEVELS = [
  'Class 9',
  'Class 10 (Current)',
  'Class 11',
  'Class 12',
  'Undergraduate / Dropper'
];

export default function LoginPage() {
  const { user, login, register, authTab, setAuthTab, handleLogoClick } = useAuth();
  const { setPage } = useExam();

  const [mode, setMode] = useState<'login' | 'register'>(authTab || 'login');

  React.useEffect(() => {
    if (authTab) {
      setMode(authTab);
    }
  }, [authTab]);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGrade, setRegGrade] = useState('Class 10 (Current)');
  const [regBoard, setRegBoard] = useState('CBSE');
  const [regSchool, setRegSchool] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      errs.loginEmail = 'Enter a valid email address';
    }
    if (!loginPassword.trim()) {
      errs.loginPassword = 'Password is required';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      login(loginEmail.trim());
      setIsSubmitting(false);
      toast.success(`Welcome back, ${loginEmail.split('@')[0]}!`);
      if (loginEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setPage('admin');
      } else {
        setPage('landing');
      }
    }, 400);
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!regName.trim()) errs.regName = 'Full name is required';
    if (!regEmail.trim() || !regEmail.includes('@')) errs.regEmail = 'Enter a valid email address';
    if (!regPassword.trim() || regPassword.length < 6) {
      errs.regPassword = 'Password must be at least 6 characters';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      register({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim() || undefined,
        grade: regGrade,
        board: regBoard,
        school: regSchool.trim() || undefined,
      });
      setIsSubmitting(false);
      toast.success(`Account created! Welcome to your 7-Day Free Trial, ${regName}!`);
      setPage('landing');
    }, 400);
  }

  // Already logged in state
  if (user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg border-primary/20 text-center">
          <CardHeader className="pb-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <CardTitle className="text-xl font-bold">You are already signed in</CardTitle>
            <CardDescription className="text-sm">
              Signed in as <strong className="text-foreground">{user.name || user.email}</strong> ({user.email})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground flex items-center justify-between">
              <span>Account Type:</span>
              <Badge variant="outline" className="capitalize">{user.role || 'candidate'}</Badge>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button className="w-full cursor-pointer" onClick={() => setPage('landing')}>
                <Home className="w-4 h-4 mr-2" />Go to Home / Assessment
              </Button>
              <Button variant="outline" className="w-full cursor-pointer border-primary/30 text-primary hover:bg-primary/5" onClick={() => setPage('profile')}>
                <User className="w-4 h-4 mr-2" />Go to My Profile & Results
              </Button>
              {user.role === 'admin' && (
                <Button variant="outline" className="w-full cursor-pointer" onClick={() => setPage('admin')}>
                  <Lock className="w-4 h-4 mr-2" />Open Admin Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-2 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="LearnReady"
              style={{ height: '50px', width: 'auto' }}
              className="object-contain cursor-pointer select-none transition-transform active:scale-95"
              onClick={handleLogoClick}
              title="LearnReady"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPage('landing')} className="cursor-pointer text-xs">
              <Home className="w-3.5 h-3.5 mr-1" />Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Value Prop */}
          <div className="lg:col-span-5 space-y-6 hidden lg:block text-left">
            <div className="space-y-2 text-left">
              <Badge className="bg-primary/10 text-primary border-primary/30 text-xs px-2.5 py-0.5">
                Indian Boards 2026-27
              </Badge>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground text-left">
                National Cognitive & Stream Diagnostic
              </h1>
              <p className="text-sm text-muted-foreground text-left sm:text-justify leading-relaxed">
                Log in to securely track your diagnostic outcomes, compare against national benchmarks, and unlock your academic stream recommendation report.
              </p>
            </div>

            <div className="space-y-3.5 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground text-left">Psychometrically Standardized</p>
                  <p className="text-2xs text-muted-foreground text-left sm:text-justify">Verbal, Numerical & Spatial battery with Holland RIASEC interest index.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground text-left">Gaussian National Norms</p>
                  <p className="text-2xs text-muted-foreground text-left sm:text-justify">Real-time percentile ranking across CBSE, ICSE, and State Board cohorts.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground text-left">Stream Fit Recommendations</p>
                  <p className="text-2xs text-muted-foreground text-left sm:text-justify">Deterministic alignment into Science PCM/PCB, Commerce, and Humanities.</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs text-muted-foreground text-left">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-primary" />Candidate Portal
              </p>
              <p className="text-2xs text-justify leading-relaxed">
                Your diagnostic results and academic orientation reports are permanently tied to your student account. Sign in or register to preserve session continuity.
              </p>
            </div>
          </div>

          {/* Right Column: Auth Card */}
          <div className="lg:col-span-7">
            <Card className="shadow-lg border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-1">
                  <img src={LOGO_URL} alt="LearnReady" className="h-8 object-contain" />
                  <Badge variant="outline" className="text-2xs font-semibold">
                    {mode === 'login' ? 'Existing Candidate' : 'New Registration'}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold">
                  {mode === 'login' ? 'Sign in to your account' : 'Create candidate account'}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  {mode === 'login'
                    ? 'Enter your credentials to access your assessment session and reports'
                    : 'Register your details to save diagnostic progress and view stream fits'}
                </CardDescription>

                {/* Tab Switcher */}
                <div className="grid grid-cols-2 gap-1 bg-muted p-1 rounded-lg mt-3">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setAuthTab('login'); setErrors({}); }}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      mode === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setAuthTab('register'); setErrors({}); }}
                    className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      mode === 'register' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Register / Sign Up
                  </button>
                </div>
              </CardHeader>

              <CardContent>
                {mode === 'login' ? (
                  /* SIGN IN FORM */
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />Email Address
                      </Label>
                      <Input
                        type="email"
                        placeholder="e.g. rahul.sharma@example.com"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className={errors.loginEmail ? 'border-destructive' : ''}
                      />
                      {errors.loginEmail && <p className="text-xs text-destructive">{errors.loginEmail}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-muted-foreground" />Password
                        </Label>
                        <span className="text-2xs text-primary hover:underline cursor-pointer" onClick={() => toast.info('Default demo password can be any characters.')}>
                          Forgot password?
                        </span>
                      </div>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          className={errors.loginPassword ? 'border-destructive pr-10' : 'pr-10'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.loginPassword && <p className="text-xs text-destructive">{errors.loginPassword}</p>}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full font-semibold cursor-pointer">
                      {isSubmitting ? 'Authenticating...' : 'Sign In'}
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground text-2xs">or quick demo</span></div>
                    </div>

                    <div className="pt-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs cursor-pointer"
                        onClick={() => {
                          setLoginEmail('student.demo@learnready.in');
                          setLoginPassword('student123');
                        }}
                      >
                        <User className="w-3.5 h-3.5 mr-1.5" />Fill Student Demo Credentials
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* REGISTER FORM */
                  <form onSubmit={handleRegister} className="space-y-3.5">
                    {/* 7-Day Free Trial Notice */}
                    <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/30 p-3 text-left space-y-1">
                      <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-semibold text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Includes 7-Day Free Candidate Trial</span>
                        <Badge variant="outline" className="text-2xs bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-0 ml-auto">
                          Trial Active
                        </Badge>
                      </div>
                      <p className="text-2xs text-muted-foreground leading-relaxed text-justify">
                        All registrations start with an unrestricted 7-day trial period. After the 7-day trial, candidates can unlock all subjects' chapterwise question banks with verified answer keys for a one-time fee of ₹899/- INR.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />Student Full Name *
                      </Label>
                      <Input
                        placeholder="e.g. Ananya Deshmukh"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        className={errors.regName ? 'border-destructive' : ''}
                      />
                      {errors.regName && <p className="text-xs text-destructive">{errors.regName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />Email Address *
                        </Label>
                        <Input
                          type="email"
                          placeholder="ananya@example.com"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          className={errors.regEmail ? 'border-destructive' : ''}
                        />
                        {errors.regEmail && <p className="text-xs text-destructive">{errors.regEmail}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />Mobile Number
                        </Label>
                        <Input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-muted-foreground" />Password *
                      </Label>
                      <Input
                        type="password"
                        placeholder="Min 6 characters"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className={errors.regPassword ? 'border-destructive' : ''}
                      />
                      {errors.regPassword && <p className="text-xs text-destructive">{errors.regPassword}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Current Class / Grade *</Label>
                        <Select value={regGrade} onValueChange={setRegGrade}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {EDUCATION_LEVELS.map(lvl => (
                              <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Board *</Label>
                        <Select value={regBoard} onValueChange={setBoard => setRegBoard(setBoard)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select board" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDIAN_BOARDS.map(b => (
                              <SelectItem key={b.value} value={b.value}>{b.label.split('—')[0].trim()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-muted-foreground" />School / Institution Name (Optional)
                      </Label>
                      <Input
                        placeholder="e.g. Delhi Public School, R.K. Puram"
                        value={regSchool}
                        onChange={e => setRegSchool(e.target.value)}
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full font-semibold cursor-pointer mt-1">
                      {isSubmitting ? 'Registering...' : 'Register & Start Assessment'}
                    </Button>
                  </form>
                )}

                <div className="mt-4 pt-3 border-t border-border text-center">
                  <button
                    type="button"
                    onClick={() => setPage('landing')}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    ← Continue directly as Guest to Assessment
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
