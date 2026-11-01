export interface BenchmarkStudent {
  id: string;
  region: string;
  educationLevel: string;
  verbal: number;
  numerical: number;
  spatial: number;
  interest: number;
  total: number;
  personality: 'Analytical' | 'Creative' | 'Operational';
}

export interface BenchmarkStats {
  mean: number;
  std: number;
  min: number;
  max: number;
}

export interface PercentileResult {
  percentile: number;
  rank: number;
  totalStudents: number;
  L: number;
  S: number;
}

// Deterministic seeded PRNG (mulberry32) — same benchmark every page load
function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box-Muller transform for normal distribution
function normalRandom(rand: () => number, mean: number, std: number): number {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return Math.max(0, Math.min(100, Math.round(mean + z * std)));
}

const REGIONS = ['North India', 'Northeast India', 'East India', 'Central India', 'West India', 'South India', 'International'];
const EDUCATION_LEVELS = ['Class 9', 'Class 10 (Current)', 'Class 11', 'Class 12', 'Undergraduate', 'Graduate'];
const PERSONALITIES: Array<BenchmarkStudent['personality']> = ['Analytical', 'Creative', 'Operational'];
const BENCHMARK_SIZE = 2500;
const DOMAIN_MEAN = 50;
const DOMAIN_STD = 15;

let _cache: BenchmarkStudent[] | null = null;

export function getBenchmarkData(): BenchmarkStudent[] {
  if (_cache) return _cache;

  const rand = mulberry32(0xC0FFEE42);

  _cache = Array.from({ length: BENCHMARK_SIZE }, (_, i) => {
    const verbal = normalRandom(rand, DOMAIN_MEAN, DOMAIN_STD);
    const numerical = normalRandom(rand, DOMAIN_MEAN, DOMAIN_STD);
    const spatial = normalRandom(rand, DOMAIN_MEAN, DOMAIN_STD);
    const interest = normalRandom(rand, DOMAIN_MEAN, DOMAIN_STD);
    const total = Math.round((verbal + numerical + spatial + interest) / 4);
    return {
      id: `STU-${String(i + 1).padStart(4, '0')}`,
      region: REGIONS[Math.floor(rand() * REGIONS.length)],
      educationLevel: EDUCATION_LEVELS[Math.floor(rand() * EDUCATION_LEVELS.length)],
      verbal, numerical, spatial, interest, total,
      personality: PERSONALITIES[Math.floor(rand() * PERSONALITIES.length)],
    };
  });

  return _cache;
}

export function getBenchmarkStats(benchmark: BenchmarkStudent[]): BenchmarkStats {
  const totals = benchmark.map(s => s.total);
  const mean = totals.reduce((a, b) => a + b, 0) / totals.length;
  const variance = totals.reduce((a, b) => a + (b - mean) ** 2, 0) / totals.length;
  const std = Math.sqrt(variance);
  return {
    mean: parseFloat(mean.toFixed(1)),
    std: parseFloat(std.toFixed(1)),
    min: Math.min(...totals),
    max: Math.max(...totals),
  };
}

/** Percentile formula: P = (L + 0.5S) / N × 100 */
export function calculatePercentile(userTotal: number, benchmark: BenchmarkStudent[]): PercentileResult {
  const N = benchmark.length + 1;
  const L = benchmark.filter(s => s.total < userTotal).length;
  const S = benchmark.filter(s => s.total === userTotal).length;
  const percentile = Math.min(99, Math.round(((L + 0.5 * S) / N) * 100));
  const rank = benchmark.filter(s => s.total > userTotal).length + 1;
  return { percentile, rank, totalStudents: N, L, S };
}

export function getTopStudents(benchmark: BenchmarkStudent[], n = 10): BenchmarkStudent[] {
  return [...benchmark].sort((a, b) => b.total - a.total).slice(0, n);
}

export function normalPDF(x: number, mean: number, std: number): number {
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / std) ** 2);
}

export function getPercentileLabel(p: number): { label: string; color: string } {
  if (p >= 90) return { label: 'Top 10% Nationwide', color: 'text-amber-600' };
  if (p >= 75) return { label: 'Above Average', color: 'text-emerald-600' };
  if (p >= 50) return { label: 'Average', color: 'text-blue-600' };
  if (p >= 25) return { label: 'Below Average', color: 'text-orange-600' };
  return { label: 'Needs Improvement', color: 'text-destructive' };
}
