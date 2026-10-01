import { getDb } from '@/lib/db';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/PrintButton';
import { formatDate } from '@/lib/formatDate';

export const dynamic = 'force-dynamic';

export default async function ReceiptPage({ params }) {
  const db = await getDb();
  
  // Use await params to fix Next.js 15+ async params handling
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const payment = await db.get(`
    SELECT fees_entries.*, students.name as student_name, students.roll_number, students.class 
    FROM fees_entries 
    JOIN students ON fees_entries.student_id = students.id
    WHERE fees_entries.id = ?
  `, [id]);

  if (!payment) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Link href="/fees" className="btn" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          <ChevronLeft size={18} /> Back
        </Link>
        <PrintButton />
      </div>

      <div className="panel" style={{ padding: '48px', background: '#fff', color: '#000' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '24px' }}>
          <h1 style={{ color: '#000', margin: '0 0 8px 0' }}>SRMS International School</h1>
          <p style={{ color: '#666', margin: 0 }}>123 Education Lane, Cityville, State 12345</p>
          <p style={{ color: '#666', margin: '4px 0 0 0' }}>Phone: (555) 123-4567 | Email: accounts@srms.edu</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
          <div>
            <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Billed To</h3>
            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>{payment.student_name}</p>
            <p style={{ margin: '0 0 4px 0', color: '#444' }}>Class: {payment.class}</p>
            <p style={{ margin: 0, color: '#444' }}>Roll Number: {payment.roll_number}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '8px' }}>Receipt Details</h3>
            <p style={{ margin: '0 0 4px 0', color: '#444' }}><strong>Receipt No:</strong> {payment.receipt_number}</p>
            <p style={{ margin: '0 0 4px 0', color: '#444' }}><strong>Date:</strong> {formatDate(payment.date)}</p>
            <p style={{ margin: '0', color: '#444' }}><strong>Payment Mode:</strong> {payment.payment_mode}</p>
            <p style={{ margin: 0, color: '#444' }}>
              <strong>Status:</strong> 
              <span style={{ color: 'green', marginLeft: '4px' }}>
                Paid
              </span>
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Fee Duration: {payment.duration_type}</h4>
          <p style={{ margin: 0, color: '#666' }}>{JSON.parse(payment.months_paid).join(', ')}</p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'left', color: '#333' }}>Description</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'right', color: '#333' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Tuition Fees</td>
              <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                ₹{payment.tuition_amount.toFixed(2)}
              </td>
            </tr>
            {payment.bus_amount > 0 && (
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Bus Fees</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  ₹{payment.bus_amount.toFixed(2)}
                </td>
              </tr>
            )}
            {payment.other_amount > 0 && (
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Other Fees</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  ₹{payment.other_amount.toFixed(2)}
                </td>
              </tr>
            )}
            {payment.late_fee_amount > 0 && (
              <tr>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Late Fee Fine</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                  ₹{payment.late_fee_amount.toFixed(2)}
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem' }}>Total Paid:</td>
              <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: '#0d6efd' }}>
                ₹{payment.total_amount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem', marginTop: '60px' }}>
          <p>Thank you for your payment!</p>
          <p style={{ fontStyle: 'italic' }}>This is a computer-generated receipt and does not require a signature.</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .panel, .panel * { visibility: visible; }
          .panel { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; box-shadow: none; border: none; }
          .no-print { display: none !important; }
        }
      `}} />
    </div>
  );
}
