'use server';
import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteStaff(id) {
  const db = await getDb();
  await db.run('DELETE FROM staff WHERE id = ?', [id]);
  revalidatePath('/staff');
}
