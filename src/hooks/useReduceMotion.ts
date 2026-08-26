import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Whether the OS "Reduce Motion" setting is on, or `null` while it is still
 * being read — the first value only arrives on a promise, so a component that
 * treats unknown as "off" would play its animation once before finding out.
 * Callers should branch on `=== false` rather than on falsiness.
 */
export function useReduceMotion(): boolean | null {
  const [reduceMotion, setReduceMotion] = useState<boolean | null>(null);

  useEffect(() => {
    let canceled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!canceled) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      canceled = true;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
