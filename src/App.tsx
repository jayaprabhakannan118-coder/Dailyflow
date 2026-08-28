import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Activity } from '@/types';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { ActivityFormModal } from '@/components/ActivityFormModal';
import { NotificationBanner } from '@/components/NotificationBanner';
import { Header } from '@/components/Header';
import { StatsBar } from '@/components/StatsBar';
import { DatePicker } from '@/components/DatePicker';
import { useNotifications } from '@/hooks/useNotifications';
import { useCurrentActivity } from '@/hooks/useCurrentActivity';
import { isToday, toDateInput } from '@/lib/date';

function formatTimeToHHMM(time: string): string {
  return time.slice(0, 5);
}

async function seedDefaultActivities(date: string): Promise<void> {
  const defaults = [
    { title: 'Morning Wake-up', scheduled_time: '07:00', duration_minutes: 15, position: 0 },
    { title: 'Exercise & Workout', scheduled_time: '07:30', duration_minutes: 45, position: 1 },
    { title: 'Breakfast', scheduled_time: '08:30', duration_minutes: 30, position: 2 },
    { title: 'Deep Work Session', scheduled_time: '09:30', duration_minutes: 120, position: 3 },
    { title: 'Lunch Break', scheduled_time: '12:00', duration_minutes: 45, position: 4 },
    { title: 'Meetings & Calls', scheduled_time: '13:00', duration_minutes: 60, position: 5 },
    { title: 'Afternoon Work', scheduled_time: '14:30', duration_minutes: 120, position: 6 },
    { title: 'Learning / Reading', scheduled_time: '17:00', duration_minutes: 45, position: 7 },
    { title: 'Dinner', scheduled_time: '19:00', duration_minutes: 45, position: 8 },
    { title: 'Wind Down & Sleep', scheduled_time: '21:30', duration_minutes: 30, position: 9 },
  ];

  const { error } = await supabase
    .from('activities')
    .insert(defaults.map((d) => ({ ...d, description: null, activity_date: date })));
  if (error) throw error;
}

async function fetchActivities(date: Date): Promise<Activity[]> {
  const dateStr = toDateInput(date);
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('activity_date', dateStr)
    .order('position', { ascending: true });
  if (error) throw error;
  return (data as Activity[]) ?? [];
}

export default function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [now, setNow] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { permission, requestPermission, notify } = useNotifications();
  const { currentActivity, nextActivity, progressPercent } = useCurrentActivity(activities, now);
  const lastNotifiedRef = useRef<string | null>(null);

  const viewingToday = isToday(selectedDate);

  // Tick every 15 seconds for "current activity" detection
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(interval);
  }, []);

  // Load activities when selected date changes
  const loadActivities = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      let data = await fetchActivities(date);
      // Only seed defaults for today, and only if empty
      if (data.length === 0 && isToday(date)) {
        await seedDefaultActivities(toDateInput(date));
        data = await fetchActivities(date);
      }
      setActivities(data);
    } catch {
      setError('Could not load your activities. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities(selectedDate);
  }, [selectedDate, loadActivities]);

  // Realtime subscription — only relevant when viewing today
  useEffect(() => {
    if (!viewingToday) return;
    const channel = supabase
      .channel('activities-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
        fetchActivities(selectedDate).then(setActivities).catch(() => {});
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [viewingToday, selectedDate]);

  // Send notification when entering a new current activity (today only)
  useEffect(() => {
    if (!viewingToday) return;
    if (!currentActivity) return;
    if (lastNotifiedRef.current === currentActivity.id) return;
    lastNotifiedRef.current = currentActivity.id;
    notify(
      'Time to start: ' + currentActivity.title,
      currentActivity.description ??
        `Scheduled at ${formatTimeToHHMM(currentActivity.scheduled_time)} for ${currentActivity.duration_minutes} min`
    );
  }, [currentActivity, notify, viewingToday]);

  const handleToggleComplete = async (activity: Activity) => {
    const newCompleted = !activity.completed;
    const { error } = await supabase
      .from('activities')
      .update({
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq('id', activity.id);
    if (error) {
      setError('Could not update activity. Please try again.');
      return;
    }
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activity.id
          ? {
              ...a,
              completed: newCompleted,
              completed_at: newCompleted ? new Date().toISOString() : null,
            }
          : a
      )
    );
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) {
      setError('Could not delete activity. Please try again.');
      return;
    }
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = async (data: {
    title: string;
    description: string;
    scheduled_time: string;
    duration_minutes: number;
  }) => {
    if (editingActivity) {
      const { error } = await supabase
        .from('activities')
        .update({
          title: data.title,
          description: data.description || null,
          scheduled_time: data.scheduled_time,
          duration_minutes: data.duration_minutes,
        })
        .eq('id', editingActivity.id);
      if (error) throw error;
    } else {
      const maxPosition = activities.reduce((max, a) => Math.max(max, a.position), -1);
      const { error } = await supabase.from('activities').insert({
        title: data.title,
        description: data.description || null,
        scheduled_time: data.scheduled_time,
        duration_minutes: data.duration_minutes,
        position: maxPosition + 1,
        activity_date: toDateInput(selectedDate),
      });
      if (error) throw error;
    }
    await loadActivities(selectedDate);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingActivity(null);
    setShowForm(true);
  };

  const completedCount = activities.filter((a) => a.completed).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header onAdd={viewingToday ? handleAdd : undefined} />

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
        {viewingToday && permission === 'default' && (
          <NotificationBanner onRequestPermission={requestPermission} />
        )}

        <DatePicker selectedDate={selectedDate} onChange={setSelectedDate} />

        <StatsBar
          total={activities.length}
          completed={completedCount}
          currentActivity={currentActivity}
          nextActivity={nextActivity}
          progressPercent={progressPercent}
          readOnly={!viewingToday}
        />

        {error && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          </div>
        ) : activities.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-slate-500">
              {viewingToday
                ? 'No activities yet. Add your first one to get started.'
                : 'No activities were tracked on this day.'}
            </p>
          </div>
        ) : (
          <ActivityTimeline
            activities={activities}
            currentActivityId={viewingToday ? currentActivity?.id ?? null : null}
            now={now}
            readOnly={!viewingToday}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      {showForm && (
        <ActivityFormModal
          activity={editingActivity}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingActivity(null);
          }}
        />
      )}
    </div>
  );
}
