import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function getDb() {
  return open({
    filename: path.join(process.cwd(), 'srms.db'),
    driver: sqlite3.Database
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    const db = await getDb();

    // Fetch Fees Income
    const feesQuery = `
      SELECT 
        f.id,
        f.date,
        'Income' as type,
        'Fees Collection' as category,
        'Receipt No: ' || f.receipt_number || ' (' || s.name || ')' as description,
        f.payment_mode as mode,
        f.total_amount as amount
      FROM fees_entries f
      LEFT JOIN students s ON f.student_id = s.id
      WHERE f.date >= ? AND f.date <= ?
    `;
    const feesData = await db.all(feesQuery, [startDate, endDate]);

    // Fetch Transactions (Income & Expenses)
    // Note: transaction_date is DATETIME (e.g., 2026-09-07 14:00:00)
    // We use DATE(transaction_date) to compare with YYYY-MM-DD
    const txQuery = `
      SELECT 
        id,
        DATE(transaction_date) as date,
        type,
        category,
        description,
        'Bank/Cash' as mode,
        amount
      FROM transactions
      WHERE DATE(transaction_date) >= ? AND DATE(transaction_date) <= ?
    `;
    const txData = await db.all(txQuery, [startDate, endDate]);

    // Merge and sort by date descending
    const mergedData = [...feesData, ...txData].sort((a, b) => {
      if (a.date === b.date) {
        return b.id - a.id;
      }
      return new Date(b.date) - new Date(a.date);
    });

    let totalIncome = 0;
    let totalExpense = 0;

    mergedData.forEach(item => {
      if (item.type === 'Income') {
        totalIncome += item.amount;
      } else if (item.type === 'Expense') {
        totalExpense += item.amount;
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: mergedData,
      summary: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense
      }
    });

  } catch (error) {
    console.error('Error fetching day book:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
