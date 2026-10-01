import { getDb } from '@/lib/db';
import SubjectTeachersClient from './SubjectTeachersClient';

import { getAccessibleClasses, hasClassAccess } from '@/lib/rbac';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Subject Teacher Master | Master Settings' };

export default async function SubjectTeachersPage() {
  const db = await getDb();
  const rbacData = await getAccessibleClasses(db);
  
  let classes = await db.all('SELECT * FROM master_classes ORDER BY id ASC');
  if (rbacData.isRestricted) {
    classes = classes.filter(c => hasClassAccess(rbacData, c.class_name));
  }
  const sections = await db.all('SELECT * FROM master_sections ORDER BY section_name ASC');
  const subjects = await db.all('SELECT * FROM master_subjects ORDER BY subject_name ASC');
  const classSubjects = await db.all('SELECT * FROM class_subject_mapping');
  const staff = await db.all('SELECT id, name, role FROM staff ORDER BY name ASC');
  
  const allocations = await db.all(`
    SELECT s.class_name, s.section_name, s.subject_name, s.staff_id, st.name as staff_name 
    FROM subject_teacher_mapping s
    JOIN staff st ON s.staff_id = st.id
  `);
  
  return (
    <SubjectTeachersClient 
      classes={classes} 
      sections={sections} 
      subjects={subjects}
      classSubjects={classSubjects}
      staff={staff} 
      initialAllocations={allocations} 
    />
  );
}
