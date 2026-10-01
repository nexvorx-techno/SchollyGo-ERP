'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Save, Plus, X, Upload } from 'lucide-react';
import CropModal from './CropModal';

const AddressFields = ({ prefix, address, onChange, disabled }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', background: disabled ? '#f9f9fa' : '#fff', padding: '16px', border: '1px solid var(--border)', borderRadius: '4px' }}>
    <div className="form-group">
      <label>House Number</label>
      <input type="text" value={address.houseNo} onChange={e => onChange('houseNo', e.target.value)} disabled={disabled} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }} />
    </div>
    <div className="form-group">
      <label>Street</label>
      <input type="text" value={address.street} onChange={e => onChange('street', e.target.value)} disabled={disabled} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }} />
    </div>
    <div className="form-group">
      <label>Locality</label>
      <input type="text" value={address.locality} onChange={e => onChange('locality', e.target.value)} disabled={disabled} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }} />
    </div>
    <div className="form-group">
      <label>Landmark</label>
      <input type="text" value={address.landmark} onChange={e => onChange('landmark', e.target.value)} disabled={disabled} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }} />
    </div>
    <div className="form-group">
      <label>Pincode</label>
      <input type="text" maxLength="6" pattern="[0-9]{6}" placeholder="6-digit code" value={address.pincode} onChange={e => onChange('pincode', e.target.value)} disabled={disabled} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }} />
    </div>
    <div className="form-group">
      <label>State</label>
      <input type="text" value={address.state} readOnly style={{ background: '#f4f5f7', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }} placeholder="Auto-fetch" />
    </div>
    <div className="form-group">
      <label>City / Block</label>
      <input type="text" value={address.city} onChange={e => onChange('city', e.target.value)} disabled={disabled} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }} />
    </div>
    <div className="form-group">
      <label>District</label>
      <input type="text" value={address.district} readOnly style={{ background: '#f4f5f7', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }} placeholder="Auto-fetch" />
    </div>
  </div>
);

export default function StaffForm({ generatedEmployeeId, saveStaffAction, initialData = null, isEdit = false }) {
  const [presentAddress, setPresentAddress] = useState({
    houseNo: '', street: '', locality: '', landmark: '', state: '', city: '', district: '', pincode: ''
  });
  const [permanentAddress, setPermanentAddress] = useState({
    houseNo: '', street: '', locality: '', landmark: '', state: '', city: '', district: '', pincode: ''
  });
  const [sameAsPresent, setSameAsPresent] = useState(false);
  
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropAspect, setCropAspect] = useState(3/4);
  const [cropTarget, setCropTarget] = useState(null);
  const [photoBase64, setPhotoBase64] = useState('');
  const [signBase64, setSignBase64] = useState('');
  const [basicPay, setBasicPay] = useState(initialData?.basic_pay || 0);
  const [hra, setHra] = useState(initialData?.hra || 0);
  const [otherAllowances, setOtherAllowances] = useState(initialData?.other_allowances || 0);
  const [pfDeduction, setPfDeduction] = useState(initialData?.pf_deduction || 0);
  const [esiDeduction, setEsiDeduction] = useState(initialData?.esi_deduction || 0);

  const grossSalary = Number(basicPay) + Number(hra) + Number(otherAllowances);
  const netSalary = grossSalary - Number(pfDeduction) - Number(esiDeduction);

  const photoInputRef = useRef(null);
  const signInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      if (initialData.present_address) {
        try { setPresentAddress(JSON.parse(initialData.present_address)); } catch(e){}
      }
      if (initialData.permanent_address) {
        try { setPermanentAddress(JSON.parse(initialData.permanent_address)); } catch(e){}
      }
      if (initialData.doc_photo && initialData.doc_photo.startsWith('data:image')) {
        setPhotoBase64(initialData.doc_photo);
      }
      if (initialData.doc_sign && initialData.doc_sign.startsWith('data:image')) {
        setSignBase64(initialData.doc_sign);
      }
    }
  }, [initialData]);

  const fetchPincodeData = async (pincode, isPermanent = false) => {
    if (pincode.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();
        if (data && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          const newDetails = {
            state: postOffice.State,
            district: postOffice.District,
          };
          if (isPermanent) {
            setPermanentAddress(prev => ({ ...prev, ...newDetails }));
          } else {
            setPresentAddress(prev => ({ ...prev, ...newDetails }));
            if (sameAsPresent) setPermanentAddress(prev => ({ ...prev, ...newDetails }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch pincode", err);
      }
    }
  };

  const handlePresentChange = (field, value) => {
    if (field === 'pincode') {
      value = value.replace(/[^0-9]/g, '');
      if (value.length > 6) value = value.substring(0, 6);
    }
    const updated = { ...presentAddress, [field]: value };
    setPresentAddress(updated);
    if (sameAsPresent) setPermanentAddress(updated);
    if (field === 'pincode' && value.length === 6) fetchPincodeData(value, false);
  };

  const handlePermanentChange = (field, value) => {
    if (field === 'pincode') {
      value = value.replace(/[^0-9]/g, '');
      if (value.length > 6) value = value.substring(0, 6);
    }
    setPermanentAddress(prev => ({ ...prev, [field]: value }));
    if (field === 'pincode' && value.length === 6) fetchPincodeData(value, true);
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setSameAsPresent(checked);
    if (checked) {
      setPermanentAddress({ ...presentAddress });
    } else {
      setPermanentAddress({
        houseNo: '', street: '', locality: '', landmark: '', state: '', city: '', district: '', pincode: ''
      });
    }
  };

  const handleFileChange = (e, target) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropImageSrc(reader.result);
        setCropTarget(target);
        setCropAspect(target === 'photo' ? 3 / 4 : 5 / 2);
        setCropModalOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
    e.target.value = null;
  };

  const handleCropComplete = (croppedBase64) => {
    if (cropTarget === 'photo') {
      setPhotoBase64(croppedBase64);
    } else if (cropTarget === 'sign') {
      setSignBase64(croppedBase64);
    }
    setCropModalOpen(false);
  };

  return (
    <>
      {cropModalOpen && (
        <CropModal 
          imageSrc={cropImageSrc}
          aspect={cropAspect}
          onClose={() => setCropModalOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}
      <form action={saveStaffAction} style={{ textAlign: 'left', width: '100%' }}>
        <input type="hidden" name="present_address_json" value={JSON.stringify(presentAddress)} />
        <input type="hidden" name="permanent_address_json" value={JSON.stringify(permanentAddress)} />
        <input type="hidden" name="doc_photo_base64" value={photoBase64} />
        <input type="hidden" name="doc_sign_base64" value={signBase64} />

        <input type="hidden" name="base_salary" value={grossSalary} />
        
        <div style={{ background: '#f4f5f7', padding: '12px 16px', borderRadius: '4px', marginBottom: '32px', display: 'flex', gap: '48px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{isEdit ? 'Employee ID' : 'Auto-Generated Employee ID'}</span>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent)' }}>{isEdit ? initialData.employee_id : generatedEmployeeId}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          {/* Main Form Fields */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            <section>
              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--accent)', fontSize: '16px' }}>1. Personal Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="name" style={{ fontWeight: 500, fontSize: '14px' }}>Full Name *</label>
                  <input type="text" id="name" name="name" defaultValue={initialData?.name} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="dob" style={{ fontWeight: 500, fontSize: '14px' }}>Date of Birth</label>
                  <input type="date" id="dob" name="dob" defaultValue={initialData?.dob} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="blood_group" style={{ fontWeight: 500, fontSize: '14px' }}>Blood Group</label>
                  <select id="blood_group" name="blood_group" defaultValue={initialData?.blood_group || ''} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: '#fff' }}>
                    <option value="">Select</option>
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="father_name" style={{ fontWeight: 500, fontSize: '14px' }}>Father's Name</label>
                  <input type="text" id="father_name" name="father_name" defaultValue={initialData?.father_name} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="mother_name" style={{ fontWeight: 500, fontSize: '14px' }}>Mother's Name</label>
                  <input type="text" id="mother_name" name="mother_name" defaultValue={initialData?.mother_name} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Present Address</h4>
                <AddressFields prefix="present" address={presentAddress} onChange={handlePresentChange} />

                <div style={{ margin: '24px 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '14px', margin: 0 }}>Permanent Address</h4>
                  <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginLeft: '16px' }}>
                    <input type="checkbox" checked={sameAsPresent} onChange={handleCheckboxChange} />
                    Same as Present Address
                  </label>
                </div>
                <AddressFields prefix="permanent" address={permanentAddress} onChange={handlePermanentChange} disabled={sameAsPresent} />
              </div>
            </section>

            <section>
              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--accent)', fontSize: '16px' }}>2. Contact Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="contact" style={{ fontWeight: 500, fontSize: '14px' }}>Mobile Number *</label>
                  <input type="text" id="contact" name="contact" defaultValue={initialData?.contact} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="email" style={{ fontWeight: 500, fontSize: '14px' }}>Email Address</label>
                  <input type="email" id="email" name="email" defaultValue={initialData?.email} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
              </div>
            </section>

            <section>
              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--accent)', fontSize: '16px' }}>3. Employment Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="role" style={{ fontWeight: 500, fontSize: '14px' }}>Role *</label>
                  <select id="role" name="role" defaultValue={initialData?.role || 'Teacher'} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: '#fff' }}>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                    <option value="Support">Support Staff</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="department" style={{ fontWeight: 500, fontSize: '14px' }}>Department *</label>
                  <input type="text" id="department" name="department" defaultValue={initialData?.department} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="joining_date" style={{ fontWeight: 500, fontSize: '14px' }}>Joining Date</label>
                  <input type="date" id="joining_date" name="joining_date" defaultValue={initialData?.joining_date} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="qualifications" style={{ fontWeight: 500, fontSize: '14px' }}>Qualifications</label>
                  <input type="text" id="qualifications" name="qualifications" defaultValue={initialData?.qualifications} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
              </div>
            </section>

            <section>
              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--accent)', fontSize: '16px' }}>4. Salary Allotment</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="basic_pay" style={{ fontWeight: 500, fontSize: '14px' }}>Basic Pay (₹)</label>
                  <input type="number" id="basic_pay" name="basic_pay" step="0.01" min="0" value={basicPay} onChange={e => setBasicPay(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="hra" style={{ fontWeight: 500, fontSize: '14px' }}>HRA (₹)</label>
                  <input type="number" id="hra" name="hra" step="0.01" min="0" value={hra} onChange={e => setHra(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="other_allowances" style={{ fontWeight: 500, fontSize: '14px' }}>Other Allowances (₹)</label>
                  <input type="number" id="other_allowances" name="other_allowances" step="0.01" min="0" value={otherAllowances} onChange={e => setOtherAllowances(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="pf_deduction" style={{ fontWeight: 500, fontSize: '14px' }}>PF Deduction (₹)</label>
                  <input type="number" id="pf_deduction" name="pf_deduction" step="0.01" min="0" value={pfDeduction} onChange={e => setPfDeduction(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="esi_deduction" style={{ fontWeight: 500, fontSize: '14px' }}>ESI Deduction (₹)</label>
                  <input type="number" id="esi_deduction" name="esi_deduction" step="0.01" min="0" value={esiDeduction} onChange={e => setEsiDeduction(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
              </div>

              <div style={{ background: '#f9fceb', padding: '16px', borderRadius: '6px', border: '1px solid #d4eb8a', display: 'flex', gap: '32px', marginTop: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Gross Salary</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>₹ {grossSalary.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Net Salary</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--success)' }}>₹ {netSalary.toFixed(2)}</div>
                </div>
              </div>
            </section>

            <section>
              <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', color: 'var(--accent)', fontSize: '16px' }}>5. Statutory & Bank Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="aadhar_number" style={{ fontWeight: 500, fontSize: '14px' }}>Aadhaar Number</label>
                  <input type="text" id="aadhar_number" name="aadhar_number" defaultValue={initialData?.aadhar_number} placeholder="12-digit number" style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="pan_number" style={{ fontWeight: 500, fontSize: '14px' }}>PAN Number</label>
                  <input type="text" id="pan_number" name="pan_number" defaultValue={initialData?.pan_number} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="uan_number" style={{ fontWeight: 500, fontSize: '14px' }}>UAN Number (EPF)</label>
                  <input type="text" id="uan_number" name="uan_number" defaultValue={initialData?.uan_number} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="pf_number" style={{ fontWeight: 500, fontSize: '14px' }}>PF Account Number</label>
                  <input type="text" id="pf_number" name="pf_number" defaultValue={initialData?.pf_number} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="bank_account" style={{ fontWeight: 500, fontSize: '14px' }}>Bank Account Number</label>
                  <input type="text" id="bank_account" name="bank_account" defaultValue={initialData?.bank_account} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="ifsc_code" style={{ fontWeight: 500, fontSize: '14px' }}>IFSC Code</label>
                  <input type="text" id="ifsc_code" name="ifsc_code" defaultValue={initialData?.ifsc_code} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                </div>
              </div>
            </section>
          </div>

          {/* Right Side: Photo and Signature */}
          <div style={{ width: '280px', background: '#f9f9fa', padding: '16px', borderRadius: '4px', border: '1px solid var(--border)', flexShrink: 0, position: 'sticky', top: '24px' }}>
            <h4 style={{ fontSize: '13px', marginBottom: '16px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Identification Media</h4>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                Staff Photo
                <span onClick={() => photoInputRef.current?.click()} style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: '12px' }}>Upload</span>
              </label>
              <div 
                onClick={() => photoInputRef.current?.click()}
                style={{ 
                  width: '120px', height: '160px', background: photoBase64 ? `url(${photoBase64}) center/cover no-repeat` : '#fff', 
                  border: '1px dashed var(--border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer', overflow: 'hidden'
                }}
              >
                {!photoBase64 && <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}><Upload size={20} /><div style={{ fontSize: '11px', marginTop: '4px' }}>Upload Photo</div></div>}
              </div>
              <input type="file" ref={photoInputRef} accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} style={{ display: 'none' }} />
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                Staff Signature
                <span onClick={() => signInputRef.current?.click()} style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: '12px' }}>Upload</span>
              </label>
              <div 
                onClick={() => signInputRef.current?.click()}
                style={{ 
                  width: '200px', height: '80px', background: signBase64 ? `url(${signBase64}) center/contain no-repeat` : '#fff', 
                  border: '1px dashed var(--border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer', overflow: 'hidden'
                }}
              >
                {!signBase64 && <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}><Upload size={20} /><div style={{ fontSize: '11px', marginTop: '4px' }}>Upload Sign</div></div>}
              </div>
              <input type="file" ref={signInputRef} accept="image/*" onChange={(e) => handleFileChange(e, 'sign')} style={{ display: 'none' }} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '48px', display: 'flex', gap: '16px', padding: '16px', background: '#f4f5f7', borderRadius: '4px' }}>
          <button type="submit" className="btn" style={{ padding: '10px 24px' }}>
            <Save size={16} /> {isEdit ? 'Update Complete Record' : 'Save Complete Record'}
          </button>
          <Link href="/staff" className="btn btn-secondary" style={{ padding: '10px 24px' }}>Cancel</Link>
        </div>
      </form>
    </>
  );
}
