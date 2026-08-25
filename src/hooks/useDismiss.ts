import { type Href, useRouter } from 'expo-router';
import { useCallback } from 'react';

/**
 * Closes the current screen.
 *
 * Plain `router.back()` throws "no navigator handled the action" when there is
 * nothing behind the current screen — which happens whenever a route is opened
 * cold from a deep link or a notification tap rather than navigated to. Falling
 * back to a replace keeps the button working in both cases, and going back
 * (rather than always jumping home) preserves the real history when there is
 * one: an exercise opened from the plan returns to the plan.
 */
export function useDismiss(fallback: Href = '/(tabs)'): () => void {
  const router = useRouter();
  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(fallback);
  }, [router, fallback]);
}
