'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Settings, Save, Star, Palette } from 'lucide-react';
import { settingsRepository } from '@/lib/db';
import { DEFAULT_EVALUATIONS, SETTINGS_KEYS, DEFAULT_APP_NAME } from '@/lib/constants';
import type { EvaluationOption } from '@/types';

export default function AdminSettingsPage() {
  const [appName, setAppName] = useState(DEFAULT_APP_NAME);
  const [evaluations, setEvaluations] = useState<(EvaluationOption & { currentPoints: number })[]>(
    DEFAULT_EVALUATIONS.map((ev) => ({ ...ev, currentPoints: ev.defaultPoints }))
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const name = await settingsRepository.get(SETTINGS_KEYS.APP_NAME);
    if (name) setAppName(name);

    const pts = await settingsRepository.getEvaluationPoints();
    setEvaluations(
      DEFAULT_EVALUATIONS.map((ev) => ({
        ...ev,
        currentPoints: pts[ev.key] ?? ev.defaultPoints,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsRepository.set(SETTINGS_KEYS.APP_NAME, appName);
      for (const ev of evaluations) {
        await settingsRepository.set(`eval_${ev.key}`, String(ev.currentPoints));
      }
      toast.success('تم حفظ الإعدادات بنجاح ✅');
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const updateEvalPoints = (key: string, value: number) => {
    setEvaluations((prev) =>
      prev.map((ev) => (ev.key === key ? { ...ev, currentPoints: value } : ev))
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div className="flex items-center justify-between" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <Settings className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-emerald-100">الإعدادات</h2>
        </div>
        <motion.button className="btn-emerald" onClick={handleSave} disabled={saving} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-4 h-4" /> حفظ الإعدادات</>}
        </motion.button>
      </motion.div>

      {/* App Name */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-emerald-200">إعدادات عامة</h3>
        </div>
        <div>
          <label className="text-sm text-emerald-300/70 mb-1.5 block">اسم التطبيق</label>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="input-glass"
            placeholder={DEFAULT_APP_NAME}
          />
        </div>
      </motion.div>

      {/* Evaluation Points */}
      <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-5 h-5 text-gold-400" />
          <h3 className="font-semibold text-emerald-200">نقاط التقييمات</h3>
        </div>
        <p className="text-xs text-emerald-500/50 mb-5">عدّل النقاط الافتراضية لكل تقييم. ستُطبق على التسجيلات الجديدة فقط.</p>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-emerald-900/20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {evaluations.map((ev, i) => (
              <motion.div
                key={ev.key}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <div>
                  <p className="font-medium text-emerald-200">{ev.label}</p>
                  <p className="text-xs text-emerald-500/50">
                    الافتراضي: {ev.defaultPoints} نقطة
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={ev.currentPoints}
                    onChange={(e) => updateEvalPoints(ev.key, Number(e.target.value))}
                    className="input-glass w-24 text-center"
                  />
                  <span className="text-xs text-emerald-400/60">نقطة</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Admin Info */}
      <motion.div
        className="glass-card-gold p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h4 className="font-semibold text-gold-300 mb-2">معلومات حساب المشرف</h4>
        <div className="text-sm space-y-1 text-emerald-300/60">
          <p>اسم المستخدم: <span className="text-emerald-200 font-mono">admin</span></p>
          <p>كلمة المرور: <span className="text-emerald-200 font-mono">admin123</span></p>
        </div>
      </motion.div>
    </div>
  );
}
