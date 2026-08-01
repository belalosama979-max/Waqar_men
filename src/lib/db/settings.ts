import { db } from './schema';
import type { AppSettings } from '@/types';

export const settingsRepository = {
  async get(key: string): Promise<string | null> {
    const setting = await db.settings.where('key').equals(key).first();
    return setting ? setting.value : null;
  },

  async set(key: string, value: string): Promise<void> {
    const existing = await db.settings.where('key').equals(key).first();
    if (existing && existing.id) {
      await db.settings.update(existing.id, { value });
    } else {
      await db.settings.add({ key, value });
    }
  },

  async getAll(): Promise<AppSettings[]> {
    return db.settings.toArray();
  },

  async getEvaluationPoints(): Promise<Record<string, number>> {
    const all = await db.settings.toArray();
    const result: Record<string, number> = {};
    for (const s of all) {
      if (s.key.startsWith('eval_')) {
        const evalKey = s.key.replace('eval_', '');
        result[evalKey] = Number(s.value);
      }
    }
    return result;
  },
};
