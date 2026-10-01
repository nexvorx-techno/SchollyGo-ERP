'use server';

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- Subjects ---
export async function createSubject(formData) {
  const db = await getDb();
  const name = formData.get('subject_name');
  const code = formData.get('subject_code');
  const bookName = formData.get('book_name') || null;
  const totalChapters = formData.get('total_chapters') || null;
  const authorName = formData.get('author_name') || null;
  const cwPages = formData.get('cw_pages') || null;
  
  await db.run(
    'INSERT INTO master_subjects (subject_name, subject_code, book_name, total_chapters, author_name, cw_pages) VALUES (?, ?, ?, ?, ?, ?)', 
    [name, code, bookName, totalChapters, authorName, cwPages]
  );
  revalidatePath('/master/subjects');
}

export async function deleteSubject(id) {
  const db = await getDb();
  // Fetch subject name to clean up mappings
  const sub = await db.get('SELECT subject_name FROM master_subjects WHERE id = ?', [id]);
  if (sub) {
    await db.run('DELETE FROM class_subject_mapping WHERE subject_name = ?', [sub.subject_name]);
    await db.run('DELETE FROM subject_teacher_mapping WHERE subject_name = ?', [sub.subject_name]);
  }
  await db.run('DELETE FROM master_subjects WHERE id = ?', [id]);
  revalidatePath('/master/subjects');
}

// --- Classes and Sections ---
export async function assignSubjectToClass(formData) {
  const db = await getDb();
  const className = formData.get('class_name');
  const subjects = formData.getAll('subjects'); // array of subject names

  // Clear existing for this class
  await db.run('DELETE FROM class_subject_mapping WHERE class_name = ?', [className]);

  // Insert new
  for (const sub of subjects) {
    await db.run('INSERT INTO class_subject_mapping (class_name, subject_name) VALUES (?, ?)', [className, sub]);
  }
  revalidatePath('/master/class-subjects');
}

export async function removeSubjectFromClass(className, subjectName) {
  const db = await getDb();
  await db.run('DELETE FROM class_subject_mapping WHERE class_name = ? AND subject_name = ?', [className, subjectName]);
  revalidatePath('/master/class-subjects');
}

export async function addClass(formData) {
  const db = await getDb();
  const name = formData.get('class_name');
  const stream = formData.get('stream');
  const startTime = formData.get('start_time') || null;
  const endTime = formData.get('end_time') || null;

  // Clean up any potential orphaned records with this name before creating
  await db.run('DELETE FROM class_section_mapping WHERE class_name = ?', [name]);
  await db.run('DELETE FROM class_subject_mapping WHERE class_name = ?', [name]);
  await db.run('DELETE FROM class_teacher_mapping WHERE class_name = ?', [name]);
  await db.run('DELETE FROM subject_teacher_mapping WHERE class_name = ?', [name]);

  await db.run(
    'INSERT INTO master_classes (class_name, stream, start_time, end_time) VALUES (?, ?, ?, ?)', 
    [name, stream, startTime, endTime]
  );
  
  // Initialize default fees for the new class
  await db.run('DELETE FROM class_fees_master WHERE class_name = ?', [name]);
  await db.run(
    'INSERT INTO class_fees_master (class_name, tuition_fee, bus_fee, admission_fee, caution_money, other_fee, duration_type, late_fee_type, late_fee_amount, due_date_day) VALUES (?, 0, 0, 0, 0, 0, "Monthly", "None", 0, 10)',
    [name]
  );
  
  revalidatePath('/master/class-sections');
  revalidatePath('/master/fees-structure');
}

export async function deleteClass(id) {
  const db = await getDb();
  // Fetch class name to clean up mappings
  const cls = await db.get('SELECT class_name FROM master_classes WHERE id = ?', [id]);
  if (cls) {
    await db.run('DELETE FROM class_section_mapping WHERE class_name = ?', [cls.class_name]);
    await db.run('DELETE FROM class_subject_mapping WHERE class_name = ?', [cls.class_name]);
    await db.run('DELETE FROM class_teacher_mapping WHERE class_name = ?', [cls.class_name]);
    await db.run('DELETE FROM subject_teacher_mapping WHERE class_name = ?', [cls.class_name]);
    await db.run('DELETE FROM class_fees_master WHERE class_name = ?', [cls.class_name]);
  }
  await db.run('DELETE FROM master_classes WHERE id = ?', [id]);
  revalidatePath('/master/class-sections');
  revalidatePath('/master/fees-structure');
}

export async function addSection(formData) {
  const db = await getDb();
  const name = formData.get('section_name');
  await db.run('INSERT INTO master_sections (section_name) VALUES (?)', [name]);
  revalidatePath('/master/class-sections');
}

export async function deleteSection(id) {
  const db = await getDb();
  // Fetch section name to clean up mappings
  const sec = await db.get('SELECT section_name FROM master_sections WHERE id = ?', [id]);
  if (sec) {
    await db.run('DELETE FROM class_section_mapping WHERE section_name = ?', [sec.section_name]);
    await db.run('DELETE FROM class_teacher_mapping WHERE section_name = ?', [sec.section_name]);
    await db.run('DELETE FROM subject_teacher_mapping WHERE section_name = ?', [sec.section_name]);
  }
  await db.run('DELETE FROM master_sections WHERE id = ?', [id]);
  revalidatePath('/master/class-sections');
}

export async function assignSectionToClass(formData) {
  const db = await getDb();
  const className = formData.get('class_name');
  const sections = formData.getAll('sections'); // array of section names

  // Clear existing for this class
  await db.run('DELETE FROM class_section_mapping WHERE class_name = ?', [className]);

  // Insert new
  for (const sec of sections) {
    await db.run('INSERT INTO class_section_mapping (class_name, section_name) VALUES (?, ?)', [className, sec]);
  }
  revalidatePath('/master/class-sections');
  revalidatePath('/timetable'); // also revalidate timetable since it relies on this mapping
}

// --- Teacher Allocations ---
export async function assignClassTeacher(formData) {
  const db = await getDb();
  const className = formData.get('class_name');
  const sectionName = formData.get('section_name');
  const staffId = formData.get('staff_id');

  // Replace existing allocation
  await db.run('DELETE FROM class_teacher_mapping WHERE class_name = ? AND section_name = ?', [className, sectionName]);
  
  if (staffId) {
    await db.run('INSERT INTO class_teacher_mapping (class_name, section_name, staff_id) VALUES (?, ?, ?)', [className, sectionName, staffId]);
  }
  revalidatePath('/master/class-teachers');
}

export async function removeClassTeacher(className, sectionName) {
  const db = await getDb();
  await db.run('DELETE FROM class_teacher_mapping WHERE class_name = ? AND section_name = ?', [className, sectionName]);
  revalidatePath('/master/class-teachers');
}

export async function assignSubjectTeacher(formData) {
  const db = await getDb();
  const className = formData.get('class_name');
  const sectionName = formData.get('section_name');
  const subjectName = formData.get('subject_name');
  const staffId = formData.get('staff_id');

  // Replace existing allocation
  await db.run('DELETE FROM subject_teacher_mapping WHERE class_name = ? AND section_name = ? AND subject_name = ?', [className, sectionName, subjectName]);
  
  if (staffId) {
    await db.run('INSERT INTO subject_teacher_mapping (class_name, section_name, subject_name, staff_id) VALUES (?, ?, ?, ?)', [className, sectionName, subjectName, staffId]);
  }
  revalidatePath('/master/subject-teachers');
}

export async function removeSubjectTeacher(className, sectionName, subjectName) {
  const db = await getDb();
  await db.run('DELETE FROM subject_teacher_mapping WHERE class_name = ? AND section_name = ? AND subject_name = ?', [className, sectionName, subjectName]);
  revalidatePath('/master/subject-teachers');
}

