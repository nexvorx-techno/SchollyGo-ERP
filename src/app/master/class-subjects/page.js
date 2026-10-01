import { getDb } from '@/lib/db';
import ClassSubjectsClient from './ClassSubjectsClient';

import { getAccessibleClasses, hasClassAccess } from '@/lib/rbac';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Stream & Subject Assign | Master Settings' };

export default async function ClassSubjectsPage() {
  const db = await getDb();
  const rbacData = await getAccessibleClasses(db);
  
  // We fetch master classes, master subjects, and the mappings
  let classesData = await db.all('SELECT * FROM master_classes');
  
  if (rbacData.isRestricted) {
    classesData = classesData.filter(c => hasClassAccess(rbacData, c.class_name));
  }
  
  // Sort classes naturally
  const classes = classesData.sort((a, b) => a.class_name.localeCompare(b.class_name, undefined, { numeric: true, sensitivity: 'base' }));
  
  const subjects = await db.all('SELECT * FROM master_subjects ORDER BY subject_name ASC');
  const mappings = await db.all('SELECT * FROM class_subject_mapping');
  
  return (
    <ClassSubjectsClient 
      classes={classes} 
      subjects={subjects} 
      initialMappings={mappings} 
    />
  );
}
