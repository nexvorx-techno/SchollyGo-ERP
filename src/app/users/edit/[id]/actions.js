'use server';

import { getDb } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function updateUser(id, formData) {
  const staff_id = formData.get('staff_id') || null;
  const username = formData.get('username');
  const password = formData.get('password');
  const role = formData.get('role');

  const permissions = formData.get('permissions') || null;
  const assigned_classes = formData.get('assigned_classes') || null;
  const approval_required = formData.get('approval_required') === '1' ? 1 : 0;
  const reporting_to = formData.get('reporting_to') || null;

  if (!role) {
    return { error: 'Role is required.' };
  }

  const db = await getDb();

  try {
    if (password) {
      // Update with new password
      const passwordHash = hashPassword(password);
      await db.run(
        `UPDATE users SET staff_id = ?, role = ?, password_hash = ?, permissions = ?, assigned_classes = ?, approval_required = ?, reporting_to = ? WHERE id = ?`,
        [staff_id, role, passwordHash, permissions, assigned_classes, approval_required, reporting_to, id]
      );
    } else {
      // Update without changing password
      await db.run(
        `UPDATE users SET staff_id = ?, role = ?, permissions = ?, assigned_classes = ?, approval_required = ?, reporting_to = ? WHERE id = ?`,
        [staff_id, role, permissions, assigned_classes, approval_required, reporting_to, id]
      );
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return { error: 'Database error occurred while updating user.' };
  }

  redirect('/users');
}
