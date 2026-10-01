import { getDb } from '@/lib/db';
import Link from 'next/link';
import { Plus, Shield } from 'lucide-react';
import UsersTableClient from './UsersTableClient';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const db = await getDb();
  
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');
  let isSuperAdmin = false;
  if (session?.value) {
    const masterUsername = process.env.ADMIN_USERNAME || 'admin';
    if (session.value === masterUsername) {
      isSuperAdmin = true;
    } else {
      const currentUser = await db.get('SELECT role FROM users WHERE username = ?', [session.value]);
      if (currentUser?.role === 'Super Admin') {
        isSuperAdmin = true;
      }
    }
  }

  // Fetch users with their corresponding staff name if linked
  const users = await db.all(`
    SELECT users.*, staff.name as staff_name, staff.role as staff_role
    FROM users
    LEFT JOIN staff ON users.staff_id = staff.id
    ORDER BY users.created_at DESC
  `);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="breadcrumb">System / User Management</div>
          <h1 className="page-title" style={{ margin: 0 }}>System Users</h1>
        </div>
        {isSuperAdmin && (
          <Link href="/users/new" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Plus size={16} /> Add New User
          </Link>
        )}
      </div>

      <div className="panel">
        <h3 style={{ padding: '24px 24px 0 24px', margin: 0 }}>System Users</h3>
        {users.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Shield size={48} style={{ margin: '0 auto 16px auto', opacity: 0.2 }} />
            <p>No system users found. Currently using default credentials.</p>
            {isSuperAdmin && (
              <Link href="/users/new" className="btn" style={{ marginTop: '16px', display: 'inline-block', textDecoration: 'none' }}>
                Create First User
              </Link>
            )}
          </div>
        ) : (
          <UsersTableClient initialUsers={users} isSuperAdmin={isSuperAdmin} />
        )}
      </div>
    </div>
  );
}
