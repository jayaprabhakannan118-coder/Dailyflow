import { Check, Pencil, Trash2, Circle, Play } from 'lucide-react';
import type { Activity } from '@/types';

interface Props {
  activities: Activity[];
  currentActivityId: string | null;
  now: Date;
  readOnly: boolean;
  onToggleComplete: (a: Activity) => void;
  onEdit: (a: Activity) => void;
  onDelete: (id: string) => void;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m} ${ampm}`;
}

function isPast(activity: Activity, now: Date): boolean {
  const [h, m] = activity.scheduled_time.split(':').map(Number);
  const minutes = h * 60 + m;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return minutes <= nowMinutes;
}

export function ActivityTimeline({
  activities,
  currentActivityId,
  now,
  readOnly,
  onToggleComplete,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200" />

      <div className="space-y-1">
        {activities.map((activity) => {
          const isCurrent = activity.id === currentActivityId;
          const isDone = activity.completed;
          const past = isPast(activity, now) && !isDone;

          return (
            <div
              key={activity.id}
              className={`relative flex gap-4 rounded-xl p-3 transition ${
                isCurrent ? 'bg-amber-50 ring-1 ring-amber-200' : 'hover:bg-slate-50'
              }`}
            >
              {/* Timeline dot */}
              <div className="relative z-10 mt-0.5 flex-shrink-0">
                <button
                  onClick={() => onToggleComplete(activity)}
                  disabled={readOnly}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition active:scale-90 ${
                    isDone
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : isCurrent
                        ? 'border-amber-400 bg-white text-amber-500 shadow-md shadow-amber-200'
                        : past
                          ? 'border-slate-300 bg-white text-slate-400'
                          : 'border-slate-200 bg-white text-slate-300 hover:border-slate-400'
                  } ${readOnly ? 'cursor-default' : ''}`}
                  aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isDone ? (
                    <Check className="h-5 w-5" />
                  ) : isCurrent ? (
                    <Play className="h-4 w-4 fill-amber-500" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3
                      className={`font-semibold ${
                        isDone ? 'text-slate-400 line-through' : 'text-slate-900'
                      }`}
                    >
                      {activity.title}
                    </h3>
                    {activity.description && (
                      <p className="mt-0.5 text-sm text-slate-500">{activity.description}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                        {formatTime(activity.scheduled_time)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                        {activity.duration_minutes} min
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 font-medium text-amber-700">
                          In progress
                        </span>
                      )}
                      {past && !isDone && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 font-medium text-red-600">
                          Overdue
                        </span>
                      )}
                      {isDone && activity.completed_at && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 font-medium text-emerald-700">
                          Done
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!readOnly && (
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <button
                        onClick={() => onEdit(activity)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(activity.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Explicit Mark as Done / Undo button */}
                {!readOnly && (
                  <button
                    onClick={() => onToggleComplete(activity)}
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                      isDone
                        ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <Circle className="h-3.5 w-3.5" />
                        Mark as Not Done
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Mark as Done
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
