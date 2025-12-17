// SpinnerWheel was previously used for a wheel animation.
// The project now uses `NameScroller` for scrolling-name animation.
// Keeping this file as a no-op to avoid accidental usage.
export default function SpinnerWheel() {
  // Deprecated - no-op
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn('SpinnerWheel is deprecated; use NameScroller instead.');
  }
  return null;
}
