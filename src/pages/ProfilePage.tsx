import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { getResults } from '../api/results';
import { ExamResultRecord } from '../types';
import { getBoardsForLevel, getBoardCategoryLabel, getDefaultBoardForLevel } from '../data/boards';
import { StorageService } from '../services/storageService';
import PaymentModal from '../components/PaymentModal';
import { printQuestionBooklet } from '../utils/printQuestionBooklet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
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
  BookOpen,
  CheckCircle2,
  FileText,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';

const LOGO_URL = `${import.meta.env.BASE_URL}logo.svg`;

const EDUCATION_LEVELS = [
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
  'Undergraduate',
  'Graduate'
];

export default function ProfilePage() {
  const { user, updateProfile, logout, handleLogoClick } = useAuth();
  const { setPage } = useExam();

  // Active section filter for vivid visual segregation
  const [activeSection, setActiveSection] = useState<'all' | 'profile' | 'results' | 'banks'>('all');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [grade, setGrade] = useState(user?.grade?.replace(/\s*\(Current\)/gi, '').trim() || 'Class 10');
  const [board, setBoard] = useState(user?.board || 'CBSE');
  const [school, setSchool] = useState(user?.school || '');
  const [isSaving, setIsSaving] = useState(false);

  function handleGradeChange(newGrade: string) {
    setGrade(newGrade);
    const boards = getBoardsForLevel(newGrade);
    if (!boards.some(b => b.value === board)) {
      setBoard(getDefaultBoardForLevel(newGrade));
    }
  }

  // Results state
  const [myResults, setMyResults] = useState<ExamResultRecord[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);

  // Pro & Payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');

  // Question bank expansion & revealed answer keys states
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setGrade(user.grade?.replace(/\s*\(Current\)/gi, '').trim() || 'Class 10');
      setBoard(user.board || 'CBSE');
      setSchool(user.school || '');
    }
  }, [user]);

  // Load results from storage
  useEffect(() => {
    async function loadData() {
      try {
        setResultsLoading(true);
        const { results } = await getResults();
        if (user?.email) {
          const emailLower = user.email.toLowerCase();
          const userRes = results.filter(
            r => r.email?.toLowerCase() === emailLower || (user.phone && r.phone === user.phone)
          );
          setMyResults(userRes);
        } else {
          setMyResults(results);
        }
      } catch (err) {
        console.error('Failed to load user results', err);
      } finally {
        setResultsLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Question bank data from storage service
  const allQuestionBanks = useMemo(() => {
    return StorageService.getQuestionBanks();
  }, []);

  // Compute 7-day trial time remaining
  const trialData = useMemo(() => {
    if (!user) return { days: 0, hours: 0, isExpired: true, formatted: 'Expired' };
    const registeredAt = user.registeredAt || Date.now();
    const trialEnd = user.trialEndsAt || (registeredAt + 7 * 24 * 60 * 60 * 1000);
    const diff = trialEnd - Date.now();

    if (diff <= 0) {
      return { days: 0, hours: 0, isExpired: true, formatted: 'Trial Concluded' };
    }
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    return {
      days,
      hours,
      isExpired: false,
      formatted: `${days}d ${hours}h free trial remaining`,
    };
  }, [user]);

  const currentSubjectBank = useMemo(() => {
    return allQuestionBanks.find(b => b.subject === selectedSubject) || allQuestionBanks[0] || {
      subject: selectedSubject,
      classLevel: 'Class 10 & 11',
      chapters: []
    };
  }, [allQuestionBanks, selectedSubject]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Full name cannot be blank.');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      updateProfile({
        name: name.trim(),
        grade,
        board,
        school: school.trim() || undefined,
      });
      setIsSaving(false);
      toast.success('Academic profile updated successfully!');
    }, 400);
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapter(prev => (prev === chapterId ? null : chapterId));
  };

  const toggleAnswerKey = (chapterId: string) => {
    if (!user?.isPaidPro) {
      setShowPaymentModal(true);
      return;
    }
    setRevealedKeys(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleDownloadPDF = (chap: typeof currentSubjectBank.chapters[0]) => {
    if (!user?.isPaidPro) {
      setShowPaymentModal(true);
      return;
    }
    printQuestionBooklet(selectedSubject, chap, currentSubjectBank.classLevel);
  };

  const handleDownloadFullSubjectPDF = () => {
    if (!user?.isPaidPro) {
      setShowPaymentModal(true);
      return;
    }
    if (!currentSubjectBank.chapters.length) {
      toast.error('No chapters available to download.');
      return;
    }
    printQuestionBooklet(selectedSubject, currentSubjectBank.chapters, currentSubjectBank.classLevel);
  };

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
      {/* Global Navigation Header */}
      <header className="border-b border-border bg-card px-4 py-3 sticky top-0 z-20 shadow-2xs text-left">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-left">
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

          <div className="flex items-center gap-2.5 text-left">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage('landing')}
              className="cursor-pointer text-sm font-semibold flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/5 h-10 px-4"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
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
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8 text-left">
        
        {/* Top Profile Banner with Candidate Status */}
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
                    <CheckCircle2 className="w-3.5 h-3.5" />Pro Member (Lifetime Unlocked)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-300 text-xs py-1 px-3 flex items-center gap-1.5 font-semibold dark:bg-amber-950/40 dark:text-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    7-Day Free Trial
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground text-left flex items-center gap-2 flex-wrap">
                <span>{user.email}</span>
                {user.phone && (
                  <>
                    <span>·</span>
                    <span className="font-mono">{user.phone}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto text-left sm:text-right">
            {!user.isPaidPro && (
              <div className="text-left sm:text-right">
                <span className="text-sm font-bold text-amber-800 dark:text-amber-300 block">
                  {trialData.formatted}
                </span>
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ₹899/- INR one-time unlocks all question banks with step-by-step keys
                </span>
              </div>
            )}
            {!user.isPaidPro ? (
              <Button
                size="sm"
                className="cursor-pointer bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2 h-10 px-4 text-sm"
                onClick={() => setShowPaymentModal(true)}
              >
                <BookOpen className="w-4 h-4" />
                Unlock Question Banks (₹899)
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4" />All Subjects & PDF Downloads Active
              </div>
            )}
          </div>
        </div>

        {/* ── VIVID SECTION NAVIGATION SELECTOR ── */}
        <div className="bg-card border border-border rounded-xl p-1.5 flex items-center gap-1.5 overflow-x-auto text-left shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveSection('all')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSection === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Sections</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('profile')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSection === 'profile'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Academic Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('results')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSection === 'results'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Assessment History ({myResults.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('banks')}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeSection === 'banks'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>3. Question Banks ({allQuestionBanks.length} Subjects)</span>
          </button>
        </div>

        {/* ── SECTION 1: CANDIDATE ACADEMIC CREDENTIALS ── */}
        {(activeSection === 'all' || activeSection === 'profile') && (
          <Card className="shadow-sm border-2 border-border/90 text-left overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 via-primary to-blue-800 text-white px-6 py-4 flex items-center justify-between text-left">
              <div className="flex items-center gap-3 text-left">
                <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                  SECTION 1
                </span>
                <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
                  <User className="w-5 h-5 text-blue-200" />
                  Candidate Credentials & Academic Profile
                </CardTitle>
              </div>
              <Badge variant="outline" className="border-white/30 text-white text-xs font-normal hidden sm:inline-flex">
                Editable Details
              </Badge>
            </div>

            <CardContent className="pt-6 space-y-5 text-left">
              <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="name" className="text-sm font-semibold text-foreground text-left">Full Name *</Label>
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
                <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2 text-left">
                  <div className="flex items-center justify-between text-left">
                    <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2 text-foreground text-left">
                      <Phone className="w-4 h-4 text-primary" />Registered Mobile Number (Locked)
                    </Label>
                    <Badge variant="outline" className="text-xs font-semibold bg-background text-muted-foreground flex items-center gap-1.5 border-border py-1 px-2.5">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />Non-Editable Identity
                    </Badge>
                  </div>
                  <Input
                    id="phone"
                    value={user.phone || 'Not Provided'}
                    disabled
                    className="h-11 text-sm font-mono bg-muted/80 text-muted-foreground cursor-not-allowed text-left"
                  />
                  <p className="text-xs text-muted-foreground text-left flex items-center gap-1.5 leading-relaxed">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    For candidate integrity and verification security, the primary registered mobile number cannot be altered after registration.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="space-y-1.5 text-left">
                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2 text-left">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />Class / Level *
                    </Label>
                    <Select value={grade} onValueChange={handleGradeChange}>
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
                    <Label className="text-sm font-semibold text-foreground text-left">
                      {getBoardCategoryLabel(grade)} *
                    </Label>
                    <Select value={board} onValueChange={setBoard}>
                      <SelectTrigger className="h-11 text-sm text-left">
                        <SelectValue placeholder={`Select ${getBoardCategoryLabel(grade).toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {getBoardsForLevel(grade).map(b => (
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

                <div className="flex justify-end pt-2 text-left">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="font-semibold cursor-pointer flex items-center gap-2 h-11 px-6 text-sm bg-primary text-white hover:bg-primary/90"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving Changes...' : 'Save Academic Details'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ── SECTION 2: ASSESSMENT RESULTS & SCORE REPORTS ── */}
        {(activeSection === 'all' || activeSection === 'results') && (
          <Card className="shadow-sm border-2 border-border/90 text-left overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white px-6 py-4 flex items-center justify-between text-left">
              <div className="flex items-center gap-3 text-left">
                <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                  SECTION 2
                </span>
                <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-emerald-200" />
                  Completed Diagnostic Assessments & Score Reports
                </CardTitle>
              </div>
              <Badge variant="outline" className="border-white/30 text-white text-xs font-normal">
                {myResults.length} Completed Test{myResults.length === 1 ? '' : 's'}
              </Badge>
            </div>

            <CardContent className="pt-6 space-y-4 text-left">
              <p className="text-sm text-muted-foreground text-left leading-relaxed">
                All benchmarked test results, stream recommendations, and detailed percentile dossiers are archived exclusively in this section.
              </p>

              {resultsLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading assessment score history...</div>
              ) : myResults.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-border bg-muted/20 space-y-3">
                  <FileText className="w-10 h-10 text-muted-foreground mx-auto" />
                  <p className="text-base font-semibold text-foreground">No assessment records found yet.</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Take the diagnostic assessment now to unlock your stream recommendation and national aptitude percentiles.
                  </p>
                  <Button
                    onClick={() => setPage('landing')}
                    className="font-semibold bg-primary hover:bg-primary/90 text-white cursor-pointer h-10 px-5 text-sm"
                  >
                    Take Diagnostic Assessment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3.5 text-left">
                  {myResults.map(r => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors text-left"
                    >
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center gap-2.5 flex-wrap text-left">
                          <span className="font-bold text-base text-foreground text-left">{r.name || user.name}</span>
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
                          onClick={() => setPage('results')}
                          className="cursor-pointer text-sm font-semibold h-10 px-4"
                        >
                          View Full Report
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.print()}
                          className="cursor-pointer text-sm text-muted-foreground h-10 px-3 hover:text-foreground"
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
        )}

        {/* ── SECTION 3: CHAPTERWISE QUESTION BANKS & VERIFIED SOLUTION KEYS ── */}
        {(activeSection === 'all' || activeSection === 'banks') && (
          <Card className="shadow-sm border-2 border-border/90 text-left overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-primary to-slate-800 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3 text-left">
                <span className="bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                  SECTION 3
                </span>
                <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 text-white">
                  <BookOpen className="w-5 h-5 text-blue-200" />
                  All Subjects' Chapterwise Question Bank & Solutions
                </CardTitle>
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

            <CardContent className="pt-6 space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4 text-left">
                <div>
                  <h3 className="font-bold text-base text-foreground text-left">Curated Chapter Repositories</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground text-left leading-relaxed">
                    Click any chapter to view diagnostic questions with options in a line. Answer keys are kept hidden until you click reveal.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadFullSubjectPDF}
                    className="cursor-pointer text-xs sm:text-sm font-semibold flex items-center gap-2 h-10 px-4 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    <Download className="w-4 h-4" />
                    Download Complete {selectedSubject} Booklet (PDF)
                  </Button>
                </div>
              </div>

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
                        : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    }`}
                  >
                    {s.subject}
                  </button>
                ))}
              </div>

              {/* Chapters List */}
              <div className="space-y-4 text-left">
                {currentSubjectBank.chapters.map(chap => {
                  const isExpanded = expandedChapter === chap.id;
                  const isKeyRevealed = !!revealedKeys[chap.id];

                  return (
                    <div
                      key={chap.id}
                      className="rounded-xl border border-border bg-card p-5 space-y-4 text-left transition-colors hover:border-border/80"
                    >
                      {/* Chapter Header Card Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                        <div className="space-y-1.5 text-left">
                          <div className="flex items-center gap-2.5 flex-wrap text-left">
                            <h4 className="font-bold text-base text-foreground text-left">{chap.title}</h4>
                            <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5">{chap.difficulty}</Badge>
                            <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                              {chap.sampleQuestions.length} Questions
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap text-left">
                            {chap.topics.map(t => (
                              <span key={t} className="bg-muted px-2.5 py-0.5 rounded-md text-xs font-medium text-foreground">{t}</span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 text-left flex-wrap">
                          <Button
                            variant={isExpanded ? 'secondary' : 'outline'}
                            size="sm"
                            className="cursor-pointer text-xs sm:text-sm font-semibold flex items-center gap-1.5 h-10 px-4"
                            onClick={() => toggleChapter(chap.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {isExpanded ? 'Hide Questions' : `View Questions (${chap.sampleQuestions.length})`}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer text-xs sm:text-sm font-semibold flex items-center gap-1.5 h-10 px-4 border-border text-foreground hover:bg-muted"
                            onClick={() => handleDownloadPDF(chap)}
                            title="Download PDF Booklet with Questions, 3 Rough Work Pages, and Answer Key"
                          >
                            <Download className="w-4 h-4" />
                            PDF Booklet
                          </Button>
                        </div>
                      </div>

                      {/* Questions Drawer (Only visible when clicked) */}
                      {isExpanded && (
                        <div className="pt-4 border-t border-border space-y-5 text-left">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-3.5 rounded-xl border border-border text-left">
                            <div className="text-left">
                              <p className="font-bold text-sm text-foreground text-left">Practice Items for {chap.title}</p>
                              <p className="text-xs text-muted-foreground text-left leading-relaxed">
                                Review questions with options below. Click the button to inspect the answer key and solutions.
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-left">
                              <Button
                                size="sm"
                                variant={isKeyRevealed ? 'default' : 'outline'}
                                className={`cursor-pointer text-xs sm:text-sm font-semibold flex items-center gap-2 h-9 px-3.5 ${
                                  isKeyRevealed ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400'
                                }`}
                                onClick={() => toggleAnswerKey(chap.id)}
                              >
                                <KeyRound className="w-4 h-4" />
                                {isKeyRevealed ? 'Hide Answer Key' : 'Reveal Answer Key & Solutions'}
                              </Button>
                            </div>
                          </div>

                          {/* Questions List */}
                          <div className="space-y-4 text-left">
                            {chap.sampleQuestions.map((sq, idx) => (
                              <div
                                key={idx}
                                className="p-4 rounded-xl bg-card border border-border/90 space-y-3 text-left shadow-2xs"
                              >
                                <div className="flex items-start gap-3 text-left">
                                  <span className="bg-primary text-primary-foreground font-bold text-xs px-2.5 py-1 rounded-md shrink-0">
                                    Q{idx + 1}
                                  </span>
                                  <p className="font-semibold text-sm sm:text-base text-foreground text-left leading-relaxed">
                                    {sq.q}
                                  </p>
                                </div>

                                {/* Options lined up in a line */}
                                {sq.options && sq.options.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 pl-9 text-xs sm:text-sm font-medium text-foreground text-left">
                                    {sq.options.map((opt, oIdx) => (
                                      <span
                                        key={oIdx}
                                        className="bg-muted/70 border border-border px-3 py-1.5 rounded-lg text-foreground"
                                      >
                                        {opt}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Answer Key Box (Only visible when 'Reveal Answer Key' is clicked) */}
                                {isKeyRevealed && (
                                  <div className="mt-3 ml-0 sm:ml-9 p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5 text-xs sm:text-sm text-left">
                                    <div className="flex items-center gap-2 text-left">
                                      <Badge className="bg-emerald-600 text-white text-2xs py-0.5 px-2">Verified Key</Badge>
                                      <span className="font-mono font-bold text-emerald-950 dark:text-emerald-200">{sq.answerKey}</span>
                                    </div>
                                    <p className="text-muted-foreground text-left leading-relaxed pt-0.5">
                                      <strong className="text-foreground">Methodology: </strong>{sq.solutionNote}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Quick Bottom Actions */}
                          <div className="flex items-center justify-between pt-2 border-t border-border text-left">
                            <span className="text-xs text-muted-foreground text-left">
                              Included in PDF booklet: Questions with options · 3 Rough Work pages · Verified Answer Key
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPDF(chap)}
                              className="cursor-pointer text-xs font-semibold flex items-center gap-1.5 h-8 px-3"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Save Chapter PDF
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Upgrade Callout if not Paid */}
              {!user.isPaidPro && (
                <div className="p-5 rounded-xl border border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 text-left space-y-2.5">
                  <div className="flex items-center gap-2 text-left">
                    <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                    <span className="font-bold text-base text-foreground text-left">Unlock All Subjects Question Bank (₹899 One-Time)</span>
                  </div>
                  <p className="text-sm text-muted-foreground text-left leading-relaxed">
                    Your registration includes a free 7-day assessment trial. For a one-time fee of <strong>₹899 INR</strong>, gain permanent access to download complete question bank PDF booklets with options, 3 dedicated rough work calculation pages, and verified step-by-step solutions across all subjects.
                  </p>
                  <Button
                    size="sm"
                    className="cursor-pointer bg-primary hover:bg-primary/90 text-white font-semibold h-10 px-5 text-sm mt-1"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    Unlock Full Repository for ₹899
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Payment Checkout Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onSuccess={() => toast.success('Pro access active! All question banks and PDF downloads unlocked.')}
      />
    </div>
  );
}
