import { getDb } from '@/lib/db';
import Link from 'next/link';
import { PlusCircle, UserCheck } from 'lucide-react';
import StaffTableClient from './StaffTableClient';

export const dynamic = 'force-dynamic';

export default async function StaffPage() {
  const db = await getDb();
  const staff = await db.all('SELECT * FROM staff ORDER BY created_at DESC');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Staff Management</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/staff/attendance" className="btn" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <UserCheck size={18} />
            Mark Attendance
          </Link>
          <Link href="/staff/new" className="btn">
            <PlusCircle size={18} />
            Add Staff
          </Link>
        </div>
      </div>

      <div className="panel">
        <StaffTableClient initialStaff={staff} />
      </div>
    </div>
  );
}
