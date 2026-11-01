import { useEffect, useRef, useState } from 'react';
import { Clock, AlertTriangle, Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';

interface TimerProps {
  seconds: number;
  testMode?: 'full' | 'quick';
  totalSeconds?: number;
}

// Web Audio API chime generator for periodic milestone alerts
function playExamChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // First note: G5 (783.99 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second note: C6 (1046.5 Hz) — pleasant academic bell chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1046.5, now + 0.18);
    gain2.gain.setValueAtTime(0.25, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.65);
  } catch (err) {
    console.warn('AudioContext playback error', err);
  }
}

export default function Timer({ seconds, testMode = 'full', totalSeconds }: TimerProps) {
  const effectiveTotal = totalSeconds || (testMode === 'quick' ? 1800 : 5400);
  const elapsed = Math.max(0, effectiveTotal - seconds);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPulsing, setIsPulsing] = useState(false);

  // Milestone tracking:
  // For 30 min exam: interval is 10 mins (600s) -> milestone after 10m (600s), 20m (1200s)
  // For 90 min exam: interval is 30 mins (1800s) -> milestone after 30m (1800s), 60m (3600s)
  const milestoneInterval = testMode === 'quick' ? 600 : 1800;
  const intervalMinutes = testMode === 'quick' ? 10 : 30;

  const lastMilestoneRef = useRef<number>(0);

  useEffect(() => {
    if (elapsed <= 0) return;

    const currentMilestone = Math.floor(elapsed / milestoneInterval);
    if (currentMilestone > 0 && currentMilestone !== lastMilestoneRef.current && seconds > 0) {
      lastMilestoneRef.current = currentMilestone;
      const elapsedMins = currentMilestone * intervalMinutes;
      const remainingMins = Math.round(seconds / 60);

      if (soundEnabled) {
        playExamChime();
      }

      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 3000);

      toast.info(`Exam Time Milestone: ${elapsedMins} mins elapsed (${remainingMins} mins remaining)`, {
        icon: '🔔',
        duration: 5000,
      });
    }
  }, [elapsed, milestoneInterval, intervalMinutes, seconds, soundEnabled]);

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  const isWarning = seconds <= 600; // last 10 min
  const isCritical = seconds <= 180; // last 3 min

  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border font-mono text-sm font-semibold transition-all shadow-2xs select-none ${
        isPulsing
          ? 'ring-2 ring-primary ring-offset-2 scale-105 bg-primary/10 border-primary text-primary'
          : isCritical
          ? 'bg-destructive/10 border-destructive/30 text-destructive animate-pulse'
          : isWarning
          ? 'bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
          : 'bg-card border-border text-foreground'
      }`}
      title={`Periodic exam beeps scheduled every ${intervalMinutes} mins`}
    >
      <div className="flex items-center gap-1.5">
        {isCritical ? (
          <AlertTriangle className="w-4 h-4 text-destructive" />
        ) : (
          <Clock className={`w-4 h-4 ${isWarning ? 'text-amber-600' : 'text-primary'}`} />
        )}
        <span className="tracking-wider">
          {hours > 0 ? `${pad(hours)}:` : ''}
          {pad(mins)}:{pad(secs)}
        </span>
      </div>

      <div className="h-4 w-px bg-border" />

      {/* Audio Beep Indicator / Mute Toggle */}
      <button
        type="button"
        onClick={() => {
          setSoundEnabled(p => {
            const next = !p;
            toast.info(next ? `Periodic ${intervalMinutes}-min sound alerts enabled` : 'Periodic sound alerts muted');
            return next;
          });
        }}
        className={`cursor-pointer p-0.5 rounded hover:bg-muted transition-colors ${
          soundEnabled ? 'text-primary' : 'text-muted-foreground opacity-50'
        }`}
        title={soundEnabled ? `Periodic sound beeps active every ${intervalMinutes} mins. Click to mute.` : 'Sound alerts muted. Click to enable.'}
      >
        {soundEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
