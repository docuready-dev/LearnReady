import { ExamResultRecord, UserAccount, PaymentRecord } from '../types';
import { ChapterQuestionBank, QUESTION_BANKS_CATALOG } from '../data/questionBanks';

const STORAGE_KEY = 'learnready_exam_results_v1';
const ACCOUNTS_KEY = 'learnready_user_accounts_v1';
const PAYMENTS_KEY = 'learnready_payments_v1';
const BANKS_KEY = 'learnready_question_banks_v1';
const SUBJECTS_KEY = 'learnready_subjects_v1';
const CLASSES_KEY = 'learnready_classes_v1';

const DEFAULT_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Commerce & Accountancy', 'English Language'];
const DEFAULT_CLASSES = ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'Undergraduate / Dropper'];

export class StorageService {
  private static getRawRecords(): ExamResultRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as ExamResultRecord[];
    } catch (e) {
      console.error('Failed to read from localStorage', e);
      return [];
    }
  }

  private static setRawRecords(records: ExamResultRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  public static async getAllResults(): Promise<ExamResultRecord[]> {
    const records = this.getRawRecords();
    return records.sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime());
  }

  public static async saveResult(data: Omit<ExamResultRecord, 'id' | 'dateTaken'> & { id?: string; dateTaken?: string }): Promise<{ success: boolean; id: string }> {
    const records = this.getRawRecords();
    const newId = data.id || `RES-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newRecord: ExamResultRecord = {
      ...data,
      id: newId,
      dateTaken: data.dateTaken || new Date().toISOString(),
    };

    // Check if record for candidate already exists with same candidateId and date within last minute (idempotency)
    const existingIndex = records.findIndex(r => r.candidateId === newRecord.candidateId && Math.abs(new Date(r.dateTaken).getTime() - new Date(newRecord.dateTaken).getTime()) < 60000);
    if (existingIndex >= 0) {
      records[existingIndex] = newRecord;
    } else {
      records.unshift(newRecord);
    }

    this.setRawRecords(records);
    return { success: true, id: newId };
  }

  public static async deleteResult(id: string): Promise<{ success: boolean }> {
    const records = this.getRawRecords();
    const filtered = records.filter(r => r.id !== id);
    this.setRawRecords(filtered);
    return { success: true };
  }

  public static exportToCSV(results: ExamResultRecord[]): void {
    if (!results.length) return;
    const headers = ['ID', 'Candidate ID', 'Name', 'Email', 'Mobile', 'Age', 'Board', 'Region', 'Class', 'Total Score', 'Verbal Score', 'Numerical Score', 'Spatial Score', 'Profile', 'Percentile', 'National Rank', 'Date Taken'];
    const rows = results.map(r => [
      r.id,
      r.candidateId,
      `"${r.name.replace(/"/g, '""')}"`,
      r.email,
      r.phone || 'N/A',
      r.age,
      r.board,
      r.region,
      r.educationLevel,
      r.totalScore,
      r.verbalScore,
      r.numericalScore,
      r.spatialScore,
      r.profile,
      r.percentile,
      r.nationalRank,
      r.dateTaken,
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LearnReady_Results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ---------------------------------------------------------------------------
  // USER ACCOUNTS
  // ---------------------------------------------------------------------------
  public static getUserAccounts(): UserAccount[] {
    try {
      const data = localStorage.getItem(ACCOUNTS_KEY);
      if (!data) return [];
      const accounts = JSON.parse(data) as UserAccount[];
      return accounts.map(a => ({
        ...a,
        grade: a.grade ? a.grade.replace(/\s*\(Current\)/gi, '').trim() : a.grade,
      }));
    } catch {
      return [];
    }
  }

  public static saveUserAccount(account: Omit<UserAccount, 'id' | 'createdAt'>): UserAccount {
    const accounts = this.getUserAccounts();
    const existing = accounts.find(a => a.email.toLowerCase() === account.email.toLowerCase());
    if (existing) {
      const updated = { ...existing, ...account };
      const idx = accounts.findIndex(a => a.id === existing.id);
      accounts[idx] = updated;
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      return updated;
    }

    const newAcc: UserAccount = {
      ...account,
      id: `USR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    accounts.push(newAcc);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return newAcc;
  }

  public static findUserByEmail(email: string): UserAccount | null {
    const accounts = this.getUserAccounts();
    return accounts.find(a => a.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public static createPasswordResetRequest(email: string): { success: boolean; token?: string; message: string } {
    const accounts = this.getUserAccounts();
    const cleanEmail = email.trim().toLowerCase();
    const user = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    const token = btoa(`${cleanEmail}:${Date.now()}:${Math.random().toString(36).substring(2, 8)}`);

    if (user) {
      user.resetToken = token;
      user.resetRequestedAt = Date.now();
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } else {
      // Store transient reset token for newly referenced email
      const placeholder: UserAccount = {
        id: `USR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        role: 'candidate',
        createdAt: new Date().toISOString(),
        resetToken: token,
        resetRequestedAt: Date.now(),
      };
      accounts.push(placeholder);
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }

    return {
      success: true,
      token,
      message: 'Password reset link generated and dispatched successfully.',
    };
  }

  public static resetUserPassword(email: string, newPassword: string): boolean {
    const accounts = this.getUserAccounts();
    const cleanEmail = email.trim().toLowerCase();
    const user = accounts.find(a => a.email.toLowerCase() === cleanEmail);

    if (user) {
      user.password = newPassword;
      user.resetToken = undefined;
      user.resetRequestedAt = undefined;
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      return true;
    }

    const newAcc: UserAccount = {
      id: `USR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      password: newPassword,
      role: 'candidate',
      createdAt: new Date().toISOString(),
    };
    accounts.push(newAcc);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return true;
  }

  public static updateUserAccount(id: string, updates: Partial<UserAccount>): UserAccount | null {
    const accounts = this.getUserAccounts();
    const idx = accounts.findIndex(a => a.id === id);
    if (idx === -1) return null;
    const updated = { ...accounts[idx], ...updates };
    accounts[idx] = updated;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return updated;
  }

  public static deleteUserAccount(id: string): boolean {
    const accounts = this.getUserAccounts();
    const filtered = accounts.filter(a => a.id !== id);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(filtered));
    return true;
  }

  public static setUserTier(idOrEmail: string, isPaidPro: boolean): boolean {
    const accounts = this.getUserAccounts();
    const target = accounts.find(a => a.id === idOrEmail || a.email.toLowerCase() === idOrEmail.toLowerCase());
    if (!target) return false;
    target.isPaidPro = isPaidPro;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    return true;
  }

  // ---------------------------------------------------------------------------
  // PAYMENTS MANAGEMENT
  // ---------------------------------------------------------------------------
  public static getPayments(): PaymentRecord[] {
    try {
      const data = localStorage.getItem(PAYMENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static recordPayment(payment: Omit<PaymentRecord, 'id' | 'date'>): PaymentRecord {
    const payments = this.getPayments();
    const newRecord: PaymentRecord = {
      ...payment,
      id: `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      date: new Date().toISOString(),
    };
    payments.unshift(newRecord);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));

    // Also auto-upgrade the user's tier to Pro
    this.setUserTier(payment.userEmail, true);
    return newRecord;
  }

  public static deletePayment(id: string): boolean {
    const payments = this.getPayments();
    const filtered = payments.filter(p => p.id !== id);
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(filtered));
    return true;
  }

  // ---------------------------------------------------------------------------
  // QUESTION BANKS MANAGEMENT
  // ---------------------------------------------------------------------------
  public static getQuestionBanks(): ChapterQuestionBank[] {
    try {
      const data = localStorage.getItem(BANKS_KEY);
      if (data) {
        const banks = JSON.parse(data) as ChapterQuestionBank[];
        // Upgrade chapters with options and missing subjects
        banks.forEach(b => {
          const catBank = QUESTION_BANKS_CATALOG.find(cb => cb.subject.toLowerCase() === b.subject.toLowerCase());
          if (catBank) {
            b.chapters.forEach(c => {
              const catChap = catBank.chapters.find(cc => cc.id === c.id);
              if (catChap) {
                c.sampleQuestions.forEach((sq, idx) => {
                  if (!sq.options && catChap.sampleQuestions[idx]?.options) {
                    sq.options = catChap.sampleQuestions[idx].options;
                  }
                });
              }
            });
          }
        });
        QUESTION_BANKS_CATALOG.forEach(cb => {
          if (!banks.some(b => b.subject.toLowerCase() === cb.subject.toLowerCase())) {
            banks.push(cb);
          }
        });
        return banks;
      }
      // Seed with default catalog
      localStorage.setItem(BANKS_KEY, JSON.stringify(QUESTION_BANKS_CATALOG));
      return QUESTION_BANKS_CATALOG;
    } catch {
      return QUESTION_BANKS_CATALOG;
    }
  }

  public static saveAllQuestionBanks(banks: ChapterQuestionBank[]): void {
    localStorage.setItem(BANKS_KEY, JSON.stringify(banks));
  }

  public static addOrUpdateChapter(subject: string, chapter: ChapterQuestionBank['chapters'][0]): void {
    const banks = this.getQuestionBanks();
    let bank = banks.find(b => b.subject.toLowerCase() === subject.toLowerCase());
    if (!bank) {
      bank = {
        subject,
        classLevel: 'Class 10 to 12',
        chapters: [],
      };
      banks.push(bank);
    }
    const existingIdx = bank.chapters.findIndex(c => c.id === chapter.id);
    if (existingIdx >= 0) {
      bank.chapters[existingIdx] = chapter;
    } else {
      bank.chapters.push(chapter);
    }
    this.saveAllQuestionBanks(banks);
  }

  public static deleteChapter(subject: string, chapterId: string): void {
    const banks = this.getQuestionBanks();
    const bank = banks.find(b => b.subject.toLowerCase() === subject.toLowerCase());
    if (bank) {
      bank.chapters = bank.chapters.filter(c => c.id !== chapterId);
      this.saveAllQuestionBanks(banks);
    }
  }

  // ---------------------------------------------------------------------------
  // SUBJECTS & CLASSES MANAGEMENT
  // ---------------------------------------------------------------------------
  public static getSubjects(): string[] {
    try {
      const data = localStorage.getItem(SUBJECTS_KEY);
      if (data) return JSON.parse(data);
      localStorage.setItem(SUBJECTS_KEY, JSON.stringify(DEFAULT_SUBJECTS));
      return DEFAULT_SUBJECTS;
    } catch {
      return DEFAULT_SUBJECTS;
    }
  }

  public static addSubject(subject: string): string[] {
    const clean = subject.trim();
    if (!clean) return this.getSubjects();
    const subjects = this.getSubjects();
    if (!subjects.some(s => s.toLowerCase() === clean.toLowerCase())) {
      subjects.push(clean);
      localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
    }
    return subjects;
  }

  public static deleteSubject(subject: string): string[] {
    const subjects = this.getSubjects().filter(s => s.toLowerCase() !== subject.toLowerCase());
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
    return subjects;
  }

  public static getClasses(): string[] {
    try {
      const data = localStorage.getItem(CLASSES_KEY);
      if (data) {
        const parsed = JSON.parse(data) as string[];
        const sanitized = Array.from(new Set(parsed.map(c => c.replace(/\s*\(Current\)/gi, '').trim()).filter(Boolean)));
        if (JSON.stringify(sanitized) !== data) {
          localStorage.setItem(CLASSES_KEY, JSON.stringify(sanitized));
        }
        return sanitized;
      }
      localStorage.setItem(CLASSES_KEY, JSON.stringify(DEFAULT_CLASSES));
      return DEFAULT_CLASSES;
    } catch {
      return DEFAULT_CLASSES;
    }
  }

  public static addClass(className: string): string[] {
    const clean = className.trim();
    if (!clean) return this.getClasses();
    const classes = this.getClasses();
    if (!classes.some(c => c.toLowerCase() === clean.toLowerCase())) {
      classes.push(clean);
      localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
    }
    return classes;
  }

  public static deleteClass(className: string): string[] {
    const classes = this.getClasses().filter(c => c.toLowerCase() !== className.toLowerCase());
    localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
    return classes;
  }
}
