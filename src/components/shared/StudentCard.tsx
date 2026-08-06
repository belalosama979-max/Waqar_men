'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Star, Calendar, Award, BookOpen, Pencil, Trash2 } from 'lucide-react';
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

  return (
    <>
      <motion.div
        className="glass-card p-5 flex flex-col gap-4 cursor-pointer group relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.4 }}
        whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(16,185,129,0.1)' }}
        onClick={onClick}
      >
        {/* Edit/Delete buttons — top-left corner */}
        {(onEdit || onDelete) && (
          <div
            className="absolute top-3 left-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {onEdit && (
              <motion.button
                onClick={onEdit}
                className="p-1.5 rounded-lg text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/15 transition-all"
                whileTap={{ scale: 0.9 }}
                title="تعديل"
              >
                <Pencil className="w-3.5 h-3.5" />
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                onClick={onDelete}
                className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/15 transition-all"
                whileTap={{ scale: 0.9 }}
                title="حذف"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 font-bold"
            style={{
              background: 'linear-gradient(135deg, rgba(5,150,105,0.3), rgba(4,120,87,0.2))',
              border: '1px solid rgba(16,185,129,0.25)',
            }}
          >
            {student.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-emerald-100 truncate group-hover:text-emerald-300 transition-colors">
              {student.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {student.teacherName && (
                <p className="text-[10px] text-emerald-500/50 truncate">{student.teacherName}</p>
              )}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20">
                {student.course || 'المساق الحر'}
              </span>
            </div>
          </div>
          {student.totalPoints > 0 && (
            <div className="flex items-center gap-1 text-gold-400">
              <Award className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div
            className="p-2 sm:p-3 rounded-xl text-center"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.12)',
            }}
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Star className="w-3 h-3 text-gold-400" />
              <span className="text-xs text-emerald-400/60">النقاط</span>
            </div>
            <p className="text-lg font-bold text-gradient-gold">
              {student.totalPoints.toLocaleString('ar-SA')}
            </p>
          </div>
          <div
            className="p-3 rounded-xl text-center"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.12)',
            }}
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Calendar className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400/60">آخر تسميع</span>
            </div>
            <p className="text-xs font-semibold text-emerald-300 leading-tight">
              {student.lastDate ? formatShortDate(student.lastDate) : '—'}
            </p>
          </div>
          <div
            className="p-2 sm:p-3 rounded-xl text-center"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.12)',
            }}
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <BookOpen className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] sm:text-xs text-emerald-400/60">
                {isHadithCourse ? 'حديث' : 'صفحة'}
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-emerald-300">
              {isHadithCourse
                ? (student.totalHadiths || 0).toLocaleString('ar-SA')
                : (student.totalPages || 0).toLocaleString('ar-SA')}
            </p>
          </div>
        </div>

        {/* Last Recitation */}
        {student.lastRecitation && (
          <div
            className="px-3 py-2 rounded-lg"
            style={{ background: 'rgba(6,95,70,0.1)', border: '1px solid rgba(16,185,129,0.1)' }}
          >
            <p className="text-xs text-emerald-400/50 mb-0.5">آخر تسميع</p>
            <p className="text-sm font-medium text-emerald-200 truncate">{student.lastRecitation}</p>
          </div>
        )}

        {/* Action Button */}
        <motion.button
          className="btn-emerald w-full justify-center py-2.5"
          onClick={(e) => {
            e.stopPropagation();
            setDialogOpen(true);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Mic className="w-4 h-4" />
          تسجيل تسميع
        </motion.button>
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
