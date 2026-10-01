import { Printer, Search, Download, CheckCircle, GraduationCap } from 'lucide-react';
import { getDb } from '@/lib/db';

export const metadata = {
  title: 'Student Report Card | SchollyGO ERP',
};

export default async function ReportCardPage() {
  const db = await getDb();
  const exams = await db.all('SELECT * FROM exams ORDER BY start_date DESC');

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Academics / Student Report Card</div>
          <h1 className="page-title">Generate Report Cards</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary">
            <Download size={16} /> Bulk Export PDF
          </button>
          <button className="btn">
            <Printer size={16} /> Print All
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
              <label>Academic Year / Term</label>
              <select>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.academic_year})</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
              <label>Class</label>
              <select>
                <option value="Class 10">Class 10</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
              <label>Section</label>
              <select>
                <option value="A">Section A</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn" style={{ height: '38px' }}>Generate Preview</button>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border)' }}>
             <GraduationCap size={48} color="var(--text-tertiary)" style={{ marginBottom: '16px', opacity: 0.5 }} />
             <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>CBSE/ICSE Standard Report Cards</h3>
             <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '13px', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
               Select a class and section to generate the final scholastic and co-scholastic report cards. The system will automatically calculate grades (A1, A2, B1...) and fetch attendance records.
             </p>
          </div>
        </div>

        <div className="panel" style={{ padding: '24px', alignSelf: 'start', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={16} /> Validation Checklist
          </h3>
          <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', color: '#14532d', lineHeight: 1.8 }}>
            <li>Ensure all Term Marks are entered</li>
            <li>Verify Co-scholastic grades</li>
            <li>Verify Attendance Records</li>
            <li>Check Class Teacher Remarks</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
