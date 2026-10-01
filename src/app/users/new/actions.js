'use server';

import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function createUser(formData) {
  const staff_id = formData.get('staff_id') || null;
  const username = formData.get('username');
  const password = formData.get('password');
  const role = formData.get('role');
  const permissions = formData.get('permissions') || null;
  const assigned_classes = formData.get('assigned_classes') || null;
  const approval_required = formData.get('approval_required') === '1' ? 1 : 0;
  const reporting_to = formData.get('reporting_to') || null;

  if (!username || !password || !role) {
    return { error: 'Username, password, and role are required.' };
  }

  const db = await getDb();

  // Check if username already exists
  const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
  if (existingUser) {
    return { error: 'Username already exists. Please choose a different one.' };
  }

  const passwordHash = hashPassword(password);

  try {
    await db.run(
      `INSERT INTO users (staff_id, username, password_hash, role, permissions, assigned_classes, approval_required, reporting_to) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [staff_id, username, passwordHash, role, permissions, assigned_classes, approval_required, reporting_to]
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return { error: 'Database error occurred while creating user.' };
  }

  redirect('/users');
}
