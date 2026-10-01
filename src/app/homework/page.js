import { getDb } from '@/lib/db';
import HomeWorkClient from './HomeWorkClient';

export const metadata = {
  title: 'Home Work Management | SchollyGO ERP',
};

export default async function HomeWorkPage() {
  const db = await getDb();
  const homeworks = await db.all('SELECT * FROM homework ORDER BY assigned_date DESC LIMIT 10');

  return <HomeWorkClient initialHomework={homeworks} />;
}
