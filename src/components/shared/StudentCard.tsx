'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Star, Calendar, BookOpen, Pencil, Trash2, ChevronLeft } from 'lucide-react';
import { RecitationDialog } from './RecitationDialog';
import { formatShortDate } from '@/lib/utils';
import type { Student } from '@/types';

interface StudentCardProps {
  student: Student;
  index?: number;
  onRecitationSaved?: () => void;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function StudentCard({ student, index = 0, onRecitationSaved, onClick, onEdit, onDelete }: StudentCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const isHadithCourse = student.course === 'الأربعين البخارية' || student.course === 'الأربعين النووية';

  const stats = [
    {
      icon: <Star className="w-3.5 h-3.5 text-gold-400" />,
      label: 'النقاط',
      value: <span className="text-gradient-gold">{student.totalPoints.toLocaleString('ar-SA')}</span>,
    },
    {
      icon: <BookOpen className="w-3.5 h-3.5 text-emerald-400" />,
      label: isHadithCourse ? 'حديث' : 'صفحة',
      value: (isHadithCourse ? student.totalHadiths || 0 : student.totalPages || 0).toLocaleString('ar-SA'),
    },
    {
      icon: <Calendar className="w-3.5 h-3.5 text-emerald-400" />,
      label: 'آخر تسميع',
      value: <span className="text-[13px]">{student.lastDate ? formatShortDate(student.lastDate) : '—'}</span>,
    },
  ];

  return (
    <>
      <motion.div
        className="glass-card p-4 flex flex-col gap-3.5 relative"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.3 }}
        whileTap={onClick ? { scale: 0.985 } : undefined}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClick}
            disabled={!onClick}
            className="flex items-center gap-3 flex-1 min-w-0 text-right"
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 font-extrabold text-emerald-100"
              style={{
                background: 'linear-gradient(145deg, rgba(16,185,129,0.32), rgba(4,120,87,0.12))',
                border: '1px solid rgba(52,211,153,0.25)',
              }}
            >
              {student.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[15px] text-emerald-50 truncate">{student.name}</h3>
              <div className="flex items-center gap-1.5 mt-1 min-w-0">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300/85 border border-emerald-500/20 whitespace-nowrap">
                  {student.course || 'المساق الحر'}
                </span>
                {student.teacherName && (
                  <span className="text-[11px] text-emerald-400/45 truncate">{student.teacherName}</span>
                )}
              </div>
            </div>
            {onClick && <ChevronLeft className="w-4 h-4 text-emerald-400/40 flex-shrink-0" />}
          </button>

          {/* Edit / delete: always visible (no hover on phones) */}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-emerald-300/70 active:scale-90 transition-transform"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid var(--line)' }}
                  aria-label="تعديل"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-red-300/70 active:scale-90 transition-transform"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.14)' }}
                  aria-label="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 rounded-2xl overflow-hidden" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid var(--line)' }}>
          {stats.map((s, i) => (
            <div key={i} className="py-2.5 px-1 text-center" style={i > 0 ? { borderRight: '1px solid var(--line)' } : undefined}>
              <div className="flex items-center justify-center gap-1 mb-1">
                {s.icon}
                <span className="text-[11px] text-emerald-300/55">{s.label}</span>
              </div>
              <p className="text-base font-extrabold text-emerald-100 leading-tight tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Last Recitation */}
        {student.lastRecitation && (
          <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(6,95,70,0.12)', border: '1px solid var(--line)' }}>
            <p className="text-[11px] text-emerald-400/50">آخر تسميع</p>
            <p className="text-sm font-semibold text-emerald-100/90 truncate">{student.lastRecitation}</p>
          </div>
        )}

        <button
          className="btn-emerald w-full justify-center"
          onClick={(e) => {
            e.stopPropagation();
            setDialogOpen(true);
          }}
        >
          <Mic className="w-4 h-4" />
          تسجيل تسميع
        </button>
      </motion.div>

      <RecitationDialog
        student={student}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={() => {
          onRecitationSaved?.();
        }}
      />
    </>
  );
}
