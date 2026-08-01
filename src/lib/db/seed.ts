import { db } from './schema';
import {
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  ADMIN_NAME,
  DEFAULT_EVALUATIONS,
  DEFAULT_APP_NAME,
  SETTINGS_KEYS,
} from '@/lib/constants';

export async function seedDatabase() {
  // Only seed if database is empty
  const adminCount = await db.admins.count();
  if (adminCount > 0) return;

  // Seed admin
  await db.admins.add({
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
    name: ADMIN_NAME,
    createdAt: new Date(),
  });

  // Seed default settings
  const settingsToSeed = [
    { key: SETTINGS_KEYS.APP_NAME, value: DEFAULT_APP_NAME },
    { key: SETTINGS_KEYS.THEME, value: 'dark' },
    ...DEFAULT_EVALUATIONS.map((ev) => ({
      key: `eval_${ev.key}`,
      value: String(ev.defaultPoints),
    })),
  ];

  for (const setting of settingsToSeed) {
    await db.settings.add(setting);
  }

  // Seed sample teachers
  const teacher1Id = await db.teachers.add({
    name: 'محمد أحمد',
    username: 'محمد',
    password: 'محمد123',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const teacher2Id = await db.teachers.add({
    name: 'أحمد علي',
    username: 'أحمد',
    password: 'أحمد123',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Seed sample students
  const studentNames1 = [
    'عبدالله محمد',
    'يوسف علي',
    'إبراهيم خالد',
    'عمر عبدالرحمن',
    'سعد ناصر',
  ];

  const studentNames2 = [
    'علي حسن',
    'حمزة أحمد',
    'زياد سالم',
    'طارق عبدالله',
    'فارس محمود',
  ];

  for (const name of studentNames1) {
    await db.students.add({
      name,
      teacherId: teacher1Id as number,
      teacherName: 'محمد أحمد',
      totalPoints: Math.floor(Math.random() * 500),
      lastRecitation: null,
      lastDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  for (const name of studentNames2) {
    await db.students.add({
      name,
      teacherId: teacher2Id as number,
      teacherName: 'أحمد علي',
      totalPoints: Math.floor(Math.random() * 500),
      lastRecitation: null,
      lastDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
