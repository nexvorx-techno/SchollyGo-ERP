import { getDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import StudentForm from '@/components/StudentForm';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export default async function NewStudentPage() {
  const db = await getDb();
  
  // Calculate next Student ID
  const currentYear = new Date().getFullYear();
  const { count } = await db.get(`SELECT COUNT(*) as count FROM students WHERE student_id LIKE ?`, [`SMS/${currentYear}/%`]) || { count: 0 };
  const nextSequence = String(count + 1).padStart(3, '0');
  const generatedStudentId = `SMS/${currentYear}/${nextSequence}`;

  // Calculate next Roll No
  const { totalStudents } = await db.get('SELECT COUNT(*) as totalStudents FROM students') || { totalStudents: 0 };
  const nextRollNo = String(totalStudents + 1).padStart(2, '0');

  // Calculate next Admission Number
  const { count: admCount } = await db.get(`SELECT COUNT(*) as count FROM students`) || { count: 0 };
  const generatedAdmissionNumber = `ADM/${currentYear}/${String(admCount + 1).padStart(3, '0')}`;

  async function saveStudent(formData) {
    'use server';
    const db = await getDb();
    
    // Auto-generate fields at the time of insertion
    const insertYear = new Date().getFullYear();
    const { count: c } = await db.get(`SELECT COUNT(*) as count FROM students WHERE student_id LIKE ?`, [`SMS/${insertYear}/%`]) || { count: 0 };
    const finalStudentId = `SMS/${insertYear}/${String(c + 1).padStart(3, '0')}`;
    
    const { totalStudents: ts } = await db.get('SELECT COUNT(*) as totalStudents FROM students') || { totalStudents: 0 };
    const finalRollNo = String(ts + 1).padStart(2, '0');
    
    const finalAdmissionNumber = formData.get('admission_number') || `ADM/${insertYear}/${String(ts + 1).padStart(3, '0')}`;

    // Helper to save base64 string to file
    const saveBase64 = (base64Str, prefix) => {
      if (!base64Str) return '';
      const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) return '';
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `${prefix}_${crypto.randomBytes(6).toString('hex')}.jpg`;
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
      fs.writeFileSync(filepath, buffer);
      return `/uploads/${filename}`;
    };

    // Extract files and save images
    const docPhotoPath = saveBase64(formData.get('doc_photo_base64'), 'photo');
    const docSignPath = saveBase64(formData.get('doc_sign_base64'), 'sign');

    const docAadhar = formData.get('doc_aadhar')?.name || '';
    const docTc = formData.get('doc_tc')?.name || '';
    const docFatherAadhar = formData.get('doc_father_aadhar')?.name || '';
    const docMotherAadhar = formData.get('doc_mother_aadhar')?.name || '';
    const docCastCertificate = formData.get('doc_cast_certificate')?.name || '';

    await db.run(`
      INSERT INTO students (
        student_id, name, father_name, mother_name, father_occupation, mother_occupation,
        present_address, permanent_address, father_mobile, father_email, mother_mobile, mother_email, whatsapp_number, whatsapp_number_owner, aadhar_number, dob, place_of_birth, cast_category,
        admission_number, class, section, roll_number, class_teacher, last_school, student_house, class_coordinator, subjects,
        fee_duration_type, tuition_fees, bus_fees, extra_class_fees, other_fees,
        doc_aadhar, doc_photo, doc_sign, doc_tc, doc_father_aadhar, doc_mother_aadhar, doc_cast_certificate,
        blood_group, sibling_id, primary_contact
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `, [
      finalStudentId,
      formData.get('name'),
      formData.get('father_name'),
      formData.get('mother_name'),
      formData.get('father_occupation'),
      formData.get('mother_occupation'),
      formData.get('present_address_json'), 
      formData.get('permanent_address_json'),
      formData.get('father_mobile_json'),
      formData.get('father_email'),
      formData.get('mother_mobile_json'),
      formData.get('mother_email'),
      formData.get('whatsapp_number'),
      formData.get('whatsapp_number_owner'),
      formData.get('aadhar_number'),
      formData.get('dob'),
      formData.get('place_of_birth'),
      formData.get('cast_category'),
      finalAdmissionNumber,
      formData.get('class'),
      formData.get('section') || '',
      finalRollNo,
      formData.get('class_teacher'),
      formData.get('last_school'),
      formData.get('student_house'),
      formData.get('class_coordinator'),
      formData.get('subjects'),
      formData.get('fee_duration_type') || 'Monthly',
      formData.get('tuition_fees') || 0,
      formData.get('bus_fees') || 0,
      formData.get('extra_class_fees') || 0,
      formData.get('other_fees') || 0,
      docAadhar,
      docPhotoPath,
      docSignPath,
      docTc,
      docFatherAadhar,
      docMotherAadhar,
      docCastCertificate,
      formData.get('blood_group') || null,
      formData.get('sibling_id') || null,
      formData.get('primary_contact') || 'Father'
    ]);
    
    redirect('/students');
  }

  return (
    <div style={{ maxWidth: '100%', paddingRight: '24px' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Academics / Students Hub / Add New</div>
          <h1 className="page-title">Add New Student</h1>
        </div>
        <Link href="/students" className="btn btn-secondary">
          <ChevronLeft size={16} /> Back to List
        </Link>
      </div>

      <div className="panel" style={{ padding: '32px' }}>
        <StudentForm 
          generatedStudentId={generatedStudentId} 
          nextRollNo={nextRollNo} 
          generatedAdmissionNumber={generatedAdmissionNumber}
          saveStudentAction={saveStudent} 
          allStudents={await db.all('SELECT id, name, student_id, class FROM students ORDER BY name ASC')}
        />
      </div>
    </div>
  );
}
