export interface Activity {
  id: string;
  title: string;
  description: string | null;
  scheduled_time: string; // "HH:MM:SS"
  duration_minutes: number;
  completed: boolean;
  completed_at: string | null;
  position: number;
  activity_date: string; // "YYYY-MM-DD"
  created_at: string;
}

export type ActivityInput = Omit<
  Activity,
  'id' | 'created_at' | 'completed' | 'completed_at'
>;
