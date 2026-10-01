import { getDb } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import StaffForm from '@/components/StaffForm';

export default async function NewStaffPage() {
  const db = await getDb();
  
  // Generate a mock employee ID for the UI
  const { count } = await db.get('SELECT COUNT(*) as count FROM staff') || { count: 0 };
  const generatedEmployeeId = `EMP/${new Date().getFullYear()}/${String(count + 1).padStart(3, '0')}`;

  async function addStaff(formData) {
    'use server';
    
    const db = await getDb();
    
    // Auto-generate employee id on save
    const { count } = await db.get('SELECT COUNT(*) as count FROM staff') || { count: 0 };
    const employeeId = `EMP/${new Date().getFullYear()}/${String(count + 1).padStart(3, '0')}`;
    
    const name = formData.get('name');
    const role = formData.get('role');
    const department = formData.get('department');
    const contact = formData.get('contact');
    const email = formData.get('email');
    const baseSalary = parseFloat(formData.get('base_salary')) || 0;
    const joiningDate = formData.get('joining_date');
    const qualifications = formData.get('qualifications');
    
    // Salary components
    const basicPay = parseFloat(formData.get('basic_pay')) || 0;
    const hra = parseFloat(formData.get('hra')) || 0;
    const otherAllowances = parseFloat(formData.get('other_allowances')) || 0;
    const pfDeduction = parseFloat(formData.get('pf_deduction')) || 0;
    const esiDeduction = parseFloat(formData.get('esi_deduction')) || 0;
    
    const aadharNumber = formData.get('aadhar_number');
    const uanNumber = formData.get('uan_number');
    const pfNumber = formData.get('pf_number');
    const fatherName = formData.get('father_name');
    const motherName = formData.get('mother_name');
    const bloodGroup = formData.get('blood_group');
    const dob = formData.get('dob');
    const ifscCode = formData.get('ifsc_code');
    const panNumber = formData.get('pan_number');
    const bankAccount = formData.get('bank_account');
    
    const presentAddressJson = formData.get('present_address_json');
    const permanentAddressJson = formData.get('permanent_address_json');
    const docPhotoBase64 = formData.get('doc_photo_base64');
    const docSignBase64 = formData.get('doc_sign_base64');
    
    await db.run(
      `INSERT INTO staff (
        employee_id, name, role, department, contact, email, base_salary, joining_date, qualifications, 
        basic_pay, hra, other_allowances, pf_deduction, esi_deduction,
        aadhar_number, uan_number, pf_number, father_name, mother_name, blood_group, dob, ifsc_code, pan_number, bank_account,
        present_address, permanent_address, doc_photo, doc_sign
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId, name, role, department, contact, email, baseSalary, joiningDate, qualifications,
        basicPay, hra, otherAllowances, pfDeduction, esiDeduction,
        aadharNumber, uanNumber, pfNumber, fatherName, motherName, bloodGroup, dob, ifscCode, panNumber, bankAccount,
        presentAddressJson, permanentAddressJson, docPhotoBase64, docSignBase64
      ]
    );
    
    redirect('/staff');
  }

  return (
    <div style={{ width: '100%', margin: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div className="breadcrumb">Home / Staff / Add New</div>
          <h2>Add New Staff Member</h2>
        </div>
      </div>

      <div className="panel" style={{ padding: '32px' }}>
        <StaffForm generatedEmployeeId={generatedEmployeeId} saveStaffAction={addStaff} />
      </div>
    </div>
  );
}
