'use server';

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function askQuestion(formData) {
  const db = await getDb();
  
  const question = formData.get('question');
  const className = formData.get('class');
  const section = formData.get('section');
  const subject = formData.get('subject');
  const topic = formData.get('topic');

  await db.run(
    'INSERT INTO qna (class, section, subject, topic, question) VALUES (?, ?, ?, ?, ?)',
    [className, section, subject, topic, question]
  );

  revalidatePath('/qna');
}

export async function answerQuestion(formData) {
  const db = await getDb();
  
  const id = formData.get('id');
  const answer = formData.get('answer');

  await db.run(
    'UPDATE qna SET answer = ? WHERE id = ?',
    [answer, id]
  );

  revalidatePath('/qna');
}
