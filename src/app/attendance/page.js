import { getDb } from '@/lib/db';
import { getAccessibleClasses, hasClassAccess } from '@/lib/rbac';
import AttendanceClient from './AttendanceClient';

export const metadata = {
  title: 'Student Attendance | SchollyGO ERP',
};

export default async function AttendancePage() {
  const db = await getDb();
  const rbacData = await getAccessibleClasses(db);
  
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

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Academics / Student Attendance</div>
          <h1 className="page-title">Daily Student Attendance</h1>
        </div>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <AttendanceClient classes={classList} sectionsByClass={sectionsByClass} />
      </div>
    </div>
  );
}
