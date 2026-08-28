import { CheckCircle2, Clock, CalendarClock, TrendingUp } from 'lucide-react';
import type { Activity } from '@/types';

interface Props {
  total: number;
  completed: number;
  currentActivity: Activity | null;
  nextActivity: Activity | null;
  progressPercent: number;
  readOnly: boolean;
}

export function StatsBar({
  total,
  completed,
  currentActivity,
  nextActivity,
  progressPercent,
  readOnly,
}: Props) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        icon={<CheckCircle2 className="h-4 w-4" />}
        label="Completed"
        value={`${completed}/${total}`}
        accent="emerald"
      />
      <StatCard
        icon={<TrendingUp className="h-4 w-4" />}
        label="Completion"
        value={`${pct}%`}
        accent="blue"
      />
      <StatCard
        icon={<Clock className="h-4 w-4" />}
        label={readOnly ? 'Last Activity' : 'Now'}
        value={currentActivity ? currentActivity.title : '—'}
        accent="amber"
        small
      />
      <StatCard
        icon={<CalendarClock className="h-4 w-4" />}
        label="Up Next"
        value={nextActivity ? nextActivity.title : '—'}
        accent="violet"
        small
      />
      <div className="col-span-2 sm:col-span-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          {readOnly
            ? pct === 100
              ? 'All activities completed this day'
              : pct > 0
                ? `${completed} of ${total} activities completed`
                : 'No activities were completed this day'
            : currentActivity
              ? `In progress: ${currentActivity.title}`
              : progressPercent > 0
                ? 'On track for the day'
                : 'Day hasn\'t started yet'}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: 'emerald' | 'blue' | 'amber' | 'violet';
  small?: boolean;
}) {
  const accents: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${accents[accent]}`}>
          {icon}
        </span>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <p
        className={`font-bold text-slate-900 ${small ? 'truncate text-sm' : 'text-xl'}`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
