'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const danger = variant === 'danger';
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/65 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
            <motion.div
              className="sheet sheet-handle pointer-events-auto w-full sm:max-w-md glass-card p-6 text-center"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 340 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  danger ? 'bg-red-500/15 text-red-300' : 'bg-amber-500/15 text-amber-300'
                }`}
                style={{ border: `1px solid ${danger ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.25)'}` }}
              >
                {danger ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <h3 className="text-lg font-extrabold text-emerald-50 mb-1.5">{title}</h3>
              <p className="text-sm text-emerald-200/60 leading-relaxed mb-6">{message}</p>

              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 min-h-[48px] rounded-2xl text-sm font-semibold text-emerald-200/80 active:scale-[0.97] transition-transform"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid var(--line-strong)' }}
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 min-h-[48px] rounded-2xl text-sm font-bold text-white active:scale-[0.97] transition-transform"
                  style={{
                    background: danger ? 'linear-gradient(160deg, #ef4444, #b91c1c)' : 'linear-gradient(160deg, #f59e0b, #b45309)',
                    border: danger ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(251,191,36,0.4)',
                  }}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
