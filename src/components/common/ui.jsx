import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cx } from '../../utils/format';
import { easeOut } from '../../utils/motion';

const variants = {
  primary: 'bg-brand-600 text-[#FFF8F2] shadow-[0_0_24px_-8px_rgba(196,92,40,0.9)] hover:bg-brand-500',
  secondary: 'border border-line bg-surface text-ink hover:border-brand-500 hover:bg-white/8',
  ghost: 'text-muted hover:bg-white/8 hover:text-ink',
  danger: 'border border-red-500/35 bg-red-950/40 text-red-200 hover:bg-red-950/55',
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-[38px] px-4 text-[13.5px]',
  lg: 'h-11 px-5 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-[-0.01em] whitespace-nowrap transition duration-150 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2} />}
      {children}
    </button>
  );
}

export function Card({ children, className = '' }) {
  return (
    <section className={cx('rounded-xl border border-line bg-surface/95 shadow-[var(--shadow-card)]', className)}>
      {children}
    </section>
  );
}

export function CardHeader({ title, sub, action, className = '' }) {
  return (
    <div className={cx('flex items-center gap-3 border-b border-line px-4 py-3.5 sm:px-[18px]', className)}>
      <div className="min-w-0">
        <h3 className="font-display text-[16px] font-semibold tracking-[-0.02em]">{title}</h3>
        {sub && <p className="mt-0.5 text-xs text-faint">{sub}</p>}
      </div>
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  );
}

const badgeTones = {
  blue: 'bg-brand-50 text-brand-700 border-brand-200',
  green: 'bg-[#e7f3ea] text-[#1f6b45] border-[#c9e4d0]',
  gray: 'bg-[#f3ece3] text-[#5c5146] border-[#e4d8cb]',
  amber: 'bg-[#f8ead0] text-[#8a5a12] border-[#ecd7ae]',
  purple: 'bg-[#f3e8f5] text-[#6b3d78] border-[#e3d0e8]',
  red: 'bg-[#fde8e8] text-[#8b2e2e] border-[#f0c4c4]',
};

export function Badge({ tone = 'gray', icon: Icon, children, className = '' }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11.5px] font-semibold whitespace-nowrap', badgeTones[tone] || badgeTones.gray, className)}>
      {Icon && <Icon size={12} strokeWidth={2.4} />}
      {children}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="px-6 py-11 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl border border-brand-200 bg-brand-50 text-brand-700">
        {Icon && <Icon size={26} strokeWidth={1.7} />}
      </div>
      <h3 className="font-display text-[18px] font-semibold tracking-[-0.02em]">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-[13.5px] text-muted">{text}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function AnimatedNumber({ value }) {
  const reduce = useReducedMotion();
  const numeric = Number(value) || 0;
  const [display, setDisplay] = useState(reduce ? numeric : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(numeric);
      return undefined;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 560);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(Math.round(numeric * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numeric, reduce]);

  return display;
}

export function StatCard({ icon: Icon, value, label, delta, accent = false, index = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.34, ease: easeOut, delay: reduce ? 0 : Math.min(index, 6) * 0.05 }}
      className={cx(
        'relative overflow-hidden rounded-xl border p-4 pl-5 shadow-[var(--shadow-card)] transition duration-200 hover:-translate-y-0.5',
        accent ? 'border-brand-200 bg-brand-50' : 'border-line bg-surface',
      )}
    >
      <span className="absolute inset-y-3 left-0 w-[3px] rounded-r bg-brand-600" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-[30px] leading-none font-semibold tracking-[-0.03em]">
            <AnimatedNumber value={value} />
          </div>
          <div className="mt-1.5 text-[12.5px] text-muted">{label}</div>
        </div>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
          {Icon && <Icon size={16} strokeWidth={2} />}
        </div>
      </div>
      {delta && <div className="mt-2.5 text-[11.5px] text-faint">{delta}</div>}
    </motion.article>
  );
}

export function Switch({ on, label, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={cx('relative h-[23px] w-10 shrink-0 rounded-full transition', on ? 'bg-brand-600' : 'bg-white/20')}
    >
      <span className={cx('absolute top-[2.5px] left-[2.5px] h-[18px] w-[18px] rounded-full bg-white shadow transition', on && 'translate-x-[17px]')} />
    </button>
  );
}

export function StageBadge({ stage }) {
  const cls = stage ? `stage-${String(stage).replace(/ /g, '-')}` : '';
  return <span className={cx('stage', cls)}>{stage || 'Not analyzed'}</span>;
}

export function Note({ children }) {
  return (
    <div className="mb-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3.5 text-[13px] text-ink">
      {children}
    </div>
  );
}
