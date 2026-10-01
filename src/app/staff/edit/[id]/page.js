import { getDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import StaffForm from '@/components/StaffForm';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export default async function EditStaffPage({ params }) {
  const db = await getDb();
  
  // Await params for Next.js 15
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const staff = await db.get('SELECT * FROM staff WHERE id = ?', [id]);
  
  if (!staff) {
    redirect('/staff');
  }

  async function updateStaff(formData) {
    'use server';
    const db = await getDb();
    const oldStaff = await db.get('SELECT * FROM staff WHERE id = ?', [id]);

    // Helper to save base64 string to file
    const saveBase64 = (base64Str, prefix) => {
      if (!base64Str || !base64Str.startsWith('data:image')) return null;
      const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) return null;
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `${prefix}_${crypto.randomBytes(6).toString('hex')}.jpg`;
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
      fs.writeFileSync(filepath, buffer);
      return `/uploads/${filename}`;
    };

    const newPhotoPath = saveBase64(formData.get('doc_photo_base64'), 'photo');
    const newSignPath = saveBase64(formData.get('doc_sign_base64'), 'sign');

    const docPhotoPath = newPhotoPath || oldStaff.doc_photo;
    const docSignPath = newSignPath || oldStaff.doc_sign;

    await db.run(`
      UPDATE staff SET 
        name = ?, role = ?, department = ?, joining_date = ?, qualifications = ?,
        contact = ?, email = ?, pan_number = ?, bank_account = ?, base_salary = ?,
        aadhar_number = ?, uan_number = ?, pf_number = ?, father_name = ?, mother_name = ?,
        blood_group = ?, dob = ?, ifsc_code = ?, present_address = ?, permanent_address = ?,
        doc_photo = ?, doc_sign = ?, basic_pay = ?, hra = ?, other_allowances = ?,
        pf_deduction = ?, esi_deduction = ?
      WHERE id = ?
    `, [
      formData.get('name'),
      formData.get('role'),
      formData.get('department'),
      formData.get('joining_date'),
      formData.get('qualifications'),
      formData.get('contact'),
      formData.get('email'),
      formData.get('pan_number'),
      formData.get('bank_account'),
      formData.get('base_salary') || 0,
      formData.get('aadhar_number'),
      formData.get('uan_number'),
      formData.get('pf_number'),
      formData.get('father_name'),
      formData.get('mother_name'),
      formData.get('blood_group'),
      formData.get('dob'),
      formData.get('ifsc_code'),
      formData.get('present_address_json'),
      formData.get('permanent_address_json'),
      docPhotoPath,
      docSignPath,
      formData.get('basic_pay') || 0,
      formData.get('hra') || 0,
      formData.get('other_allowances') || 0,
      formData.get('pf_deduction') || 0,
      formData.get('esi_deduction') || 0,
      id
    ]);
    
    redirect('/staff');
  }

  return (
    <div style={{ maxWidth: '100%', paddingRight: '24px' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Human Resources / Employee Records / Edit</div>
          <h1 className="page-title">Edit Staff Details</h1>
        </div>
        <Link href="/staff" className="btn btn-secondary">
          <ChevronLeft size={16} /> Back to List
        </Link>
      </div>

      <div className="panel" style={{ padding: '32px' }}>
        <StaffForm 
          isEdit={true}
          initialData={staff}
          saveStaffAction={updateStaff} 
        />
      </div>
    </div>
  );
}
