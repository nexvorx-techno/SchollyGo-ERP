import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const className = searchParams.get('class');

  if (!className) {
    return NextResponse.json({ error: 'Class is required' }, { status: 400 });
  }

  const db = await getDb();
  
  const masterFee = await db.get(`
    SELECT tuition_fee, bus_fee, other_fee, duration_type
    FROM class_fees_master 
    WHERE class_name = ?
  `, [className]);

  if (!masterFee) {
    return NextResponse.json({ tuition_fee: 0, bus_fee: 0, other_fee: 0, duration_type: 'Monthly' });
  }

  return NextResponse.json(masterFee);
}
