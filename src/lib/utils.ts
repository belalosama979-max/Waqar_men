import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatArabicDate(date: Date | string | null): string {
  if (!date) return '—';
  try {
    return format(new Date(date), 'dd MMMM yyyy', { locale: ar });
  } catch {
    return '—';
  }
}

export function formatShortDate(date: Date | string | null): string {
  if (!date) return '—';
  try {
    return format(new Date(date), 'dd/MM/yyyy');
  } catch {
    return '—';
  }
}

export function getRankEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `${rank}`;
}

export function getEvaluationColor(evaluation: string): string {
  const colors: Record<string, string> = {
    'ممتاز_جداً': 'text-emerald-400',
    'ممتاز': 'text-green-400',
    'جيد_جداً': 'text-blue-400',
    'لم_يسمع': 'text-gray-400',
    'رجع_في_التسميع': 'text-amber-400',
  };
  return colors[evaluation] || 'text-gray-400';
}

export function getEvaluationBadgeColor(evaluation: string): string {
  const colors: Record<string, string> = {
    'ممتاز_جداً': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'ممتاز': 'bg-green-500/20 text-green-400 border-green-500/30',
    'جيد_جداً': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'لم_يسمع': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'رجع_في_التسميع': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };
  return colors[evaluation] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

export function getEvaluationLabel(key: string): string {
  const labels: Record<string, string> = {
    'ممتاز_جداً': 'ممتاز جداً',
    'ممتاز': 'ممتاز',
    'جيد_جداً': 'جيد جداً',
    'لم_يسمع': 'لم يسمع',
    'رجع_في_التسميع': 'رجع في التسميع',
  };
  return labels[key] || key;
}

export function generateTeacherPassword(name: string): string {
  const firstName = name.split(' ')[0];
  return `${firstName}123`;
}

export function highlightText(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark class="bg-gold-400/30 text-gold-300 rounded px-0.5">$1</mark>');
}
