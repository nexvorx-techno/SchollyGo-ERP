import { getDb } from '@/lib/db';
import Link from 'next/link';
import { PlusCircle, Search } from 'lucide-react';
import StudentsTableClient from './StudentsTableClient';
import { getAccessibleClasses, hasClassAccess } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function StudentsPage({ searchParams }) {
  // Fix Next.js 15 async searchParams
  const resolvedParams = await searchParams;
  const q = resolvedParams?.q || '';
  
  const db = await getDb();
  const rbacData = await getAccessibleClasses(db);
  
  let students = [];
  if (q) {
    students = await db.all(
      `SELECT * FROM students WHERE (name LIKE ? OR student_id LIKE ?) ORDER BY created_at DESC`, 
      [`%${q}%`, `%${q}%`]
    );
  } else {
    students = await db.all('SELECT * FROM students ORDER BY created_at DESC');
  }

  // Filter based on RBAC
  if (rbacData.isRestricted) {
    students = students.filter(s => hasClassAccess(rbacData, s.class_name, s.section_name));
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Academics / Students Hub</div>
          <h1 className="page-title">Students Hub</h1>
        </div>
        <Link href="/students/new" className="btn">
          <PlusCircle size={16} /> Add New Student
        </Link>
      </div>

      <div className="panel">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
          <form style={{ display: 'flex', gap: '8px', flex: 1 }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
              <input 
                type="text" 
                name="q" 
                defaultValue={q}
                placeholder="Search by Name or Student ID..." 
                style={{ padding: '8px 12px 8px 32px', border: '1px solid var(--border)', borderRadius: '3px', width: '100%', fontSize: '13px' }}
              />
            </div>
            <button type="submit" className="btn btn-secondary">Search</button>
            {q && (
              <Link href="/students" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Clear</Link>
            )}
          </form>
        </div>

        <div className="table-container">
          <StudentsTableClient initialStudents={students} />
        </div>
      </div>
    </div>
  );
}
