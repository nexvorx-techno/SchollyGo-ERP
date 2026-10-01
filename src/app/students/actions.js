'use server';
import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteStudent(id) {
  const db = await getDb();
  await db.run('DELETE FROM students WHERE id = ?', [id]);
  revalidatePath('/students');
}
