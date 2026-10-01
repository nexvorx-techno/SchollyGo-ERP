import { getDb } from '@/lib/db';
import Link from 'next/link';
import PrintButton from '@/components/PrintButton';
import { formatDate } from '@/lib/formatDate';

export const dynamic = 'force-dynamic';

export default async function PayslipPage({ params, searchParams }) {
  const db = await getDb();
  
  const resolvedParams = await params;
  const staffId = resolvedParams.id;
  
  const resolvedSearchParams = await searchParams;
  const monthParam = resolvedSearchParams.month || new Date().toISOString().substring(0, 7);
  
  const staff = await db.get('SELECT * FROM staff WHERE id = ?', [staffId]);
  
  if (!staff) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <h2>Staff Member Not Found</h2>
        <Link href="/payroll" className="btn">Return to Payroll</Link>
      </div>
    );
  }

  // Calculate attendance for the requested month
  const { presentCount } = await db.get(`
    SELECT COUNT(*) as presentCount 
    FROM attendance 
    WHERE staff_id = ? AND status = 'Present' AND date LIKE ?
  `, [staff.id, `${monthParam}%`]) || { presentCount: 0 };
  
  const { halfDayCount } = await db.get(`
    SELECT COUNT(*) as halfDayCount 
    FROM attendance 
    WHERE staff_id = ? AND status = 'Half-Day' AND date LIKE ?
  `, [staff.id, `${monthParam}%`]) || { halfDayCount: 0 };

  const totalWorkingDays = 22;
  const effectiveDays = presentCount + (halfDayCount * 0.5);
  
  const grossSalary = (staff.basic_pay || 0) + (staff.hra || 0) + (staff.other_allowances || 0) || staff.base_salary || 0;
  const deductions = (staff.pf_deduction || 0) + (staff.esi_deduction || 0);

  let calculatedGross = grossSalary;
  
  if (effectiveDays < totalWorkingDays && effectiveDays > 0) {
     calculatedGross = (grossSalary / totalWorkingDays) * effectiveDays;
  } else if (effectiveDays === 0) {
     const { totalRecords } = await db.get('SELECT COUNT(*) as totalRecords FROM attendance WHERE staff_id = ?', [staff.id]);
     if (totalRecords > 0) {
       calculatedGross = 0;
     }
  }

  const calculatedNet = Math.max(0, calculatedGross - deductions);
  
  const formattedMonth = new Date(`${monthParam}-01`).toLocaleString('default', { month: 'long', year: 'numeric' });
  const generatedDate = formatDate(new Date());

  return (
    <div>
      {/* Non-printable controls */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Link href="/payroll" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
          ← Back to Payroll
        </Link>
        <PrintButton />
      </div>

      {/* Printable Payslip */}
      <div className="receipt-container" style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        background: '#fff', 
        padding: '40px', 
        border: '1px solid var(--border)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        color: '#000' 
      }}>
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>DAV Public School</h1>
          <p style={{ margin: '0', fontSize: '14px', color: '#555' }}>123 Education Lane, Knowledge City, State - 123456</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#555' }}>Contact: +91 9876543210 | Email: info@davschool.edu</p>
          <h2 style={{ margin: '24px 0 0 0', fontSize: '18px', textTransform: 'uppercase' }}>Payslip for {formattedMonth}</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold', width: '120px', border: 'none' }}>Employee Name:</td>
                  <td style={{ padding: '4px 0', border: 'none' }}>{staff.name}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold', border: 'none' }}>Employee ID:</td>
                  <td style={{ padding: '4px 0', border: 'none' }}>{staff.employee_id || `EMP-${String(staff.id).padStart(4, '0')}`}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold', border: 'none' }}>Designation:</td>
                  <td style={{ padding: '4px 0', border: 'none' }}>{staff.role}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold', border: 'none' }}>Department:</td>
                  <td style={{ padding: '4px 0', border: 'none' }}>{staff.department}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold', width: '120px', border: 'none' }}>Date of Joining:</td>
                  <td style={{ padding: '4px 0', border: 'none' }}>{staff.joining_date || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold', border: 'none' }}>PAN Number:</td>
                  <td style={{ padding: '4px 0', border: 'none' }}>{staff.pan_number || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold', border: 'none' }}>Bank Account:</td>
                  <td style={{ padding: '4px 0', border: 'none' }}>{staff.bank_account || '-'}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold', border: 'none' }}>IFSC Code:</td>
                  <td style={{ padding: '4px 0', border: 'none' }}>{staff.ifsc_code || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '14px', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '12px', marginTop: 0 }}>Attendance Summary</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px 0', border: 'none' }}>Total Working Days</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', border: 'none' }}>{totalWorkingDays}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', border: 'none' }}>Days Present</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', border: 'none' }}>{presentCount}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', border: 'none' }}>Half-Days</td>
                  <td style={{ padding: '4px 0', textAlign: 'right', border: 'none' }}>{halfDayCount}</td>
                </tr>
                <tr>
                  <td style={{ padding: '4px 0', fontWeight: 'bold', border: 'none' }}>Effective Paid Days</td>
                  <td style={{ padding: '4px 0', fontWeight: 'bold', textAlign: 'right', border: 'none' }}>{effectiveDays}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <h3 style={{ fontSize: '14px', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '12px' }}>Earnings & Deductions</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px', border: '1px solid #000' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Earnings</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Amount (₹)</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>Deductions</th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px' }}>Basic Pay</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{(staff.basic_pay || staff.base_salary || 0).toFixed(2)}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>Provident Fund (PF)</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{(staff.pf_deduction || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px' }}>House Rent Allowance (HRA)</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{(staff.hra || 0).toFixed(2)}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>ESI</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{(staff.esi_deduction || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px' }}>Other Allowances</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{(staff.other_allowances || 0).toFixed(2)}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}></td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}></td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}>
              <td style={{ border: '1px solid #000', padding: '8px' }}>Standard Gross Earnings</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{grossSalary.toFixed(2)}</td>
              <td style={{ border: '1px solid #000', padding: '8px' }}>Total Deductions</td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>{deductions.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
          <table style={{ width: '400px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #000' }}>Prorated Gross (based on attendance)</td>
                <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #000' }}>₹{calculatedGross.toFixed(2)}</td>
              </tr>
              <tr style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
                <td style={{ padding: '12px 8px', border: '1px solid #000', fontSize: '16px' }}>NET PAYABLE</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', border: '1px solid #000', fontSize: '16px' }}>₹{calculatedNet.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '64px', paddingTop: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '150px', borderBottom: '1px solid #000', marginBottom: '8px' }}></div>
            <p style={{ margin: 0, fontSize: '14px' }}>Employer Signature</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '150px', borderBottom: '1px solid #000', marginBottom: '8px' }}></div>
            <p style={{ margin: 0, fontSize: '14px' }}>Employee Signature</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', fontSize: '12px', color: '#666' }}>
          This is a computer-generated document. Generated on {generatedDate}.
        </div>
      </div>
      
      {/* CSS to ensure it prints properly */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-container, .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
