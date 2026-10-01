import { NextResponse } from 'next/server';
import crypto from 'crypto';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';

async function getDb() {
  return open({
    filename: path.join(process.cwd(), 'srms.db'),
    driver: sqlite3.Database
  });
}

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId, amountPaid, lateFeePaid, tuitionPaid } = await request.json();

    const secret = process.env.RAZORPAY_KEY_SECRET;

    // Verify signature
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Payment is authentic, record it in the database
    const db = await getDb();

    // Generate a receipt number
    const lastReceipt = await db.get('SELECT receipt_number FROM fees_entries ORDER BY id DESC LIMIT 1');
    let receiptNumber = 'REC-1001';
    if (lastReceipt && lastReceipt.receipt_number) {
      const parts = lastReceipt.receipt_number.split('-');
      if (parts.length === 2 && !isNaN(parts[1])) {
        receiptNumber = `REC-${parseInt(parts[1]) + 1}`;
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const monthStr = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const monthsPaidJson = JSON.stringify([{ month: monthStr, amount: amountPaid }]);

    // Insert into fees_entries
    const stmt = await db.prepare(`
      INSERT INTO fees_entries (
        student_id, receipt_number, date, 
        duration_type, months_paid,
        tuition_amount, bus_amount, other_amount, late_fee_amount, total_amount, payment_mode
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)
    `);

    await stmt.run([
      studentId,
      receiptNumber,
      today,
      'Quarterly',
      monthsPaidJson,
      tuitionPaid, // portion for base fees
      lateFeePaid, // portion for late fees
      amountPaid,
      'Online Payment (Razorpay)'
    ]);
    await stmt.finalize();

    // --- Generate PDF Receipt and Send Email ---
    const student = await db.get('SELECT * FROM students WHERE id = ?', [studentId]);
    if (student && (student.father_email || student.mother_email || student.email)) {
      const emailTo = student.father_email || student.mother_email || student.email;
      
      const generatePDF = () => {
        return new Promise((resolve, reject) => {
          const doc = new PDFDocument({ margin: 50 });
          let buffers = [];
          doc.on('data', buffers.push.bind(buffers));
          doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
          });
          doc.on('error', reject);

          // Header
          doc.fontSize(24).font('Helvetica-Bold').text('SchollyGO ERP', { align: 'center' });
          doc.fontSize(12).font('Helvetica').text('Official Fee Receipt', { align: 'center' });
          doc.moveDown(2);

          // Receipt Info
          doc.fontSize(12).text(`Receipt No: ${receiptNumber}`);
          doc.text(`Date: ${today}`);
          doc.text(`Transaction ID: ${razorpay_payment_id}`);
          doc.moveDown(1);

          // Student Info
          doc.text(`Student Name: ${student.name}`);
          doc.text(`Student ID: ${student.student_id}`);
          doc.text(`Class/Section: ${student.class} ${student.section || ''}`);
          doc.moveDown(2);

          // Payment Breakdown
          doc.fontSize(14).font('Helvetica-Bold').text('Payment Details');
          doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
          doc.moveDown(1);
          
          doc.fontSize(12).font('Helvetica');
          doc.text(`Base Fees Paid: Rs ${tuitionPaid.toFixed(2)}`);
          doc.text(`Late Fees Paid: Rs ${lateFeePaid.toFixed(2)}`);
          doc.moveDown(1);
          doc.fontSize(14).font('Helvetica-Bold').text(`Total Amount Paid: Rs ${amountPaid.toFixed(2)}`);
          
          doc.moveDown(4);
          doc.fontSize(10).font('Helvetica-Oblique').text('This is a computer generated receipt and requires no signature.', { align: 'center' });

          doc.end();
        });
      };

      try {
        const pdfBuffer = await generatePDF();

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '465'),
          secure: parseInt(process.env.SMTP_PORT || '465') === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const mailOptions = {
          from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
          to: emailTo,
          subject: `Payment Successful - Receipt ${receiptNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #15803d;">Payment Successful!</h2>
              <p>Dear Parent of <strong>${student.name}</strong>,</p>
              <p>We have successfully received your online payment of <strong>₹${amountPaid.toFixed(2)}</strong>.</p>
              <p>Your official fee receipt (<strong>${receiptNumber}</strong>) has been generated and is attached to this email as a PDF.</p>
              <p>Thank you for your prompt payment.</p>
              <br/>
              <p>Best regards,<br/>Administration Office</p>
            </div>
          `,
          attachments: [
            {
              filename: `Receipt_${receiptNumber}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        };

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          await transporter.sendMail(mailOptions);
        }
      } catch (pdfErr) {
        console.error('Error generating/sending PDF receipt:', pdfErr);
        // We still return success since payment was recorded
      }
    }

    return NextResponse.json({ success: true, receiptNumber });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
