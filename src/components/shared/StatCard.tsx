'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  subtitle?: string;
  color?: 'emerald' | 'gold' | 'blue' | 'purple';
  animateCount?: boolean;
  delay?: number;
}

function AnimatedCounter({ value, duration = 0.9 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(eased * value));
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [value, duration]);

  return <>{count.toLocaleString('ar-SA')}</>;
}

const colorMap = {
  emerald: { accent: '#34d399', tint: 'rgba(16,185,129,0.14)', ring: 'rgba(52,211,153,0.22)', value: 'text-emerald-50' },
  gold: { accent: '#e3bd62', tint: 'rgba(217,180,90,0.14)', ring: 'rgba(217,180,90,0.28)', value: 'text-gold-200' },
  blue: { accent: '#7cc4fa', tint: 'rgba(96,165,250,0.12)', ring: 'rgba(96,165,250,0.22)', value: 'text-sky-50' },
  purple: { accent: '#c4b5fd', tint: 'rgba(167,139,250,0.12)', ring: 'rgba(167,139,250,0.22)', value: 'text-violet-50' },
};

export function StatCard({
  title,
  value,
  icon,
  subtitle,
  color = 'emerald',
  animateCount = true,
  delay = 0,
}: StatCardProps) {
  const c = colorMap[color];
  const isNumber = typeof value === 'number';

  return (
    <motion.div
      className="glass-card relative overflow-hidden p-4 md:p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
    >
      {/* accent line along the leading edge */}
      <span className="absolute top-4 bottom-4 right-0 w-[3px] rounded-l-full" style={{ background: c.accent, opacity: 0.85 }} />

      <div className="relative flex items-start justify-between gap-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 [&_svg]:w-5 [&_svg]:h-5"
          style={{ background: c.tint, border: `1px solid ${c.ring}`, color: c.accent }}
        >
          {icon}
        </div>
      </div>
      <p className={cn('relative mt-3 text-[1.7rem] md:text-3xl font-extrabold leading-none tabular-nums', c.value)}>
        {isNumber && animateCount ? (
          <AnimatedCounter value={value as number} />
        ) : isNumber ? (
          (value as number).toLocaleString('ar-SA')
        ) : (
          value
        )}
      </p>
      <p className="relative mt-1.5 text-[13px] text-emerald-200/60 font-semibold truncate">{title}</p>
      {subtitle && <p className="relative text-xs text-emerald-400/40 mt-0.5 truncate">{subtitle}</p>}
    </motion.div>
  );
}
