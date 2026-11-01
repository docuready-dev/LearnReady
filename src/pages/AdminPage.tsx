import React, { useEffect, useState, useMemo } from 'react';
import { useAuth, ADMIN_EMAIL } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { getResults, deleteResult } from '../api/results';
import { StorageService } from '../services/storageService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Users,
  BarChart3,
  ShieldOff,
  Trash2,
  LogOut,
  Home,
  Search,
  TrendingUp,
  Download,
  CreditCard,
  BookOpen,
  Settings,
  Plus,
  Edit,
  CheckCircle2,
  Clock,
  Sparkles,
  Upload,
  FileJson,
  X,
  Lock,
  ChevronDown,
  ChevronUp,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { ExamResultRecord, UserAccount, PaymentRecord } from '../types';
import { ChapterQuestionBank } from '../data/questionBanks';

const LOGO_URL = `${import.meta.env.BASE_URL}logo.svg`;
const BOARDS = ['CBSE', 'ICSE', 'STATE_MH', 'STATE_WB', 'STATE_DL', 'STATE_TN', 'STATE_KA', 'STATE_OTHER', 'IB', 'IGCSE'];

type TabKey = 'results' | 'users' | 'tiers' | 'banks' | 'academic';

export default function AdminPage() {
  const { user, isLoading, openAdminModal, logout } = useAuth();
  const { setPage } = useExam();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<TabKey>('results');

  // Data states
  const [results, setResults] = useState<ExamResultRecord[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [questionBanks, setQuestionBanks] = useState<ChapterQuestionBank[]>([]);
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [classesList, setClassesList] = useState<string[]>([]);

  // Search & Filters
  const [resultsSearch, setResultsSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userTierFilter, setUserTierFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [selectedBankSubject, setSelectedBankSubject] = useState<string>('Mathematics');

  // Deletion modals
  const [deletingResultId, setDeletingResultId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Edit User modal state
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserGrade, setEditUserGrade] = useState('');
  const [editUserBoard, setEditUserBoard] = useState('');
  const [editUserSchool, setEditUserSchool] = useState('');

  // Record Manual Payment modal state
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);
  const [manualPayEmail, setManualPayEmail] = useState('');
  const [manualPayName, setManualPayName] = useState('');
  const [manualPayMethod, setManualPayMethod] = useState<'upi' | 'card' | 'manual'>('manual');
  const [manualPayRef, setManualPayRef] = useState('');

  // Add Chapter modal state
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [newChapSubject, setNewChapSubject] = useState('');
  const [newChapClass, setNewChapClass] = useState('Class 10 & 11');
  const [newChapTitle, setNewChapTitle] = useState('');
  const [newChapCount, setNewChapCount] = useState(25);
  const [newChapDiff, setNewChapDiff] = useState<'Foundational' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [newChapTopics, setNewChapTopics] = useState('');
  const [newChapSampleQ, setNewChapSampleQ] = useState('');
  const [newChapAnswerKey, setNewChapAnswerKey] = useState('');
  const [newChapSolution, setNewChapSolution] = useState('');

  // Add Subject & Class modals
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassInput, setNewClassInput] = useState('');

  // JSON batch upload modal
  const [showJsonUploadModal, setShowJsonUploadModal] = useState(false);
  const [jsonBatchContent, setJsonBatchContent] = useState('');

  // Expanded chapter keys in preview
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);

  // Initial data load
  useEffect(() => {
    if (!user || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || user.role !== 'admin') return;

    // Load results
    getResults()
      .then(d => {
        setResults(d.results);
        setLoadingResults(false);
      })
      .catch(() => setLoadingResults(false));

    // Load storage datasets
    refreshAllData();
  }, [user]);

  function refreshAllData() {
    setUserAccounts(StorageService.getUserAccounts());
    setPayments(StorageService.getPayments());
    const banks = StorageService.getQuestionBanks();
    setQuestionBanks(banks);
    const subs = StorageService.getSubjects();
    setSubjectsList(subs);
    if (subs.length > 0 && !subs.includes(selectedBankSubject)) {
      setSelectedBankSubject(subs[0]);
    }
    setClassesList(StorageService.getClasses());
  }

  // Filtered results
  const filteredResults = useMemo(() => {
    let r = results;
    if (boardFilter !== 'all') r = r.filter(x => x.board === boardFilter);
    if (resultsSearch.trim()) {
      const s = resultsSearch.toLowerCase();
      r = r.filter(
        x =>
          x.name.toLowerCase().includes(s) ||
          x.email.toLowerCase().includes(s) ||
          x.candidateId.toLowerCase().includes(s)
      );
    }
    return r;
  }, [results, resultsSearch, boardFilter]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    let list = userAccounts;
    if (userTierFilter === 'paid') list = list.filter(u => u.isPaidPro);
    if (userTierFilter === 'free') list = list.filter(u => !u.isPaidPro);
    if (userSearch.trim()) {
      const s = userSearch.toLowerCase();
      list = list.filter(
        u =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.phone && u.phone.includes(s))
      );
    }
    return list;
  }, [userAccounts, userSearch, userTierFilter]);

  // Statistics
  const totalRevenue = useMemo(() => payments.reduce((acc, p) => acc + (p.status === 'confirmed' ? p.amount : 0), 0), [payments]);
  const proUsersCount = useMemo(() => userAccounts.filter(u => u.isPaidPro).length, [userAccounts]);

  // ---------------------------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------------------------
  async function handleDeleteResult(id: string) {
    try {
      await deleteResult({ id });
      setResults(prev => prev.filter(r => r.id !== id));
      toast.success('Assessment record deleted successfully.');
    } catch {
      toast.error('Failed to delete record.');
    } finally {
      setDeletingResultId(null);
    }
  }

  function handleExportCSV() {
    StorageService.exportToCSV(results);
    toast.success('Exporting student results CSV...');
  }

  // User details edit
  function handleOpenEditUser(u: UserAccount) {
    setEditingUser(u);
    setEditUserName(u.name || '');
    setEditUserPhone(u.phone || '');
    setEditUserGrade(u.grade || 'Class 10 (Current)');
    setEditUserBoard(u.board || 'CBSE');
    setEditUserSchool(u.school || '');
  }

  function handleSaveUserEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;

    StorageService.updateUserAccount(editingUser.id, {
      name: editUserName.trim(),
      phone: editUserPhone.trim(),
      grade: editUserGrade,
      board: editUserBoard,
      school: editUserSchool.trim(),
    });

    toast.success(`Candidate details updated for ${editingUser.email}`);
    setEditingUser(null);
    refreshAllData();
  }

  function handleDeleteUser(id: string) {
    StorageService.deleteUserAccount(id);
    toast.success('Candidate account deleted from registry.');
    setDeletingUserId(null);
    refreshAllData();
  }

  // Tier toggle (Free vs Paid Pro)
  function handleToggleTier(userId: string, currentStatus: boolean) {
    const newStatus = !currentStatus;
    StorageService.setUserTier(userId, newStatus);
    toast.success(`User tier updated to ${newStatus ? 'Paid Pro (Lifetime)' : '7-Day Free Trial'}`);
    refreshAllData();
  }

  // Manual payment submission
  function handleRecordManualPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!manualPayEmail.trim()) {
      toast.error('Candidate email is required');
      return;
    }

    StorageService.recordPayment({
      userEmail: manualPayEmail.trim(),
      userName: manualPayName.trim() || manualPayEmail.split('@')[0],
      amount: 899,
      currency: 'INR',
      method: manualPayMethod,
      transactionRef: manualPayRef.trim() || `MANUAL-${Date.now()}`,
      status: 'confirmed',
    });

    toast.success(`Payment of ₹899 recorded for ${manualPayEmail}! Candidate tier upgraded to Pro.`);
    setShowManualPaymentModal(false);
    setManualPayEmail('');
    setManualPayName('');
    setManualPayRef('');
    refreshAllData();
  }

  function handleDeletePayment(id: string) {
    StorageService.deletePayment(id);
    toast.success('Payment transaction record deleted.');
    refreshAllData();
  }

  // Question Banks chapter upload
  function handleAddChapter(e: React.FormEvent) {
    e.preventDefault();
    const targetSubject = newChapSubject || selectedBankSubject || 'Mathematics';
    if (!newChapTitle.trim()) {
      toast.error('Chapter title is required');
      return;
    }

    const topicsArr = newChapTopics
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const chapterObj = {
      id: `chap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: newChapTitle.trim(),
      questionCount: Number(newChapCount) || 20,
      difficulty: newChapDiff,
      topics: topicsArr.length ? topicsArr : ['Core Curriculum', 'Verified Solved Examples'],
      sampleQuestions: [
        {
          q: newChapSampleQ.trim() || `Core assessment test question for ${newChapTitle}.`,
          answerKey: newChapAnswerKey.trim() || 'Verified step-by-step answer key.',
          solutionNote: newChapSolution.trim() || 'Detailed step-by-step solution methodology.',
        },
      ],
    };

    StorageService.addOrUpdateChapter(targetSubject, chapterObj);
    toast.success(`Chapter "${newChapTitle}" deployed to ${targetSubject} question bank!`);
    setShowAddChapterModal(false);
    setNewChapTitle('');
    setNewChapTopics('');
    setNewChapSampleQ('');
    setNewChapAnswerKey('');
    setNewChapSolution('');
    refreshAllData();
  }

  function handleDeleteChapter(subject: string, chapterId: string) {
    StorageService.deleteChapter(subject, chapterId);
    toast.success('Chapter removed from question bank.');
    refreshAllData();
  }

  function handleBatchJsonUpload(e: React.FormEvent) {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonBatchContent);
      if (Array.isArray(parsed)) {
        StorageService.saveAllQuestionBanks(parsed);
        toast.success(`Batch imported ${parsed.length} subject question banks successfully!`);
      } else if (parsed.subject && parsed.chapters) {
        const banks = StorageService.getQuestionBanks();
        const existingIdx = banks.findIndex(b => b.subject.toLowerCase() === parsed.subject.toLowerCase());
        if (existingIdx >= 0) banks[existingIdx] = parsed;
        else banks.push(parsed);
        StorageService.saveAllQuestionBanks(banks);
        toast.success(`Question bank for ${parsed.subject} updated successfully!`);
      } else {
        toast.error('Invalid JSON structure. Expected array of subjects or single subject object.');
        return;
      }
      setShowJsonUploadModal(false);
      setJsonBatchContent('');
      refreshAllData();
    } catch {
      toast.error('Malformed JSON syntax. Please verify and retry.');
    }
  }

  function handleExportBanksJson() {
    const data = StorageService.getQuestionBanks();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LearnReady_QuestionBanks_Catalog_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Question Banks JSON catalog exported.');
  }

  // Add / Delete Subject
  function handleAddSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubjectInput.trim()) return;
    const updated = StorageService.addSubject(newSubjectInput.trim());
    setSubjectsList(updated);
    toast.success(`Subject "${newSubjectInput.trim()}" added to academic configuration!`);
    setNewSubjectInput('');
    setShowAddSubjectModal(false);
  }

  function handleDeleteSubject(sub: string) {
    const updated = StorageService.deleteSubject(sub);
    setSubjectsList(updated);
    toast.success(`Subject "${sub}" removed.`);
  }

  // Add / Delete Class
  function handleAddClass(e: React.FormEvent) {
    e.preventDefault();
    if (!newClassInput.trim()) return;
    const updated = StorageService.addClass(newClassInput.trim());
    setClassesList(updated);
    toast.success(`Class "${newClassInput.trim()}" added to academic configuration!`);
    setNewClassInput('');
    setShowAddClassModal(false);
  }

  function handleDeleteClass(cls: string) {
    const updated = StorageService.deleteClass(cls);
    setClassesList(updated);
    toast.success(`Class "${cls}" removed.`);
  }

  // Selected subject question bank
  const currentBank = useMemo(() => {
    return questionBanks.find(b => b.subject.toLowerCase() === selectedBankSubject.toLowerCase()) || questionBanks[0] || {
      subject: selectedBankSubject,
      classLevel: 'Classes 9 to 12',
      chapters: [],
    };
  }, [questionBanks, selectedBankSubject]);

  // ---------------------------------------------------------------------------
  // Unauthenticated Gateway Guard
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Skeleton className="w-16 h-16 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md shadow-lg border-destructive/20 text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
              <ShieldOff className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Restricted Administrative Console</h1>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed text-left">
                This administrative console is restricted exclusively to <strong>{ADMIN_EMAIL}</strong>. Access requires authentication with the master administrator password.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="default"
                className="w-full cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-2"
                onClick={() => openAdminModal()}
              >
                <Lock className="w-4 h-4" />
                Enter Master Admin Password
              </Button>
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                onClick={() => setPage('landing')}
              >
                <Home className="w-4 h-4 mr-2" />Return to Platform
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Authenticated Admin Dashboard Layout
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background flex flex-col font-delight text-left">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="LearnReady" style={{ height: '44px', width: 'auto' }} className="object-contain" />
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold leading-none text-foreground">Master Control Panel</span>
                <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                  Super Admin
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{ADMIN_EMAIL}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage('landing')}
              className="cursor-pointer text-xs flex items-center gap-1 border-primary/30 text-primary hover:bg-primary/5"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Launchpad</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="border-t border-border/60 bg-muted/30 px-4">
          <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto py-1.5">
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                activeTab === 'results' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              National Results
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                activeTab === 'users' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              User Details ({userAccounts.length})
            </button>

            <button
              onClick={() => setActiveTab('tiers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                activeTab === 'tiers' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              Payments & Tiers ({payments.length})
            </button>

            <button
              onClick={() => setActiveTab('banks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                activeTab === 'banks' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-violet-600" />
              Question Banks Upload
            </button>

            <button
              onClick={() => setActiveTab('academic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                activeTab === 'academic' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              Add Subject & Class
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 text-left">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Test Candidates</p>
                <p className="text-2xl font-bold mt-0.5">{results.length}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Registered Users</p>
                <p className="text-2xl font-bold mt-0.5">{userAccounts.length}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Pro Subscriptions</p>
                <p className="text-2xl font-bold mt-0.5">{proUsersCount}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Revenue Logged</p>
                <p className="text-2xl font-bold mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===================================================================
            TAB 1: NATIONAL RESULTS
           =================================================================== */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">National Results & Scoring Records</h2>
                <p className="text-xs text-muted-foreground">Student diagnostic dossiers, percentile rankings, and RIASEC stream matches.</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleExportCSV} className="cursor-pointer text-xs self-start sm:self-auto">
                <Download className="w-3.5 h-3.5 mr-1.5" />Export All Results (CSV)
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9 text-xs"
                  placeholder="Search by student name, email, or candidate ID…"
                  value={resultsSearch}
                  onChange={e => setResultsSearch(e.target.value)}
                />
              </div>
              <Select value={boardFilter} onValueChange={setBoardFilter}>
                <SelectTrigger className="w-full sm:w-44 text-xs"><SelectValue placeholder="Filter by board" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Boards</SelectItem>
                  {BOARDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-0">
                {loadingResults ? (
                  <div className="p-6 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
                ) : filteredResults.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No assessment results match your query.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="border-b border-border bg-muted/40">
                        <tr>
                          {['Candidate', 'Email', 'Mobile', 'Board', 'Score', 'Percentile', 'Profile', 'Date', ''].map(h => (
                            <th key={h} className="text-left font-semibold uppercase tracking-wide text-muted-foreground px-4 py-2.5 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map((r, i) => (
                          <tr key={r.id} className={`border-b border-border/40 hover:bg-muted/30 transition-colors ${i % 2 ? 'bg-muted/10' : ''}`}>
                            <td className="px-4 py-3 font-medium whitespace-nowrap">{r.name || r.candidateId}</td>
                            <td className="px-4 py-3 text-muted-foreground font-mono">{r.email}</td>
                            <td className="px-4 py-3 text-muted-foreground font-mono whitespace-nowrap">{r.phone || 'N/A'}</td>
                            <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{r.board}</Badge></td>
                            <td className="px-4 py-3 font-bold text-primary">{r.totalScore}/100</td>
                            <td className="px-4 py-3 text-muted-foreground">{r.percentile}th</td>
                            <td className="px-4 py-3"><Badge className="text-xs">{r.profile}</Badge></td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.dateTaken ? new Date(r.dateTaken).toLocaleDateString('en-IN') : '—'}</td>
                            <td className="px-4 py-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                                onClick={() => setDeletingResultId(r.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Board Average Chart */}
            {!loadingResults && results.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />Average Diagnostic Score by Educational Board
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={BOARDS.map(b => {
                        const match = results.filter(r => r.board === b);
                        return {
                          board: b,
                          avg: match.length ? Math.round(match.reduce((acc, x) => acc + x.totalScore, 0) / match.length) : 0,
                          count: match.length,
                        };
                      }).filter(d => d.count > 0)}
                      margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="board" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip formatter={(val: number) => [`${val}/100`, 'Average Score']} />
                      <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 2: USER DETAILS MANAGEMENT
           =================================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Candidate User Accounts</h2>
                <p className="text-xs text-muted-foreground">Inspect, edit credentials, manage registration metadata, and delete user profiles.</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={userTierFilter} onValueChange={(v: any) => setUserTierFilter(v)}>
                  <SelectTrigger className="w-36 text-xs"><SelectValue placeholder="Tier Filter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="free">Free Trial</SelectItem>
                    <SelectItem value="paid">Paid Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 text-xs"
                placeholder="Search candidates by name, email, or mobile number…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-0">
                {filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No registered candidate users found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="border-b border-border bg-muted/40">
                        <tr>
                          {['Candidate Name', 'Email Address', 'Mobile Number', 'Class', 'Board', 'School', 'Registered', 'Tier Status', 'Actions'].map(h => (
                            <th key={h} className="text-left font-semibold uppercase tracking-wide text-muted-foreground px-4 py-2.5 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u, i) => (
                          <tr key={u.id} className={`border-b border-border/40 hover:bg-muted/30 transition-colors ${i % 2 ? 'bg-muted/10' : ''}`}>
                            <td className="px-4 py-3 font-semibold whitespace-nowrap">{u.name || 'Candidate'}</td>
                            <td className="px-4 py-3 font-mono text-muted-foreground">{u.email}</td>
                            <td className="px-4 py-3 font-mono whitespace-nowrap text-foreground">{u.phone || 'Not Provided'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{u.grade || 'Class 10'}</td>
                            <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{u.board || 'CBSE'}</Badge></td>
                            <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{u.school || '—'}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                              {u.registeredAt ? new Date(u.registeredAt).toLocaleDateString('en-IN') : 'Recent'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {u.isPaidPro ? (
                                <Badge className="bg-emerald-600 text-white text-xs flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />Paid Pro
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 text-xs flex items-center gap-1">
                                  <Clock className="w-3 h-3" />Free Trial
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs px-2 cursor-pointer"
                                  onClick={() => handleOpenEditUser(u)}
                                  title="Edit candidate details"
                                >
                                  <Edit className="w-3 h-3 mr-1" />Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs px-2 text-destructive hover:bg-destructive/10 cursor-pointer"
                                  onClick={() => setDeletingUserId(u.id)}
                                  title="Delete candidate account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===================================================================
            TAB 3: USER PAYMENTS & TIER CONTROL
           =================================================================== */}
        {activeTab === 'tiers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">User Payments & Tier Permissions</h2>
                <p className="text-xs text-muted-foreground">Upgrade or downgrade candidate accounts between Free 7-Day Trial and Paid Pro (₹899).</p>
              </div>
              <Button
                size="sm"
                className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5"
                onClick={() => setShowManualPaymentModal(true)}
              >
                <Plus className="w-3.5 h-3.5" />Record Manual Payment (₹899)
              </Button>
            </div>

            {/* Quick Tier Switching Table */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />Candidate Tier Control Panel
                </CardTitle>
                <CardDescription className="text-xs">
                  Grant or revoke access to chapterwise question banks and verified answer keys in self-service mode.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="border-b border-border bg-muted/40">
                      <tr>
                        {['Candidate', 'Email', 'Current Tier', 'Trial Window', 'Tier Switch Action'].map(h => (
                          <th key={h} className="text-left font-semibold uppercase tracking-wide text-muted-foreground px-4 py-2.5 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {userAccounts.map((u, i) => {
                        const trialEnd = u.trialEndsAt || (u.registeredAt ? u.registeredAt + 7 * 24 * 60 * 60 * 1000 : Date.now());
                        const isExpired = Date.now() > trialEnd;
                        return (
                          <tr key={u.id} className={`border-b border-border/40 hover:bg-muted/30 transition-colors ${i % 2 ? 'bg-muted/10' : ''}`}>
                            <td className="px-4 py-3 font-semibold whitespace-nowrap">{u.name || 'Candidate'}</td>
                            <td className="px-4 py-3 font-mono text-muted-foreground">{u.email}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {u.isPaidPro ? (
                                <Badge className="bg-emerald-600 text-white text-xs">Paid Pro Lifetime</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 text-xs">
                                  {isExpired ? 'Trial Expired' : '7-Day Free Trial'}
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                              {u.isPaidPro ? 'Lifetime Unlocked' : isExpired ? 'Expired' : 'Active (7 Days)'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {u.isPaidPro ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs px-2.5 text-amber-700 hover:bg-amber-50 border-amber-300 cursor-pointer"
                                  onClick={() => handleToggleTier(u.id, true)}
                                >
                                  Revert to Free Trial
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="h-7 text-xs px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer font-semibold"
                                  onClick={() => handleToggleTier(u.id, false)}
                                >
                                  Grant Paid Pro (₹899 Unlocked)
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Payment Transactions Ledger */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />Payment Transaction History
                </CardTitle>
                <CardDescription className="text-xs">
                  All automated UPI/Card checkouts and manual fee logs for question bank access.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {payments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-xs">
                    No payment transactions recorded yet. Use the button above to record manual payments.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="border-b border-border bg-muted/40">
                        <tr>
                          {['Transaction ID', 'Candidate Email', 'Candidate Name', 'Amount', 'Method', 'Date', 'Status', ''].map(h => (
                            <th key={h} className="text-left font-semibold uppercase tracking-wide text-muted-foreground px-4 py-2.5 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p, i) => (
                          <tr key={p.id} className={`border-b border-border/40 hover:bg-muted/30 transition-colors ${i % 2 ? 'bg-muted/10' : ''}`}>
                            <td className="px-4 py-3 font-mono font-medium text-foreground whitespace-nowrap">{p.transactionRef || p.id}</td>
                            <td className="px-4 py-3 text-muted-foreground font-mono">{p.userEmail}</td>
                            <td className="px-4 py-3 font-medium whitespace-nowrap">{p.userName}</td>
                            <td className="px-4 py-3 font-bold text-emerald-700 dark:text-emerald-400">₹{p.amount}</td>
                            <td className="px-4 py-3 uppercase text-xs font-semibold">{p.method}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(p.date).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3">
                              <Badge className="bg-emerald-600 text-white text-xs capitalize">{p.status}</Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                                onClick={() => handleDeletePayment(p.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===================================================================
            TAB 4: QUESTION BANK UPLOAD & CATALOG
           =================================================================== */}
        {activeTab === 'banks' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Question Bank Repository & Upload</h2>
                <p className="text-xs text-muted-foreground">Upload chapterwise question banks, modify verified answer keys, or batch upload JSON catalogs.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  className="cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1.5"
                  onClick={() => {
                    setNewChapSubject(selectedBankSubject);
                    setShowAddChapterModal(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />Upload New Chapter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer text-xs flex items-center gap-1.5"
                  onClick={() => setShowJsonUploadModal(true)}
                >
                  <Upload className="w-3.5 h-3.5" />JSON Batch Upload
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer text-xs flex items-center gap-1.5"
                  onClick={handleExportBanksJson}
                >
                  <Download className="w-3.5 h-3.5" />Export Catalog (JSON)
                </Button>
              </div>
            </div>

            {/* Subject Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 border-b border-border">
              {subjectsList.map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => {
                    setSelectedBankSubject(sub);
                    setExpandedChapterId(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    selectedBankSubject === sub
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Subject Overview Card */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-foreground">{currentBank.subject}</h3>
                  <Badge variant="outline" className="text-xs">{currentBank.classLevel}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Total Chapters: <strong>{currentBank.chapters.length}</strong> • Total Questions Available:{' '}
                  <strong>{currentBank.chapters.reduce((acc, c) => acc + c.questionCount, 0)}</strong>
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer text-xs"
                onClick={() => {
                  setNewChapSubject(currentBank.subject);
                  setShowAddChapterModal(true);
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />Add Chapter to {currentBank.subject}
              </Button>
            </div>

            {/* Chapter List */}
            {currentBank.chapters.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">No chapters uploaded for {currentBank.subject} yet.</p>
                <p className="text-xs mt-1">Use the "Upload New Chapter" button above to add questions and answer keys.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentBank.chapters.map(chap => {
                  const isExpanded = expandedChapterId === chap.id;
                  return (
                    <div key={chap.id} className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-foreground">{chap.title}</h4>
                            <Badge variant="outline" className="text-xs">{chap.difficulty}</Badge>
                            <span className="text-xs text-muted-foreground">{chap.questionCount} Questions</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            {chap.topics.map(t => (
                              <span key={t} className="bg-muted px-2 py-0.5 rounded text-xs text-muted-foreground">{t}</span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 cursor-pointer flex items-center gap-1"
                            onClick={() => setExpandedChapterId(isExpanded ? null : chap.id)}
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {isExpanded ? 'Hide Key' : 'Inspect Sample & Key'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                            onClick={() => handleDeleteChapter(currentBank.subject, chap.id)}
                            title="Delete this chapter"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Expandable Sample Question & Answer Key */}
                      {isExpanded && (
                        <div className="border-t border-border pt-3 mt-2 space-y-3">
                          {chap.sampleQuestions.map((qItem, idx) => (
                            <div key={idx} className="rounded-lg bg-muted/40 p-3 space-y-2 text-xs">
                              <p className="font-semibold text-foreground">Sample Item {idx + 1}: {qItem.q}</p>
                              <div className="rounded border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/40 p-2 text-xs text-emerald-950 dark:text-emerald-100">
                                <strong>Verified Answer Key:</strong> {qItem.answerKey}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                <strong>Solution Note:</strong> {qItem.solutionNote}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 5: ACADEMIC CONFIGURATION (ADD SUBJECT & ADD CLASS)
           =================================================================== */}
        {activeTab === 'academic' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Academic Subjects & Class Configuration</h2>
              <p className="text-xs text-muted-foreground">Manage active academic subjects and secondary grade cohorts across the diagnostic system.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SUBJECTS CONFIGURATION */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />Active Subjects ({subjectsList.length})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Available across question banks and student profiles.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="cursor-pointer text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1"
                    onClick={() => setShowAddSubjectModal(true)}
                  >
                    <Plus className="w-3 h-3" />Add Subject
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {subjectsList.map(sub => {
                    const bank = questionBanks.find(b => b.subject.toLowerCase() === sub.toLowerCase());
                    const chapCount = bank ? bank.chapters.length : 0;
                    return (
                      <div key={sub} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                        <div>
                          <p className="text-xs font-bold text-foreground">{sub}</p>
                          <p className="text-xs text-muted-foreground">{chapCount} Chapters in Question Bank</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                          onClick={() => handleDeleteSubject(sub)}
                          title="Delete subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* CLASSES CONFIGURATION */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" />Active Classes / Levels ({classesList.length})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Available in student registration and diagnostic forms.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    className="cursor-pointer text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1"
                    onClick={() => setShowAddClassModal(true)}
                  >
                    <Plus className="w-3 h-3" />Add Class
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {classesList.map(cls => (
                    <div key={cls} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                      <div>
                        <p className="text-xs font-bold text-foreground">{cls}</p>
                        <p className="text-xs text-muted-foreground">Active Cohort Target</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
                        onClick={() => handleDeleteClass(cls)}
                        title="Delete class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* ===================================================================
          MODAL: EDIT USER DETAILS
         =================================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg shadow-xl border-border bg-card text-left">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="text-base font-bold">Edit Candidate Credentials</CardTitle>
                <CardDescription className="text-xs">Editing account metadata for {editingUser.email}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 cursor-pointer" onClick={() => setEditingUser(null)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSaveUserEdit} className="space-y-3.5">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Candidate Full Name</Label>
                  <Input value={editUserName} onChange={e => setEditUserName(e.target.value)} required />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Mobile Number</Label>
                  <Input value={editUserPhone} onChange={e => setEditUserPhone(e.target.value)} placeholder="10-digit mobile" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Class / Grade</Label>
                    <Select value={editUserGrade} onValueChange={setEditUserGrade}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {classesList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Educational Board</Label>
                    <Select value={editUserBoard} onValueChange={setEditUserBoard}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Select board" /></SelectTrigger>
                      <SelectContent>
                        {BOARDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">School / Institution</Label>
                  <Input value={editUserSchool} onChange={e => setEditUserSchool(e.target.value)} placeholder="e.g. DPS R.K. Puram" />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingUser(null)} className="cursor-pointer">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="cursor-pointer font-semibold bg-primary text-primary-foreground">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===================================================================
          MODAL: RECORD MANUAL PAYMENT (₹899)
         =================================================================== */}
      {showManualPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-xl border-border bg-card text-left">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />Record Manual Payment (₹899)
                </CardTitle>
                <CardDescription className="text-xs">Log offline or cash payment and instantly grant candidate Pro tier.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 cursor-pointer" onClick={() => setShowManualPaymentModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleRecordManualPayment} className="space-y-3.5">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Candidate Email Address *</Label>
                  <Input
                    type="email"
                    placeholder="candidate@example.com"
                    value={manualPayEmail}
                    onChange={e => setManualPayEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Candidate Full Name (Optional)</Label>
                  <Input
                    placeholder="e.g. Priya Sharma"
                    value={manualPayName}
                    onChange={e => setManualPayName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Fee Amount</Label>
                    <Input value="₹899 INR" disabled className="bg-muted font-bold text-emerald-700" />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Payment Mode</Label>
                    <Select value={manualPayMethod} onValueChange={(v: any) => setManualPayMethod(v)}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Select mode" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Cash / Direct</SelectItem>
                        <SelectItem value="upi">Direct UPI Transfer</SelectItem>
                        <SelectItem value="card">Bank / POS Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Transaction Reference / Receipt ID</Label>
                  <Input
                    placeholder="e.g. REC-2026-001"
                    value={manualPayRef}
                    onChange={e => setManualPayRef(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowManualPaymentModal(false)} className="cursor-pointer">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="cursor-pointer font-semibold bg-emerald-600 hover:bg-emerald-700 text-white">
                    Confirm & Grant Pro Tier
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===================================================================
          MODAL: UPLOAD NEW CHAPTER TO QUESTION BANK
         =================================================================== */}
      {showAddChapterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-xl shadow-xl border-border bg-card text-left my-8">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />Upload Chapter Question Bank
                </CardTitle>
                <CardDescription className="text-xs">Deploy chapter questions and verified answer keys to candidate repository.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 cursor-pointer" onClick={() => setShowAddChapterModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4 max-h-[75vh] overflow-y-auto">
              <form onSubmit={handleAddChapter} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Subject *</Label>
                    <Select value={newChapSubject || selectedBankSubject} onValueChange={setNewChapSubject}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        {subjectsList.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Target Class Level</Label>
                    <Select value={newChapClass} onValueChange={setNewChapClass}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {classesList.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Chapter Title *</Label>
                  <Input
                    placeholder="e.g. Electromagnetic Induction & Alternating Currents"
                    value={newChapTitle}
                    onChange={e => setNewChapTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Total Question Count</Label>
                    <Input
                      type="number"
                      value={newChapCount}
                      onChange={e => setNewChapCount(parseInt(e.target.value) || 20)}
                      min={5}
                      max={200}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Difficulty Level</Label>
                    <Select value={newChapDiff} onValueChange={(v: any) => setNewChapDiff(v)}>
                      <SelectTrigger className="text-xs"><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Foundational">Foundational</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Key Topics (Comma separated)</Label>
                  <Input
                    placeholder="Faraday's Law, Lenz's Law, Mutual Inductance, AC Circuits"
                    value={newChapTopics}
                    onChange={e => setNewChapTopics(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Sample Assessment Question</Label>
                  <Textarea
                    placeholder="State Faraday's law of electromagnetic induction and write its mathematical formulation."
                    value={newChapSampleQ}
                    onChange={e => setNewChapSampleQ(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Verified Answer Key *</Label>
                  <Textarea
                    placeholder="Induced emf ε = -dΦ/dt where Φ is the magnetic flux through the closed loop circuit."
                    value={newChapAnswerKey}
                    onChange={e => setNewChapAnswerKey(e.target.value)}
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Step-by-Step Solution Note</Label>
                  <Textarea
                    placeholder="Provide full pedagogical solution notes for candidate review."
                    value={newChapSolution}
                    onChange={e => setNewChapSolution(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddChapterModal(false)} className="cursor-pointer">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="cursor-pointer font-semibold bg-primary text-primary-foreground">
                    Save & Deploy Chapter
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===================================================================
          MODAL: BATCH JSON QUESTION BANK UPLOAD
         =================================================================== */}
      {showJsonUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-xl shadow-xl border-border bg-card text-left">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-violet-600" />Batch JSON Question Bank Upload
                </CardTitle>
                <CardDescription className="text-xs">Paste formatted JSON array of subjects and chapters to bulk update.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 cursor-pointer" onClick={() => setShowJsonUploadModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleBatchJsonUpload} className="space-y-3.5">
                <Textarea
                  placeholder={`[\n  {\n    "subject": "Mathematics",\n    "classLevel": "Class 10 & 11",\n    "chapters": [...]\n  }\n]`}
                  value={jsonBatchContent}
                  onChange={e => setJsonBatchContent(e.target.value)}
                  rows={8}
                  className="font-mono text-xs"
                  required
                />
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowJsonUploadModal(false)} className="cursor-pointer">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="cursor-pointer font-semibold bg-primary text-primary-foreground">
                    Import JSON Catalog
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===================================================================
          MODAL: ADD SUBJECT
         =================================================================== */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm shadow-xl border-border bg-card text-left">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border">
              <CardTitle className="text-sm font-bold">Add Academic Subject</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 cursor-pointer" onClick={() => setShowAddSubjectModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleAddSubject} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Subject Title</Label>
                  <Input
                    placeholder="e.g. Computer Science & Python"
                    value={newSubjectInput}
                    onChange={e => setNewSubjectInput(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddSubjectModal(false)} className="cursor-pointer">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="cursor-pointer font-semibold bg-primary text-primary-foreground">
                    Add Subject
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===================================================================
          MODAL: ADD CLASS
         =================================================================== */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm shadow-xl border-border bg-card text-left">
            <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border">
              <CardTitle className="text-sm font-bold">Add Target Class / Cohort</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 cursor-pointer" onClick={() => setShowAddClassModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleAddClass} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Class / Cohort Title</Label>
                  <Input
                    placeholder="e.g. Class 8 Foundation"
                    value={newClassInput}
                    onChange={e => setNewClassInput(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddClassModal(false)} className="cursor-pointer">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="cursor-pointer font-semibold bg-primary text-primary-foreground">
                    Add Class
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===================================================================
          CONFIRMATION: DELETE RESULT
         =================================================================== */}
      <AlertDialog open={!!deletingResultId} onOpenChange={open => { if (!open) setDeletingResultId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete assessment result record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this student's diagnostic scores and percentile calculations. This action cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingResultId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingResultId && handleDeleteResult(deletingResultId)}>
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ===================================================================
          CONFIRMATION: DELETE USER ACCOUNT
         =================================================================== */}
      <AlertDialog open={!!deletingUserId} onOpenChange={open => { if (!open) setDeletingUserId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete candidate account?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the candidate's account registry, login credentials, and session state.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingUserId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingUserId && handleDeleteUser(deletingUserId)}>
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
