import { BellRing } from 'lucide-react';

export function NotificationBanner({
  onRequestPermission,
}: {
  onRequestPermission: () => void;
}) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
      <BellRing className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1">
        Enable notifications to get alerted when each activity starts.
      </p>
      <button
        onClick={onRequestPermission}
        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
      >
        Enable
      </button>
    </div>
  );
}
