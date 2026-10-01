import { getDb } from '@/lib/db';
import { Users, CreditCard, UserCheck, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const db = await getDb();
  
  const { totalStudents } = await db.get('SELECT COUNT(*) as totalStudents FROM students') || { totalStudents: 0 };
  const { totalStaff } = await db.get('SELECT COUNT(*) as totalStaff FROM staff') || { totalStaff: 0 };
  const { totalRevenue } = await db.get('SELECT SUM(amount_paid) as totalRevenue FROM fees') || { totalRevenue: 0 };
  const { pendingFees } = await db.get('SELECT SUM(amount_due - amount_paid) as pendingFees FROM fees WHERE status = "Pending"') || { pendingFees: 0 };
  
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home / Dashboard</div>
          <h1 className="page-title">Executive Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary">Generate Report</button>
          <button className="btn">Settings</button>
        </div>
      </div>
      
      <div className="metric-grid">
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="metric-title">Total Enrolled Students</div>
              <div className="metric-value">{totalStudents}</div>
            </div>
            <Users size={20} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> +2.4% from last month
          </div>
        </div>
        
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="metric-title">Active Staff Members</div>
              <div className="metric-value">{totalStaff}</div>
            </div>
            <UserCheck size={20} color="var(--success)" />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Across all departments
          </div>
        </div>
        
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="metric-title">Total Revenue (MTD)</div>
              <div className="metric-value">₹{(totalRevenue || 0).toLocaleString()}</div>
            </div>
            <CreditCard size={20} color="var(--accent)" />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> +12.5% from last month
          </div>
        </div>

        <div className="metric-card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="metric-title">Outstanding Dues</div>
              <div className="metric-value">₹{(pendingFees || 0).toLocaleString()}</div>
            </div>
            <AlertCircle size={20} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '8px' }}>
            Requires immediate action
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>Recent Activity Feed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ background: '#e3fcef', color: 'var(--success)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={14} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '13px' }}>Fee Payment Received</p>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>John Doe paid ₹500.00 for Term 1 Tuition.</p>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}><Clock size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> 2 hours ago</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ background: '#deebff', color: 'var(--accent)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={14} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '13px' }}>New Student Enrolled</p>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>Jane Smith was admitted to Class 10-A.</p>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}><Clock size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> 5 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/students/new" className="btn btn-secondary" style={{ justifyContent: 'center' }}>Admit New Student</Link>
            <Link href="/fees/collect" className="btn" style={{ justifyContent: 'center' }}>Record Fee Payment</Link>
            <Link href="/staff/attendance" className="btn btn-secondary" style={{ justifyContent: 'center' }}>Process Daily Attendance</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
