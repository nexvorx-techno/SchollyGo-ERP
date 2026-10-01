'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Save, Plus, X, Upload, Search } from 'lucide-react';
import CropModal from './CropModal';

// Extracted outside to prevent re-mounting and losing focus on keystroke
const AddressFields = ({ prefix, address, onChange, disabled }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: disabled ? '#f9f9fa' : '#fff', padding: '16px', border: '1px solid var(--border)', borderRadius: '4px' }}>
    <div className="form-group">
      <label>House Number</label>
      <input type="text" value={address.houseNo} onChange={e => onChange('houseNo', e.target.value)} disabled={disabled} />
    </div>
    <div className="form-group">
      <label>Street</label>
      <input type="text" value={address.street} onChange={e => onChange('street', e.target.value)} disabled={disabled} />
    </div>
    <div className="form-group">
      <label>Locality</label>
      <input type="text" value={address.locality} onChange={e => onChange('locality', e.target.value)} disabled={disabled} />
    </div>
    <div className="form-group">
      <label>Landmark</label>
      <input type="text" value={address.landmark} onChange={e => onChange('landmark', e.target.value)} disabled={disabled} />
    </div>
    <div className="form-group">
      <label>Pincode</label>
      <input type="text" maxLength="6" pattern="[0-9]{6}" placeholder="6-digit code" value={address.pincode} onChange={e => onChange('pincode', e.target.value)} disabled={disabled} />
    </div>
    <div className="form-group">
      <label>State</label>
      <input type="text" value={address.state} readOnly style={{ background: '#f4f5f7' }} placeholder="Auto-fetch" />
    </div>
    <div className="form-group">
      <label>City / Block</label>
      <input type="text" value={address.city} onChange={e => onChange('city', e.target.value)} disabled={disabled} />
    </div>
    <div className="form-group">
      <label>District</label>
      <input type="text" value={address.district} readOnly style={{ background: '#f4f5f7' }} placeholder="Auto-fetch" />
    </div>
  </div>
);

// Helper for dynamic mobile numbers with prefix code
const MobileInputList = ({ label, values, setValues }) => {
  const handleCodeChange = (index, val) => {
    const newValues = [...values];
    newValues[index].code = val;
    setValues(newValues);
  };
  const handleNumChange = (index, val) => {
    const newValues = [...values];
    newValues[index].num = val;
    setValues(newValues);
  };
  const handleAdd = () => setValues([...values, { code: '+91', num: '' }]);
  const handleRemove = (index) => {
    if (values.length > 1) {
      const newValues = [...values];
      newValues.splice(index, 1);
      setValues(newValues);
    }
  };

  return (
    <div className="form-group">
      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{label}</span>
        <button type="button" onClick={handleAdd} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 600 }}>
          <Plus size={12} /> Add More
        </button>
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {values.map((val, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="text" value={val.code} onChange={(e) => handleCodeChange(idx, e.target.value)} style={{ width: '60px', textAlign: 'center' }} />
            <input type="text" value={val.num} onChange={(e) => handleNumChange(idx, e.target.value)} style={{ flex: 1 }} placeholder="Mobile Number" />
            {values.length > 1 && (
              <button type="button" onClick={() => handleRemove(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}>
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function StudentForm({ generatedStudentId, nextRollNo, generatedAdmissionNumber, saveStudentAction, initialData = null, isEdit = false, allStudents = [] }) {
  const [presentAddress, setPresentAddress] = useState({
    houseNo: '', street: '', locality: '', landmark: '', state: '', city: '', district: '', pincode: ''
  });
  const [permanentAddress, setPermanentAddress] = useState({
    houseNo: '', street: '', locality: '', landmark: '', state: '', city: '', district: '', pincode: ''
  });
  const [sameAsPresent, setSameAsPresent] = useState(false);
  
  // Dynamic mobile lists with country code
  const [fatherMobiles, setFatherMobiles] = useState([{ code: '+91', num: '' }]);
  const [motherMobiles, setMotherMobiles] = useState([{ code: '+91', num: '' }]);
  const [primaryContact, setPrimaryContact] = useState(initialData?.primary_contact || 'Father');

  // Media cropping state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropAspect, setCropAspect] = useState(3/4);
  const [cropTarget, setCropTarget] = useState(null); // 'photo' or 'sign'
  const [photoBase64, setPhotoBase64] = useState('');
  const [signBase64, setSignBase64] = useState('');

  // Fee state
  const [feeDurationType, setFeeDurationType] = useState(initialData?.fee_duration_type || 'Monthly');
  const [tuitionFees, setTuitionFees] = useState(initialData?.tuition_fees || 0);
  const [busFees, setBusFees] = useState(initialData?.bus_fees || 0);
  const [otherFees, setOtherFees] = useState(initialData?.other_fees || 0);

  // Blood group and Sibling
  const [bloodGroup, setBloodGroup] = useState(initialData?.blood_group || '');
  const [siblingSearch, setSiblingSearch] = useState('');
  const [selectedSibling, setSelectedSibling] = useState(null);

  const photoInputRef = useRef(null);
  const signInputRef = useRef(null);

  // Initialize from initialData if editing
  useEffect(() => {
    if (initialData) {
      if (initialData.present_address) {
        try { setPresentAddress(JSON.parse(initialData.present_address)); } catch(e){}
      }
      if (initialData.permanent_address) {
        try { setPermanentAddress(JSON.parse(initialData.permanent_address)); } catch(e){}
      }
      if (initialData.father_mobile) {
        try { setFatherMobiles(JSON.parse(initialData.father_mobile) || [{ code: '+91', num: '' }]); } catch(e){}
      }
      if (initialData.mother_mobile) {
        try { setMotherMobiles(JSON.parse(initialData.mother_mobile) || [{ code: '+91', num: '' }]); } catch(e){}
      }
      if (initialData.doc_photo && initialData.doc_photo.startsWith('data:image')) {
        setPhotoBase64(initialData.doc_photo);
      }
      if (initialData.doc_sign && initialData.doc_sign.startsWith('data:image')) {
        setSignBase64(initialData.doc_sign);
      }
      if (initialData.blood_group) {
        setBloodGroup(initialData.blood_group);
      }
      if (initialData.primary_contact) {
        setPrimaryContact(initialData.primary_contact);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (initialData && initialData.sibling_id && allStudents.length > 0) {
      const sib = allStudents.find(s => s.id === initialData.sibling_id);
      if (sib) setSelectedSibling(sib);
    }
  }, [initialData, allStudents]);

  const filteredSiblings = siblingSearch.trim() === '' ? [] : allStudents.filter(s => 
    (s.name.toLowerCase().includes(siblingSearch.toLowerCase()) || 
    s.student_id.toLowerCase().includes(siblingSearch.toLowerCase())) &&
    (!isEdit || s.id !== initialData?.id)
  ).slice(0, 5);

  const handleClassChange = async (e) => {
    const selectedClass = e.target.value;
    if (selectedClass) {
      try {
        const res = await fetch(`/api/fees/master?class=${encodeURIComponent(selectedClass)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setFeeDurationType(data.duration_type || 'Monthly');
          setTuitionFees(data.tuition_fee || 0);
          setBusFees(data.bus_fee || 0);
          setOtherFees(data.other_fee || 0);
        }
      } catch (err) {
        console.error('Failed to fetch master fees', err);
      }
    }
  };

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
            if (sameAsPresent) {
               setPermanentAddress(prev => ({ ...prev, ...newDetails }));
            }
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
    // reset input
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
      <form action={saveStudentAction} style={{ textAlign: 'left' }}>
        <input type="hidden" name="present_address_json" value={JSON.stringify(presentAddress)} />
        <input type="hidden" name="permanent_address_json" value={JSON.stringify(permanentAddress)} />
        <input type="hidden" name="father_mobile_json" value={JSON.stringify(fatherMobiles.filter(m => m.num.trim() !== ''))} />
        <input type="hidden" name="mother_mobile_json" value={JSON.stringify(motherMobiles.filter(m => m.num.trim() !== ''))} />
        <input type="hidden" name="doc_photo_base64" value={photoBase64} />
        <input type="hidden" name="doc_sign_base64" value={signBase64} />
        <input type="hidden" name="blood_group" value={bloodGroup} />
        <input type="hidden" name="primary_contact" value={primaryContact} />
        <input type="hidden" name="sibling_id" value={selectedSibling ? selectedSibling.id : ''} />

        <div style={{ background: '#f4f5f7', padding: '12px 16px', borderRadius: '4px', marginBottom: '32px', display: 'flex', gap: '48px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{isEdit ? 'Student ID' : 'Auto-Generated Student ID'}</span>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent)' }}>{isEdit ? initialData.student_id : generatedStudentId}</div>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{isEdit ? 'Roll No' : 'Auto-Generated Roll No'}</span>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>{isEdit ? initialData.roll_number : nextRollNo}</div>
          </div>
        </div>

        <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '24px', color: 'var(--accent)' }}>1. Personal Details</h3>
        
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Left Side: Standard Fields */}
          <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" name="name" defaultValue={initialData?.name} required />
              </div>
              <div className="form-group">
                <label>Aadhar Number</label>
                <input type="text" name="aadhar_number" defaultValue={initialData?.aadhar_number} />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" name="dob" defaultValue={initialData?.dob} />
              </div>
              <div className="form-group">
                <label>Place of Birth</label>
                <input type="text" name="place_of_birth" defaultValue={initialData?.place_of_birth} />
              </div>
              <div className="form-group">
                <label>Caste Category</label>
                <select name="cast_category" defaultValue={initialData?.cast_category || 'UR'}>
                  <option value="UR">UR</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                  <option value="">-- Select --</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Father's Name</label>
                <input type="text" name="father_name" defaultValue={initialData?.father_name} />
              </div>
              <div className="form-group">
                <label>Mother's Name</label>
                <input type="text" name="mother_name" defaultValue={initialData?.mother_name} />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Father's Occupation</label>
                <input type="text" name="father_occupation" defaultValue={initialData?.father_occupation} />
              </div>
              <div className="form-group">
                <label>Mother's Occupation</label>
                <input type="text" name="mother_occupation" defaultValue={initialData?.mother_occupation} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ position: 'relative', flex: 1 }}>
                <label>Sibling in School?</label>
                {!selectedSibling ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid var(--border)', borderRadius: '4px', padding: '0 8px' }}>
                      <Search size={16} color="var(--text-secondary)" />
                      <input 
                        type="text" 
                        placeholder="Search student by name or ID..." 
                        value={siblingSearch}
                        onChange={(e) => setSiblingSearch(e.target.value)}
                        style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
                      />
                    </div>
                    {filteredSiblings.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid var(--border)', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, marginTop: '4px' }}>
                        {filteredSiblings.map(sib => (
                          <div 
                            key={sib.id}
                            onClick={() => { setSelectedSibling(sib); setSiblingSearch(''); }}
                            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                          >
                            <div style={{ fontWeight: 500 }}>{sib.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{sib.class} • {sib.student_id}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px' }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#166534' }}>{selectedSibling.name}</div>
                      <div style={{ fontSize: '12px', color: '#166534' }}>{selectedSibling.class} • {selectedSibling.student_id}</div>
                    </div>
                    <button type="button" onClick={() => setSelectedSibling(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h4 style={{ fontSize: '14px', marginTop: '24px', marginBottom: '12px' }}>Present Address</h4>
            <AddressFields prefix="present" address={presentAddress} onChange={handlePresentChange} />

            <div style={{ margin: '24px 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '14px', margin: 0 }}>Permanent Address</h4>
              <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginLeft: '16px' }}>
                <input type="checkbox" checked={sameAsPresent} onChange={handleCheckboxChange} />
                Same as Present Address
              </label>
            </div>
            <AddressFields prefix="permanent" address={permanentAddress} onChange={handlePermanentChange} disabled={sameAsPresent} />


            <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', margin: '40px 0 24px 0', color: 'var(--accent)' }}>2. Contact Details</h3>
            
            <div className="form-row" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <MobileInputList 
                  label={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Father Mobile Number(s)
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: '#f4f5f7', padding: '2px 6px', borderRadius: '4px' }}>
                        <input type="radio" name="primary_contact_display" checked={primaryContact === 'Father'} onChange={() => setPrimaryContact('Father')} />
                        Primary
                      </label>
                    </span>
                  } 
                  values={fatherMobiles} 
                  setValues={setFatherMobiles} 
                />
              </div>
              <div className="form-group">
                <label>Father Email Address</label>
                <input type="email" name="father_email" defaultValue={initialData?.father_email} />
              </div>
            </div>

            <div className="form-row" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <MobileInputList 
                  label={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Mother Mobile Number(s)
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'normal', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: '#f4f5f7', padding: '2px 6px', borderRadius: '4px' }}>
                        <input type="radio" name="primary_contact_display" checked={primaryContact === 'Mother'} onChange={() => setPrimaryContact('Mother')} />
                        Primary
                      </label>
                    </span>
                  } 
                  values={motherMobiles} 
                  setValues={setMotherMobiles} 
                />
              </div>
              <div className="form-group">
                <label>Mother Email Address</label>
                <input type="email" name="mother_email" defaultValue={initialData?.mother_email} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ maxWidth: '400px' }}>
                <label>WhatsApp Number belongs to</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" name="whatsapp_number" placeholder="Enter WhatsApp Number" defaultValue={initialData?.whatsapp_number} style={{ flex: 1 }} />
                  <select name="whatsapp_number_owner" defaultValue={initialData?.whatsapp_number_owner || 'Father'} style={{ width: '120px' }}>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Both">Both</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>
            </div>

          </div>

          {/* Right Side: Photo and Signature Uploads */}
          <div style={{ width: '280px', background: '#f9f9fa', padding: '16px', borderRadius: '4px', border: '1px solid var(--border)', flexShrink: 0, position: 'sticky', top: '24px' }}>
            <h4 style={{ fontSize: '13px', marginBottom: '16px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Identification Media</h4>
            
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                Student Photo
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

            <div className="form-group">
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                Student Signature
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

        <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', margin: '40px 0 24px 0', color: 'var(--accent)' }}>3. Academic Details</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Admission Number</label>
          <input type="text" name="admission_number" defaultValue={initialData?.admission_number || generatedAdmissionNumber} />
        </div>
        <div className="form-group">
          <label>Class *</label>
          <select name="class" required defaultValue={initialData?.class || ''} onChange={handleClassChange}>
            <option value="">-- Select --</option>
            <option value="Nursery">Nursery</option>
            <option value="LKG">LKG</option>
            <option value="UKG">UKG</option>
            <option value="Class 1">Class 1</option>
            <option value="Class 2">Class 2</option>
            <option value="Class 3">Class 3</option>
            <option value="Class 4">Class 4</option>
            <option value="Class 5">Class 5</option>
            <option value="Class 6">Class 6</option>
            <option value="Class 7">Class 7</option>
            <option value="Class 8">Class 8</option>
            <option value="Class 9">Class 9</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 11">Class 11</option>
            <option value="Class 12">Class 12</option>
          </select>
        </div>
        <div className="form-group">
          <label>Section *</label>
          <select name="section" required defaultValue={initialData?.section || 'A'}>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
            <option value="D">Section D</option>
          </select>
        </div>
        <div className="form-group">
          <label>Subjects</label>
          <select name="subjects" defaultValue={initialData?.subjects || 'All'}>
            <option value="All">All Subjects</option>
            <option value="PCM">PCM</option>
            <option value="PCB">PCB</option>
            <option value="Commerce">Commerce</option>
            <option value="Arts">Arts</option>
            <option value="Other">Other (Enter Manually)</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Class Teacher</label>
          <input type="text" name="class_teacher" defaultValue={initialData?.class_teacher} />
        </div>
        <div className="form-group">
          <label>Class Coordinator</label>
          <input type="text" name="class_coordinator" defaultValue={initialData?.class_coordinator} />
        </div>
        <div className="form-group">
          <label>Student House</label>
          <select name="student_house" defaultValue={initialData?.student_house || ''}>
            <option value="">-- None --</option>
            <option value="Blue">Blue</option>
            <option value="Green">Green</option>
            <option value="Red">Red</option>
            <option value="Yellow">Yellow</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Last School Studied</label>
          <input type="text" name="last_school" defaultValue={initialData?.last_school} />
        </div>
      </div>

      <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', margin: '40px 0 24px 0', color: 'var(--accent)' }}>4. Fees Setup</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Fee Duration Type</label>
          <select name="fee_duration_type" value={feeDurationType} onChange={e => setFeeDurationType(e.target.value)}>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
          </select>
        </div>
        <div className="form-group">
          <label>Tuition Fees</label>
          <input type="number" step="0.01" min="0" name="tuition_fees" value={tuitionFees} onChange={e => setTuitionFees(Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label>Bus Fees</label>
          <input type="number" step="0.01" min="0" name="bus_fees" value={busFees} onChange={e => setBusFees(Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label>Extra Class Fees</label>
          <input type="number" step="0.01" min="0" name="extra_class_fees" defaultValue={initialData?.extra_class_fees} />
        </div>
        <div className="form-group">
          <label>Other Fees</label>
          <input type="number" step="0.01" min="0" name="other_fees" value={otherFees} onChange={e => setOtherFees(Number(e.target.value))} />
        </div>
      </div>

      <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', margin: '40px 0 24px 0', color: 'var(--accent)' }}>5. Documents Upload</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Aadhar Card {initialData?.doc_aadhar && <span style={{ color: 'var(--success)' }}>(Uploaded)</span>}</label>
          <input type="file" name="doc_aadhar" accept=".pdf,image/*" />
        </div>
        <div className="form-group">
          <label>Last School TC {initialData?.doc_tc && <span style={{ color: 'var(--success)' }}>(Uploaded)</span>}</label>
          <input type="file" name="doc_tc" accept=".pdf,image/*" />
        </div>
        <div className="form-group">
          <label>Father's Aadhar {initialData?.doc_father_aadhar && <span style={{ color: 'var(--success)' }}>(Uploaded)</span>}</label>
          <input type="file" name="doc_father_aadhar" accept=".pdf,image/*" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Mother's Aadhar {initialData?.doc_mother_aadhar && <span style={{ color: 'var(--success)' }}>(Uploaded)</span>}</label>
          <input type="file" name="doc_mother_aadhar" accept=".pdf,image/*" />
        </div>
        <div className="form-group">
          <label>Caste Certificate {initialData?.doc_cast_certificate && <span style={{ color: 'var(--success)' }}>(Uploaded)</span>}</label>
          <input type="file" name="doc_cast_certificate" accept=".pdf,image/*" />
        </div>
      </div>

      <div style={{ marginTop: '48px', display: 'flex', gap: '16px', padding: '16px', background: '#f4f5f7', borderRadius: '4px' }}>
        <button type="submit" className="btn" style={{ padding: '10px 24px' }}>
          <Save size={16} /> {isEdit ? 'Update Complete Record' : 'Save Complete Record'}
        </button>
        <Link href="/students" className="btn btn-secondary" style={{ padding: '10px 24px' }}>Cancel</Link>
      </div>
    </form>
    </>
  );
}
