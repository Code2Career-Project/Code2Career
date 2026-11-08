import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

export function Atmosphere() {
  const reduce = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    if (reduce) {
      root.style.setProperty('--c2c-shift', '0');
      return undefined;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      root.style.setProperty('--c2c-shift', String(Math.min(1, window.scrollY / max)));
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduce]);

  return (
    <div className="c2c-sky no-print" aria-hidden="true">
      <div className="c2c-sky-grid" />
      <div className="c2c-sky-glow c2c-sky-glow-a" />
      <div className="c2c-sky-glow c2c-sky-glow-b" />
      <svg className="c2c-sky-path" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <path d="M-40 640C220 500 400 780 660 560S1080 280 1500 460" />
        <path d="M-20 760C280 620 500 860 780 680S1160 440 1520 590" />
      </svg>
      <p className="c2c-sky-name">
        Code<span className="c2c-sky-two">2</span>Career
      </p>
    </div>
  );
}
