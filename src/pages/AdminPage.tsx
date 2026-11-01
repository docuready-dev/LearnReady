import { useEffect, useState, useMemo } from 'react';
import { useAuth, ADMIN_EMAIL } from '../context/AuthContext';
import { useExam } from '../context/ExamContext';
import { getResults, deleteResult } from '../api/results';
import { StorageService } from '../services/storageService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BarChart3, Trophy, Shield, ShieldOff, Trash2, LogOut, Home, Search, TrendingUp, Download } from 'lucide-react';
import { toast } from 'sonner';
import { ExamResultRecord } from '../types';

const LOGO_URL = '/logo.svg';
const BOARDS = ['CBSE', 'ICSE', 'STATE_MH', 'STATE_WB', 'STATE_DL', 'STATE_TN', 'STATE_KA', 'STATE_OTHER', 'IB', 'IGCSE'];

type Result = ExamResultRecord;

function StatCard({ label, value, icon: Icon, cls }: { label: string; value: string | number; icon: any; cls: string }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cls}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BoardChart({ results }: { results: Result[] }) {
  const data = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    results.forEach(r => {
      const b = r.board || 'Other';
      if (!map[b]) map[b] = { count: 0, total: 0 };
      map[b].count++;
      map[b].total += r.totalScore;
    });
    return Object.entries(map).map(([board, d]) => ({ board, avg: Math.round(d.total / d.count), count: d.count }));
  }, [results]);

  if (!data.length) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />Average Score by Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="board" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
              formatter={(v: number, name: string) => [name === 'avg' ? `${v}/100` : v, name === 'avg' ? 'Avg Score' : 'Students']}
            />
            <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function AdminDashboard() {
  const { setPage } = useExam();
  const { user, logout } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getResults().then(d => { setResults(d.results); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    let r = results;
    if (boardFilter !== 'all') r = r.filter(x => x.board === boardFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      r = r.filter(x => x.name.toLowerCase().includes(s) || x.email.toLowerCase().includes(s) || x.candidateId.toLowerCase().includes(s));
    }
    return r;
  }, [results, search, boardFilter]);

  const avgScore = results.length ? Math.round(results.reduce((a, r) => a + r.totalScore, 0) / results.length) : 0;
  const topScore = results.length ? Math.max(...results.map(r => r.totalScore)) : 0;

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteResult({ id });
      setResults(prev => prev.filter(r => r.id !== id));
      toast.success('Record deleted successfully');
    } catch {
      toast.error('Failed to delete record');
    } finally {
      setDeleting(null);
    }
  }

  function handleExportCSV() {
    StorageService.exportToCSV(results);
    toast.success('Exporting CSV...');
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="LearnReady" style={{ height: '32px', width: 'auto' }} className="object-contain" />
            <div>
              <p className="text-xs font-bold leading-none">Admin Panel</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="cursor-pointer">
              <Download className="w-3.5 h-3.5 mr-1" />Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage('landing')} className="cursor-pointer">
              <Home className="w-3.5 h-3.5 mr-1" />Home
            </Button>
            <Button variant="outline" size="sm" onClick={() => logout()} className="cursor-pointer">
              <LogOut className="w-3.5 h-3.5 mr-1" />Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold">National Results Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All student assessments — searchable, filterable, exportable, and deletable.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Total Students" value={results.length.toLocaleString('en-IN')} icon={Users} cls="bg-blue-100 text-blue-600" />
            <StatCard label="Average Score" value={`${avgScore}/100`} icon={BarChart3} cls="bg-emerald-100 text-emerald-600" />
            <StatCard label="Top Score" value={`${topScore}/100`} icon={Trophy} cls="bg-amber-100 text-amber-600" />
            <StatCard label="Access Level" value="Super Admin" icon={Shield} cls="bg-purple-100 text-purple-600" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name, email, or candidate ID…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={boardFilter} onValueChange={setBoardFilter}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Filter by board" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Boards</SelectItem>
              {BOARDS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{results.length === 0 ? 'No results recorded yet. They appear here as students complete assessments.' : 'No results match your search or filter.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>{['Name', 'Email', 'Board', 'Score', 'Percentile', 'Profile', 'Date', ''].map(h => (
                      <th key={h} className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground px-4 py-2.5 whitespace-nowrap">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <tr key={r.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 ? 'bg-muted/10' : ''}`}>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{r.name || r.candidateId}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{r.email}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{r.board}</Badge></td>
                        <td className="px-4 py-3 font-bold text-primary">{r.totalScore}/100</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.percentile}th</td>
                        <td className="px-4 py-3"><Badge className="text-xs">{r.profile}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{r.dateTaken ? new Date(r.dateTaken).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="px-4 py-3">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer" disabled={deleting === r.id}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this record?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete <strong>{r.name || r.candidateId}</strong>'s result. This cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(r.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
              Showing {filtered.length} of {results.length} total records
            </div>
          )}
        </Card>

        {!loading && results.length > 0 && <BoardChart results={results} />}
      </main>
    </div>
  );
}

export default function AdminPage() {
  const { user, isLoading, loginWithRedirect, loginAsAdmin } = useAuth();
  const { setPage } = useExam();
  const [customEmail, setCustomEmail] = useState('');

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-sm shadow-lg">
          <CardContent className="pt-8 pb-6 text-center space-y-5">
            <img src={LOGO_URL} alt="LearnReady" className="h-10 mx-auto object-contain" />
            <div>
              <h1 className="text-xl font-bold">Admin Portal</h1>
              <p className="text-sm text-muted-foreground mt-1">Authenticate as Super Admin ({ADMIN_EMAIL}) to access the results dashboard.</p>
            </div>
            
            <div className="space-y-3">
              <Button className="w-full cursor-pointer" onClick={() => loginAsAdmin()}>
                <Shield className="w-4 h-4 mr-2" />Login as Super Admin
              </Button>
              
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or test custom email</span></div>
              </div>

              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  className="text-xs"
                />
                <Button variant="outline" size="sm" onClick={() => loginWithRedirect(customEmail)} disabled={!customEmail.includes('@')}>
                  Enter
                </Button>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="w-full text-muted-foreground cursor-pointer" onClick={() => setPage('landing')}>
              <Home className="w-4 h-4 mr-1.5" />Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-sm shadow-lg">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <ShieldOff className="w-7 h-7 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Access Denied</h1>
              <p className="text-sm text-muted-foreground mt-1"><strong>{user.email}</strong> does not have admin privileges.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="default" className="w-full" onClick={() => loginAsAdmin()}>
                Switch to Super Admin
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setPage('landing')}>
                <Home className="w-4 h-4 mr-2" />Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdminDashboard />;
}
