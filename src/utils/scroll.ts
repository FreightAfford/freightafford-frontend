import { animate, type AnimationPlaybackControls } from "motion/react";

// Height of the sticky navbar, so sections land just below it.
const NAV_OFFSET = 64;

let current: AnimationPlaybackControls | null = null;

/**
 * Glide the page to the element with this id. Unlike the browser's native
 * smooth scroll, the speed is ours to set: longer trips take a little longer,
 * and the user can take over at any time by scrolling.
 */
export const scrollToSection = (id: string) => {
  const target = document.getElementById(id);
  if (!target) return;

  const from = window.scrollY;
  const to = Math.max(
    0,
    target.getBoundingClientRect().top + from - NAV_OFFSET,
  );
  const distance = Math.abs(to - from);
  if (distance < 2) return;

  current?.stop();

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, to);
    return;
  }

  const stop = () => current?.stop();
  const userEvents = ["wheel", "touchstart", "keydown"] as const;
  userEvents.forEach((name) =>
    window.addEventListener(name, stop, { passive: true, once: true }),
  );

  current = animate(from, to, {
    duration: Math.min(1, 0.9 + distance / 4000),
    ease: [0.65, 0, 0.35, 1],
    onUpdate: (y) => window.scrollTo(0, y),
    onComplete: () =>
      userEvents.forEach((name) => window.removeEventListener(name, stop)),
  });
};
