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
  Phone,
  GraduationCap,
  Clock,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

const LOGO_URL = `${import.meta.env.BASE_URL}logo.svg`;

const EDUCATION_LEVELS = [
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'Undergraduate / Dropper'
];

export default function LoginPage() {
  const { user, login, register, authTab, setAuthTab, handleLogoClick, requestPasswordReset, resetPassword } = useAuth();
  const { setPage } = useExam();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(authTab || 'login');

  React.useEffect(() => {
    if (authTab) {
      setMode(authTab);
    }
  }, [authTab]);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form (Mobile number and Email are compulsory)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGrade, setRegGrade] = useState('Class 10');
  const [regBoard, setRegBoard] = useState('CBSE');
  const [regSchool, setRegSchool] = useState('');

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

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
    if (!regEmail.trim() || !regEmail.includes('@')) {
      errs.regEmail = 'Email address is compulsory';
    }

    const cleanPhone = regPhone.replace(/\D/g, '');
    if (!regPhone.trim()) {
      errs.regPhone = 'Mobile number is compulsory';
    } else if (cleanPhone.length < 10) {
      errs.regPhone = 'Enter a valid 10-digit mobile number';
    }

    if (!regPassword.trim() || regPassword.length < 6) {
      errs.regPassword = 'Password is required (min 6 characters)';
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
        phone: regPhone.trim(),
        password: regPassword.trim(),
        grade: regGrade,
        board: regBoard,
        school: regSchool.trim() || undefined,
      });
      setIsSubmitting(false);
      toast.success(`Account created! Welcome, ${regName}!`);
      setPage('landing');
    }, 400);
  }

  function handleSendForgotEmail(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      errs.forgotEmail = 'Enter a valid registered email address';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      requestPasswordReset(forgotEmail.trim());
      setIsSubmitting(false);
      setForgotSent(true);
      toast.success('Password reset instructions generated! Please check your spam & bin folders.');
    }, 500);
  }

  function handleCompletePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!newPassword.trim() || newPassword.length < 6) {
      errs.newPassword = 'New password must be at least 6 characters';
    }
    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      resetPassword(forgotEmail.trim(), newPassword.trim());
      setIsSubmitting(false);
      toast.success('Password successfully reset! You can now sign in.');
      setLoginEmail(forgotEmail.trim());
      setLoginPassword(newPassword.trim());
      setMode('login');
      setForgotSent(false);
    }, 500);
  }

  // Already logged in state
  if (user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-delight text-left">
        <Card className="w-full max-w-md border-border text-left">
          <CardHeader className="pb-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl font-bold text-left">You are signed in</CardTitle>
            <CardDescription className="text-sm text-left">
              Logged in as <strong className="text-foreground">{user.name || user.email}</strong> ({user.email})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            <div className="rounded-xl bg-muted/60 p-3.5 text-sm text-muted-foreground flex items-center justify-between text-left">
              <span className="font-medium">Account Status:</span>
              <Badge variant="outline" className="capitalize text-xs font-semibold">{user.isPaidPro ? 'Pro Member' : '7-Day Trial'}</Badge>
            </div>

            <div className="flex flex-col gap-2 pt-1 text-left">
              <Button className="w-full cursor-pointer h-10 text-sm font-semibold bg-primary hover:bg-primary/90 text-white" onClick={() => setPage('landing')}>
                <Home className="w-4 h-4 mr-2" />Go to Assessment
              </Button>
              <Button variant="outline" className="w-full cursor-pointer border-border text-foreground hover:bg-muted h-10 text-sm font-semibold" onClick={() => setPage('profile')}>
                <User className="w-4 h-4 mr-2" />Go to My Profile & Results
              </Button>
              {user.role === 'admin' && (
                <Button variant="outline" className="w-full cursor-pointer h-10 text-sm font-semibold" onClick={() => setPage('admin')}>
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
    <div className="min-h-screen bg-background flex flex-col font-delight text-left">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 sticky top-0 z-10 text-left">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-left">
          <div className="flex items-center gap-3 text-left">
            <img
              src={LOGO_URL}
              alt="LearnReady"
              style={{ height: '48px', width: 'auto' }}
              className="object-contain cursor-pointer select-none transition-transform active:scale-95"
              onClick={handleLogoClick}
              title="LearnReady"
            />
          </div>
          <div className="flex items-center gap-2 text-left">
            <Button variant="ghost" size="sm" onClick={() => setPage('landing')} className="cursor-pointer text-sm font-medium h-10 px-3">
              <Home className="w-4 h-4 mr-1.5" />Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 text-left">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
          {/* Left Column: Value Prop */}
          <div className="lg:col-span-5 space-y-6 hidden lg:block text-left">
            <div className="space-y-2 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary text-left">
                Student Account
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-foreground text-left leading-tight">
                Aptitude Assessment & Stream Guidance
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground text-left leading-relaxed">
                Sign in or register to take the assessment, save your scores, and see your stream recommendations.
              </p>
            </div>

            <div className="space-y-3.5 text-left border-t border-border pt-4">
              <div className="space-y-1 text-left">
                <p className="text-sm font-semibold text-foreground text-left">Aptitude Testing</p>
                <p className="text-xs sm:text-sm text-muted-foreground text-left leading-relaxed">
                  Questions covering Verbal, Numerical, and Spatial reasoning.
                </p>
              </div>

              <div className="space-y-1 text-left">
                <p className="text-sm font-semibold text-foreground text-left">Stream Fit Guidance</p>
                <p className="text-xs sm:text-sm text-muted-foreground text-left leading-relaxed">
                  Clear recommendations on Science (PCM/PCB), Commerce, or Humanities.
                </p>
              </div>

              <div className="space-y-1 text-left">
                <p className="text-sm font-semibold text-foreground text-left">National Percentile</p>
                <p className="text-xs sm:text-sm text-muted-foreground text-left leading-relaxed">
                  See where you stand compared to students across Indian boards.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-1.5 text-left">
              <p className="font-semibold text-foreground flex items-center gap-2 text-sm text-left">
                <GraduationCap className="w-4 h-4 text-primary" />Your Results Are Always Saved
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground text-left leading-relaxed">
                All completed test scores and stream recommendation reports stay linked to your email and phone number.
              </p>
            </div>
          </div>

          {/* Right Column: Auth Card */}
          <div className="lg:col-span-7 text-left">
            <Card className="border-border text-left shadow-sm">
              <CardHeader className="pb-4 text-left">
                <div className="flex items-center justify-between mb-1 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {mode === 'login' ? 'Candidate Sign In' : mode === 'register' ? 'New Registration' : 'Password Recovery'}
                  </span>
                </div>
                <CardTitle className="text-2xl font-bold text-left">
                  {mode === 'login' ? 'Sign in to your account' : mode === 'register' ? 'Create student account' : 'Reset your password'}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground text-left leading-relaxed">
                  {mode === 'login'
                    ? 'Enter your email and password to access your test session and reports'
                    : mode === 'register'
                    ? 'Register your details to save your test progress and view stream fits'
                    : 'Enter your registered email address to receive password reset instructions'}
                </CardDescription>

                {/* Tab Switcher */}
                {mode !== 'forgot' ? (
                  <div className="grid grid-cols-2 gap-1.5 bg-muted p-1 rounded-lg mt-3 text-left">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setAuthTab('login'); setErrors({}); }}
                      className={`py-2 text-sm font-semibold rounded-md transition-all cursor-pointer text-center ${
                        mode === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('register'); setAuthTab('register'); setErrors({}); }}
                      className={`py-2 text-sm font-semibold rounded-md transition-all cursor-pointer text-center ${
                        mode === 'register' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Register
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 text-left">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setErrors({}); }}
                      className="text-sm text-primary hover:underline flex items-center gap-1.5 cursor-pointer font-medium text-left"
                    >
                      <ArrowLeft className="w-4 h-4" />Back to Sign In
                    </button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="text-left">
                {mode === 'login' ? (
                  /* SIGN IN FORM */
                  <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <div className="space-y-1.5 text-left">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2 text-left">
                        <Mail className="w-4 h-4 text-muted-foreground" />Email Address
                      </Label>
                      <Input
                        type="email"
                        placeholder="e.g. rahul.sharma@example.com"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className={`h-11 text-sm text-left ${errors.loginEmail ? 'border-destructive' : ''}`}
                      />
                      {errors.loginEmail && <p className="text-xs text-destructive text-left">{errors.loginEmail}</p>}
                    </div>

                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center justify-between text-left">
                        <Label className="text-sm font-semibold text-foreground flex items-center gap-2 text-left">
                          <Lock className="w-4 h-4 text-muted-foreground" />Password
                        </Label>
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline cursor-pointer font-medium"
                          onClick={() => {
                            setMode('forgot');
                            setForgotSent(false);
                            setForgotEmail(loginEmail || '');
                            setErrors({});
                          }}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative text-left">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          className={`h-11 text-sm text-left ${errors.loginPassword ? 'border-destructive pr-10' : 'pr-10'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.loginPassword && <p className="text-xs text-destructive text-left">{errors.loginPassword}</p>}
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full font-semibold h-11 text-sm cursor-pointer bg-primary hover:bg-primary/90 text-white">
                      {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <div className="relative my-4 text-left">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground text-xs">or demo</span></div>
                    </div>

                    <div className="pt-1 text-left">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm font-medium h-10 cursor-pointer border-border hover:bg-muted"
                        onClick={() => {
                          setLoginEmail('student.demo@learnready.in');
                          setLoginPassword('student123');
                        }}
                      >
                        <User className="w-4 h-4 mr-2" />Fill Student Demo Credentials
                      </Button>
                    </div>
                  </form>
                ) : mode === 'register' ? (
                  /* REGISTER FORM */
                  <form onSubmit={handleRegister} className="space-y-4 text-left">
                    {/* 7-Day Free Trial Notice */}
                    <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-left space-y-1">
                      <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm text-left">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>Includes 7-Day Free Trial</span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-left">
                        Registration starts with a free 7-day trial. Full chapter-wise question banks and verified answer keys can be unlocked anytime for a one-time fee of ₹899.
                      </p>
                    </div>

                    {/* Compulsory Credentials Notice */}
                    <div className="rounded-lg bg-muted/60 p-3 text-xs sm:text-sm text-muted-foreground text-left leading-relaxed">
                      <strong>Requirements:</strong> Mobile number and email address are required for candidate records. No OTP required. Just set a password.
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2 text-left">
                        <User className="w-4 h-4 text-muted-foreground" />Student Full Name *
                      </Label>
                      <Input
                        placeholder="e.g. Ananya Deshmukh"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        className={`h-11 text-sm text-left ${errors.regName ? 'border-destructive' : ''}`}
                      />
                      {errors.regName && <p className="text-xs text-destructive text-left">{errors.regName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div className="space-y-1.5 text-left">
                        <Label className="text-sm font-semibold text-foreground flex items-center gap-2 text-left">
                          <Mail className="w-4 h-4 text-muted-foreground" />Email Address *
                        </Label>
                        <Input
                          type="email"
                          placeholder="ananya@example.com"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          className={`h-11 text-sm text-left ${errors.regEmail ? 'border-destructive' : ''}`}
                        />
                        {errors.regEmail && <p className="text-xs text-destructive text-left">{errors.regEmail}</p>}
                      </div>

                      <div className="space-y-1.5 text-left">
                        <Label className="text-sm font-semibold text-foreground flex items-center gap-2 text-left">
                          <Phone className="w-4 h-4 text-muted-foreground" />Mobile Number *
                        </Label>
                        <Input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                          className={`h-11 text-sm text-left ${errors.regPhone ? 'border-destructive' : ''}`}
                        />
                        {errors.regPhone && <p className="text-xs text-destructive text-left">{errors.regPhone}</p>}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2 text-left">
                        <Lock className="w-4 h-4 text-muted-foreground" />Password * (Min 6 characters)
                      </Label>
                      <Input
                        type="password"
                        placeholder="Choose a password"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className={`h-11 text-sm text-left ${errors.regPassword ? 'border-destructive' : ''}`}
                      />
                      {errors.regPassword && <p className="text-xs text-destructive text-left">{errors.regPassword}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                      <div className="space-y-1.5 text-left">
                        <Label className="text-sm font-semibold text-foreground text-left">Class / Level *</Label>
                        <Select value={regGrade} onValueChange={setRegGrade}>
                          <SelectTrigger className="h-11 text-sm text-left">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {EDUCATION_LEVELS.map(lvl => (
                              <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <Label className="text-sm font-semibold text-foreground text-left">Educational Board *</Label>
                        <Select value={regBoard} onValueChange={setRegBoard}>
                          <SelectTrigger className="h-11 text-sm text-left">
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

                    <div className="space-y-1.5 text-left">
                      <Label className="text-sm font-semibold text-foreground flex items-center gap-2 text-left">
                        <School className="w-4 h-4 text-muted-foreground" />School Name (Optional)
                      </Label>
                      <Input
                        placeholder="e.g. Delhi Public School"
                        value={regSchool}
                        onChange={e => setRegSchool(e.target.value)}
                        className="h-11 text-sm text-left"
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full font-semibold h-11 text-sm cursor-pointer mt-1 bg-primary hover:bg-primary/90 text-white">
                      {isSubmitting ? 'Creating Account...' : 'Register & Start Assessment'}
                    </Button>
                  </form>
                ) : (
                  /* FORGOT PASSWORD FORM */
                  <div className="space-y-4 text-left">
                    {/* Mailbox Spam and Bin Folders Notice */}
                    <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/40 p-4 text-left space-y-1.5">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-sm text-left">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>Check Spam & Trash Folders</span>
                      </div>
                      <p className="text-xs sm:text-sm text-amber-950/90 dark:text-amber-100/90 text-left leading-relaxed">
                        If you do not see the password recovery email in your primary inbox, please check your <strong>Spam</strong> and <strong>Trash</strong> folders.
                      </p>
                    </div>

                    {!forgotSent ? (
                      <form onSubmit={handleSendForgotEmail} className="space-y-4 text-left">
                        <div className="space-y-1.5 text-left">
                          <Label className="text-sm font-semibold text-foreground flex items-center gap-2 text-left">
                            <Mail className="w-4 h-4 text-muted-foreground" />Registered Email Address *
                          </Label>
                          <Input
                            type="email"
                            placeholder="e.g. rahul.sharma@example.com"
                            value={forgotEmail}
                            onChange={e => setForgotEmail(e.target.value)}
                            className={`h-11 text-sm text-left ${errors.forgotEmail ? 'border-destructive' : ''}`}
                          />
                          {errors.forgotEmail && <p className="text-xs text-destructive text-left">{errors.forgotEmail}</p>}
                        </div>

                        <Button type="submit" disabled={isSubmitting} className="w-full font-semibold h-11 text-sm cursor-pointer bg-primary hover:bg-primary/90 text-white">
                          {isSubmitting ? 'Sending Instructions...' : 'Send Password Reset Link'}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleCompletePasswordReset} className="space-y-4 text-left">
                        <div className="rounded-xl bg-muted/60 border border-border p-3.5 text-sm text-foreground space-y-1 text-left">
                          <p className="font-semibold flex items-center gap-2 text-left">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            Resetting Password for {forgotEmail}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground text-left leading-relaxed">
                            Enter your new password below.
                          </p>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <Label className="text-sm font-semibold text-foreground flex items-center gap-2 text-left">
                            <Lock className="w-4 h-4 text-muted-foreground" />New Password *
                          </Label>
                          <div className="relative text-left">
                            <Input
                              type={showNewPassword ? 'text' : 'password'}
                              placeholder="Min 6 characters"
                              value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              className={`h-11 text-sm text-left ${errors.newPassword ? 'border-destructive pr-10' : 'pr-10'}`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(p => !p)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {errors.newPassword && <p className="text-xs text-destructive text-left">{errors.newPassword}</p>}
                        </div>

                        <div className="space-y-1.5 text-left">
                          <Label className="text-sm font-semibold text-foreground flex items-center gap-2 text-left">
                            <Lock className="w-4 h-4 text-muted-foreground" />Confirm New Password *
                          </Label>
                          <Input
                            type="password"
                            placeholder="Repeat new password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className={`h-11 text-sm text-left ${errors.confirmPassword ? 'border-destructive' : ''}`}
                          />
                          {errors.confirmPassword && <p className="text-xs text-destructive text-left">{errors.confirmPassword}</p>}
                        </div>

                        <Button type="submit" disabled={isSubmitting} className="w-full font-semibold h-11 text-sm cursor-pointer bg-primary hover:bg-primary/90 text-white">
                          {isSubmitting ? 'Updating...' : 'Save New Password & Sign In'}
                        </Button>
                      </form>
                    )}

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => { setMode('login'); setErrors({}); }}
                        className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer inline-flex items-center gap-1.5 font-medium"
                      >
                        <ArrowLeft className="w-4 h-4" />Return to Sign In
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-border text-center">
                  <button
                    type="button"
                    onClick={() => setPage('landing')}
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    ← Continue to Assessment
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
