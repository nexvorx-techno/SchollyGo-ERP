'use server';

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function assignHomework(formData) {
  const db = await getDb();
  
  const className = formData.get('class');
  const section = formData.get('section');
  const subject = formData.get('subject');
  const dueDate = formData.get('due_date');
  const description = formData.get('description');
  const assignedDate = new Date().toISOString().split('T')[0];

  await db.run(
    'INSERT INTO homework (class, section, subject, assigned_date, due_date, description) VALUES (?, ?, ?, ?, ?, ?)',
    [className, section, subject, assignedDate, dueDate, description]
  );

  revalidatePath('/homework');
}
