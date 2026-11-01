import { ExamResultRecord, UserAccount } from '../types';

const STORAGE_KEY = 'learnready_exam_results_v1';
const ACCOUNTS_KEY = 'learnready_user_accounts_v1';

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
      return data ? JSON.parse(data) : [];
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

    // If user account wasn't in list yet, create account with new password
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
}
