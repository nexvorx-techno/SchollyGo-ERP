'use server';

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteUser(id) {
  const db = await getDb();
  await db.run('DELETE FROM users WHERE id = ?', [id]);
  revalidatePath('/users');
}
