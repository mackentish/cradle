let frozen: Date | null = null;

/**
 * The app's single source of "now".
 *
 * Everything time-dependent goes through this rather than calling `new Date()`
 * directly, so what the user sees — her week, today's session, her streak — can be
 * pinned in tests. Without a seam like this, any test that renders a screen is
 * quietly coupled to the clock on the machine running it.
 */
export function now(): Date {
  return frozen ? new Date(frozen) : new Date();
}

/**
 * Test seam. Pass a date to freeze the clock, or null to hand it back to the
 * system. Production code never calls this.
 */
export function setNow(date: Date | null): void {
  frozen = date;
}
