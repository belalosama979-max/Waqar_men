'use client';

import { useId } from 'react';

/** Eight-point star (rub el hizb) with an open book: the app's mark. */
export function BrandMark({ size = 44, className }: { size?: number; className?: string }) {
  // unique per instance: a shared id resolves to the first copy, which may sit in a hidden sidebar
  const id = `bm-gold-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: 'linear-gradient(145deg, #0f5a43 0%, #08362a 60%, #052219 100%)',
        border: '1px solid rgba(217,180,90,0.35)',
        boxShadow: '0 1px 0 rgba(255,230,160,0.12) inset, 0 8px 22px -8px rgba(16,185,129,0.45)',
      }}
    >
      <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 100 100" fill="none" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f6dd9b" />
            <stop offset="0.55" stopColor="#d9b45a" />
            <stop offset="1" stopColor="#a8791f" />
          </linearGradient>
        </defs>
        <rect x="22" y="22" width="56" height="56" stroke={`url(#${id})`} strokeWidth="4.5" strokeLinejoin="round" />
        <rect x="22" y="22" width="56" height="56" stroke={`url(#${id})`} strokeWidth="4.5" strokeLinejoin="round" transform="rotate(45 50 50)" />
        <path d="M50 44 L34 39 V61 L50 66 Z M50 44 L66 39 V61 L50 66 Z" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
