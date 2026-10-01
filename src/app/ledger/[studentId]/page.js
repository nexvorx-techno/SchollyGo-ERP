import { getDb } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Printer, Download } from 'lucide-react';
import StudentLedgerClient from './StudentLedgerClient';
import { formatDate } from '@/lib/formatDate';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  return {
    title: `Ledger - Student ${resolvedParams.studentId} | SchollyGO ERP`,
  };
}

export default async function IndividualLedgerPage({ params }) {
  const resolvedParams = await params;
  const studentId = resolvedParams.studentId;
  const db = await getDb();

  // Fetch Student
  const student = await db.get(
    'SELECT * FROM students WHERE id = ?',
    [studentId]
  );

  if (!student) {
    notFound();
  }

  // Fetch Payment History (Receipts)
  const receipts = await db.all(
    'SELECT * FROM fees_entries WHERE student_id = ? ORDER BY id DESC',
    [studentId]
  );

  // Calculate Totals
  const totalPaid = receipts.reduce((sum, r) => sum + r.total_amount, 0);
  const totalLateFees = receipts.reduce((sum, r) => sum + r.late_fee_amount, 0);

  // Fetch Master Fees for this Class
  const masterFees = await db.get(
    'SELECT * FROM class_fees_master WHERE class_name = ?',
    [student.class]
  );

  return (
    <div>
      <div className="page-header" style={{ '@media print': { display: 'none' } }}>
        <div>
          <div className="breadcrumb">Accounting & Finance / Student Ledger / View Ledger</div>
          <h1 className="page-title">Ledger: {student.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <StudentLedgerClient student={student} receipts={receipts} totalPaid={totalPaid} masterFees={masterFees} />
          <Link href="/ledger" className="btn btn-secondary">
            <ChevronLeft size={16} /> Back to List
          </Link>
        </div>
      </div>

      <div className="panel print-area" id="ledger-print-area" style={{ padding: '32px' }}>
        
        {/* Ledger Header / Student Info */}
        <div style={{ borderBottom: '2px solid var(--border)', paddingBottom: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>STATEMENT OF ACCOUNT</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
              <p><strong>Student Name:</strong> {student.name}</p>
              <p><strong>Student ID:</strong> {student.student_id}</p>
              <p><strong>Class & Section:</strong> {student.class} - {student.section}</p>
              <p><strong>Father's Name:</strong> {student.father_name}</p>
            </div>
          </div>
          <div style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
            <p><strong>Date Printed:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Tuition Fees:</strong> ₹{student.tuition_fees?.toFixed(2) || '0.00'}</p>
            <p><strong>Bus Fees:</strong> ₹{student.bus_fees?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '8px' }}>
            <div style={{ color: '#166534', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Total Amount Paid</div>
            <div style={{ color: '#15803d', fontSize: '28px', fontWeight: '700' }}>₹{totalPaid.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '20px', borderRadius: '8px' }}>
            <div style={{ color: '#991b1b', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Total Late Fees Paid</div>
            <div style={{ color: '#b91c1c', fontSize: '28px', fontWeight: '700' }}>₹{totalLateFees.toFixed(2)}</div>
          </div>
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px' }}>
            <div style={{ color: '#334155', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Total Transactions</div>
            <div style={{ color: '#0f172a', fontSize: '28px', fontWeight: '700' }}>{receipts.length}</div>
          </div>
        </div>

        {/* Transactions Table */}
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>Transaction History</h3>
        
        {receipts.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Receipt No.</th>
                  <th>Particulars / Months Paid</th>
                  <th style={{ textAlign: 'right' }}>Tuition</th>
                  <th style={{ textAlign: 'right' }}>Bus</th>
                  <th style={{ textAlign: 'right' }}>Other</th>
                  <th style={{ textAlign: 'right' }}>Late Fee</th>
                  <th style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Credit</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map(receipt => {
                  // Parse months paid if it's JSON array
                  let monthsDisplay = receipt.months_paid;
                  try {
                    const parsed = JSON.parse(receipt.months_paid);
                    if (Array.isArray(parsed)) {
                      monthsDisplay = parsed.join(', ');
                    }
                  } catch (e) {
                    // Ignore, leave as is
                  }
                  
                  return (
                    <tr key={receipt.id}>
                      <td>{formatDate(receipt.date)}</td>
                      <td style={{ fontWeight: '500', color: 'var(--brand-primary)' }}>{receipt.receipt_number}</td>
                      <td>Fee Payment - {monthsDisplay || receipt.duration_type}</td>
                      <td style={{ textAlign: 'right' }}>₹{receipt.tuition_amount.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>₹{receipt.bus_amount.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>₹{receipt.other_amount.toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>₹{receipt.late_fee_amount.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#15803d' }}>
                        + ₹{receipt.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan="3" style={{ textAlign: 'right' }}>Grand Total:</td>
                  <td style={{ textAlign: 'right' }}>₹{receipts.reduce((sum, r) => sum + r.tuition_amount, 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>₹{receipts.reduce((sum, r) => sum + r.bus_amount, 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>₹{receipts.reduce((sum, r) => sum + r.other_amount, 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>₹{receipts.reduce((sum, r) => sum + r.late_fee_amount, 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', color: '#15803d' }}>₹{totalPaid.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', margin: 0 }}>No payment transactions found for this student.</p>
          </div>
        )}

      </div>
    </div>
  );
}
