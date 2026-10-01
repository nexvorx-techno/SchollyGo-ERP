'use server';

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteFeeEntry(id) {
  const db = await getDb();
  await db.run('DELETE FROM fees_entries WHERE id = ?', [id]);
  revalidatePath('/fees');
}
