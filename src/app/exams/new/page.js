import { getDb } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAccessibleClasses, hasClassAccess } from '@/lib/rbac';
import NewExamClient from './NewExamClient';

export const dynamic = 'force-dynamic';

export default async function NewExamPage() {
  const db = await getDb();
  const rbacData = await getAccessibleClasses(db);
  
  // Fetch classes for the dropdown
  const classes = await db.all('SELECT class_name FROM master_classes ORDER BY class_name ASC');
  // Fetch sections for the dropdown
  const sections = await db.all('SELECT section_name FROM master_sections ORDER BY section_name ASC');

  let finalClasses = classes.map(c => c.class_name);
  let finalSections = sections.map(s => s.section_name);

  if (rbacData.isRestricted) {
    finalClasses = finalClasses.filter(c => hasClassAccess(rbacData, c));
    // Since sections in exams are often selected independently of a single class in the UI (or maybe they are?), 
    // wait, if NewExamClient just takes a flat list of sections, we should filter it to only sections the user has access to in ANY class.
    const allowedSectionSet = new Set();
    Object.values(rbacData.allowedClasses).forEach(secs => secs.forEach(s => allowedSectionSet.add(s)));
    finalSections = finalSections.filter(s => allowedSectionSet.has(s));
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Academics / Exams / Schedule Exam</div>
          <h1 className="page-title">Schedule New Exam</h1>
        </div>
        <Link href="/exams" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Exams
        </Link>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <NewExamClient 
          classes={finalClasses} 
          sections={finalSections} 
        />
      </div>
    </div>
  );
}
