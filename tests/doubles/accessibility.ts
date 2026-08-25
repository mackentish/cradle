/** Lets a test turn Reduce Motion on for the code under test. */
export const accessibilityDouble = {
  reduceMotion: false,

  reset() {
    this.reduceMotion = false;
  },
};
