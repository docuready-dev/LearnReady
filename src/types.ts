export type Domain = 'verbal' | 'numerical' | 'spatial' | 'personality';
export type RiasecCode = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
export type ProfileType = 'Analytical' | 'Creative' | 'Operational';
export type Page = 'landing' | 'exam' | 'results' | 'admin' | 'login' | 'profile';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface MCQOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  domain: Domain;
  type: 'mcq' | 'likert';
  difficulty?: Difficulty;
  text: string;
  passage?: string;
  options?: MCQOption[];
  correctAnswer?: string;
  explanation?: string;
  riasecCode?: RiasecCode;
}

export interface SessionQuestionIds {
  verbal: string[];
  numerical: string[];
  spatial: string[];
  personality: string[];
}

export type TestMode = 'full' | 'quick';

export interface ExamState {
  candidateId: string;
  email: string;
  phone?: string;
  name: string;
  age: string;
  region: string;
  educationLevel: string;
  board: string;
  testMode: TestMode;
  startTime: number;
  currentSection: number;
  currentQuestion: number;
  answers: Record<string, string>;
  submittedSections: boolean[];
  completed: boolean;
  questionIds: SessionQuestionIds;
}

export interface SectionScore {
  domain: Domain;
  label: string;
  raw: number;
  total: number;
  percentage: number;
}

export interface PersonalityResult {
  riasecScores: Record<RiasecCode, number>;
  analytical: number;
  creative: number;
  operational: number;
  profile: ProfileType;
}

export interface ExamResultRecord {
  id: string;
  candidateId: string;
  name: string;
  email: string;
  phone?: string;
  age: number;
  board: string;
  region: string;
  educationLevel: string;
  totalScore: number;
  verbalScore: number;
  numericalScore: number;
  spatialScore: number;
  profile: string;
  percentile: number;
  nationalRank: number;
  dateTaken: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'candidate' | 'admin';
  grade?: string;
  board?: string;
  school?: string;
  createdAt: string;
  registeredAt?: number;
  trialEndsAt?: number;
  isPaidPro?: boolean;
}
