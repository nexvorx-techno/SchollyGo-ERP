import { getDb } from '@/lib/db';
import UserForm from '@/components/UserForm';
import { updateUser } from './actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EditUserPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const db = await getDb();
  
  const user = await db.get('SELECT * FROM users WHERE id = ?', [id]);
  if (!user) {
    redirect('/users');
  }

  // Fetch all staff to pass to the client component for searching
  const staffList = await db.all('SELECT id, name, employee_id, role, department, contact, email, doc_photo FROM staff ORDER BY name ASC');

  // Fetch existing users for the Reporting Person dropdown
  const userList = await db.all('SELECT id, username FROM users ORDER BY username ASC');

  // Fetch classes and sections for assignment (join with master tables to ignore orphaned defaults)
  const classListRows = await db.all(`
    SELECT mc.class_name, ms.section_name 
    FROM master_classes mc
    LEFT JOIN class_section_mapping csm ON mc.class_name = csm.class_name
    LEFT JOIN master_sections ms ON csm.section_name = ms.section_name
    ORDER BY CAST(SUBSTR(mc.class_name, 7) AS INTEGER) ASC, mc.id ASC, ms.section_name ASC
  `);
  
  const classHierarchy = classListRows.reduce((acc, row) => {
    const existingClass = acc.find(c => c.class_name === row.class_name);
    if (existingClass) {
      if (row.section_name && !existingClass.sections.includes(row.section_name)) {
        existingClass.sections.push(row.section_name);
      }
    } else {
      acc.push({ class_name: row.class_name, sections: row.section_name ? [row.section_name] : [] });
    }
    return acc;
  }, []);

  // Create a wrapper action to bind the user ID
  const saveUserAction = updateUser.bind(null, id);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <div className="breadcrumb">System / User Management / Edit User</div>
          <h1 className="page-title">Edit User Account</h1>
        </div>
        <Link href="/users" className="btn btn-secondary">
          <ChevronLeft size={16} /> Back to List
        </Link>
      </div>

      <UserForm 
        staffList={staffList} 
        userList={userList}
        classList={classHierarchy}
        isEdit={true} 
        initialData={user}
        saveUserAction={saveUserAction} 
      />
    </div>
  );
}
