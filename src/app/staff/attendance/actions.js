'use server';

import { getDb } from '@/lib/db';

export async function punchAttendance(employeeId) {
  if (!employeeId || employeeId.trim() === '') {
    return { error: 'Please enter an Employee ID.' };
  }

  const db = await getDb();
  
  // Find staff by employee_id or raw ID fallback
  const staff = await db.get(
    'SELECT id, name, employee_id FROM staff WHERE LOWER(employee_id) = ? OR id = ?', 
    [employeeId.trim().toLowerCase(), employeeId.trim()]
  );

  if (!staff) {
    return { error: `No staff member found with ID: ${employeeId}` };
  }

  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Check if attendance already exists for today
  const existing = await db.get('SELECT id FROM attendance WHERE staff_id = ? AND date = ?', [staff.id, today]);
  
  if (existing) {
    // If they already punched in, we just update them to Present again (or could handle punch-out logic later)
    await db.run('UPDATE attendance SET status = "Present" WHERE id = ?', [existing.id]);
    return { 
      success: true, 
      message: `Welcome back, ${staff.name}! Punched in at ${currentTime}.` 
    };
  } else {
    // Insert new attendance record
    await db.run('INSERT INTO attendance (staff_id, date, status) VALUES (?, ?, "Present")', [staff.id, today]);
    return { 
      success: true, 
      message: `Welcome, ${staff.name}! Punched in successfully at ${currentTime}.` 
    };
  }
}
