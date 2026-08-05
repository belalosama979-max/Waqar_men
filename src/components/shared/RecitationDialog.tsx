'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, BookOpen, Star, Plus, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { recitationsRepository, settingsRepository, studentsRepository } from '@/lib/db';
import { QURAN_SURAHS, QURAN_PARTS, DEFAULT_EVALUATIONS } from '@/lib/constants';
import { calculatePagesCount } from '@/lib/constants/quran-pages';
import { useAuthStore } from '@/store/authStore';
import type { Student, RecitationType, EvaluationKey, EvaluationOption } from '@/types';

interface RecitationDialogProps {
  student: Student;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

type Step = 1 | 2 | 3;

export function RecitationDialog({ student, open, onClose, onSaved }: RecitationDialogProps) {
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>(1);
  const [loading, setSaving] = useState(false);

  // Step 1
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Step 2
  const [type, setType] = useState<RecitationType>('جزء');
  const [part, setPart] = useState<number>(1);
  const [surahIndex, setSurahIndex] = useState<number>(1);
  const [fromPage, setFromPage] = useState<number | ''>('');
  const [toPage, setToPage] = useState<number | ''>('');
  const [fromAyah, setFromAyah] = useState<number | ''>('');
  const [toAyah, setToAyah] = useState<number | ''>('');

  // Step 3
  const [evaluation, setEvaluation] = useState<EvaluationKey>('ممتاز_جداً');
  const [extraPoints, setExtraPoints] = useState<number>(0);
  const [evaluationOptions, setEvaluationOptions] = useState<EvaluationOption[]>(DEFAULT_EVALUATIONS);
  const [currentEvalPoints, setCurrentEvalPoints] = useState<number>(60);


  useEffect(() => {
    if (open) {
      // Reset state
      setStep(1);
      setDate(new Date().toISOString().split('T')[0]);
      setType('جزء');
      setPart(1);
      setSurahIndex(1);
      setFromPage('');
      setToPage('');
      setFromAyah('');
      setToAyah('');
      setEvaluation('ممتاز_جداً');
      setExtraPoints(0);

      // Load custom evaluation points from settings
      settingsRepository.getEvaluationPoints().then((pts) => {
        const updated = DEFAULT_EVALUATIONS.map((ev) => ({
          ...ev,
          defaultPoints: pts[ev.key] ?? ev.defaultPoints,
        }));
        setEvaluationOptions(updated);
        const defaultEval = updated.find((e) => e.key === 'ممتاز_جداً');
        setCurrentEvalPoints(defaultEval?.defaultPoints ?? 60);
      });
    }
  }, [open]);

  const handleEvaluationChange = (key: EvaluationKey) => {
    setEvaluation(key);
    const opt = evaluationOptions.find((e) => e.key === key);
    setCurrentEvalPoints(opt?.defaultPoints ?? 0);
  };

  const totalPoints = currentEvalPoints + (extraPoints || 0);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const selectedSurah = QURAN_SURAHS.find((s) => s.index === surahIndex);
      const recitationLabel =
        type === 'جزء'
          ? `الجزء ${part}`
          : selectedSurah?.arabicName || `سورة ${surahIndex}`;

      let calculatedPages = 0;
      if (type === 'جزء') {
        const p1 = Number(fromPage) || 0;
        const p2 = Number(toPage) || 0;
        calculatedPages = Math.max(0, p2 - p1 + 1);
      } else {
        const a1 = Number(fromAyah) || 0;
        const a2 = Number(toAyah) || 0;
        if (a1 > 0 && a2 >= a1) {
          calculatedPages = calculatePagesCount(surahIndex, a1, surahIndex, a2);
        }
      }

      await recitationsRepository.add({
        studentId: student.id!,
        studentName: student.name,
        teacherId: user.id,
        teacherName: user.name,
        date: new Date(date),
        type,
        part: type === 'جزء' ? part : undefined,
        surah: type === 'سورة' ? surahIndex : undefined,
        surahName: recitationLabel,
        fromPage: type === 'جزء' && fromPage !== '' ? Number(fromPage) : undefined,
        toPage: type === 'جزء' && toPage !== '' ? Number(toPage) : undefined,
        fromAyah: type === 'سورة' && fromAyah !== '' ? Number(fromAyah) : undefined,
        toAyah: type === 'سورة' && toAyah !== '' ? Number(toAyah) : undefined,
        pagesCount: calculatedPages,
        evaluation,
        evalPoints: currentEvalPoints,
        extraPoints: extraPoints || 0,
        totalPoints,
        createdAt: new Date(),
      });

      await studentsRepository.addPointsAndPages(student.id!, totalPoints, calculatedPages, recitationLabel, new Date(date));

      toast.success(`تم تسجيل تسميع ${student.name} بنجاح! ✨`, {
        description: `${recitationLabel} — ${evaluationOptions.find(e => e.key === evaluation)?.label} — ${totalPoints} نقطة`,
      });
      onSaved();
      onClose();
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const stepTitles = ['اختر التاريخ', 'نوع التسميع', 'التقييم والنقاط'];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full sm:max-w-lg glass-card overflow-hidden rounded-t-3xl sm:rounded-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 border-b border-emerald-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-emerald-100">تسجيل تسميع</h2>
                    <p className="text-sm text-emerald-400/60">{student.name}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-emerald-400/50 hover:text-emerald-400 transition-colors"
                    style={{ background: 'rgba(16,185,129,0.1)' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Step Indicators */}
                <div className="flex items-center gap-2">
                  {([1, 2, 3] as Step[]).map((s) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          s < step
                            ? 'bg-emerald-500 text-white'
                            : s === step
                            ? 'bg-emerald-600/40 text-emerald-300 border-2 border-emerald-500'
                            : 'bg-emerald-900/30 text-emerald-600'
                        }`}
                      >
                        {s < step ? <Check className="w-3.5 h-3.5" /> : s}
                      </div>
                      <span className={`text-xs flex-1 hidden sm:block ${s === step ? 'text-emerald-300' : 'text-emerald-600'}`}>
                        {stepTitles[s - 1]}
                      </span>
                      {s < 3 && (
                        <div className={`h-0.5 w-4 sm:w-8 transition-all ${s < step ? 'bg-emerald-500' : 'bg-emerald-900/30'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <div className="p-5 min-h-48">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-semibold text-emerald-200">تاريخ التسميع</h3>
                      </div>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="input-glass text-center text-lg"
                        style={{ colorScheme: 'dark' }}
                      />
                      <p className="text-xs text-emerald-500/50 text-center">
                        {new Date(date).toLocaleDateString('ar-SA', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-5 h-5 text-emerald-400" />
                        <h3 className="font-semibold text-emerald-200">نوع التسميع</h3>
                      </div>

                      {/* Type Selection */}
                      <div className="flex gap-3">
                        {(['جزء', 'سورة'] as RecitationType[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => setType(t)}
                            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                              type === t
                                ? 'bg-emerald-600/30 text-emerald-300 border-2 border-emerald-500/50'
                                : 'text-emerald-400/50 border border-emerald-500/15 hover:bg-emerald-900/20'
                            }`}
                          >
                            {t === 'جزء' ? '📖 جزء' : '📝 سورة'}
                          </button>
                        ))}
                      </div>

                      {/* Part/Surah Dropdown & Inputs */}
                      {type === 'جزء' ? (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-emerald-400/60 mb-1.5 block">اختر الجزء</label>
                            <select
                              value={part}
                              onChange={(e) => setPart(Number(e.target.value))}
                              className="select-glass"
                            >
                              {QURAN_PARTS.map((p) => (
                                <option key={p.index} value={p.index}>
                                  {p.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <label className="text-xs text-emerald-400/60 mb-1.5 block">من صفحة</label>
                              <input
                                type="number"
                                min={1}
                                max={604}
                                value={fromPage}
                                onChange={(e) => setFromPage(e.target.value === '' ? '' : Number(e.target.value))}
                                className="input-glass"
                                placeholder="1"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-emerald-400/60 mb-1.5 block">إلى صفحة</label>
                              <input
                                type="number"
                                min={1}
                                max={604}
                                value={toPage}
                                onChange={(e) => setToPage(e.target.value === '' ? '' : Number(e.target.value))}
                                className="input-glass"
                                placeholder="20"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-emerald-400/60 mb-1.5 block">اختر السورة</label>
                            <select
                              value={surahIndex}
                              onChange={(e) => setSurahIndex(Number(e.target.value))}
                              className="select-glass"
                              size={1}
                            >
                              {QURAN_SURAHS.map((s) => (
                                <option key={s.index} value={s.index}>
                                  {s.index}. {s.arabicName}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-1">
                              <label className="text-xs text-emerald-400/60 mb-1.5 block">من آية</label>
                              <input
                                type="number"
                                min={1}
                                value={fromAyah}
                                onChange={(e) => setFromAyah(e.target.value === '' ? '' : Number(e.target.value))}
                                className="input-glass"
                                placeholder="1"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-emerald-400/60 mb-1.5 block">إلى آية</label>
                              <input
                                type="number"
                                min={1}
                                value={toAyah}
                                onChange={(e) => setToAyah(e.target.value === '' ? '' : Number(e.target.value))}
                                className="input-glass"
                                placeholder="286"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Calculated Pages Info */}
                      {type === 'جزء' && fromPage !== '' && toPage !== '' && Number(toPage) >= Number(fromPage) && (
                        <div className="p-3 mt-2 rounded-xl bg-emerald-900/20 border border-emerald-500/20 flex items-center justify-between">
                          <span className="text-sm text-emerald-300">عدد الصفحات المحسوبة:</span>
                          <span className="font-bold text-emerald-400">{Math.max(0, Number(toPage) - Number(fromPage) + 1)}</span>
                        </div>
                      )}
                      {type === 'سورة' && fromAyah !== '' && toAyah !== '' && Number(toAyah) >= Number(fromAyah) && (
                        <div className="p-3 mt-2 rounded-xl bg-emerald-900/20 border border-emerald-500/20 flex items-center justify-between">
                          <span className="text-sm text-emerald-300">عدد الصفحات المحسوبة:</span>
                          <span className="font-bold text-emerald-400">
                            {calculatePagesCount(surahIndex, Number(fromAyah), surahIndex, Number(toAyah))}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-gold-400" />
                        <h3 className="font-semibold text-emerald-200">التقييم والنقاط</h3>
                      </div>

                      {/* Evaluation Options */}
                      <div className="grid grid-cols-1 gap-2">
                        {evaluationOptions.map((opt) => (
                          <button
                            key={opt.key}
                            onClick={() => handleEvaluationChange(opt.key as EvaluationKey)}
                            className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-all ${
                              evaluation === opt.key
                                ? 'border-2 border-emerald-500/60 bg-emerald-900/30'
                                : 'border border-emerald-500/10 hover:border-emerald-500/25 hover:bg-emerald-900/15'
                            }`}
                          >
                            <span className="text-emerald-200">{opt.label}</span>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                evaluation === opt.key
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-emerald-900/50 text-emerald-400/70'
                              }`}
                            >
                              {opt.defaultPoints} نقطة
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Extra Points */}
                      <div>
                        <label className="text-xs text-emerald-400/60 mb-1.5 block flex items-center gap-1">
                          <Plus className="w-3 h-3" />
                          نقاط إضافية
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={999}
                          value={extraPoints}
                          onChange={(e) => setExtraPoints(Number(e.target.value))}
                          className="input-glass text-center"
                          placeholder="0"
                        />
                      </div>

                      {/* Total Preview */}
                      <div
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(4,120,87,0.1))',
                          border: '1px solid rgba(16,185,129,0.2)',
                        }}
                      >
                        <span className="text-sm text-emerald-300/70">المجموع الكلي</span>
                        <span className="text-xl font-bold text-gradient-gold">
                          {totalPoints} نقطة
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Navigation */}
              <div className="p-4 border-t border-emerald-500/10 flex gap-3">
                {step > 1 && (
                  <button
                    onClick={() => setStep((s) => (s - 1) as Step)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-emerald-400/70 hover:text-emerald-400 transition-colors"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                    رجوع
                  </button>
                )}
                <motion.button
                  className="flex-1 btn-emerald justify-center py-2.5"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={step < 3 ? () => setStep((s) => (s + 1) as Step) : handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : step < 3 ? (
                    <>
                      التالي
                      <ChevronLeft className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      حفظ التسميع
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
