import { getDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import FeesMasterTable from '@/components/FeesMasterTable';

export const dynamic = 'force-dynamic';

export default async function FeesMasterPage() {
  const db = await getDb();
  
  // Fetch master fees
  const classes = await db.all(`
    SELECT * FROM class_fees_master 
    ORDER BY CAST(SUBSTR(class_name, 7) AS INTEGER) ASC, id ASC
  `);

  async function updateMasterFee(formData) {
    'use server';
    const db = await getDb();
    
    const id = parseInt(formData.get('id'));
    const tuition_fee = parseFloat(formData.get('tuition_fee')) || 0;
    const bus_fee = parseFloat(formData.get('bus_fee')) || 0;
    const admission_fee = parseFloat(formData.get('admission_fee')) || 0;
    const caution_money = parseFloat(formData.get('caution_money')) || 0;
    const other_fee = parseFloat(formData.get('other_fee')) || 0;
    const duration_type = formData.get('duration_type') || 'Monthly';
    const late_fee_type = formData.get('late_fee_type') || 'None';
    const late_fee_amount = parseFloat(formData.get('late_fee_amount')) || 0;
    const due_date_day = parseInt(formData.get('due_date_day')) || 10;
    
    await db.run(`
      UPDATE class_fees_master 
      SET tuition_fee = ?, bus_fee = ?, admission_fee = ?, caution_money = ?, other_fee = ?, duration_type = ?, late_fee_type = ?, late_fee_amount = ?, due_date_day = ?
      WHERE id = ?
    `, [tuition_fee, bus_fee, admission_fee, caution_money, other_fee, duration_type, late_fee_type, late_fee_amount, due_date_day, id]);

    revalidatePath('/master/fees-structure');
  }

  return (
    <div style={{ maxWidth: '100%', paddingRight: '24px' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Master Settings / Fees Structure</div>
          <h1 style={{ margin: '8px 0 0 0' }}>Fees Structure</h1>
        </div>
      </div>

      <div style={{ background: '#eef2ff', padding: '16px', borderRadius: '4px', marginBottom: '24px', border: '1px solid #c7d2fe', color: '#3730a3' }}>
        <strong>Information:</strong> The fees defined below will be automatically applied as the default structure when admitting new students to these specific classes.
      </div>

      <FeesMasterTable initialClasses={classes} updateAction={updateMasterFee} />
    </div>
  );
}
