import { getDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import FeesForm from '@/components/FeesForm';

export default async function NewFeeEntryPage() {
  const db = await getDb();
  
  // Calculate next Receipt Number
  const currentYear = new Date().getFullYear();
  const { count } = await db.get(`SELECT COUNT(*) as count FROM fees_entries WHERE receipt_number LIKE ?`, [`REC/${currentYear}/%`]) || { count: 0 };
  const nextSequence = String(count + 1).padStart(4, '0');
  const generatedReceiptNumber = `REC/${currentYear}/${nextSequence}`;

  async function saveFeeEntry(formData) {
    'use server';
    const db = await getDb();
    
    const insertYear = new Date().getFullYear();
    const { count: c } = await db.get(`SELECT COUNT(*) as count FROM fees_entries WHERE receipt_number LIKE ?`, [`REC/${insertYear}/%`]) || { count: 0 };
    const finalReceiptNumber = `REC/${insertYear}/${String(c + 1).padStart(4, '0')}`;

    const studentId = parseInt(formData.get('student_id'));
    const date = new Date().toISOString();
    const durationType = formData.get('duration_type');
    const monthsPaid = formData.get('months_paid_json');
    const tuitionAmount = parseFloat(formData.get('tuition_amount') || 0);
    const busAmount = parseFloat(formData.get('bus_amount') || 0);
    const otherAmount = parseFloat(formData.get('other_amount') || 0);
    const lateFeeAmount = parseFloat(formData.get('late_fee_amount') || 0);
    const totalAmount = tuitionAmount + busAmount + otherAmount + lateFeeAmount;
    
    const result = await db.run(`
      INSERT INTO fees_entries (
        receipt_number, student_id, date, duration_type, months_paid,
        tuition_amount, bus_amount, other_amount, late_fee_amount, total_amount, payment_mode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      finalReceiptNumber, studentId, date, durationType, monthsPaid,
      tuitionAmount, busAmount, otherAmount, lateFeeAmount, totalAmount, 'Cash'
    ]);

    redirect(`/fees/receipt/${result.lastID}`);
  }

  // We need to fetch all students to pass to the client component for the search modal
  const students = await db.all('SELECT id, student_id, name, father_name, aadhar_number, class, tuition_fees, fee_duration_type, doc_photo FROM students');
  const masterFees = await db.all('SELECT class_name, tuition_fee, duration_type, late_fee_type, late_fee_amount, due_date_day FROM class_fees_master');

  return (
    <div style={{ maxWidth: '100%', paddingRight: '24px' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Accounting & Finance / Fees Receipt Entry / Add New Entry</div>
          <h1 style={{ margin: '8px 0 0 0' }}>Add New Fee Entry</h1>
        </div>
        <Link href="/fees" className="btn btn-secondary">
          <ChevronLeft size={16} /> Back to Fees
        </Link>
      </div>

      <div className="panel" style={{ padding: '32px' }}>
        <FeesForm generatedReceiptNumber={generatedReceiptNumber} saveFeeAction={saveFeeEntry} students={students} masterFees={masterFees} />
      </div>
    </div>
  );
}
