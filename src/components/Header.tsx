import { Bell } from 'lucide-react';

export function Header({ onAdd }: { onAdd: (() => void) | undefined }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">DailyFlow</h1>
            <p className="text-xs text-slate-500">Your day, on track</p>
          </div>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 active:scale-95"
          >
            + Add Activity
          </button>
        )}
      </div>
    </header>
  );
}
