import { Question } from '../types';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  answer: string | undefined;
  onAnswer: (value: string) => void;
  questionNumber: number;
  totalQuestions: number;
}

const LIKERT_LABELS = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

export default function QuestionCard({ question, answer, onAnswer, questionNumber, totalQuestions }: QuestionCardProps) {
  return (
    <div className="space-y-5">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Question {questionNumber} of {totalQuestions}
      </div>

      {question.passage && (
        <div className="bg-muted/60 border border-border rounded-lg p-4 text-sm text-foreground/80 leading-relaxed max-h-40 overflow-y-auto">
          <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">Reading Passage</p>
          <p>{question.passage}</p>
        </div>
      )}

      <div className="text-base font-medium text-foreground leading-relaxed">
        {question.text.split('\n').map((line, i) => {
          const isPattern = /[■□●○▲▲△▼◆★☆|]/.test(line) || /^\s*[\d\|]/.test(line);
          return (
            <span key={i} className={isPattern ? 'block font-mono text-sm tracking-widest my-0.5' : 'block'}>
              {line || <br />}
            </span>
          );
        })}
      </div>

      {question.type === 'mcq' && question.options && (
        <div className="space-y-2.5">
          {question.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => onAnswer(opt.value)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all flex items-center gap-3 cursor-pointer',
                answer === opt.value
                  ? 'border-primary bg-secondary text-primary font-medium'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/60 text-foreground'
              )}
            >
              <span
                className={cn(
                  'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors',
                  answer === opt.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground'
                )}
              >
                {opt.value}
              </span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}

      {question.type === 'likert' && (
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Strongly Disagree</span>
            <span>Strongly Agree</span>
          </div>
          <div className="flex gap-3 justify-between">
            {[1, 2, 3, 4, 5].map(val => (
              <button
                key={val}
                onClick={() => onAnswer(String(val))}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs transition-all cursor-pointer',
                  answer === String(val)
                    ? 'border-primary bg-secondary text-primary font-semibold'
                    : 'border-border bg-card hover:border-primary/40 text-muted-foreground'
                )}
              >
                <span
                  className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors',
                    answer === String(val)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border'
                  )}
                >
                  {val}
                </span>
                <span className="hidden sm:block text-center leading-tight">{LIKERT_LABELS[val - 1]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
