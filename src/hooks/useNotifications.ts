import { useCallback, useEffect, useState } from 'react';

type Permission = NotificationPermission | 'unsupported';

export function useNotifications() {
  const [permission, setPermission] = useState<Permission>('unsupported');

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }, []);

  const notify = useCallback(
    (title: string, body: string) => {
      if (typeof Notification === 'undefined') return;
      if (Notification.permission !== 'granted') return;
      try {
        new Notification(title, { body });
      } catch {
        // Some browsers throw if too many notifications are queued
      }
    },
    []
  );

  return { permission, requestPermission, notify };
}
