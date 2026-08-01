import { supabase } from '@/lib/supabase';
import { SETTINGS_KEYS } from '@/lib/constants';

export const settingsRepository = {
  async get(key: string): Promise<string | undefined> {
    const { data, error } = await supabase.from('settings').select('value').eq('key', key).single();
    if (error || !data) return undefined;
    return data.value;
  },

  async set(key: string, value: string): Promise<void> {
    const { error } = await supabase.from('settings').upsert({ key, value }, { onConflict: 'key' });
    if (error) throw error;
  },

  async getEvaluationPoints(): Promise<Record<string, number>> {
    const { data, error } = await supabase.from('settings').select('*').like('key', 'eval_%');
    if (error) return {};
    
    const result: Record<string, number> = {};
    (data || []).forEach((row) => {
      const evalKey = (row.key as string).replace('eval_', '');
      result[evalKey] = parseInt(row.value as string, 10);
    });
    return result;
  },
};
