import { Redirect } from 'expo-router';
import React from 'react';

import { launchReminderTap } from '@/lib/notifications';
import { useAppState } from '@/state/AppState';

/**
 * Entry gate. The root layout holds the navigator back until storage has been
 * read, so by the time this renders the answer is already known.
 *
 * A launch from a reminder tap is decided here rather than navigated to
 * afterwards: the redirect below runs on focus, so a push from anywhere else
 * during the first mount would be replaced by it a moment later. Going straight
 * to the session is also what the stack's anchor is for — the tabs stay mounted
 * underneath, so closing the session lands on Today.
 */
export default function Index() {
  const { onboarded } = useAppState();
  const tap = launchReminderTap();

  if (!onboarded) return <Redirect href="/onboarding" />;
  if (tap) return <Redirect href={`/session/${tap.programId}` as never} withAnchor />;
  return <Redirect href="/(tabs)" />;
}
