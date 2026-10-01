import { getDb } from '@/lib/db';
import TimetableClient from './TimetableClient';

import { getAccessibleClasses, hasClassAccess } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export default async function TimetablePage() {
  const db = await getDb();
  const rbacData = await getAccessibleClasses(db);
  
  // Fetch classes for the dropdown
  const classes = await db.all('SELECT class_name FROM master_classes ORDER BY class_name ASC');
  // Fetch class section mappings
  const classSectionRows = await db.all('SELECT class_name, section_name FROM class_section_mapping ORDER BY section_name ASC');
  // Fetch mapped subjects (for validation in the assign popup)
  const mappedSubjects = await db.all('SELECT class_name, subject_name FROM class_subject_mapping');

  let finalClasses = classes;
  let finalSectionRows = classSectionRows;

  if (rbacData.isRestricted) {
    finalClasses = classes.filter(c => hasClassAccess(rbacData, c.class_name));
    finalSectionRows = classSectionRows.filter(row => hasClassAccess(rbacData, row.class_name, row.section_name));
  }

  // We pass this data to the client to avoid repeated simple DB calls
  const classList = finalClasses.map(c => c.class_name).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  
  const sectionsByClass = {};
  for (const row of finalSectionRows) {
    if (!sectionsByClass[row.class_name]) sectionsByClass[row.class_name] = [];
    sectionsByClass[row.class_name].push(row.section_name);
  }
  
  // Create a fast lookup map for subjects by class
  const subjectsByClass = {};
  for (const m of mappedSubjects) {
    if (!subjectsByClass[m.class_name]) subjectsByClass[m.class_name] = [];
    subjectsByClass[m.class_name].push(m.subject_name);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Academics / Time Table</div>
          <h1 className="page-title">Class Time Table</h1>
        </div>
      </div>

      <TimetableClient 
        classes={classList} 
        sectionsByClass={sectionsByClass} 
        subjectsByClass={subjectsByClass} 
      />
    </div>
  );
}
