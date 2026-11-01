import { BenchmarkStudent } from '../data/benchmark';
import { cn } from '@/lib/utils';
import { Trophy, Medal, User2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LeaderboardProps {
  topStudents: BenchmarkStudent[];
  userRank: number;
  userTotal: number;
  candidateId: string;
  name: string;
  region: string;
  educationLevel: string;
  totalStudents: number;
}

const RANK_ICON = (rank: number) => {
  if (rank === 1) return <Trophy className="w-3.5 h-3.5 text-amber-500" />;
  if (rank === 2) return <Medal className="w-3.5 h-3.5 text-slate-400" />;
  if (rank === 3) return <Medal className="w-3.5 h-3.5 text-amber-700" />;
  return null;
};

function Row({ rank, id, region, educationLevel, total, isUser }: {
  rank: number; id: string; region: string; educationLevel: string; total: number; isUser?: boolean;
}) {
  return (
    <tr className={cn('border-b border-border transition-colors', isUser ? 'bg-primary/5 font-semibold' : 'hover:bg-muted/40')}>
      <td className="py-2.5 px-3 text-sm">
        <span className="flex items-center gap-1.5">
          {RANK_ICON(rank)}
          <span className={cn(rank <= 3 ? 'font-bold' : '')}>{rank}</span>
        </span>
      </td>
      <td className="py-2.5 px-3 text-sm">
        <span className="flex items-center gap-1.5">
          {isUser && <User2 className="w-3.5 h-3.5 text-primary" />}
          <span className={cn(isUser ? 'text-primary' : '')}>{id}</span>
          {isUser && <Badge variant="outline" className="text-xs px-1.5 py-0 border-primary text-primary ml-1">You</Badge>}
        </span>
      </td>
      <td className="py-2.5 px-3 text-sm text-muted-foreground hidden sm:table-cell">{region}</td>
      <td className="py-2.5 px-3 text-sm text-muted-foreground hidden md:table-cell">{educationLevel}</td>
      <td className="py-2.5 px-3 text-sm text-right">
        <span className={cn('font-bold tabular-nums', isUser ? 'text-primary' : '')}>{total}</span>
        <span className="text-muted-foreground font-normal">/100</span>
      </td>
    </tr>
  );
}

export default function Leaderboard({
  topStudents, userRank, userTotal, candidateId, name, region, educationLevel, totalStudents
}: LeaderboardProps) {
  const userInTop10 = userRank <= 10;

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/60 border-b border-border">
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rank</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Candidate</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Region</th>
              <th className="text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Education</th>
              <th className="text-right py-2.5 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Score</th>
            </tr>
          </thead>
          <tbody>
            {topStudents.map((s, i) => (
              <Row
                key={s.id}
                rank={i + 1}
                id={userInTop10 && i + 1 === userRank ? (name || candidateId) : s.id}
                region={userInTop10 && i + 1 === userRank ? region : s.region}
                educationLevel={userInTop10 && i + 1 === userRank ? educationLevel : s.educationLevel}
                total={userInTop10 && i + 1 === userRank ? userTotal : s.total}
                isUser={userInTop10 && i + 1 === userRank}
              />
            ))}

            {!userInTop10 && (
              <>
                <tr><td colSpan={5} className="py-2 px-3 text-center text-xs text-muted-foreground">· · · {totalStudents - 11} more candidates · · ·</td></tr>
                <Row
                  rank={userRank}
                  id={name || candidateId}
                  region={region}
                  educationLevel={educationLevel}
                  total={userTotal}
                  isUser
                />
              </>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground text-center">
        Showing top 10 out of {totalStudents.toLocaleString()} candidates nationwide
      </p>
    </div>
  );
}
