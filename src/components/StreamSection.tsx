import { StreamRecommendation, STREAM_DATA, StreamType } from '../utils/scoring';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GraduationCap, Star } from 'lucide-react';

interface Props {
  stream: StreamRecommendation;
  educationLevel: string;
}

const ORDER: StreamType[] = ['Science', 'Commerce', 'Humanities'];

const BAR_COLORS: Record<StreamType, string> = {
  Science: 'bg-blue-500',
  Commerce: 'bg-emerald-500',
  Humanities: 'bg-violet-500',
};

function StreamBar({ name, pct, isTop }: { name: StreamType; pct: number; isTop: boolean }) {
  const meta = STREAM_DATA[name];
  return (
    <div className={cn('rounded-xl border p-4 transition-all', isTop ? `${meta.bgClass} ${meta.borderClass} ring-2 ring-offset-1 ring-primary/30` : 'bg-card border-border')}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">{meta.emoji}</span>
          <div>
            <p className={cn('font-bold text-sm', isTop ? meta.colorClass : 'text-foreground')}>{name} Stream</p>
            <p className="text-xs text-muted-foreground">{meta.badge}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-2xl font-black tabular-nums', isTop ? meta.colorClass : 'text-foreground')}>{pct}%</span>
          {isTop && <Badge className="text-xs bg-primary text-primary-foreground"><Star className="w-3 h-3 mr-1 fill-current" />Best Fit</Badge>}
        </div>
      </div>
      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', BAR_COLORS[name])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function StreamSection({ stream, educationLevel }: Props) {
  const rec = stream.recommended;
  const meta = STREAM_DATA[rec];
  const isClass10 = educationLevel.includes('10');

  return (
    <div className={cn('rounded-2xl border-2 overflow-hidden', meta.borderClass)}>
      {/* Header */}
      <div className={cn('px-6 py-4 flex items-center justify-between', meta.bgClass, meta.borderClass, 'border-b-2')}>
        <div className="flex items-center gap-3">
          <GraduationCap className={cn('w-5 h-5', meta.colorClass)} />
          <div>
            <p className={cn('font-bold text-base', meta.colorClass)}>
              Stream Aptitude Analysis
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isClass10 ? 'Class 10 Exclusive · Powered by your aptitude + interest profile' : `${educationLevel} Career Cluster Alignment`}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={cn('font-semibold text-xs', meta.colorClass, meta.borderClass)}>
          {isClass10 ? '🎯 Class 10 Special' : educationLevel}
        </Badge>
      </div>

      <div className="p-6 space-y-4">
        {/* Stream bars */}
        <div className="space-y-3">
          {ORDER.map(s => (
            <StreamBar key={s} name={s} pct={stream[s.toLowerCase() as 'science' | 'commerce' | 'humanities']} isTop={s === rec} />
          ))}
        </div>

        {/* Recommended stream detail */}
        <div className={cn('rounded-xl p-5 border-2', meta.bgClass, meta.borderClass)}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{meta.emoji}</span>
            <div>
              <p className={cn('font-black text-lg', meta.colorClass)}>Recommended: {rec} Stream</p>
              <p className="text-xs text-muted-foreground">{meta.badge}</p>
            </div>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed mb-4">{meta.description}</p>

          <div className="space-y-3">
            <div>
              <p className={cn('text-xs font-bold uppercase tracking-wide mb-2', meta.colorClass)}>Suggested Subjects</p>
              <div className="flex flex-wrap gap-1.5">
                {meta.subjects.map(s => (
                  <Badge key={s} variant="outline" className={cn('text-xs font-medium', meta.colorClass, meta.borderClass)}>{s}</Badge>
                ))}
              </div>
            </div>
            <div>
              <p className={cn('text-xs font-bold uppercase tracking-wide mb-1', meta.colorClass)}>Career Pathways</p>
              <p className="text-sm text-muted-foreground">{meta.careers}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Stream recommendation is based on your aptitude scores and RIASEC interest profile. Discuss with a career counsellor before making your final choice.
        </p>
      </div>
    </div>
  );
}
