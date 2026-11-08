export const easeOut = [0.22, 1, 0.36, 1];

export const fadeRise = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.34, ease: easeOut },
};

export const popIn = {
  initial: { opacity: 0, y: 8, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6 },
  transition: { duration: 0.2, ease: easeOut },
};
