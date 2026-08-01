import Dexie, { Table } from 'dexie';
import type { Admin, Teacher, Student, Recitation, AppSettings } from '@/types';

export class QuranRecitationDB extends Dexie {
  admins!: Table<Admin, number>;
  teachers!: Table<Teacher, number>;
  students!: Table<Student, number>;
  recitations!: Table<Recitation, number>;
  settings!: Table<AppSettings, number>;

  constructor() {
    super('QuranRecitationDB');

    this.version(1).stores({
      admins: '++id, username',
      teachers: '++id, username, name',
      students: '++id, teacherId, name, totalPoints',
      recitations: '++id, studentId, teacherId, date, evaluation, type',
      settings: '++id, key',
    });
  }
}

export const db = new QuranRecitationDB();
