import { FileText, Award, Download, Search } from 'lucide-react';
import { getDb } from '@/lib/db';

export const metadata = {
  title: 'Result Management | SchollyGO ERP',
};

export default async function ResultsPage() {
  const db = await getDb();
  const exams = await db.all('SELECT * FROM exams ORDER BY start_date DESC');

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Academics / Result Management</div>
          <h1 className="page-title">Marks Entry & Processing</h1>
        </div>
        <button className="btn">
          <Award size={16} /> Publish Results
        </button>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Select Examination Term</label>
            <select>
              <option value="">-- Choose Exam --</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.academic_year})</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Select Class</label>
            <select>
              <option value="Class 10">Class 10</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Select Section</label>
            <select>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Subject</label>
            <select>
              <option>Mathematics</option>
              <option>Science</option>
              <option>English</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn" style={{ height: '38px' }}>Load Students</button>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '64px', border: '1px dashed var(--border)', borderRadius: '8px', background: '#fafafa' }}>
          <FileText size={48} color="var(--text-tertiary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>Select criteria to enter marks</h3>
          <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '13px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
            Choose an exam, class, section, and subject above to load the student roster for marks entry. Supports CBSE FA/SA grading standards.
          </p>
        </div>
      </div>
    </div>
  );
}
