import { getDb } from '@/lib/db';
import ClassSectionsClient from './ClassSectionsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Class & Section Master | Master Settings' };

export default async function ClassSectionsPage() {
  const db = await getDb();
  
  const classesData = await db.all('SELECT * FROM master_classes');
  const sectionsData = await db.all('SELECT * FROM master_sections');
  const classSectionRows = await db.all('SELECT * FROM class_section_mapping');
  
  const classes = classesData.sort((a, b) => a.class_name.localeCompare(b.class_name, undefined, { numeric: true, sensitivity: 'base' }));
  const sections = sectionsData.sort((a, b) => a.section_name.localeCompare(b.section_name, undefined, { numeric: true, sensitivity: 'base' }));
  
  const initialMappings = {};
  for (const row of classSectionRows) {
    if (!initialMappings[row.class_name]) initialMappings[row.class_name] = [];
    initialMappings[row.class_name].push(row.section_name);
  }
  
  return <ClassSectionsClient initialClasses={classes} initialSections={sections} initialMappings={initialMappings} />;
}
