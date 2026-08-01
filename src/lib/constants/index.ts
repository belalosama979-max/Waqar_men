import type { EvaluationOption, Surah } from '@/types';

// =========================================
// 114 Quran Surahs in Arabic
// =========================================

export const QURAN_SURAHS: Surah[] = [
  { index: 1, name: 'الفاتحة', arabicName: 'سورة الفاتحة' },
  { index: 2, name: 'البقرة', arabicName: 'سورة البقرة' },
  { index: 3, name: 'آل عمران', arabicName: 'سورة آل عمران' },
  { index: 4, name: 'النساء', arabicName: 'سورة النساء' },
  { index: 5, name: 'المائدة', arabicName: 'سورة المائدة' },
  { index: 6, name: 'الأنعام', arabicName: 'سورة الأنعام' },
  { index: 7, name: 'الأعراف', arabicName: 'سورة الأعراف' },
  { index: 8, name: 'الأنفال', arabicName: 'سورة الأنفال' },
  { index: 9, name: 'التوبة', arabicName: 'سورة التوبة' },
  { index: 10, name: 'يونس', arabicName: 'سورة يونس' },
  { index: 11, name: 'هود', arabicName: 'سورة هود' },
  { index: 12, name: 'يوسف', arabicName: 'سورة يوسف' },
  { index: 13, name: 'الرعد', arabicName: 'سورة الرعد' },
  { index: 14, name: 'إبراهيم', arabicName: 'سورة إبراهيم' },
  { index: 15, name: 'الحجر', arabicName: 'سورة الحجر' },
  { index: 16, name: 'النحل', arabicName: 'سورة النحل' },
  { index: 17, name: 'الإسراء', arabicName: 'سورة الإسراء' },
  { index: 18, name: 'الكهف', arabicName: 'سورة الكهف' },
  { index: 19, name: 'مريم', arabicName: 'سورة مريم' },
  { index: 20, name: 'طه', arabicName: 'سورة طه' },
  { index: 21, name: 'الأنبياء', arabicName: 'سورة الأنبياء' },
  { index: 22, name: 'الحج', arabicName: 'سورة الحج' },
  { index: 23, name: 'المؤمنون', arabicName: 'سورة المؤمنون' },
  { index: 24, name: 'النور', arabicName: 'سورة النور' },
  { index: 25, name: 'الفرقان', arabicName: 'سورة الفرقان' },
  { index: 26, name: 'الشعراء', arabicName: 'سورة الشعراء' },
  { index: 27, name: 'النمل', arabicName: 'سورة النمل' },
  { index: 28, name: 'القصص', arabicName: 'سورة القصص' },
  { index: 29, name: 'العنكبوت', arabicName: 'سورة العنكبوت' },
  { index: 30, name: 'الروم', arabicName: 'سورة الروم' },
  { index: 31, name: 'لقمان', arabicName: 'سورة لقمان' },
  { index: 32, name: 'السجدة', arabicName: 'سورة السجدة' },
  { index: 33, name: 'الأحزاب', arabicName: 'سورة الأحزاب' },
  { index: 34, name: 'سبأ', arabicName: 'سورة سبأ' },
  { index: 35, name: 'فاطر', arabicName: 'سورة فاطر' },
  { index: 36, name: 'يس', arabicName: 'سورة يس' },
  { index: 37, name: 'الصافات', arabicName: 'سورة الصافات' },
  { index: 38, name: 'ص', arabicName: 'سورة ص' },
  { index: 39, name: 'الزمر', arabicName: 'سورة الزمر' },
  { index: 40, name: 'غافر', arabicName: 'سورة غافر' },
  { index: 41, name: 'فصلت', arabicName: 'سورة فصلت' },
  { index: 42, name: 'الشورى', arabicName: 'سورة الشورى' },
  { index: 43, name: 'الزخرف', arabicName: 'سورة الزخرف' },
  { index: 44, name: 'الدخان', arabicName: 'سورة الدخان' },
  { index: 45, name: 'الجاثية', arabicName: 'سورة الجاثية' },
  { index: 46, name: 'الأحقاف', arabicName: 'سورة الأحقاف' },
  { index: 47, name: 'محمد', arabicName: 'سورة محمد' },
  { index: 48, name: 'الفتح', arabicName: 'سورة الفتح' },
  { index: 49, name: 'الحجرات', arabicName: 'سورة الحجرات' },
  { index: 50, name: 'ق', arabicName: 'سورة ق' },
  { index: 51, name: 'الذاريات', arabicName: 'سورة الذاريات' },
  { index: 52, name: 'الطور', arabicName: 'سورة الطور' },
  { index: 53, name: 'النجم', arabicName: 'سورة النجم' },
  { index: 54, name: 'القمر', arabicName: 'سورة القمر' },
  { index: 55, name: 'الرحمن', arabicName: 'سورة الرحمن' },
  { index: 56, name: 'الواقعة', arabicName: 'سورة الواقعة' },
  { index: 57, name: 'الحديد', arabicName: 'سورة الحديد' },
  { index: 58, name: 'المجادلة', arabicName: 'سورة المجادلة' },
  { index: 59, name: 'الحشر', arabicName: 'سورة الحشر' },
  { index: 60, name: 'الممتحنة', arabicName: 'سورة الممتحنة' },
  { index: 61, name: 'الصف', arabicName: 'سورة الصف' },
  { index: 62, name: 'الجمعة', arabicName: 'سورة الجمعة' },
  { index: 63, name: 'المنافقون', arabicName: 'سورة المنافقون' },
  { index: 64, name: 'التغابن', arabicName: 'سورة التغابن' },
  { index: 65, name: 'الطلاق', arabicName: 'سورة الطلاق' },
  { index: 66, name: 'التحريم', arabicName: 'سورة التحريم' },
  { index: 67, name: 'الملك', arabicName: 'سورة الملك' },
  { index: 68, name: 'القلم', arabicName: 'سورة القلم' },
  { index: 69, name: 'الحاقة', arabicName: 'سورة الحاقة' },
  { index: 70, name: 'المعارج', arabicName: 'سورة المعارج' },
  { index: 71, name: 'نوح', arabicName: 'سورة نوح' },
  { index: 72, name: 'الجن', arabicName: 'سورة الجن' },
  { index: 73, name: 'المزمل', arabicName: 'سورة المزمل' },
  { index: 74, name: 'المدثر', arabicName: 'سورة المدثر' },
  { index: 75, name: 'القيامة', arabicName: 'سورة القيامة' },
  { index: 76, name: 'الإنسان', arabicName: 'سورة الإنسان' },
  { index: 77, name: 'المرسلات', arabicName: 'سورة المرسلات' },
  { index: 78, name: 'النبأ', arabicName: 'سورة النبأ' },
  { index: 79, name: 'النازعات', arabicName: 'سورة النازعات' },
  { index: 80, name: 'عبس', arabicName: 'سورة عبس' },
  { index: 81, name: 'التكوير', arabicName: 'سورة التكوير' },
  { index: 82, name: 'الانفطار', arabicName: 'سورة الانفطار' },
  { index: 83, name: 'المطففين', arabicName: 'سورة المطففين' },
  { index: 84, name: 'الانشقاق', arabicName: 'سورة الانشقاق' },
  { index: 85, name: 'البروج', arabicName: 'سورة البروج' },
  { index: 86, name: 'الطارق', arabicName: 'سورة الطارق' },
  { index: 87, name: 'الأعلى', arabicName: 'سورة الأعلى' },
  { index: 88, name: 'الغاشية', arabicName: 'سورة الغاشية' },
  { index: 89, name: 'الفجر', arabicName: 'سورة الفجر' },
  { index: 90, name: 'البلد', arabicName: 'سورة البلد' },
  { index: 91, name: 'الشمس', arabicName: 'سورة الشمس' },
  { index: 92, name: 'الليل', arabicName: 'سورة الليل' },
  { index: 93, name: 'الضحى', arabicName: 'سورة الضحى' },
  { index: 94, name: 'الشرح', arabicName: 'سورة الشرح' },
  { index: 95, name: 'التين', arabicName: 'سورة التين' },
  { index: 96, name: 'العلق', arabicName: 'سورة العلق' },
  { index: 97, name: 'القدر', arabicName: 'سورة القدر' },
  { index: 98, name: 'البينة', arabicName: 'سورة البينة' },
  { index: 99, name: 'الزلزلة', arabicName: 'سورة الزلزلة' },
  { index: 100, name: 'العاديات', arabicName: 'سورة العاديات' },
  { index: 101, name: 'القارعة', arabicName: 'سورة القارعة' },
  { index: 102, name: 'التكاثر', arabicName: 'سورة التكاثر' },
  { index: 103, name: 'العصر', arabicName: 'سورة العصر' },
  { index: 104, name: 'الهمزة', arabicName: 'سورة الهمزة' },
  { index: 105, name: 'الفيل', arabicName: 'سورة الفيل' },
  { index: 106, name: 'قريش', arabicName: 'سورة قريش' },
  { index: 107, name: 'الماعون', arabicName: 'سورة الماعون' },
  { index: 108, name: 'الكوثر', arabicName: 'سورة الكوثر' },
  { index: 109, name: 'الكافرون', arabicName: 'سورة الكافرون' },
  { index: 110, name: 'النصر', arabicName: 'سورة النصر' },
  { index: 111, name: 'المسد', arabicName: 'سورة المسد' },
  { index: 112, name: 'الإخلاص', arabicName: 'سورة الإخلاص' },
  { index: 113, name: 'الفلق', arabicName: 'سورة الفلق' },
  { index: 114, name: 'الناس', arabicName: 'سورة الناس' },
];

// =========================================
// Juz (Parts) Labels
// =========================================

export const QURAN_PARTS = Array.from({ length: 30 }, (_, i) => ({
  index: i + 1,
  label: `الجزء ${i + 1}`,
}));

// =========================================
// Default Evaluation Options
// =========================================

export const DEFAULT_EVALUATIONS: EvaluationOption[] = [
  {
    key: 'ممتاز_جداً',
    label: 'ممتاز جداً',
    defaultPoints: 60,
    color: 'emerald',
  },
  {
    key: 'ممتاز',
    label: 'ممتاز',
    defaultPoints: 40,
    color: 'green',
  },
  {
    key: 'جيد_جداً',
    label: 'جيد جداً',
    defaultPoints: 25,
    color: 'blue',
  },
  {
    key: 'لم_يسمع',
    label: 'لم يسمع',
    defaultPoints: 0,
    color: 'gray',
  },
  {
    key: 'رجع_في_التسميع',
    label: 'رجع في التسميع',
    defaultPoints: 10,
    color: 'amber',
  },
];

// =========================================
// Settings Keys
// =========================================

export const SETTINGS_KEYS = {
  APP_NAME: 'app_name',
  THEME: 'theme',
  EVAL_ممتاز_جداً: 'eval_ممتاز_جداً',
  EVAL_ممتاز: 'eval_ممتاز',
  EVAL_جيد_جداً: 'eval_جيد_جداً',
  EVAL_لم_يسمع: 'eval_لم_يسمع',
  EVAL_رجع_في_التسميع: 'eval_رجع_في_التسميع',
} as const;

export const DEFAULT_APP_NAME = 'نظام إدارة تسميع القرآن الكريم';

// =========================================
// Admin Credentials
// =========================================

export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'admin123';
export const ADMIN_NAME = 'المشرف العام';
