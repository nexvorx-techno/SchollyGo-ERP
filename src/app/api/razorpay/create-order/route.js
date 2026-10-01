import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Setup database connection
async function getDb() {
  return open({
    filename: path.join(process.cwd(), 'srms.db'),
    driver: sqlite3.Database
  });
}

  export async function POST(request) {
  try {
    const { studentId, customAmount } = await request.json();

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
    }

    const db = await getDb();

    // 1. Fetch Student Details
    const student = await db.get('SELECT * FROM students WHERE id = ?', [studentId]);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 2. Fetch Receipts & Master Fees
    const receipts = await db.all('SELECT * FROM fees_entries WHERE student_id = ?', [studentId]);
    const masterFees = await db.get('SELECT * FROM class_fees_master WHERE class_name = ?', [student.class]);
    
    // 3. Calculate Pending Balance
    const totalPaid = receipts.reduce((sum, r) => sum + r.total_amount, 0);
    
    let quarterlyBaseFee = 0;
    if (masterFees) {
      const tuitionFees = masterFees.tuition_fee || 0;
      const busFees = masterFees.bus_fee || 0;
      const otherFees = masterFees.other_fee || 0;
      const baseFee = tuitionFees + busFees + otherFees;

      if (masterFees.duration_type === 'Monthly') {
        quarterlyBaseFee = baseFee * 3;
      } else {
        quarterlyBaseFee = baseFee;
      }
    } else {
      const tuitionFees = student?.tuition_fees || 0;
      const busFees = student?.bus_fees || 0;
      quarterlyBaseFee = (tuitionFees + busFees) * 3;
    }

    let totalBaseFeesPaid = receipts.reduce((sum, r) => sum + (r.tuition_amount || 0) + (r.bus_amount || 0) + (r.other_amount || 0), 0) || totalPaid;

    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const academicYearStart = currentMonth >= 4 ? currentYear : currentYear - 1;

    const quarters = [
      { due: new Date(academicYearStart, 3, 15) },
      { due: new Date(academicYearStart, 6, 15) },
      { due: new Date(academicYearStart, 9, 15) },
      { due: new Date(academicYearStart + 1, 0, 15) }
    ];

    let expectedBaseFee = 0;
    let pendingBaseFee = 0;
    let pendingLateFee = 0;

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
            const lateFeeForQ = diffDays * 10;
            
            pendingBaseFee += unpaidForThisQuarter;
            pendingLateFee += lateFeeForQ;
        }
      }
    }

    const totalPendingBalance = pendingBaseFee + pendingLateFee;

    if (totalPendingBalance <= 0) {
      return NextResponse.json({ error: 'No pending dues to pay.' }, { status: 400 });
    }

    let orderAmount = totalPendingBalance;
    if (customAmount && !isNaN(customAmount) && Number(customAmount) > 0) {
      if (Number(customAmount) > totalPendingBalance) {
         return NextResponse.json({ error: 'Payment amount cannot exceed pending balance.' }, { status: 400 });
      }
      orderAmount = Number(customAmount);
    }

    // 4. Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // 5. Create Order
    const options = {
      amount: Math.round(orderAmount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `rcpt_${studentId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      key_id: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      studentDetails: {
        name: student.name,
        email: student.email || '',
        contact: student.contact_number || '',
        student_id: student.student_id,
        class: student.class
      },
      breakdown: {
        pendingBaseFee,
        pendingLateFee,
        totalPendingBalance
      }
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
