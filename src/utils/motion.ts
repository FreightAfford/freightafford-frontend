// The dashboard's motion language: short, ease-out and only a few pixels of
// travel. Spread these onto motion components, e.g. <motion.div {...fadeRise}>.
// DashboardLayout's MotionConfig turns transforms off for reduced motion.
//
// Timings sit inside `animate`, so they only shape the entrance and never
// delay hover or other gestures on the same element.

export const EASE = [0.22, 1, 0.36, 1] as const;

// Rise a few pixels into place, after `delay` seconds.
const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: EASE, delay },
  },
});

export const fadeRise = rise();

// fadeRise, delayed by position so siblings arrive one after another.
export const stagger = (index = 0, step = 0.04) =>
  rise(Math.min(index * step, 0.2));
