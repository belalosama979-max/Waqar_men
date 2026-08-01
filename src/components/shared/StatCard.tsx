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

function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(eased * value));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [value, duration]);

  return <>{count.toLocaleString('ar-SA')}</>;
}

const colorMap = {
  emerald: {
    bg: 'rgba(6,95,70,0.15)',
    border: 'rgba(16,185,129,0.2)',
    icon: 'text-emerald-400',
    iconBg: 'rgba(16,185,129,0.15)',
    glow: 'rgba(16,185,129,0.1)',
    value: 'text-emerald-300',
  },
  gold: {
    bg: 'rgba(180,83,9,0.1)',
    border: 'rgba(251,191,36,0.2)',
    icon: 'text-gold-400',
    iconBg: 'rgba(251,191,36,0.15)',
    glow: 'rgba(251,191,36,0.1)',
    value: 'text-gold-300',
  },
  blue: {
    bg: 'rgba(29,78,216,0.1)',
    border: 'rgba(96,165,250,0.2)',
    icon: 'text-blue-400',
    iconBg: 'rgba(96,165,250,0.15)',
    glow: 'rgba(96,165,250,0.1)',
    value: 'text-blue-300',
  },
  purple: {
    bg: 'rgba(109,40,217,0.1)',
    border: 'rgba(167,139,250,0.2)',
    icon: 'text-purple-400',
    iconBg: 'rgba(167,139,250,0.15)',
    glow: 'rgba(167,139,250,0.1)',
    value: 'text-purple-300',
  },
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
  const colors = colorMap[color];
  const isNumber = typeof value === 'number';

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-5 cursor-default"
      style={{
        background: `rgba(10, 20, 12, 0.7)`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${colors.border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 30px ${colors.glow}`,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -3, boxShadow: `0 16px 40px rgba(0,0,0,0.4), 0 0 40px ${colors.glow}` }}
    >
      {/* Background decoration */}
      <div
        className="absolute -top-8 -left-8 w-32 h-32 rounded-full opacity-20 blur-2xl"
        style={{ background: `radial-gradient(circle, ${colors.iconBg}, transparent)` }}
      />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-emerald-300/60 font-medium mb-1">{title}</p>
          <p className={cn('text-3xl font-bold', colors.value)}>
            {isNumber && animateCount ? (
              <AnimatedCounter value={value as number} />
            ) : (
              isNumber ? (value as number).toLocaleString('ar-SA') : value
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-emerald-400/40 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={cn('p-3 rounded-xl flex-shrink-0', colors.icon)}
          style={{ background: colors.iconBg, border: `1px solid ${colors.border}` }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
