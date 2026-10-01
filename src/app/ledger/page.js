import { getDb } from '@/lib/db';
import { getAccessibleClasses, hasClassAccess } from '@/lib/rbac';
import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import LedgerClient from './LedgerClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Student Ledger | SchollyGO ERP',
};

export default async function StudentLedgerPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const currentClass = resolvedParams?.class || 'All';
  const currentSection = resolvedParams?.section || 'All';
  const searchQuery = resolvedParams?.q || '';

  const db = await getDb();
  const rbacData = await getAccessibleClasses(db);
  
  // Fetch classes and sections for the dropdowns
  const classes = await db.all('SELECT class_name FROM master_classes ORDER BY class_name ASC');
  const classSectionRows = await db.all('SELECT class_name, section_name FROM class_section_mapping ORDER BY section_name ASC');
  
  let finalClasses = classes;
  let finalSectionRows = classSectionRows;

  if (rbacData.isRestricted) {
    finalClasses = classes.filter(c => hasClassAccess(rbacData, c.class_name));
    finalSectionRows = classSectionRows.filter(row => hasClassAccess(rbacData, row.class_name, row.section_name));
  }
  
  const classList = finalClasses.map(c => c.class_name).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  const sectionsByClass = {};
  for (const row of finalSectionRows) {
    if (!sectionsByClass[row.class_name]) sectionsByClass[row.class_name] = [];
    sectionsByClass[row.class_name].push(row.section_name);
  }

  // Fetch students based on filters
  let students = [];
  
  let query = 'SELECT id, student_id, name, roll_number, father_name, father_mobile, status, class, section FROM students WHERE 1=1';
  let queryParams = [];

  if (currentClass !== 'All') {
    query += ' AND class = ?';
    queryParams.push(currentClass);
  }
  
  if (currentSection !== 'All') {
    query += ' AND section = ?';
    queryParams.push(currentSection);
  }

  if (searchQuery) {
    query += ' AND (name LIKE ? OR roll_number LIKE ? OR student_id LIKE ? OR father_mobile LIKE ?)';
    const likeQ = `%${searchQuery}%`;
    queryParams.push(likeQ, likeQ, likeQ, likeQ);
  }

  query += ' ORDER BY class ASC, section ASC, roll_number ASC, name ASC';

  students = await db.all(query, queryParams);

  if (rbacData.isRestricted) {
    students = students.filter(s => hasClassAccess(rbacData, s.class, s.section));
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Accounting & Finance / Student Ledger</div>
          <h1 className="page-title">Student Ledger</h1>
        </div>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <LedgerClient 
          classes={classList} 
          sectionsByClass={sectionsByClass} 
          initialClass={currentClass} 
          initialSection={currentSection}
          initialSearch={searchQuery}
        />

        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Students ({students.length})
          </h2>
            
            {students.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Class-Sec</th>
                      <th>Roll No</th>
                      <th>Student ID</th>
                      <th>Student Name</th>
                      <th>Father Name</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>{student.class}-{student.section}</td>
                        <td>{student.roll_number || '-'}</td>
                        <td>{student.student_id}</td>
                        <td style={{ fontWeight: '500' }}>{student.name}</td>
                        <td>{student.father_name || '-'}</td>
                        <td>
                          <span className={`status-badge ${student.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                            {student.status || 'Active'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link href={`/ledger/${student.id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <FileText size={14} /> View Ledger <ChevronRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No students found in this class and section.</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}
