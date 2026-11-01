import { useMemo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, ReferenceLine, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { normalPDF } from '../data/benchmark';

interface BellCurveChartProps {
  userScore: number;
  mean: number;
  std: number;
}

interface ChartPoint {
  x: number;
  below: number | null;
  above: number | null;
  curve: number;
}

function ordinalSuffix(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function BellCurveChart({ userScore, mean, std }: BellCurveChartProps) {
  const data = useMemo<ChartPoint[]>(() => {
    const pts: ChartPoint[] = [];
    for (let x = 0; x <= 100; x += 1) {
      const pdf = normalPDF(x, mean, std);
      pts.push({
        x,
        below: x <= userScore ? pdf : null,
        above: x >= userScore ? pdf : null,
        curve: pdf,
      });
    }
    return pts;
  }, [userScore, mean, std]);

  const userLabel = `Your Score: ${userScore}`;
  const meanLabel = `Nat. Avg: ${Math.round(mean)}`;

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-primary opacity-70" />
          Your percentile area
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-muted" />
          Above your score
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-8 border-t-2 border-dashed border-muted-foreground" />
          National average ({Math.round(mean)})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-8 border-t-2 border-primary" />
          {ordinalSuffix(userScore)} score
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, 100]}
            tickCount={11}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            label={{ value: 'Score', position: 'insideBottom', offset: -2, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis hide />
          <Tooltip
            formatter={(value: number) => [value.toFixed(5), 'Density']}
            labelFormatter={(label) => `Score: ${label}`}
            contentStyle={{ fontSize: 12, borderRadius: '6px', border: '1px solid hsl(var(--border))' }}
          />

          {/* Shaded area below user's score */}
          <Area dataKey="below" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.45} connectNulls={false} />
          {/* Light area above user's score */}
          <Area dataKey="above" stroke="none" fill="hsl(var(--muted))" fillOpacity={0.6} connectNulls={false} />
          {/* Full bell curve line */}
          <Line dataKey="curve" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />

          <ReferenceLine
            x={Math.round(mean)}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={{ value: meanLabel, position: 'top', fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          />
          <ReferenceLine
            x={userScore}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            label={{ value: userLabel, position: 'top', fontSize: 10, fill: 'hsl(var(--primary))' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
