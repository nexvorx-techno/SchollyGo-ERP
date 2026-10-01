import { getDb } from '@/lib/db';
import FeesRegisterClient from './FeesRegisterClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Fees Register | SchollyGO ERP',
};

export default async function FeesRegisterPage() {
  const db = await getDb();
  
  // Fetch all students
  const students = await db.all('SELECT id, student_id, admission_number, name, class, primary_contact, father_mobile, mother_mobile FROM students ORDER BY class, name');
  
  // Fetch all receipts
  const receipts = await db.all('SELECT student_id, total_amount, tuition_amount, months_paid, date FROM fees_entries');
  
  // Get current date
  const today = new Date();
  const currentMonthIdx = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Simple heuristic for "Pending Fees" vs "Paid"
  // For the purpose of the register, we'll see if the student has paid anything for the current month.
  // Actually, we can check if they have ANY receipts in the current month. If yes -> Paid. If no -> Pending.
  // Alternatively, just sum total paid and pass it to the client. The client can use a more precise logic if needed.
  // Let's do it on the server:
  
  // Fetch class fees master
  const masterFees = await db.all('SELECT class_name, tuition_fee, duration_type FROM class_fees_master');

  const ALL_MONTHS = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
  const ALL_QUARTERS = ['Q1 (Apr-Jun)', 'Q2 (Jul-Sep)', 'Q3 (Oct-Dec)', 'Q4 (Jan-Mar)'];

  const studentData = students.map(student => {
    const studentReceipts = receipts.filter(r => r.student_id === student.id);
    const totalPaidToDate = studentReceipts.reduce((sum, r) => sum + r.total_amount, 0);
    
    // Find expected fees for this class
    const masterFee = masterFees.find(m => m.class_name === student.class);
    const baseTuition = masterFee ? (masterFee.tuition_fee || 0) : 0;
    const durationType = masterFee ? (masterFee.duration_type || 'Monthly') : 'Monthly';
    
    let totalExpectedTuition = 0;
    let totalPeriods = [];
    
    if (durationType === 'Monthly') {
      totalExpectedTuition = baseTuition * 12;
      totalPeriods = ALL_MONTHS;
    } else if (durationType === 'Quarterly') {
      totalExpectedTuition = baseTuition * 4;
      totalPeriods = ALL_QUARTERS;
    } else {
      totalExpectedTuition = baseTuition; // Yearly
      totalPeriods = ['Yearly'];
    }
    
    // Add any manually collected bus/other fees to the expected amount?
    // A simpler heuristic: the balance is the total expected base tuition minus the total paid (which includes tuition, bus, other).
    // Wait, if they pay bus fees, totalPaid goes up, which would incorrectly reduce tuition balance.
    // Instead, let's track just the expected total as: (Base Tuition * periods)
    // Actually, let's calculate exact tuition paid vs expected tuition to avoid bus fee pollution:
    const totalTuitionPaid = studentReceipts.reduce((sum, r) => sum + (r.tuition_amount || 0), 0);
    let balance = totalExpectedTuition - totalTuitionPaid;
    
    // If we don't have tuition_amount in receipts (old entries), fallback to total_amount
    if (totalTuitionPaid === 0 && totalPaidToDate > 0) {
       balance = totalExpectedTuition - totalPaidToDate;
    }
    
    if (balance < 0) balance = 0;
    
    // Collect all paid periods from JSON
    let paidPeriods = [];
    studentReceipts.forEach(r => {
       try {
          if (r.months_paid) {
            const periods = JSON.parse(r.months_paid);
            if (Array.isArray(periods)) {
               periods.forEach(p => { if (!paidPeriods.includes(p)) paidPeriods.push(p); });
            }
          }
       } catch (e) {}
    });
    
    const unpaidPeriods = totalPeriods.filter(p => !paidPeriods.includes(p));
    
    let status = 'Pending Fees';
    if (balance <= 0) {
       status = 'Fees Paid';
    } else if (totalPaidToDate > 0 && balance > 0) {
       status = 'Partial Paid';
    } else if (totalPaidToDate === 0) {
       status = 'Pending Fees';
    }
    
    return {
      id: student.id,
      student_id: student.student_id,
      admission_number: student.admission_number,
      name: student.name,
      class: student.class,
      primary_contact: student.primary_contact,
      father_mobile: student.father_mobile,
      mother_mobile: student.mother_mobile,
      total_paid: totalPaidToDate,
      balance: balance,
      unpaid_periods: unpaidPeriods,
      status: status
    };
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Accounting & Finance / Fees Register</div>
          <h1 className="page-title">Fees Register</h1>
        </div>
      </div>
      
      <div className="panel">
        <FeesRegisterClient initialData={studentData} />
      </div>
    </div>
  );
}
