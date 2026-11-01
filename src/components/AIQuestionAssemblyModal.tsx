import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Cpu, ShieldCheck, Clock } from 'lucide-react';
import { getBoardLabel } from '../data/boards';

interface AIQuestionAssemblyModalProps {
  open: boolean;
  educationLevel: string;
  board: string;
  testMode: 'full' | 'quick';
  candidateName: string;
  onComplete: () => void;
}

export default function AIQuestionAssemblyModal({
  open,
  educationLevel,
  board,
  testMode,
  candidateName,
  onComplete,
}: AIQuestionAssemblyModalProps) {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const boardName = getBoardLabel(board);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setActiveStep(0);
      return;
    }

    // Step-by-step processing animation over ~2.4 seconds
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 350);
          return 100;
        }

        const next = prev + 5;
        if (next >= 85) setActiveStep(4);
        else if (next >= 65) setActiveStep(3);
        else if (next >= 40) setActiveStep(2);
        else if (next >= 20) setActiveStep(1);
        else setActiveStep(0);

        return next;
      });
    }, 110);

    return () => clearInterval(interval);
  }, [open, onComplete]);

  const steps = [
    {
      title: `Analyzing Academic Profile: ${educationLevel}`,
      desc: 'Configuring cognitive benchmark parameters for candidate level',
    },
    {
      title: `Curriculum Calibration for ${board}`,
      desc: `Aligning syllabus weighting with ${boardName}`,
    },
    {
      title: 'Generating Multidimensional Question Pool',
      desc: 'Retrieving Verbal Comprehension, Numerical Logic, Spatial Reasoning & RIASEC items',
    },
    {
      title: 'Applying Cognitive Difficulty Interleaving',
      desc: 'Distributing foundational, intermediate, and advanced diagnostic items',
    },
    {
      title: 'Finalizing Secure Assessment Environment',
      desc: testMode === 'quick' ? '30-minute battery initialized (Audio alerts every 10 mins)' : '90-minute battery initialized (Audio alerts every 30 mins)',
    },
  ];

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="sm:max-w-lg font-delight text-left p-6 sm:p-7 space-y-5">
        <div className="space-y-2 text-left">
          <div className="flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5 animate-pulse text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg text-foreground text-left">AI Question Engine</h3>
                <p className="text-xs text-muted-foreground text-left">Compiling realtime diagnostic battery</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs font-mono font-semibold border-primary/30 text-primary">
              {progress}% Compiled
            </Badge>
          </div>

          <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1 text-left">
            <div className="flex items-center justify-between text-xs font-medium text-foreground text-left">
              <span>Candidate: <strong>{candidateName || 'Student'}</strong></span>
              <span>Level: <strong>{educationLevel}</strong></span>
            </div>
            <p className="text-xs text-muted-foreground truncate text-left">
              Affiliation: {boardName}
            </p>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-1.5 text-left">
          <Progress value={progress} className="h-2.5 bg-muted" />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>Synthesis in progress</span>
            <span>{testMode === 'quick' ? '30 Questions · Quick' : '65 Questions · Full'}</span>
          </div>
        </div>

        {/* Live Processing Steps Checklist */}
        <div className="space-y-2.5 text-left pt-1">
          {steps.map((step, idx) => {
            const isDone = activeStep > idx || progress === 100;
            const isCurrent = activeStep === idx && progress < 100;

            return (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-3 ${
                  isDone
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-foreground'
                    : isCurrent
                    ? 'bg-primary/5 border-primary/30 text-foreground shadow-2xs'
                    : 'bg-card/50 border-border/50 text-muted-foreground opacity-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
                  )}
                </div>
                <div className="text-left space-y-0.5 min-w-0">
                  <p className="font-semibold text-xs text-foreground text-left truncate">{step.title}</p>
                  <p className="text-2xs sm:text-xs text-muted-foreground text-left leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-2xs sm:text-xs text-muted-foreground border-t border-border pt-3 text-left">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            Periodic exam audio beeps scheduled
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified Board Standards
          </span>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
