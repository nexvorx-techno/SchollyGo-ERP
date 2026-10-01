import { getDb } from '@/lib/db';
import Link from 'next/link';
import { PlusCircle, Calendar } from 'lucide-react';
import ExamsListClient from './ExamsListClient';

export const dynamic = 'force-dynamic';

export default async function ExamsPage() {
  const db = await getDb();
  
  const exams = await db.all(`
    SELECT e.*, 
      (SELECT MIN(exam_date) FROM exam_schedules WHERE exam_id = e.id) as first_exam_date,
      (SELECT MAX(exam_date) FROM exam_schedules WHERE exam_id = e.id) as last_exam_date
    FROM exams e
    ORDER BY e.created_at DESC
  `);
  
  // Also fetch all schedules so we can pass them to the client for the "View" modal
  const allSchedules = await db.all(`
    SELECT * FROM exam_schedules ORDER BY exam_date ASC, start_time ASC
  `);

  // Group schedules by exam_id
  const schedulesByExamId = {};
  for (const s of allSchedules) {
    if (!schedulesByExamId[s.exam_id]) {
      schedulesByExamId[s.exam_id] = [];
    }
    schedulesByExamId[s.exam_id].push(s);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Academics / Exam Management</div>
          <h1 className="page-title">Exam Management</h1>
        </div>
        <Link href="/exams/new" className="btn">
          <PlusCircle size={16} /> Schedule New Exam
        </Link>
      </div>

      <div className="panel">
        <h3 style={{ padding: '24px 24px 0 24px', margin: 0 }}>All Exams</h3>
        {exams.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Calendar size={48} style={{ margin: '0 auto 16px auto', opacity: 0.2 }} />
            <p>No exams found. Schedule one to get started.</p>
            <Link href="/exams/new" className="btn" style={{ marginTop: '16px', display: 'inline-block', textDecoration: 'none' }}>
              Schedule First Exam
            </Link>
          </div>
        ) : (
          <ExamsListClient initialExams={exams} schedulesMap={schedulesByExamId} />
        )}
      </div>
    </div>
  );
}
