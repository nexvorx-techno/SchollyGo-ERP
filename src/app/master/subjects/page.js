import { getDb } from '@/lib/db';
import SubjectsClient from './SubjectsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Create Subjects | Master Settings' };

export default async function SubjectsPage() {
  const db = await getDb();
  const subjects = await db.all('SELECT * FROM master_subjects ORDER BY subject_name ASC');
  
  return <SubjectsClient initialSubjects={subjects} />;
}
