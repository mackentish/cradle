import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { addReminderTapListener } from '@/lib/notifications';

/**
 * Takes a reminder tapped while the app is running to that program's session,
 * instead of leaving her on whatever screen she was last on.
 *
 * The tap that *launched* the app is not handled here: a push during the first
 * mount is undone by the entry gate's redirect, which runs on focus and so lands
 * after it. `app/index.tsx` reads that one and redirects straight to the session.
 *
 * `enabled` is the onboarding guard. `session/[program]` does not exist until she
 * is onboarded, and a push at a route declared out of existence is silent — so
 * the tap waits for the guard rather than being dropped at it.
 */
export function useReminderTap(enabled: boolean): void {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    return addReminderTapListener(({ programId }) => {
      router.push(`/session/${programId}` as never);
    });
  }, [enabled, router]);
}
