import { questions } from '../data/questions';
import { RiasecCode, ProfileType, PersonalityResult, SectionScore } from '../types';

export function calcAptitudeScore(
  domain: 'verbal' | 'numerical' | 'spatial',
  answers: Record<string, string>,
  questionIds: string[]
): SectionScore {
  const qs = questionIds
    .map(id => questions.find(q => q.id === id))
    .filter((q): q is NonNullable<typeof q> => !!q && q.domain === domain);
  const raw = qs.filter(q => answers[q.id] === q.correctAnswer).length;
  const labels: Record<string, string> = {
    verbal: 'Verbal Reasoning',
    numerical: 'Numerical Reasoning',
    spatial: 'Spatial Reasoning',
  };
  return {
    domain,
    label: labels[domain],
    raw,
    total: qs.length || 15,
    percentage: qs.length ? Math.round((raw / qs.length) * 100) : 0,
  };
}

export function calcPersonalityResult(answers: Record<string, string>, questionIds: string[]): PersonalityResult {
  const qs = questionIds
    .map(id => questions.find(q => q.id === id))
    .filter((q): q is NonNullable<typeof q> => !!q && q.domain === 'personality');

  const totals: Record<RiasecCode, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const counts: Record<RiasecCode, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  qs.forEach(q => {
    if (q.riasecCode && answers[q.id]) {
      totals[q.riasecCode] += parseInt(answers[q.id], 10);
      counts[q.riasecCode]++;
    }
  });

  const riasecScores = {} as Record<RiasecCode, number>;
  (['R', 'I', 'A', 'S', 'E', 'C'] as RiasecCode[]).forEach(code => {
    riasecScores[code] = counts[code] > 0 ? Math.round((totals[code] / (counts[code] * 5)) * 100) : 0;
  });

  const analytical = Math.round((riasecScores.I + riasecScores.C) / 2);
  const creative = Math.round((riasecScores.A + riasecScores.E) / 2);
  const operational = Math.round((riasecScores.R + riasecScores.S) / 2);
  let profile: ProfileType;
  if (analytical >= creative && analytical >= operational) profile = 'Analytical';
  else if (creative >= operational) profile = 'Creative';
  else profile = 'Operational';

  return { riasecScores, analytical, creative, operational, profile };
}

export function calcTotalScore(
  verbal: SectionScore,
  numerical: SectionScore,
  spatial: SectionScore,
  personality: PersonalityResult
): number {
  const interestScore = Math.max(personality.analytical, personality.creative, personality.operational);
  return Math.round((verbal.percentage + numerical.percentage + spatial.percentage + interestScore) / 4);
}

// ── Stream Recommendation (Class 10 & 12 exclusive) ──────────────────────────

export type StreamType = 'Science' | 'Commerce' | 'Humanities';

export interface StreamRecommendation {
  science: number;
  commerce: number;
  humanities: number;
  recommended: StreamType;
}

export const STREAM_DATA: Record<StreamType, {
  emoji: string;
  badge: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  subjects: string[];
  careers: string;
  description: string;
}> = {
  Science: {
    emoji: '🔬',
    badge: 'PCM / PCB',
    colorClass: 'text-blue-700',
    borderClass: 'border-blue-300',
    bgClass: 'bg-blue-50',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
    careers: 'Engineering · Medicine · Data Science · Architecture · Pharmacy · Biotechnology · Research',
    description: 'Your strong numerical reasoning, spatial aptitude, and investigative interest profile indicate high suitability for the Science stream. You are likely to excel in problem-solving, experimental thinking, and analytical work.',
  },
  Commerce: {
    emoji: '📊',
    badge: 'Commerce / Business',
    colorClass: 'text-emerald-700',
    borderClass: 'border-emerald-300',
    bgClass: 'bg-emerald-50',
    subjects: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'Entrepreneurship'],
    careers: 'Chartered Accountancy · MBA · Finance · Banking · Management · Law · Economics · Marketing',
    description: 'Your balanced numerical aptitude combined with enterprising and organised personality traits indicate strong suitability for Commerce. You are likely to excel in business analysis, financial thinking, and leadership roles.',
  },
  Humanities: {
    emoji: '📚',
    badge: 'Humanities / Arts',
    colorClass: 'text-violet-700',
    borderClass: 'border-violet-300',
    bgClass: 'bg-violet-50',
    subjects: ['History', 'Political Science', 'Geography', 'Sociology', 'Psychology', 'Literature'],
    careers: 'Law · Journalism · Civil Services · Teaching · Psychology · Social Work · Literature · Policy',
    description: 'Your exceptional verbal reasoning, social awareness, and creative interests indicate strong potential in Humanities. You are likely to excel in communication, critical thinking, and people-centred roles.',
  },
};

export function calcStreamRecommendation(
  verbal: SectionScore,
  numerical: SectionScore,
  spatial: SectionScore,
  personality: PersonalityResult
): StreamRecommendation {
  // Science: numerical (35%) + spatial (25%) + Investigative (25%) + Realistic (15%)
  const rawSci =
    numerical.percentage * 0.35 +
    spatial.percentage * 0.25 +
    personality.riasecScores['I'] * 0.25 +
    personality.riasecScores['R'] * 0.15;

  // Commerce: numerical (30%) + verbal (25%) + Enterprising (25%) + Conventional (20%)
  const rawCom =
    numerical.percentage * 0.30 +
    verbal.percentage * 0.25 +
    personality.riasecScores['E'] * 0.25 +
    personality.riasecScores['C'] * 0.20;

  // Humanities: verbal (40%) + Social (30%) + Artistic (30%)
  const rawHum =
    verbal.percentage * 0.40 +
    personality.riasecScores['S'] * 0.30 +
    personality.riasecScores['A'] * 0.30;

  const total = rawSci + rawCom + rawHum || 1;
  const science = Math.round((rawSci / total) * 100);
  const commerce = Math.round((rawCom / total) * 100);
  const humanities = 100 - science - commerce;

  const recommended: StreamType =
    science >= commerce && science >= humanities
      ? 'Science'
      : commerce >= humanities
      ? 'Commerce'
      : 'Humanities';

  return { science, commerce, humanities, recommended };
}

export const PROFILE_DESCRIPTIONS: Record<ProfileType, { tagline: string; description: string; careers: string }> = {
  Analytical: {
    tagline: 'Evidence-Driven Problem Solver',
    description: 'You demonstrate a strong inclination toward structured problem-solving, systematic analysis, and evidence-based decision-making. Ideal in roles requiring data interpretation, procedural accuracy, and critical thinking.',
    careers: 'Clinical Research · Healthcare Analytics · Quality Assurance · Software & Data Engineering · Regulatory Affairs',
  },
  Creative: {
    tagline: 'Innovative Communicator & Leader',
    description: 'You exhibit a natural talent for innovative thinking, persuasive communication, and strategic leadership. You thrive in dynamic environments that value originality, vision, and entrepreneurial initiative.',
    careers: 'Communications · Media & Design · Consulting · Program Development · Product Strategy',
  },
  Operational: {
    tagline: 'Practical People-Centred Executor',
    description: 'You are a practical, people-centred professional who excels in hands-on environments. You derive deep satisfaction from direct interaction and systematic, reliable execution.',
    careers: 'Operations & Management · Educational Administration · Project Coordination · Allied Health & Services',
  },
};
