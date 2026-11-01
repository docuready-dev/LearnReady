import { useEffect } from 'react';
import { useExam } from '../context/ExamContext';
import { getSessionQuestions } from '../data/randomizer';
import { SECTIONS } from '../data/questions';
import Timer from '../components/Timer';
import QuestionCard from '../components/QuestionCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOGO_URL = '/logo.svg';

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  violet: 'bg-violet-100 text-violet-800 border-violet-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
};

export default function ExamPage() {
  const { state, timeRemaining, setPage, setAnswer, submitSection, setCurrentQuestion, setCurrentSection } = useExam();

  useEffect(() => {
    if (state.completed) setPage('results');
  }, [state.completed, setPage]);

  // Guard: if questionIds are empty (legacy state), redirect to landing
  useEffect(() => {
    if (!state.startTime) return;
    if (!state.questionIds || state.questionIds.verbal.length === 0) setPage('landing');
  }, [state.startTime, state.questionIds, setPage]);

  const sectionIdx = state.currentSection;
  const section = SECTIONS[sectionIdx];

  // Get the randomised question set for this domain
  const domainKey = section.key as keyof typeof state.questionIds;
  const sessionIds = state.questionIds?.[domainKey] ?? [];
  const sectionQuestions = getSessionQuestions(section.key, sessionIds);

  const qIdx = state.currentQuestion;
  const currentQ = sectionQuestions[qIdx];
  const answeredCount = sectionQuestions.filter(q => state.answers[q.id] !== undefined).length;
  const progress = sectionQuestions.length > 0 ? (answeredCount / sectionQuestions.length) * 100 : 0;

  function handleSubmitSection() {
    submitSection(sectionIdx);
    if (sectionIdx === 3) setPage('results');
  }

  if (!currentQ && sectionQuestions.length > 0 && qIdx >= sectionQuestions.length) {
    setCurrentQuestion(0);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-1.5 flex items-center gap-3">
          <div className="flex items-center gap-3 flex-shrink-0">
            <img src={LOGO_URL} alt="LearnReady" style={{ height: '32px', width: 'auto' }} className="object-contain" />
            {state.board && <Badge variant="outline" className="text-xs hidden md:flex">{state.board}</Badge>}
            {state.testMode === 'quick' && (
              <Badge className="text-xs hidden md:flex bg-amber-100 text-amber-700 border-amber-300 border">⚡ Quick Test</Badge>
            )}
          </div>

          <div className="flex-1 flex gap-1 overflow-x-auto py-1">
            {SECTIONS.map((s, i) => {
              const submitted = state.submittedSections[i];
              const active = i === sectionIdx;
              return (
                <button
                  key={s.key}
                  disabled={!submitted && i !== sectionIdx}
                  onClick={() => { if (submitted || i === sectionIdx) setCurrentSection(i); }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 cursor-pointer',
                    active ? 'bg-primary text-primary-foreground' :
                    submitted ? 'bg-muted text-muted-foreground hover:bg-muted/80' :
                    'text-muted-foreground/40 cursor-not-allowed'
                  )}
                >
                  {submitted && <CheckCircle2 className="w-3 h-3" />}
                  {s.shortLabel}
                </button>
              );
            })}
          </div>
          <div className="flex-shrink-0"><Timer seconds={timeRemaining} /></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-2 flex items-center gap-2">
          <Progress value={progress} className="flex-1 h-1.5" />
          <span className="text-xs text-muted-foreground flex-shrink-0">{answeredCount}/{sectionQuestions.length}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 py-6">
        <div className="mb-4">
          <Badge variant="outline" className={cn('text-xs border', colorMap[section.color])}>{section.label}</Badge>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex-1">
          {currentQ ? (
            <QuestionCard
              question={currentQ}
              answer={state.answers[currentQ.id]}
              onAnswer={val => setAnswer(currentQ.id, val)}
              questionNumber={qIdx + 1}
              totalQuestions={sectionQuestions.length}
            />
          ) : (
            <div className="flex items-center justify-center h-40 text-muted-foreground">Loading questions...</div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <Button variant="outline" onClick={() => setCurrentQuestion(Math.max(0, qIdx - 1))} disabled={qIdx === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          <div className="flex gap-1.5 flex-wrap justify-center max-w-xs sm:max-w-sm">
            {sectionQuestions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(i)}
                className={cn(
                  'w-7 h-7 rounded-full text-xs font-medium border transition-all cursor-pointer',
                  i === qIdx ? 'bg-primary text-primary-foreground border-primary' :
                  state.answers[q.id] ? 'bg-secondary border-primary/40 text-primary' :
                  'bg-card border-border text-muted-foreground hover:border-primary/40'
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {qIdx < sectionQuestions.length - 1 ? (
            <Button onClick={() => setCurrentQuestion(qIdx + 1)}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="cursor-pointer">
                  <CheckCircle2 className="w-4 h-4 mr-2" />Submit {section.shortLabel}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Submit {section.label}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You answered {answeredCount} of {sectionQuestions.length} questions. Once submitted, you cannot return.
                    {answeredCount < sectionQuestions.length && (
                      <span className="block mt-2 font-medium text-amber-600">
                        {sectionQuestions.length - answeredCount} question(s) unanswered.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Review answers</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmitSection}>Confirm submission</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </main>
    </div>
  );
}
