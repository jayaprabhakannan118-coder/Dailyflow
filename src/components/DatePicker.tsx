import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { isToday, formatDateLabel, toDateInput, fromDateInput } from '@/lib/date';

interface Props {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export function DatePicker({ selectedDate, onChange }: Props) {
  const today = isToday(selectedDate);

  const shift = (days: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    onChange(next);
  };

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <button
        onClick={() => shift(-1)}
        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        aria-label="Previous day"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <label className="flex flex-1 cursor-pointer items-center justify-center gap-2">
        <Calendar className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-semibold text-slate-700">
          {formatDateLabel(selectedDate)}
        </span>
        {today && (
          <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
            Today
          </span>
        )}
        <input
          type="date"
          value={toDateInput(selectedDate)}
          max={toDateInput(new Date())}
          onChange={(e) => {
            if (e.target.value) onChange(fromDateInput(e.target.value));
          }}
          className="sr-only"
        />
      </label>

      <button
        onClick={() => shift(1)}
        disabled={today}
        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Next day"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
