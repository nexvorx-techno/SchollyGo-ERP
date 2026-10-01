import { getDb } from '@/lib/db';
import QnAClient from './QnAClient';

export const metadata = {
  title: 'Question & Answers | SchollyGO ERP',
};

export default async function QnAPage() {
  const db = await getDb();
  const questions = await db.all('SELECT * FROM qna ORDER BY date_posted DESC LIMIT 15');

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Academics / Question & Answers</div>
          <h1 className="page-title">Student Q&A Forum</h1>
        </div>
      </div>
      <QnAClient initialQuestions={questions} />
    </div>
  );
}
