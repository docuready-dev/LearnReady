import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  seconds: number;
}

export default function Timer({ seconds }: TimerProps) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  const isWarning = seconds <= 600; // last 10 min
  const isCritical = seconds <= 120; // last 2 min

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-semibold transition-colors ${
        isCritical
          ? 'bg-destructive/10 border-destructive/30 text-destructive'
          : isWarning
          ? 'bg-amber-50 border-amber-200 text-amber-700'
          : 'bg-primary/5 border-primary/20 text-primary'
      }`}
    >
      {isCritical ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
      <span>
        {hours > 0 ? `${pad(hours)}:` : ''}
        {pad(mins)}:{pad(secs)}
      </span>
    </div>
  );
}
