import { Domain, Difficulty, SessionQuestionIds } from '../types';
import { questions } from './questions';
import { Question } from '../types';

// Seeded mulberry32 PRNG — deterministic per session
function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 0x01000193);
  }
  return h >>> 0;
}

function fisherYates<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Determine difficulty proportion according to academic class / level.
 * Real-time academic scenario calibration:
 * - Class 9: Foundational curriculum (50% easy, 40% medium, 10% hard)
 * - Class 10: Secondary board standard (35% easy, 45% medium, 20% hard)
 * - Class 11: Higher secondary transition (25% easy, 50% medium, 25% hard)
 * - Class 12: Senior board & competitive prep (15% easy, 50% medium, 35% hard)
 * - Higher Ed (UG / Grad / Dropper): Advanced aptitude & analytical reasoning (10% easy, 45% medium, 45% hard)
 */
function getDifficultyRatios(educationLevel: string = 'Class 10') {
  const l = educationLevel.toLowerCase();
  if (l.includes('class 9')) {
    return { easy: 0.50, medium: 0.40, hard: 0.10 };
  } else if (l.includes('class 10')) {
    return { easy: 0.35, medium: 0.45, hard: 0.20 };
  } else if (l.includes('class 11')) {
    return { easy: 0.25, medium: 0.50, hard: 0.25 };
  } else if (l.includes('class 12')) {
    return { easy: 0.15, medium: 0.50, hard: 0.35 };
  } else {
    // Undergraduate / Graduate / Dropper
    return { easy: 0.10, medium: 0.45, hard: 0.45 };
  }
}

/**
 * Select questions with cognitive difficulty tailored to level and board curriculum.
 */
function selectWithLevelAndBoard(
  pool: Question[],
  count: number,
  rand: () => number,
  educationLevel: string = 'Class 10',
  board: string = 'CBSE'
): string[] {
  const ratios = getDifficultyRatios(educationLevel);
  const isHighRigorBoard = ['ICSE', 'IB', 'IGCSE', 'INI_CENTRAL', 'BCI_LAW'].includes(board);

  // Board-specific weighting: high-rigor boards shift +5% towards hard
  const hardRatio = isHighRigorBoard ? Math.min(0.50, ratios.hard + 0.05) : ratios.hard;
  const easyRatio = isHighRigorBoard ? Math.max(0.08, ratios.easy - 0.05) : ratios.easy;

  const byDiff: Record<Difficulty, Question[]> = {
    easy: fisherYates(pool.filter(q => q.difficulty === 'easy'), rand),
    medium: fisherYates(pool.filter(q => q.difficulty === 'medium'), rand),
    hard: fisherYates(pool.filter(q => q.difficulty === 'hard'), rand),
  };

  const easyCount = Math.round(count * easyRatio);
  const hardCount = Math.round(count * hardRatio);
  const mediumCount = Math.max(0, count - easyCount - hardCount);

  const picks: Question[] = [
    ...byDiff.easy.slice(0, easyCount),
    ...byDiff.medium.slice(0, mediumCount),
    ...byDiff.hard.slice(0, hardCount),
  ];

  // Fill shortfall from remaining pool if any tier is understocked
  if (picks.length < count) {
    const usedIds = new Set(picks.map(q => q.id));
    const spare = fisherYates(pool.filter(q => !usedIds.has(q.id)), rand);
    picks.push(...spare.slice(0, count - picks.length));
  }

  // Shuffle so questions are seamlessly interleaved across difficulty
  return fisherYates(picks, rand).slice(0, count).map(q => q.id);
}

/**
 * Generate a unique, reproducible session question set for each candidate
 * calibrated to their exact academic level and educational / university board.
 */
export function generateSessionQuestions(
  candidateId: string,
  startTime: number,
  mode: 'full' | 'quick' = 'full',
  educationLevel: string = 'Class 10',
  board: string = 'CBSE'
): SessionQuestionIds {
  const seed = hashString(`${candidateId}::${startTime}::${educationLevel}::${board}`);
  const rand = mulberry32(seed);

  const verbalPool = questions.filter(q => q.domain === 'verbal' && q.type === 'mcq');
  const numericalPool = questions.filter(q => q.domain === 'numerical' && q.type === 'mcq');
  const spatialPool = questions.filter(q => q.domain === 'spatial' && q.type === 'mcq');
  const personalityPool = questions.filter(q => q.domain === 'personality' && q.type === 'likert');

  // Quick mode: 8 per aptitude section + 6 personality = 30 total
  // Full mode:  15 per aptitude section + 20 personality = 65 total
  const aptCount = mode === 'quick' ? 8 : 15;
  const persCount = mode === 'quick' ? 6 : 20;

  return {
    verbal: selectWithLevelAndBoard(verbalPool, aptCount, rand, educationLevel, board),
    numerical: selectWithLevelAndBoard(numericalPool, aptCount, rand, educationLevel, board),
    spatial: selectWithLevelAndBoard(spatialPool, aptCount, rand, educationLevel, board),
    personality: fisherYates(personalityPool, rand).slice(0, persCount).map(q => q.id),
  };
}

/** Retrieve full Question objects for a session's selected IDs (preserving order). */
export function getSessionQuestions(domain: Domain, questionIds: string[]): Question[] {
  return questionIds
    .map(id => questions.find(q => q.id === id))
    .filter((q): q is Question => q !== undefined && q.domain === domain);
}
