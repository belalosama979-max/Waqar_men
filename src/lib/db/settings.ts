import { supabase } from '@/lib/supabase';

export const settingsRepository = {
  async get(key: string): Promise<string | undefined> {
    try {
      const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
      if (error || !data) return undefined;
      return data.value;
    } catch {
      return undefined;
    }
  },

  async set(key: string, value: string): Promise<void> {
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) throw new Error(error.message || 'فشل حفظ الإعدادات');
  },

  async getEvaluationPoints(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase.from('settings').select('*').like('key', 'eval_%');
      if (error || !data) return {};
      
      const result: Record<string, number> = {};
      data.forEach((row) => {
        const evalKey = (row.key as string).replace('eval_', '');
        result[evalKey] = parseInt(row.value as string, 10);
      });
      return result;
    } catch {
      return {};
    }
  },
};
