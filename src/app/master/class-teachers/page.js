import { getDb } from '@/lib/db';
import ClassTeachersClient from './ClassTeachersClient';

import { getAccessibleClasses, hasClassAccess } from '@/lib/rbac';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Class Teacher Allocation | Master Settings' };

export default async function ClassTeachersPage() {
  const db = await getDb();
  const rbacData = await getAccessibleClasses(db);
  
  let classes = await db.all('SELECT * FROM master_classes ORDER BY id ASC');
  if (rbacData.isRestricted) {
    classes = classes.filter(c => hasClassAccess(rbacData, c.class_name));
  }
  const sections = await db.all('SELECT * FROM master_sections ORDER BY section_name ASC');
  const staff = await db.all('SELECT id, name, role FROM staff ORDER BY name ASC');
  
  const allocations = await db.all(`
    SELECT c.class_name, c.section_name, c.staff_id, s.name as staff_name 
    FROM class_teacher_mapping c
    JOIN staff s ON c.staff_id = s.id
  `);
  
  return (
    <ClassTeachersClient 
      classes={classes} 
      sections={sections} 
      staff={staff} 
      initialAllocations={allocations} 
    />
  );
}
