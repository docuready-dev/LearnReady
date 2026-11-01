import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { getResults } from '../api/results';
import { ExamResultRecord } from '../types';
import { INDIAN_BOARDS } from '../data/boards';
import { StorageService } from '../services/storageService';
import PaymentModal from '../components/PaymentModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Home,
  User,
  Phone,
  Mail,
  GraduationCap,
  School,
  Lock,
  Save,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  FileText,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

const LOGO_URL = `${import.meta.env.BASE_URL}logo.svg`;

const EDUCATION_LEVELS = [
  'Class 9',
  'Class 10 (Current)',
  'Class 11',
  'Class 12',
  'Undergraduate',
  'Graduate'
];

export default function ProfilePage() {
  const { user, updateProfile, logout, handleLogoClick } = useAuth();
  const { setPage } = useExam();

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [grade, setGrade] = useState(user?.grade || 'Class 10 (Current)');
  const [board, setBoard] = useState(user?.board || 'CBSE');
  const [school, setSchool] = useState(user?.school || '');
  const [isSaving, setIsSaving] = useState(false);

  // Results state
  const [myResults, setMyResults] = useState<ExamResultRecord[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);

  // Pro & Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setGrade(user.grade || 'Class 10 (Current)');
      setBoard(user.board || 'CBSE');
      setSchool(user.school || '');
    }
  }, [user]);

  // Fetch results for this candidate
  useEffect(() => {
    if (!user) return;
    getResults()
      .then(d => {
        const emailLower = user.email.toLowerCase();
        const mine = d.results.filter(
          r => r.email?.toLowerCase() === emailLower || (user.phone && r.phone === user.phone)
        );
        setMyResults(mine);
        setResultsLoading(false);
      })
      .catch(() => setResultsLoading(false));
  }, [user]);

  // Trial calculations
  const trialData = useMemo(() => {
    if (!user) return { isTrialActive: false, daysLeft: 0, hoursLeft: 0, formatted: '' };
    if (user.isPaidPro) return { isTrialActive: false, isPaid: true, formatted: 'Pro Member (Unlimited Access)' };

    const trialEnd = user.trialEndsAt || (user.registeredAt ? user.registeredAt + 7 * 24 * 60 * 60 * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000);
    const diff = Math.max(0, trialEnd - Date.now());
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 1000)) / (60 * 1000));

    return {
      isTrialActive: diff > 0,
      isExpired: diff === 0,
      daysLeft: days,
      hoursLeft: hours,
      formatted: diff > 0 ? `${days}d ${hours}h ${minutes}m remaining` : 'Trial Expired',
    };
  }, [user]);

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Full name cannot be empty');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      updateProfile({
        name: name.trim(),
        grade,
        board,
        school: school.trim(),
      });
      setIsSaving(false);
      toast.success('Candidate profile updated successfully!');
    }, 350);
  }

  const allQuestionBanks = useMemo(() => StorageService.getQuestionBanks(), []);

  const currentSubjectBank = useMemo(() => {
    return allQuestionBanks.find(s => s.subject === selectedSubject) || allQuestionBanks[0] || { subject: 'General', classLevel: 'All', chapters: [] };
  }, [allQuestionBanks, selectedSubject]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 font-delight text-left">
        <Card className="w-full max-w-sm text-left p-6 space-y-4">
          <p className="text-sm sm:text-base text-muted-foreground text-left">Please sign in to view your candidate profile and assessment history.</p>
          <Button className="w-full h-11 text-sm font-semibold" onClick={() => setPage('login')}>Sign In / Register</Button>
          <Button variant="outline" className="w-full h-11 text-sm font-semibold" onClick={() => setPage('landing')}>Back to Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-delight text-left">
      {/* Global Navigation Header with prominent Back to Home */}
      <header className="border-b border-border bg-card px-4 py-3 sticky top-0 z-10 shadow-2xs text-left">
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

          <div className="flex items-center gap-2.5 text-left">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage('landing')}
              className="cursor-pointer text-sm font-semibold flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/5 h-10 px-4"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer h-10 px-3"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-7 text-left">
        {/* Top Profile Banner with 7-Day Trial Status */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 text-left">
          <div className="flex items-center gap-4 text-left">
            <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2.5 flex-wrap text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground text-left">{user.name || 'Candidate'}</h1>
                {user.isPaidPro ? (
                  <Badge className="bg-emerald-600 text-white border-0 text-xs py-1 px-3 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />Pro Member (Lifetime)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 text-xs py-1 px-3 flex items-center gap-1.5 font-semibold dark:bg-amber-950/40 dark:text-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    7-Day Free Trial
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground text-left">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto text-left sm:text-right">
            {!user.isPaidPro && (
              <div className="text-left sm:text-right">
                <span className="text-sm font-bold text-amber-800 dark:text-amber-300 block">
                  {trialData.formatted}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  One-time ₹899/- INR unlocks all chapterwise question banks
                </span>
              </div>
            )}
            {!user.isPaidPro && (
              <Button
                size="sm"
                className="cursor-pointer bg-gradient-to-r from-primary to-blue-700 text-white font-bold flex items-center gap-2 shadow-sm h-10 px-4 text-sm"
                onClick={() => setShowPaymentModal(true)}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Unlock Question Bank (₹899)
              </Button>
            )}
          </div>
        </div>

        {/* Section 1: Candidate Profile Details (With Locked Mobile Number) */}
        <Card className="shadow-sm border-border text-left">
          <CardHeader className="pb-3 text-left">
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-left">
              <User className="w-5 h-5 text-primary" />Candidate Credentials & Academic Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="text-left">
            <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="space-y-1.5 text-left">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground text-left">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-11 text-sm text-left"
                    required
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground flex items-center gap-2 text-left">
                    <Mail className="w-4 h-4 text-muted-foreground" />Email Address (Account ID)
                  </Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="h-11 text-sm bg-muted text-muted-foreground cursor-not-allowed text-left"
                  />
                </div>
              </div>

              {/* Locked Mobile Number Limitation */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-left">
                <div className="flex items-center justify-between text-left">
                  <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2 text-foreground text-left">
                    <Phone className="w-4 h-4 text-primary" />Mobile Number (Identity Locked)
                  </Label>
                  <Badge variant="outline" className="text-xs font-semibold bg-background text-muted-foreground flex items-center gap-1.5 border-muted py-1 px-2.5">
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />Permanent Limitation
                  </Badge>
                </div>
                <Input
                  id="phone"
                  value={user.phone || 'Not Provided during registration'}
                  disabled
                  className="h-11 text-sm bg-background/80 font-mono text-muted-foreground cursor-not-allowed border-muted text-left"
                />
                <div className="flex items-start gap-2 pt-1 text-left">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-muted-foreground text-left leading-relaxed">
                    <strong>Candidate Security Policy:</strong> Mobile numbers are permanently bound to your diagnostic records upon registration to prevent unauthorized identity transfers and ensure national percentile authenticity. Mobile numbers cannot be altered in self-service mode.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <div className="space-y-1.5 text-left">
                  <Label className="text-sm font-semibold text-foreground flex items-center gap-2 text-left">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />Current Class / Level
                  </Label>
                  <Select value={grade} onValueChange={setGrade}>
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
                  <Label className="text-sm font-semibold text-foreground text-left">Educational Board</Label>
                  <Select value={board} onValueChange={setBoard}>
                    <SelectTrigger className="h-11 text-sm text-left">
                      <SelectValue placeholder="Select board" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_BOARDS.map(b => (
                        <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 text-left">
                  <Label htmlFor="school" className="text-sm font-semibold text-foreground flex items-center gap-2 text-left">
                    <School className="w-4 h-4 text-muted-foreground" />School / Institution
                  </Label>
                  <Input
                    id="school"
                    value={school}
                    onChange={e => setSchool(e.target.value)}
                    placeholder="e.g. Delhi Public School"
                    className="h-11 text-sm text-left"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end text-left">
                <Button type="submit" disabled={isSaving} className="cursor-pointer font-bold h-11 text-sm px-6">
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Updating Profile...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Section 2: All Assessment Results (Dedicated in Profile - No mess in Homepage) */}
        <Card className="shadow-sm border-border text-left">
          <CardHeader className="pb-3 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="text-left">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-left">
                  <FileText className="w-5 h-5 text-primary" />My Assessment History & Reports
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5 text-left leading-relaxed">
                  All your past cognitive battery sessions, All-India percentiles, and academic stream dossiers are archived here.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage('landing')}
                className="cursor-pointer text-sm font-semibold h-10 px-4 shrink-0 text-left"
              >
                Launch New Assessment
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-left">
            {resultsLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading your examination records...</div>
            ) : myResults.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-base">No Diagnostic Assessments Completed Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto text-left sm:text-center leading-relaxed">
                  You haven't completed an assessment session yet. Launch a session from the home page to compute your national percentile and discover your recommended academic stream.
                </p>
                <Button size="sm" onClick={() => setPage('landing')} className="cursor-pointer h-10 px-5 text-sm font-semibold">
                  Take Assessment Now
                </Button>
              </div>
            ) : (
              <div className="space-y-3 text-left">
                {myResults.map(r => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-border p-4 sm:p-5 hover:border-primary/40 hover:bg-muted/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left"
                  >
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center gap-2.5 flex-wrap text-left">
                        <span className="font-bold text-base text-foreground text-left">{r.name || r.candidateId}</span>
                        <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">{r.board}</Badge>
                        <Badge className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold px-2.5 py-0.5">
                          {r.profile || 'Profile Completed'}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground text-left">
                        Candidate ID: <span className="font-mono text-foreground font-semibold">{r.candidateId}</span> · Completed on {r.dateTaken ? new Date(r.dateTaken).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'}
                      </p>
                      <div className="flex items-center gap-4 text-sm pt-1 text-left flex-wrap">
                        <span>Score: <strong className="text-foreground font-bold">{r.totalScore}/100</strong></span>
                        <span>Percentile: <strong className="text-primary font-bold">{r.percentile}th</strong></span>
                        {r.verbalScore !== undefined && (
                          <span className="text-muted-foreground text-xs hidden sm:inline">
                            (Verbal: {r.verbalScore}% | Numerical: {r.numericalScore}% | Spatial: {r.spatialScore}%)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 text-left">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPage('results');
                        }}
                        className="cursor-pointer text-sm font-semibold h-10 px-4"
                      >
                        View Full Dossier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.print()}
                        className="cursor-pointer text-sm text-muted-foreground h-10 px-3"
                        title="Print / Save PDF"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: All Subjects Chapterwise Question Bank + Answer Key (Post 7-Day Trial ₹899 Access) */}
        <Card className="shadow-sm border-border text-left">
          <CardHeader className="pb-3 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="text-left">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-left">
                  <BookOpen className="w-5 h-5 text-primary" />All Subjects' Chapterwise Question Bank & Answer Key
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5 text-left leading-relaxed">
                  Comprehensive topic-by-topic question repository with verified solution keys for Classes 9 to 12.
                </p>
              </div>

              {!user.isPaidPro ? (
                <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-xs px-3 py-1 font-semibold dark:bg-amber-950/40 dark:text-amber-200">
                  Requires Pro Unlock (₹899/- One-Time)
                </Badge>
              ) : (
                <Badge className="bg-emerald-600 text-white text-xs px-3 py-1 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />Full Repository Unlocked
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            {/* Subject Selector Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 text-left">
              {allQuestionBanks.map(s => (
                <button
                  key={s.subject}
                  type="button"
                  onClick={() => setSelectedSubject(s.subject)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap text-left ${
                    selectedSubject === s.subject
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s.subject}
                </button>
              ))}
            </div>

            {/* Chapters List */}
            <div className="space-y-3.5 text-left">
              {currentSubjectBank.chapters.map(chap => {
                const isExpanded = expandedChapter === chap.id;
                return (
                  <div key={chap.id} className="rounded-xl border border-border p-4 sm:p-5 space-y-3.5 bg-card text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                      <div className="text-left">
                        <div className="flex items-center gap-2.5 flex-wrap text-left">
                          <h4 className="font-bold text-base text-foreground text-left">{chap.title}</h4>
                          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">{chap.difficulty}</Badge>
                          <span className="text-xs sm:text-sm text-muted-foreground">{chap.questionCount} Questions with Key</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-1.5 flex-wrap text-left">
                          {chap.topics.map(t => (
                            <span key={t} className="bg-muted px-2.5 py-1 rounded-md text-xs font-medium">{t}</span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-left">
                        {user.isPaidPro ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer text-sm font-semibold flex items-center gap-1.5 h-10 px-4"
                            onClick={() => setExpandedChapter(isExpanded ? null : chap.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {isExpanded ? 'Hide Answer Key' : 'View Question Bank & Key'}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-sm font-semibold cursor-pointer border-amber-300 text-amber-900 hover:bg-amber-50 h-10 px-4 dark:border-amber-700 dark:text-amber-200"
                            onClick={() => setShowPaymentModal(true)}
                          >
                            <Lock className="w-4 h-4 mr-1.5 text-amber-600" />Unlock for ₹899
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Unlocked Questions & Solution Key Drawer */}
                    {user.isPaidPro && isExpanded && (
                      <div className="pt-3 border-t border-border/60 space-y-3.5 text-left">
                        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-sm text-foreground space-y-1 text-left">
                          <p className="font-bold text-primary text-left">Verified Answer Key & Solution Notes</p>
                          <p className="text-xs sm:text-sm text-muted-foreground text-left leading-relaxed">
                            Below are curated diagnostic items from {chap.title} with keyed answers and methodological steps.
                          </p>
                        </div>

                        {chap.sampleQuestions.map((sq, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-2 text-sm text-left">
                            <p className="font-semibold text-foreground text-left leading-relaxed">
                              <strong className="text-primary font-bold">Q{idx + 1}:</strong> {sq.q}
                            </p>
                            <div className="p-3 rounded-lg bg-background border border-border text-sm text-left">
                              <span className="font-bold text-emerald-700 dark:text-emerald-400">Answer Key: </span>
                              <span className="font-mono text-foreground font-bold">{sq.answerKey}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground text-left leading-relaxed">
                              <strong className="text-foreground">Solution Note:</strong> {sq.solutionNote}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Upgrade Callout if not Paid */}
            {!user.isPaidPro && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-primary/5 border border-amber-200 text-left space-y-2.5 dark:from-amber-950/20 dark:to-primary/10 dark:border-amber-800">
                <div className="flex items-center gap-2 text-left">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-base text-foreground text-left">Post 7-Day Trial Upgrade (₹899/- INR)</span>
                </div>
                <p className="text-sm text-muted-foreground text-left leading-relaxed">
                  Your registration comes with a free 7-day diagnostic assessment trial. After the trial (or anytime now), a one-time fee of <strong>₹899/- INR</strong> provides full access to all subjects' chapterwise question bank with verified answer keys across Mathematics, Physics, Chemistry, Biology, Commerce & English.
                </p>
                <Button
                  size="sm"
                  className="cursor-pointer bg-primary hover:bg-primary/90 text-white font-bold h-11 px-5 text-sm mt-1"
                  onClick={() => setShowPaymentModal(true)}
                >
                  Unlock All Subjects Question Bank for ₹899 INR
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Payment Checkout Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onSuccess={() => toast.success('Pro access active! All question banks unlocked.')}
      />
    </div>
  );
}
