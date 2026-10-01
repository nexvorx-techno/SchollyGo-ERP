import { getDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import StudentForm from '@/components/StudentForm';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export default async function EditStudentPage({ params }) {
  const db = await getDb();

  // Await params for Next.js 15
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const student = await db.get('SELECT * FROM students WHERE id = ?', [id]);

  if (!student) {
    redirect('/students');
  }

  async function updateStudent(formData) {
    'use server';
    const db = await getDb();
    const oldStudent = await db.get('SELECT * FROM students WHERE id = ?', [id]);

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

    const docPhotoPath = newPhotoPath || oldStudent.doc_photo;
    const docSignPath = newSignPath || oldStudent.doc_sign;

    const docAadhar = formData.get('doc_aadhar')?.name || oldStudent.doc_aadhar;
    const docTc = formData.get('doc_tc')?.name || oldStudent.doc_tc;
    const docFatherAadhar = formData.get('doc_father_aadhar')?.name || oldStudent.doc_father_aadhar;
    const docMotherAadhar = formData.get('doc_mother_aadhar')?.name || oldStudent.doc_mother_aadhar;
    const docCastCertificate = formData.get('doc_cast_certificate')?.name || oldStudent.doc_cast_certificate;

    await db.run(`
      UPDATE students SET 
        name = ?, father_name = ?, mother_name = ?, father_occupation = ?, mother_occupation = ?,
        present_address = ?, permanent_address = ?, father_mobile = ?, father_email = ?, mother_mobile = ?, mother_email = ?, whatsapp_number = ?, whatsapp_number_owner = ?, aadhar_number = ?, dob = ?, place_of_birth = ?, cast_category = ?,
        admission_number = ?, class = ?, section = ?, class_teacher = ?, last_school = ?, student_house = ?, class_coordinator = ?, subjects = ?,
        fee_duration_type = ?, tuition_fees = ?, bus_fees = ?, extra_class_fees = ?, other_fees = ?,
        doc_aadhar = ?, doc_photo = ?, doc_sign = ?, doc_tc = ?, doc_father_aadhar = ?, doc_mother_aadhar = ?, doc_cast_certificate = ?,
        blood_group = ?, sibling_id = ?, primary_contact = ?
      WHERE id = ?
    `, [
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
      formData.get('admission_number'),
      formData.get('class'),
      formData.get('section') || '',
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
      formData.get('primary_contact') || 'Father',
      id
    ]);

    redirect('/students');
  }

  return (
    <div style={{ maxWidth: '100%', paddingRight: '24px' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Academics / Students Hub / Edit Details</div>
          <h1 className="page-title">Edit Student Details</h1>
        </div>
        <Link href="/students" className="btn btn-secondary">
          <ChevronLeft size={16} /> Back to List
        </Link>
      </div>

      <div className="panel" style={{ padding: '32px' }}>
        <StudentForm
          isEdit={true}
          initialData={student}
          saveStudentAction={updateStudent}
          allStudents={await db.all('SELECT id, name, student_id, class FROM students WHERE id != ? ORDER BY name ASC', [id])}
        />
      </div>
    </div>
  );
}
