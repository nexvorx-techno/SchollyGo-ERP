'use server';
import nodemailer from 'nodemailer';
import { getDb } from '@/lib/db';
import dotenv from 'dotenv';
dotenv.config();

export async function bulkSendReminders(studentIds, method) {
  console.log(`Sending reminders to ${studentIds.length} students via ${method}`);
  
  let successCount = 0;
  
  if (method === 'Email' || method === 'Both') {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    const db = await getDb();
    
    for (const id of studentIds) {
      const student = await db.get(`
        SELECT s.*, m.tuition_fee, m.duration_type
        FROM students s 
        LEFT JOIN class_fees_master m ON s.class = m.class_name 
        WHERE s.id = ?
      `, [id]);
      if (!student) continue;
      
      let targetEmail = student.father_email || student.mother_email;
      if (student.primary_contact === 'MOTHER' && student.mother_email) {
        targetEmail = student.mother_email;
      } else if (student.primary_contact === 'FATHER' && student.father_email) {
        targetEmail = student.father_email;
      }
      
      if (!targetEmail) {
         console.log(`No email found for student ${student.name}`);
         continue;
      }
      
      // Calculate balance and unpaid periods
      const receipts = await db.all('SELECT total_amount, tuition_amount, months_paid FROM fees_entries WHERE student_id = ?', [student.id]);
      const totalTuitionPaid = receipts.reduce((sum, r) => sum + (r.tuition_amount || 0), 0);
      const totalPaidToDate = receipts.reduce((sum, r) => sum + (r.total_amount || 0), 0);
      
      const baseTuition = student.tuition_fee || 0;
      const durationType = student.duration_type || 'Monthly';
      let totalExpectedTuition = 0;
      let totalPeriods = [];
      const ALL_MONTHS = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
      const ALL_QUARTERS = ['Q1 (Apr-Jun)', 'Q2 (Jul-Sep)', 'Q3 (Oct-Dec)', 'Q4 (Jan-Mar)'];
      
      if (durationType === 'Monthly') {
        totalExpectedTuition = baseTuition * 12;
        totalPeriods = ALL_MONTHS;
      } else if (durationType === 'Quarterly') {
        totalExpectedTuition = baseTuition * 4;
        totalPeriods = ALL_QUARTERS;
      } else {
        totalExpectedTuition = baseTuition;
        totalPeriods = ['Yearly'];
      }
      
      let balance = totalExpectedTuition - totalTuitionPaid;
      if (totalTuitionPaid === 0 && totalPaidToDate > 0) balance = totalExpectedTuition - totalPaidToDate;
      if (balance < 0) balance = 0;
      
      let paidPeriods = [];
      receipts.forEach(r => {
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
      const unpaidString = unpaidPeriods.length > 0 ? unpaidPeriods.join(', ') : 'None';
      
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
          to: targetEmail,
          subject: 'Pending Fees Reminder - SchollyGO ERP',
          text: `Dear Parent,\n\nThis is a gentle reminder that the fees for your ward ${student.name} (Adm No: ${student.admission_number || student.student_id}, Class: ${student.class} ${student.section ? '- ' + student.section : ''}) are currently pending.\n\nOutstanding Balance: ₹${balance.toFixed(2)}\nUnpaid Periods: ${unpaidString}\n\nPlease clear the dues at your earliest convenience to avoid any late fees.\n\nThank you,\nSchool Administration`,
        });
        console.log(`Email sent for ${student.name} to ${targetEmail}`);
        successCount++;
      } catch (err) {
        console.error(`Failed to send email for ${student.name}:`, err);
      }
    }
  }
  
  // For WhatsApp, we just simulate for now
  if (method === 'WhatsApp' || method === 'Both') {
    await new Promise(resolve => setTimeout(resolve, 500));
    successCount = studentIds.length; // Assuming WhatsApp succeeds for all selected
  }
  
  return { success: true, count: method === 'Email' ? successCount : studentIds.length, method };
}
