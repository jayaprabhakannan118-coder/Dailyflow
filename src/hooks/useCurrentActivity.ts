import { useMemo } from 'react';
import type { Activity } from '@/types';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function activityEndMinutes(activity: Activity): number {
  return timeToMinutes(activity.scheduled_time) + activity.duration_minutes;
}

/**
 * Determines which activity is "current" based on the wall clock:
 * the activity whose [start, start+duration) window contains now,
 * or if none, the most recent activity that has started but not ended.
 */
export function useCurrentActivity(activities: Activity[], now: Date) {
  return useMemo(() => {
    if (activities.length === 0) {
      return { currentActivity: null, nextActivity: null, progressPercent: 0 };
    }

    const sorted = [...activities].sort(
      (a, b) => timeToMinutes(a.scheduled_time) - timeToMinutes(b.scheduled_time)
    );

    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let current: Activity | null = null;
    let next: Activity | null = null;

    for (const a of sorted) {
      const start = timeToMinutes(a.scheduled_time);
      const end = activityEndMinutes(a);
      if (start <= nowMinutes && nowMinutes < end) {
        current = a;
      }
      if (start > nowMinutes && !next) {
        next = a;
      }
    }

    // If no active window, pick the last started activity (still "current" in spirit)
    if (!current) {
      for (let i = sorted.length - 1; i >= 0; i--) {
        if (timeToMinutes(sorted[i].scheduled_time) <= nowMinutes) {
          current = sorted[i];
          break;
        }
      }
    }

    // Progress: percentage of total scheduled time elapsed
    const firstStart = timeToMinutes(sorted[0].scheduled_time);
    const lastEnd = activityEndMinutes(sorted[sorted.length - 1]);
    const totalSpan = lastEnd - firstStart;
    const elapsed = nowMinutes - firstStart;
    const progressPercent =
      totalSpan > 0 ? Math.max(0, Math.min(100, Math.round((elapsed / totalSpan) * 100))) : 0;

    return { currentActivity: current, nextActivity: next, progressPercent };
  }, [activities, now]);
}
