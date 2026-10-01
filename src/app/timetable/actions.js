'use server';

import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getScheduleMetadata(className, sectionName) {
  const db = await getDb();
  
  // Get master class details (school timings)
  const masterClass = await db.get('SELECT * FROM master_classes WHERE class_name = ?', [className]);
  
  // Get timetable settings (lunch timings, class teacher)
  const settings = await db.get('SELECT * FROM timetable_settings WHERE class_name = ? AND section_name = ?', [className, sectionName]);
  
  let classTeacher = null;
  if (settings && settings.class_teacher_id) {
    classTeacher = await db.get('SELECT * FROM staff WHERE id = ?', [settings.class_teacher_id]);
  } else {
    // Try to auto-fetch from class_teacher_mapping
    const mapping = await db.get('SELECT staff_id FROM class_teacher_mapping WHERE class_name = ? AND section_name = ?', [className, sectionName]);
    if (mapping) {
      classTeacher = await db.get('SELECT * FROM staff WHERE id = ?', [mapping.staff_id]);
    }
  }

  return {
    masterClass,
    settings,
    classTeacher
  };
}

export async function saveScheduleMetadata(className, sectionName, lunchStartTime, lunchEndTime, classTeacherId) {
  const db = await getDb();
  
  await db.run(`
    INSERT INTO timetable_settings (class_name, section_name, lunch_start_time, lunch_end_time, class_teacher_id)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(class_name, section_name) DO UPDATE SET
      lunch_start_time = excluded.lunch_start_time,
      lunch_end_time = excluded.lunch_end_time,
      class_teacher_id = excluded.class_teacher_id
  `, [className, sectionName, lunchStartTime, lunchEndTime, classTeacherId]);
  
  revalidatePath('/timetable');
  return { success: true };
}

export async function fetchTimetable(className, sectionName) {
  const db = await getDb();
  
  const periods = await db.all(`
    SELECT t.*, s.name as teacher_name 
    FROM timetables t
    LEFT JOIN staff s ON t.teacher_id = s.id
    WHERE t.class = ? AND t.section = ?
  `, [className, sectionName]);
  
  return periods;
}

export async function savePeriod(data) {
  const db = await getDb();
  
  // Validate teacher duplicacy
  // We check if this teacher is assigned to another class at an overlapping time on the same day
  if (data.teacher_id) {
    const overlapping = await db.get(`
      SELECT * FROM timetables 
      WHERE teacher_id = ? 
      AND day_of_week = ? 
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )
      AND (class != ? OR section != ?)
    `, [
      data.teacher_id, 
      data.day_of_week, 
      data.start_time, data.start_time,
      data.end_time, data.end_time,
      data.start_time, data.end_time,
      data.class_name, data.section_name
    ]);
    
    if (overlapping) {
      return { 
        success: false, 
        message: `Teacher is already assigned to ${overlapping.class} ${overlapping.section} during this time (${overlapping.start_time} - ${overlapping.end_time}).` 
      };
    }
  }

  // Upsert the period
  const existing = await db.get(
    'SELECT id FROM timetables WHERE class = ? AND section = ? AND day_of_week = ? AND period_number = ?',
    [data.class_name, data.section_name, data.day_of_week, data.period_number]
  );
  
  if (existing) {
    await db.run(`
      UPDATE timetables 
      SET subject = ?, teacher_id = ?, start_time = ?, end_time = ?
      WHERE id = ?
    `, [data.subject, data.teacher_id, data.start_time, data.end_time, existing.id]);
  } else {
    await db.run(`
      INSERT INTO timetables (class, section, day_of_week, period_number, subject, teacher_id, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [data.class_name, data.section_name, data.day_of_week, data.period_number, data.subject, data.teacher_id, data.start_time, data.end_time]);
  }
  
  revalidatePath('/timetable');
  return { success: true, message: 'Period assigned successfully.' };
}

export async function deletePeriod(id) {
  const db = await getDb();
  await db.run('DELETE FROM timetables WHERE id = ?', [id]);
  revalidatePath('/timetable');
  return { success: true };
}

export async function autoFetchSubjectTeacher(className, sectionName, subjectName) {
  const db = await getDb();
  const mapping = await db.get(
    'SELECT staff_id FROM subject_teacher_mapping WHERE class_name = ? AND section_name = ? AND subject_name = ?',
    [className, sectionName, subjectName]
  );
  
  if (mapping) {
    const teacher = await db.get('SELECT id, name FROM staff WHERE id = ?', [mapping.staff_id]);
    return teacher;
  }
  return null;
}
