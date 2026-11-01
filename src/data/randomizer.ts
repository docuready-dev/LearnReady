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
 * "Unique-Max" Algorithm: select `count` questions from `pool` while
 * preserving difficulty distribution: easy ~33%, medium ~47%, hard ~20%.
 * Falls back to any available question if a tier is under-stocked.
 */
function selectWithDifficulty(pool: Question[], count: number, rand: () => number): string[] {
  const byDiff: Record<Difficulty, Question[]> = {
    easy: fisherYates(pool.filter(q => q.difficulty === 'easy'), rand),
    medium: fisherYates(pool.filter(q => q.difficulty === 'medium'), rand),
    hard: fisherYates(pool.filter(q => q.difficulty === 'hard'), rand),
  };

  const easyCount = Math.round(count * 0.33);
  const hardCount = Math.round(count * 0.20);
  const mediumCount = count - easyCount - hardCount;

  const picks: Question[] = [
    ...byDiff.easy.slice(0, easyCount),
    ...byDiff.medium.slice(0, mediumCount),
    ...byDiff.hard.slice(0, hardCount),
  ];

  // Fill shortfall from remaining pool
  if (picks.length < count) {
    const usedIds = new Set(picks.map(q => q.id));
    const spare = fisherYates(pool.filter(q => !usedIds.has(q.id)), rand);
    picks.push(...spare.slice(0, count - picks.length));
  }

  // Final shuffle so difficulties are interleaved
  return fisherYates(picks, rand).slice(0, count).map(q => q.id);
}

/**
 * Generate a unique, reproducible session question set for each candidate.
 * Seed = hash of candidateId + startTime → same inputs always give same output.
 */
export function generateSessionQuestions(
  candidateId: string,
  startTime: number,
  mode: 'full' | 'quick' = 'full'
): SessionQuestionIds {
  const seed = hashString(`${candidateId}::${startTime}`);
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
    verbal: selectWithDifficulty(verbalPool, aptCount, rand),
    numerical: selectWithDifficulty(numericalPool, aptCount, rand),
    spatial: selectWithDifficulty(spatialPool, aptCount, rand),
    personality: fisherYates(personalityPool, rand).slice(0, persCount).map(q => q.id),
  };
}

/** Retrieve full Question objects for a session's selected IDs (preserving order). */
export function getSessionQuestions(domain: Domain, questionIds: string[]): Question[] {
  return questionIds
    .map(id => questions.find(q => q.id === id))
    .filter((q): q is Question => q !== undefined && q.domain === domain);
}
