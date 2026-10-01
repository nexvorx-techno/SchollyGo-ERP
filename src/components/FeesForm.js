'use client';

import { useState, useMemo } from 'react';
import { Search, Save, X, User } from 'lucide-react';
import { formatDate } from '@/lib/formatDate';

const MONTHS = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
const QUARTERS = ['Q1 (Apr-Jun)', 'Q2 (Jul-Sep)', 'Q3 (Oct-Dec)', 'Q4 (Jan-Mar)'];

export default function FeesForm({ generatedReceiptNumber, saveFeeAction, students, masterFees }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [durationType, setDurationType] = useState('Monthly'); // 'Monthly' or 'Quarterly'
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  
  const [busAmount, setBusAmount] = useState(0);
  const [otherAmount, setOtherAmount] = useState(0);

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const lowerQ = searchQuery.toLowerCase();
    return students.filter(s => 
      s.name.toLowerCase().includes(lowerQ) || 
      s.student_id.toLowerCase().includes(lowerQ) ||
      (s.aadhar_number && s.aadhar_number.includes(lowerQ))
    );
  }, [searchQuery, students]);

  // Handle student selection
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setIsSearchOpen(false);
  };

  const handlePeriodToggle = (period) => {
    if (selectedPeriods.includes(period)) {
      setSelectedPeriods(selectedPeriods.filter(p => p !== period));
    } else {
      setSelectedPeriods([...selectedPeriods, period]);
    }
  };

  // Look up master fee for selected student's class
  const masterFeeRecord = useMemo(() => {
    if (!selectedStudent || !masterFees) return null;
    return masterFees.find(m => m.class_name === selectedStudent.class);
  }, [selectedStudent, masterFees]);

  const getPeriodDueDate = (periodStr) => {
    const today = new Date();
    let year = today.getFullYear(); 
    
    // Simplistic year detection: if today is Jan-Mar, we are in the 'end' of the academic year.
    const isCurrentYearEnding = today.getMonth() < 3;
    const academicStartYear = isCurrentYearEnding ? year - 1 : year;

    let monthIdx = 0;
    if (durationType === 'Monthly') {
      const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      monthIdx = allMonths.indexOf(periodStr);
    } else {
      if (periodStr.includes('Q1')) monthIdx = 3; // April
      if (periodStr.includes('Q2')) monthIdx = 6; // July
      if (periodStr.includes('Q3')) monthIdx = 9; // October
      if (periodStr.includes('Q4')) monthIdx = 0; // January
    }

    let dueYear = academicStartYear;
    if (monthIdx < 3) { // Jan, Feb, Mar belong to the end of the academic year (next calendar year)
      dueYear = academicStartYear + 1;
    }

    const dueDay = masterFeeRecord?.due_date_day || 10;
    // Due date based on the configured day of the month
    return new Date(dueYear, monthIdx, dueDay); 
  };

  const calculateLateFee = () => {
    if (!masterFeeRecord || !masterFeeRecord.late_fee_type || masterFeeRecord.late_fee_type === 'None') return 0;
    
    let totalLateFee = 0;
    const today = new Date();
    
    selectedPeriods.forEach(period => {
      const dueDate = getPeriodDueDate(period);
      if (today > dueDate) {
        const timeDiff = today.getTime() - dueDate.getTime();
        const daysLate = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        if (daysLate > 0) {
          if (masterFeeRecord.late_fee_type === 'Per Day') {
            totalLateFee += daysLate * masterFeeRecord.late_fee_amount;
          } else if (masterFeeRecord.late_fee_type === 'Fixed') {
            totalLateFee += masterFeeRecord.late_fee_amount;
          }
        }
      }
    });
    
    return totalLateFee;
  };

  const lateFeeAmount = calculateLateFee();

  const baseTuition = masterFeeRecord ? masterFeeRecord.tuition_fee : 0;
  
  // Calculate multiplier based on master fee duration type vs selected payment duration type
  let tuitionMultiplier = 1;
  const studentDurationType = masterFeeRecord ? (masterFeeRecord.duration_type || 'Monthly') : 'Monthly';
  
  if (studentDurationType === 'Monthly' && durationType === 'Quarterly') {
    tuitionMultiplier = 3;
  } else if (studentDurationType === 'Quarterly' && durationType === 'Monthly') {
    tuitionMultiplier = 1 / 3;
  } else {
    tuitionMultiplier = 1;
  }
  
  const totalTuition = baseTuition * tuitionMultiplier * selectedPeriods.length;
  
  const totalAmount = totalTuition + busAmount + otherAmount + lateFeeAmount;

  return (
    <>
      {/* Student Search Modal */}
      {isSearchOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Search Student</h3>
              <button onClick={() => setIsSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            <input 
              type="text" 
              placeholder="Search by Name, Student ID, or Aadhar..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '10px 14px', width: '100%', marginBottom: '16px', border: '1px solid var(--border)', borderRadius: '4px' }}
            />
            <div style={{ overflowY: 'auto', flex: 1, border: '1px solid var(--border)', borderRadius: '4px' }}>
              {filteredStudents.map(student => (
                <div 
                  key={student.id} 
                  onClick={() => handleSelectStudent(student)}
                  style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: '#fff' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f9f9fa'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: student.doc_photo ? `url(${student.doc_photo}) center/cover` : '#eee', marginRight: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!student.doc_photo && <User size={20} color="#ccc" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{student.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ID: {student.student_id} • Class: {student.class}</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>
                    ₹{student.tuition_fees}/mo
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No students found.</div>}
            </div>
          </div>
        </div>
      )}

      <form action={saveFeeAction} style={{ textAlign: 'left' }}>
        <input type="hidden" name="student_id" value={selectedStudent ? selectedStudent.id : ''} />
        <input type="hidden" name="months_paid_json" value={JSON.stringify(selectedPeriods)} />
        <input type="hidden" name="tuition_amount" value={totalTuition} />
        <input type="hidden" name="late_fee_amount" value={lateFeeAmount} />

        <div style={{ background: '#f4f5f7', padding: '16px', borderRadius: '4px', marginBottom: '32px', display: 'flex', gap: '48px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Auto-Generated Receipt No</span>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--accent)' }}>{generatedReceiptNumber}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Date</div>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>{formatDate(new Date())}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '32px' }}>
          {/* Left Column */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '24px', color: 'var(--accent)' }}>1. Student Details</h3>
            
            {!selectedStudent ? (
              <div style={{ border: '1px dashed var(--border)', borderRadius: '4px', padding: '32px', textAlign: 'center', background: '#f9f9fa' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Select a student to continue</p>
                <button type="button" className="btn" onClick={() => setIsSearchOpen(true)}>
                  <Search size={16} /> Search Student
                </button>
              </div>
            ) : (
              <div style={{ border: '1px solid var(--border)', borderRadius: '4px', padding: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '80px', height: '100px', borderRadius: '4px', background: selectedStudent.doc_photo ? `url(${selectedStudent.doc_photo}) center/cover` : '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!selectedStudent.doc_photo && <User size={40} color="#ccc" />}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 8px 0' }}>{selectedStudent.name}</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                    <div><span style={{ color: 'var(--text-secondary)' }}>ID:</span> {selectedStudent.student_id}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Class:</span> {selectedStudent.class}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Father:</span> {selectedStudent.father_name}</div>
                    <div><span style={{ color: 'var(--text-secondary)' }}>Aadhar:</span> {selectedStudent.aadhar_number}</div>
                  </div>
                  <button type="button" onClick={() => setIsSearchOpen(true)} style={{ marginTop: '16px', background: 'none', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Change Student</button>
                </div>
              </div>
            )}

            <h3 style={{ fontSize: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', margin: '40px 0 24px 0', color: 'var(--accent)' }}>2. Fee Structure</h3>
            
            <div className="form-group" style={{ opacity: selectedStudent ? 1 : 0.5, pointerEvents: selectedStudent ? 'auto' : 'none' }}>
              <label>Duration Type</label>
              <select name="duration_type" value={durationType} onChange={(e) => { setDurationType(e.target.value); setSelectedPeriods([]); }}>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>

            <div className="form-group" style={{ opacity: selectedStudent ? 1 : 0.5, pointerEvents: selectedStudent ? 'auto' : 'none' }}>
              <label>Select Periods</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {(durationType === 'Monthly' ? MONTHS : QUARTERS).map(period => (
                  <label key={period} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', background: selectedPeriods.includes(period) ? '#f0f4ff' : '#fff', borderColor: selectedPeriods.includes(period) ? 'var(--accent)' : 'var(--border)' }}>
                    <input type="checkbox" checked={selectedPeriods.includes(period)} onChange={() => handlePeriodToggle(period)} />
                    <span style={{ fontSize: '13px' }}>{period}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-row" style={{ marginTop: '24px', opacity: selectedStudent ? 1 : 0.5, pointerEvents: selectedStudent ? 'auto' : 'none' }}>
              <div className="form-group">
                <label>Bus Fees (Manual Override)</label>
                <input type="number" name="bus_amount" value={busAmount} onChange={e => setBusAmount(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Other Fees</label>
                <input type="number" name="other_amount" value={otherAmount} onChange={e => setOtherAmount(Number(e.target.value))} />
              </div>
            </div>

          </div>

          {/* Right Column: Receipt Summary */}
          <div style={{ width: '320px', flexShrink: 0 }}>
            <div style={{ position: 'sticky', top: '24px', background: '#fff', padding: '24px', borderRadius: '4px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Receipt Summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Tuition Fee</span>
                  <span>₹{totalTuition.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Bus Fee</span>
                  <span>₹{busAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Other Fees</span>
                  <span>₹{otherAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                  <span>Late Fee Fine</span>
                  <span>₹{lateFeeAmount.toFixed(2)}</span>
                </div>
                <hr style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 600 }}>
                  <span>Total Amount</span>
                  <span style={{ color: 'var(--accent)' }}>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit" className="btn" disabled={!selectedStudent || selectedPeriods.length === 0} style={{ width: '100%', padding: '12px' }}>
                <Save size={18} /> Save & Print Receipt
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
