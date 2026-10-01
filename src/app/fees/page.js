import { getDb } from '@/lib/db';
import Link from 'next/link';
import { PlusCircle, Printer } from 'lucide-react';
import PrintButton from '@/components/PrintButton';
import DeleteFeeButton from '@/components/DeleteFeeButton';
import { formatDate } from '@/lib/formatDate';

export const dynamic = 'force-dynamic';

export default async function FeesPage() {
  const db = await getDb();
  
  // Get recent fee payments
  const payments = await db.all(`
    SELECT fees_entries.*, students.name as student_name, students.roll_number, students.class
    FROM fees_entries
    JOIN students ON fees_entries.student_id = students.id
    ORDER BY fees_entries.id DESC
    LIMIT 50
  `);

  return (
    <div style={{ maxWidth: '100%', paddingRight: '24px' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Accounting & Finance / Fees Receipt Entry</div>
          <h1 style={{ margin: '8px 0 0 0' }}>Receive Fees</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <input 
            type="text" 
            placeholder="Search by Receipt or Name" 
            style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '4px', width: '250px' }}
          />
          <Link href="/fees/new" className="btn">
            <PlusCircle size={18} />
            Add New Entry
          </Link>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ padding: '24px 24px 0 24px', margin: 0 }}>Recent Entries</h3>
        {payments.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No fee payments found.
          </div>
        ) : (
          <table style={{ marginTop: '16px', width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', background: '#f9f9fa' }}>
                <th style={{ padding: '12px 24px' }}>Receipt No</th>
                <th style={{ padding: '12px 24px' }}>Date</th>
                <th style={{ padding: '12px 24px' }}>Student</th>
                <th style={{ padding: '12px 24px' }}>Class</th>
                <th style={{ padding: '12px 24px' }}>Duration</th>
                <th style={{ padding: '12px 24px' }}>Total Amount</th>
                <th style={{ padding: '12px 24px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 24px', fontWeight: 600, color: 'var(--accent)' }}>{payment.receipt_number}</td>
                  <td style={{ padding: '12px 24px' }}>{formatDate(payment.date)}</td>
                  <td style={{ padding: '12px 24px', fontWeight: 500 }}>
                    {payment.student_name} <br/>
                    <small style={{ color: 'var(--text-secondary)' }}>Roll: {payment.roll_number}</small>
                  </td>
                  <td style={{ padding: '12px 24px' }}>{payment.class}</td>
                  <td style={{ padding: '12px 24px' }}>{payment.duration_type}</td>
                  <td style={{ padding: '12px 24px', fontWeight: 600 }}>₹{payment.total_amount.toFixed(2)}</td>
                  <td style={{ padding: '12px 24px', display: 'flex', gap: '8px' }}>
                    <PrintButton receiptId={payment.id} />
                    <DeleteFeeButton receiptId={payment.id} receiptNumber={payment.receipt_number} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
