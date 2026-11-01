import React from 'react';
import { ExamState, SectionScore, PersonalityResult } from '../types';
import { PercentileResult } from '../data/benchmark';
import { getSessionQuestions } from '../data/randomizer';
import { getBoardLabel } from '../data/boards';
import { PROFILE_DESCRIPTIONS, STREAM_DATA, StreamRecommendation, StreamType } from '../utils/scoring';

const LOGO_URL = `${import.meta.env.BASE_URL}logo.svg`;

const DOMAIN_META: Record<string, { label: string; color: string; light: string }> = {
  verbal:      { label: 'Verbal Reasoning',                 color: '#1d4ed8', light: '#eff6ff' },
  numerical:   { label: 'Numerical Reasoning',              color: '#047857', light: '#ecfdf5' },
  spatial:     { label: 'Spatial Reasoning',                color: '#6d28d9', light: '#f5f3ff' },
  personality: { label: 'Occupational Interests (RIASEC)',  color: '#b45309', light: '#fffbeb' },
};

const PROFILE_COLORS: Record<string, string> = {
  Analytical: '#1d4ed8', Creative: '#7c3aed', Operational: '#047857',
};

const LIKERT_LABELS = ['', 'Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

interface PrintReportProps {
  state: ExamState;
  verbal: SectionScore;
  numerical: SectionScore;
  spatial: SectionScore;
  personality: PersonalityResult;
  userTotal: number;
  percentileResult: PercentileResult;
  profile: string;
  streamRec?: StreamRecommendation | null;
}

const STREAM_ORDER: StreamType[] = ['Science', 'Commerce', 'Humanities'];
const STREAM_PRINT_COLORS: Record<StreamType, string> = { Science: '#1d4ed8', Commerce: '#047857', Humanities: '#6d28d9' };
const STREAM_PRINT_BG: Record<StreamType, string> = { Science: '#eff6ff', Commerce: '#ecfdf5', Humanities: '#f5f3ff' };

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ── Per-question card ─────────────────────────────────────────────────────────
function QuestionCard({
  q, userAnswer, index, domainColor,
}: {
  q: ReturnType<typeof getSessionQuestions>[0];
  userAnswer: string | undefined;
  index: number;
  domainColor: string;
}) {
  const isLikert = q.type === 'likert';
  const isCorrect = isLikert ? true : userAnswer === q.correctAnswer;
  const wasAnswered = userAnswer !== undefined;
  const statusColor = !wasAnswered ? '#9ca3af' : isCorrect ? '#16a34a' : '#dc2626';
  const borderColor = !wasAnswered ? '#d1d5db' : isCorrect ? '#86efac' : '#fca5a5';

  return (
    <div style={{
      marginBottom: '10px',
      pageBreakInside: 'avoid',
      breakInside: 'avoid',
      border: `1px solid ${borderColor}`,
      borderLeft: `4px solid ${statusColor}`,
      borderRadius: '6px',
      padding: '11px 14px',
      background: '#ffffff',
    }}>
      {/* Number + Question text */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{
          minWidth: '22px', height: '22px', borderRadius: '50%',
          background: domainColor, color: '#fff',
          fontSize: '10px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>{index}</span>
        <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#111827', margin: 0, lineHeight: 1.45 }}>
          {q.text}
        </p>
      </div>

      {/* MCQ options — 2-column grid */}
      {!isLikert && q.options && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', paddingLeft: '32px', marginBottom: '8px' }}>
          {q.options.map(opt => {
            const isUserChoice = opt.value === userAnswer;
            const isCorrectOpt = opt.value === q.correctAnswer;
            const bg = isCorrectOpt ? '#dcfce7' : (isUserChoice && !isCorrect) ? '#fee2e2' : '#f9fafb';
            const border = isCorrectOpt ? '#86efac' : (isUserChoice && !isCorrect) ? '#fca5a5' : '#e5e7eb';
            const color = isCorrectOpt ? '#166534' : (isUserChoice && !isCorrect) ? '#991b1b' : '#374151';
            return (
              <div key={opt.value} style={{
                padding: '4px 8px', borderRadius: '4px',
                fontSize: '11px', background: bg, border: `1px solid ${border}`,
                color, fontWeight: (isCorrectOpt || isUserChoice) ? 600 : 400,
              }}>
                <span style={{ fontWeight: 700, marginRight: '4px' }}>({opt.value})</span>
                {opt.label}
                {isUserChoice && !isCorrect && <span style={{ marginLeft: '4px' }}>✗</span>}
                {isCorrectOpt && <span style={{ marginLeft: '4px' }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Likert response */}
      {isLikert && (
        <p style={{ fontSize: '11.5px', color: '#4b5563', paddingLeft: '32px', margin: '0 0 6px' }}>
          Response: <strong style={{ color: wasAnswered ? '#111827' : '#9ca3af' }}>
            {wasAnswered ? `${userAnswer} — ${LIKERT_LABELS[+userAnswer] ?? ''}` : 'Not answered'}
          </strong>
        </p>
      )}

      {/* Answer summary */}
      {!isLikert && (
        <div style={{ paddingLeft: '32px', fontSize: '11px', marginBottom: q.explanation ? '6px' : '0', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ color: statusColor, fontWeight: 600 }}>
            {!wasAnswered ? '— Unanswered' : isCorrect ? '✓ Correct' : `✗ Your answer: (${userAnswer}) ${q.options?.find(o => o.value === userAnswer)?.label ?? ''}`}
          </span>
          {!isCorrect && q.correctAnswer && (
            <span style={{ color: '#166534', fontWeight: 600 }}>
              | Correct: ({q.correctAnswer}) {q.options?.find(o => o.value === q.correctAnswer)?.label}
            </span>
          )}
        </div>
      )}

      {/* Explanation */}
      {q.explanation && (
        <div style={{ paddingLeft: '32px', marginTop: '6px' }}>
          <div style={{
            background: '#f0f9ff', border: '1px solid #bae6fd',
            borderRadius: '4px', padding: '6px 10px',
            fontSize: '11px', color: '#0c4a6e', lineHeight: 1.5,
          }}>
            <strong>Step-by-step: </strong>{q.explanation}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Section review page ───────────────────────────────────────────────────────
function SectionReview({
  domain, ids, answers,
}: {
  domain: 'verbal' | 'numerical' | 'spatial' | 'personality';
  ids: string[];
  answers: Record<string, string>;
}) {
  const meta = DOMAIN_META[domain];
  const qs = getSessionQuestions(domain, ids);

  // Group consecutive questions by passage (passages shown once)
  const groups: Array<{ passage?: string; questions: typeof qs }> = [];
  qs.forEach(q => {
    const last = groups[groups.length - 1];
    if (last && last.passage === q.passage) {
      last.questions.push(q);
    } else {
      groups.push({ passage: q.passage, questions: [q] });
    }
  });

  let idx = 0;

  return (
    <div style={{ paddingTop: '18mm' }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: meta.color, color: '#fff',
        padding: '10px 18px', borderRadius: '7px', marginBottom: '16px',
      }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, letterSpacing: '0.04em' }}>
          {meta.label}
        </h3>
        <span style={{ fontSize: '11px', opacity: 0.9, fontWeight: 600 }}>
          {qs.length} Question{qs.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Question groups (with optional passages) */}
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.passage && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderLeft: `4px solid ${meta.color}`,
              borderRadius: '5px',
              padding: '10px 14px',
              marginBottom: '10px',
              fontSize: '11px',
              color: '#374151',
              lineHeight: 1.65,
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
            }}>
              <p style={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: meta.color, margin: '0 0 5px' }}>
                📖 Reading Passage — Questions {idx + 1}–{idx + group.questions.length}
              </p>
              {group.passage}
            </div>
          )}
          {group.questions.map(q => (
            <QuestionCard
              key={q.id}
              q={q}
              userAnswer={answers[q.id]}
              index={++idx}
              domainColor={meta.color}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PrintReport({
  state, verbal, numerical, spatial, personality, userTotal, percentileResult, profile, streamRec,
}: PrintReportProps) {
  const showStream = streamRec && (state.educationLevel?.includes('10') || state.educationLevel?.includes('12'));
  const ids = state.questionIds;
  const pColor = PROFILE_COLORS[profile] || '#1d4ed8';
  const profileDesc = PROFILE_DESCRIPTIONS[profile as keyof typeof PROFILE_DESCRIPTIONS];

  const scores = [
    { label: 'Verbal',     score: verbal.percentage,    sub: `${verbal.raw}/${verbal.total}`,     color: '#1d4ed8', bg: '#eff6ff' },
    { label: 'Numerical',  score: numerical.percentage,  sub: `${numerical.raw}/${numerical.total}`, color: '#047857', bg: '#ecfdf5' },
    { label: 'Spatial',    score: spatial.percentage,    sub: `${spatial.raw}/${spatial.total}`,   color: '#6d28d9', bg: '#f5f3ff' },
    { label: 'Composite',  score: userTotal,             sub: 'overall',                           color: '#1f2937', bg: '#f9fafb' },
  ];

  const candidateDetails = [
    ['Candidate Name',     state.name || 'N/A'],
    ['Candidate ID',       state.candidateId],
    ['Email Address',      state.email],
    ['Mobile Number',      state.phone || 'N/A'],
    ['Age',                state.age],
    ['Educational Board',  getBoardLabel(state.board)],
    ['Class / Level',      state.educationLevel],
    ['Region',             state.region],
    ['Test Format',        state.testMode === 'quick' ? 'Quick Test (30 min · 30 Q)' : 'Full Assessment (90 min · 65 Q)'],
    ['Date of Assessment', new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
    ['Time',               new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })],
  ];

  return (
    <div className="hidden print:block" style={{ fontFamily: 'Arial, Helvetica, sans-serif', color: '#1e293b', fontSize: '12px' }}>

      {/* ── Print CSS ── */}
      <style>{`
        @page { margin: 14mm 18mm; size: A4 portrait; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* ── Fixed watermark ── */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%) rotate(-35deg)',
        zIndex: -1, pointerEvents: 'none', userSelect: 'none',
      }}>
        <img src={LOGO_URL} alt="" style={{ width: '380px', opacity: 0.06 }} />
      </div>

      {/* ── Fixed page header (logo every page) ── */}
      <div style={{ position: 'fixed', top: '6mm', right: '0', zIndex: 100, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '8px', fontWeight: 700, color: '#6b7280', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>LearnReady Battery</p>
          <p style={{ fontSize: '7.5px', color: '#9ca3af', margin: 0 }}>{state.name} · {state.candidateId}</p>
        </div>
        <img src={LOGO_URL} alt="LearnReady" style={{ width: '90px', height: 'auto' }} />
      </div>

      {/* ══════════ PAGE 1: COVER SUMMARY ══════════ */}
      <div style={{ paddingTop: '16mm', minHeight: '86vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Report Title ── */}
        <div style={{ textAlign: 'center', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb' }}>
          <img src={LOGO_URL} alt="LearnReady" style={{ width: '120px', height: 'auto', margin: '0 auto 8px', display: 'block' }} />
          <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9ca3af', margin: '0 0 4px' }}>
            Confidential · Candidate Assessment Report
          </p>
          <h1 style={{ fontSize: '21px', fontWeight: 900, color: '#111827', margin: '0 0 3px', letterSpacing: '-0.02em' }}>
            Aptitude & Interest Battery
          </h1>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: 0 }}>
            National Diagnostic Assessment · Class 9 to 12 India · 2026-27
          </p>
        </div>

        {/* ── Candidate Details (2-column grid) ── */}
        <div>
          <p style={{ fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', margin: '0 0 8px' }}>
            Candidate Information
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
            {candidateDetails.map(([label, value], i) => (
              <div key={label} style={{
                padding: '6px 12px',
                background: i % 4 < 2 ? '#f9fafb' : '#fff',
                borderBottom: i < candidateDetails.length - 2 ? '1px solid #f3f4f6' : 'none',
                borderRight: i % 2 === 0 ? '1px solid #e5e7eb' : 'none',
              }}>
                <p style={{ fontSize: '8.5px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 1px' }}>{label}</p>
                <p style={{ fontSize: '11.5px', fontWeight: 500, color: '#111827', margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Score Cards ── */}
        <div>
          <p style={{ fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', margin: '0 0 8px' }}>
            Domain Performance
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {scores.map(d => (
              <div key={d.label} style={{
                background: d.bg, border: `1px solid ${d.color}25`,
                borderTop: `3px solid ${d.color}`,
                borderRadius: '6px', padding: '12px 10px', textAlign: 'center',
              }}>
                <p style={{ fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: d.color, margin: '0 0 6px' }}>{d.label}</p>
                <p style={{ fontSize: '28px', fontWeight: 900, color: d.color, margin: '0 0 2px', lineHeight: 1 }}>{d.score}</p>
                <p style={{ fontSize: '9.5px', color: '#6b7280', margin: 0 }}>{d.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── National Ranking Banner ── */}
        <div style={{
          background: '#eff6ff', border: '1.5px solid #bfdbfe',
          borderRadius: '8px', padding: '14px 20px',
        }}>
          <p style={{ fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#3b82f6', margin: '0 0 10px' }}>
            National Benchmark Result
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            {[
              { value: `#${percentileResult.rank.toLocaleString('en-IN')}`, label: 'National Rank', color: '#1d4ed8' },
              { value: ordinal(percentileResult.percentile), label: 'Percentile', color: '#1d4ed8' },
              { value: `${userTotal}/100`, label: 'Composite Score', color: pColor },
              { value: `${percentileResult.totalStudents.toLocaleString('en-IN')}`, label: 'Total Candidates', color: '#1d4ed8' },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <div style={{ width: '1px', height: '44px', background: '#bfdbfe' }} />}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 900, color: item.color, margin: '0 0 2px', lineHeight: 1 }}>{item.value}</p>
                  <p style={{ fontSize: '9.5px', color: '#6b7280', margin: 0 }}>{item.label}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Interest Profile ── */}
        {profileDesc && (
          <div style={{
            border: `1.5px solid ${pColor}30`,
            borderLeft: `5px solid ${pColor}`,
            borderRadius: '6px',
            padding: '12px 16px',
            background: '#fafafa',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ background: pColor, color: '#fff', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                {profile} Profile
              </div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: pColor, margin: 0 }}>{profileDesc.tagline}</p>
            </div>
            <p style={{ fontSize: '11px', color: '#374151', lineHeight: 1.55, margin: '0 0 6px' }}>{profileDesc.description}</p>
            <p style={{ fontSize: '11px', color: '#374151', margin: 0 }}>
              <strong style={{ color: '#111827' }}>Recommended career domains: </strong>{profileDesc.careers}
            </p>
          </div>
        )}

        {/* ── Class 10 / 12 Stream Recommendation ── */}
        {showStream && streamRec && (() => {
          const rec = streamRec.recommended;
          const meta = STREAM_DATA[rec];
          const streamColor = STREAM_PRINT_COLORS[rec];
          const streamBg = STREAM_PRINT_BG[rec];
          return (
            <div style={{ border: `2px solid ${streamColor}40`, borderLeft: `5px solid ${streamColor}`, borderRadius: '8px', padding: '14px 16px', background: streamBg }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: streamColor, margin: 0 }}>
                  🎯 STREAM APTITUDE ANALYSIS — {state.educationLevel?.includes('10') ? 'CLASS 10 EXCLUSIVE' : state.educationLevel?.toUpperCase()}
                </p>
              </div>
              {/* Bars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                {STREAM_ORDER.map(s => {
                  const pct = streamRec[s.toLowerCase() as 'science' | 'commerce' | 'humanities'];
                  const isRec = s === rec;
                  const sColor = STREAM_PRINT_COLORS[s];
                  return (
                    <div key={s} style={{ background: '#fff', borderRadius: '6px', padding: '8px 10px', border: `1px solid ${sColor}30`, outline: isRec ? `2px solid ${sColor}` : 'none', outlineOffset: '1px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: sColor, margin: 0 }}>{STREAM_DATA[s].emoji} {s}</p>
                        <p style={{ fontSize: '14px', fontWeight: 900, color: sColor, margin: 0 }}>{pct}%{isRec ? ' ★' : ''}</p>
                      </div>
                      <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: sColor, borderRadius: '2px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: '9.5px', fontWeight: 700, color: streamColor, margin: '0 0 4px' }}>
                Recommended: {rec} Stream ({meta.badge})
              </p>
              <p style={{ fontSize: '10.5px', color: '#374151', lineHeight: 1.5, margin: '0 0 6px' }}>{meta.description}</p>
              <p style={{ fontSize: '10px', color: '#374151', margin: 0 }}>
                <strong style={{ color: streamColor }}>Subjects: </strong>{meta.subjects.join(' · ')}
              </p>
              <p style={{ fontSize: '10px', color: '#374151', margin: '3px 0 0' }}>
                <strong style={{ color: streamColor }}>Career Paths: </strong>{meta.careers}
              </p>
            </div>
          );
        })()}

        {/* ── Interest Breakdown ── */}
        <div>
          <p style={{ fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', margin: '0 0 8px' }}>
            RIASEC Interest Scores
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
            {([['R','Realistic','#c2410c'],['I','Investigative','#1d4ed8'],['A','Artistic','#9d174d'],['S','Social','#166534'],['E','Enterprising','#7e22ce'],['C','Conventional','#374151']] as [string,string,string][]).map(([code, name, color]) => (
              <div key={code} style={{ textAlign: 'center', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '5px', padding: '8px 4px' }}>
                <p style={{ fontSize: '8px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>{code}</p>
                <p style={{ fontSize: '18px', fontWeight: 900, color, margin: '0 0 1px', lineHeight: 1 }}>
                  {personality.riasecScores[code as keyof typeof personality.riasecScores]}%
                </p>
                <p style={{ fontSize: '7.5px', color: '#6b7280', margin: 0 }}>{name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ PAGES 2–5: QUESTION REVIEWS ══════════ */}
      <div style={{ pageBreakBefore: 'always' }}>
        {/* Legend */}
        <div style={{
          display: 'flex', gap: '16px', flexWrap: 'wrap',
          padding: '8px 14px', background: '#f9fafb',
          border: '1px solid #e5e7eb', borderRadius: '6px',
          marginBottom: '16px', fontSize: '10.5px', color: '#374151',
          marginTop: '18mm',
        }}>
          <span><strong>Legend:</strong></span>
          <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Correct answer (green)</span>
          <span style={{ color: '#dc2626', fontWeight: 600 }}>✗ Wrong answer (red)</span>
          <span style={{ color: '#9ca3af' }}>— Not answered (grey)</span>
          <span style={{ color: '#0c4a6e' }}>💡 Step-by-step solution (blue box)</span>
        </div>
        <SectionReview domain="verbal" ids={ids?.verbal ?? []} answers={state.answers} />
      </div>

      <div style={{ pageBreakBefore: 'always' }}>
        <SectionReview domain="numerical" ids={ids?.numerical ?? []} answers={state.answers} />
      </div>

      <div style={{ pageBreakBefore: 'always' }}>
        <SectionReview domain="spatial" ids={ids?.spatial ?? []} answers={state.answers} />
      </div>

      <div style={{ pageBreakBefore: 'always' }}>
        <SectionReview domain="personality" ids={ids?.personality ?? []} answers={state.answers} />
        {/* Footer */}
        <div style={{ marginTop: '24px', paddingTop: '10px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontSize: '9px', color: '#9ca3af' }}>
          LearnReady Aptitude & Interest Battery — Confidential Candidate Report · {state.name} ({state.candidateId}) ·
          Generated {new Date().toLocaleDateString('en-IN')}
        </div>
      </div>
    </div>
  );
}
