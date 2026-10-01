import { getDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CollectFeePage() {
  const db = await getDb();
  const students = await db.all('SELECT id, name, roll_number, class FROM students ORDER BY name ASC');

  async function collectFee(formData) {
    'use server';
    const db = await getDb();
    
    const studentId = formData.get('student_id');
    const amount = parseFloat(formData.get('amount'));
    const description = formData.get('description');
    const status = formData.get('status') || 'Paid';
    
    const result = await db.run(
      'INSERT INTO fees (student_id, amount, description, status) VALUES (?, ?, ?, ?)',
      [studentId, amount, description, status]
    );
    
    // Redirect to the receipt for this payment
    redirect(`/fees/receipt/${result.lastID}`);
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Collect Fee</h2>
        <Link href="/fees" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Back to Fees</Link>
      </div>

      <div className="panel" style={{ padding: '32px' }}>
        <form action={collectFee} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="student_id" style={{ fontWeight: 500 }}>Select Student</label>
            <select id="student_id" name="student_id" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: '#fff' }}>
              <option value="">-- Select a student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.class} - Roll: {s.roll_number})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <label htmlFor="amount" style={{ fontWeight: 500 }}>Amount (₹)</label>
              <input type="number" id="amount" name="amount" required step="0.01" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <label htmlFor="status" style={{ fontWeight: 500 }}>Status</label>
              <select id="status" name="status" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: '#fff' }}>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="description" style={{ fontWeight: 500 }}>Description (e.g. Tuition Term 1)</label>
            <input type="text" id="description" name="description" required style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
          </div>

          <button type="submit" className="btn" style={{ marginTop: '16px', justifyContent: 'center', background: 'var(--success)' }}>
            Process Payment
          </button>
        </form>
      </div>
    </div>
  );
}
