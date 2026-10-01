import { getDb } from '@/lib/db';
import { Receipt } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PayrollPage() {
  const db = await getDb();
  
  // Calculate payroll dynamically based on base_salary and attendance in the current month
  // Note: For a real app, this would be more complex and saved as payroll records.
  
  const staff = await db.all('SELECT * FROM staff ORDER BY name ASC');
  
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  
  const payrollData = [];
  
  for (const member of staff) {
    // Count attendance for this month
    const { presentCount } = await db.get(`
      SELECT COUNT(*) as presentCount 
      FROM attendance 
      WHERE staff_id = ? AND status = 'Present' AND date LIKE ?
    `, [member.id, `${currentMonth}%`]) || { presentCount: 0 };
    
    const { halfDayCount } = await db.get(`
      SELECT COUNT(*) as halfDayCount 
      FROM attendance 
      WHERE staff_id = ? AND status = 'Half-Day' AND date LIKE ?
    `, [member.id, `${currentMonth}%`]) || { halfDayCount: 0 };

    // Assuming 22 working days in a month for simple calculation
    // Deduct salary for absences (rough logic)
    const totalWorkingDays = 22;
    const effectiveDays = presentCount + (halfDayCount * 0.5);
    
    // Calculate Gross Salary (Fallback to base_salary if basic_pay is missing for legacy records)
    const grossSalary = (member.basic_pay || 0) + (member.hra || 0) + (member.other_allowances || 0) || member.base_salary || 0;
    const deductions = (member.pf_deduction || 0) + (member.esi_deduction || 0);

    let calculatedGross = grossSalary;
    
    if (effectiveDays < totalWorkingDays && effectiveDays > 0) {
       calculatedGross = (grossSalary / totalWorkingDays) * effectiveDays;
    } else if (effectiveDays === 0) {
       const { totalRecords } = await db.get('SELECT COUNT(*) as totalRecords FROM attendance WHERE staff_id = ?', [member.id]);
       if (totalRecords > 0) {
         calculatedGross = 0;
       }
    }

    const calculatedNet = Math.max(0, calculatedGross - deductions);

    payrollData.push({
      ...member,
      presentCount,
      halfDayCount,
      grossSalary,
      deductions,
      calculatedNet
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Payroll Generation</h1>
        <div style={{ background: 'var(--bg-secondary)', padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border)', fontWeight: 600 }}>
          Month: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="panel">
        <h3 style={{ padding: '24px 24px 0 24px', margin: 0 }}>Estimated Payroll</h3>
        {payrollData.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No staff members found.
          </div>
        ) : (
          <table style={{ marginTop: '16px' }}>
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Gross Salary</th>
                <th>Days Present</th>
                <th>Deductions (PF+ESI)</th>
                <th>Net Payable</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map((data) => (
                <tr key={data.id}>
                  <td>{data.employee_id || `#${data.id}`}</td>
                  <td style={{ fontWeight: 500 }}>
                    {data.name}
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{data.role}</div>
                  </td>
                  <td>₹{(data.grossSalary || 0).toFixed(2)}</td>
                  <td>{data.presentCount} {data.halfDayCount > 0 ? `(+${data.halfDayCount} Half-Days)` : ''}</td>
                  <td style={{ color: 'var(--danger)' }}>₹{(data.deductions || 0).toFixed(2)}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>
                    ₹{(data.calculatedNet || 0).toFixed(2)}
                  </td>
                  <td>
                    <Link href={`/payroll/slip/${data.id}?month=${currentMonth}`} className="btn" style={{ background: 'var(--success)', padding: '6px 12px', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Receipt size={14} />
                      Generate Slip
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
