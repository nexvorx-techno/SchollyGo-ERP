import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, studentName, studentDetails, receipts, totalPaid, masterFees } = await request.json();

    if (!email || email === 'N/A') {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    // --- Quarterly Fee Calculation Logic ---
    let quarterlyBaseFee = 0;
    
    if (masterFees) {
      const tuitionFees = masterFees.tuition_fee || 0;
      const busFees = masterFees.bus_fee || 0;
      const otherFees = masterFees.other_fee || 0;
      const baseFee = tuitionFees + busFees + otherFees;

      if (masterFees.duration_type === 'Monthly') {
        quarterlyBaseFee = baseFee * 3;
      } else {
        // If 'Quarterly' or other
        quarterlyBaseFee = baseFee;
      }
    } else {
      // Fallback if no master fee is found
      const tuitionFees = studentDetails?.tuition_fees || 0;
      const busFees = studentDetails?.bus_fees || 0;
      quarterlyBaseFee = (tuitionFees + busFees) * 3;
    }

    let totalBaseFeesPaid = 0;
    if (receipts && Array.isArray(receipts)) {
      totalBaseFeesPaid = receipts.reduce((sum, r) => sum + (r.tuition_amount || 0) + (r.bus_amount || 0) + (r.other_amount || 0), 0);
    } else {
      totalBaseFeesPaid = totalPaid || 0;
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const academicYearStart = currentMonth >= 4 ? currentYear : currentYear - 1;

    const quarters = [
      { id: 'Q1', name: 'Q1 (Apr-Jun)', due: new Date(academicYearStart, 3, 15) }, // April 15
      { id: 'Q2', name: 'Q2 (Jul-Sep)', due: new Date(academicYearStart, 6, 15) }, // July 15
      { id: 'Q3', name: 'Q3 (Oct-Dec)', due: new Date(academicYearStart, 9, 15) }, // October 15
      { id: 'Q4', name: 'Q4 (Jan-Mar)', due: new Date(academicYearStart + 1, 0, 15) } // January 15
    ];

    let pendingBaseFee = 0;
    let pendingLateFee = 0;
    let expectedBaseFee = 0;
    const overdueDetails = [];

    for (const q of quarters) {
      if (today > q.due) {
        expectedBaseFee += quarterlyBaseFee;
        
        let paidTowardsThisQuarter = 0;
        if (totalBaseFeesPaid >= expectedBaseFee) {
            paidTowardsThisQuarter = quarterlyBaseFee;
        } else if (totalBaseFeesPaid > (expectedBaseFee - quarterlyBaseFee)) {
            paidTowardsThisQuarter = totalBaseFeesPaid - (expectedBaseFee - quarterlyBaseFee);
        }
        
        const unpaidForThisQuarter = quarterlyBaseFee - paidTowardsThisQuarter;
        
        if (unpaidForThisQuarter > 0) {
            const diffTime = Math.abs(today - q.due);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            const lateFeeForQ = diffDays * 10; // ₹10 per day late fee
            
            pendingBaseFee += unpaidForThisQuarter;
            pendingLateFee += lateFeeForQ;
            
            overdueDetails.push({
                name: q.name,
                unpaidBase: unpaidForThisQuarter,
                lateFee: lateFeeForQ,
                daysLate: diffDays
            });
        }
      }
    }

    const totalPendingBalance = pendingBaseFee + pendingLateFee;

    // --- HTML Generation ---
    const recentReceipts = receipts ? receipts.slice(0, 5) : [];
    let receiptsHtml = '';
    
    if (recentReceipts.length > 0) {
      receiptsHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left;">
              <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Date</th>
              <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Receipt No</th>
              <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${recentReceipts.map(r => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${new Date(r.date).toLocaleDateString()}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #f97316;">${r.receipt_number}</td>
                <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #15803d; font-weight: bold;">₹${r.total_amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      receiptsHtml = '<p style="color: #64748b; font-size: 14px; margin-top: 16px;">No recent transactions found.</p>';
    }

    let overdueHtml = '';
    if (overdueDetails.length > 0) {
      overdueHtml = `
        <h3 style="margin-top: 32px; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; color: #b91c1c;">Overdue Breakdown</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px;">
          <thead>
            <tr style="background-color: #fef2f2; text-align: left;">
              <th style="padding: 10px; border-bottom: 2px solid #fecaca; color: #991b1b;">Quarter</th>
              <th style="padding: 10px; border-bottom: 2px solid #fecaca; color: #991b1b; text-align: right;">Pending Base</th>
              <th style="padding: 10px; border-bottom: 2px solid #fecaca; color: #991b1b; text-align: right;">Late Fee (₹10/day)</th>
            </tr>
          </thead>
          <tbody>
            ${overdueDetails.map(d => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #fee2e2;">${d.name} <br/><span style="font-size:11px; color:#ef4444;">(${d.daysLate} days late)</span></td>
                <td style="padding: 10px; border-bottom: 1px solid #fee2e2; text-align: right;">₹${d.unpaidBase.toFixed(2)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #fee2e2; text-align: right; color: #b91c1c; font-weight: bold;">₹${d.lateFee.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: parseInt(process.env.SMTP_PORT || '465') === 465, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials missing. Email not sent.");
      return NextResponse.json({ error: 'SMTP credentials are not configured on the server.' }, { status: 500 });
    }

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: `Fees Statement & Reminder - ${studentName}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; color: #334155;">
          
          <!-- Header with Logo -->
          <div style="background-color: #161822; padding: 24px; text-align: center; color: white;">
            <div style="font-size: 24px; font-weight: 700; letter-spacing: 0.5px; color: #FAC52C;">SchollyGO ERP</div>
            <div style="font-size: 14px; opacity: 0.8; margin-top: 4px; color: #94a3b8;">Enterprise School Management System</div>
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            <h2 style="color: #d97706; margin-top: 0;">Fees Statement & Reminder</h2>
            <p>Dear Parent/Guardian of <strong>${studentName}</strong>,</p>
            <p>This is a summary of the current fee status for your ward for the ongoing academic session.</p>
            
            <!-- Summary Box Using Table for Email Client Compatibility -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin: 24px 0;">
              <tr>
                <td style="padding: 16px; text-align: left; width: 33%;">
                  <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Total Expected</div>
                  <div style="font-size: 18px; font-weight: 700; color: #334155;">₹${expectedBaseFee.toFixed(2)}</div>
                </td>
                <td style="padding: 16px; text-align: center; width: 33%; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                  <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Total Paid</div>
                  <div style="font-size: 18px; font-weight: 700; color: #15803d;">₹${(totalPaid || 0).toFixed(2)}</div>
                </td>
                <td style="padding: 16px; text-align: right; width: 33%;">
                  <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Pending Balance</div>
                  <div style="font-size: 18px; font-weight: 700; color: #b91c1c;">₹${totalPendingBalance.toFixed(2)}</div>
                </td>
              </tr>
            </table>

            ${overdueHtml}

            <!-- Ledger Table -->
            <h3 style="margin-top: 32px; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Recent Transactions</h3>
            ${receiptsHtml}

            <!-- Action Button -->
            <div style="text-align: center; margin-top: 40px; margin-bottom: 24px;">
              <p style="margin-bottom: 16px; font-size: 14px;">Please clear the pending balance at your earliest convenience.</p>
              <a href="http://localhost:3000/pay?student=${studentDetails?.id || ''}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Pay Online Now</a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              If you have already made this payment, please disregard this email or contact the administration office.<br/>
              <strong>Accounting & Finance Department</strong>
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Notification sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send notification.' }, { status: 500 });
  }
}
