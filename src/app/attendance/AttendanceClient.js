'use client';

import { useState, useEffect } from 'react';
import { getStudentsForAttendance, saveAttendance } from './actions';
import { Save, Check, X, Clock, AlertCircle, Loader2 } from 'lucide-react';

export default function AttendanceClient({ classes = [], sectionsByClass = {} }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  // When classes are provided but section might not be 'A', wait to set it.
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchStudents = async () => {
    if (!selectedClass || !selectedSection || !date) return;
    setLoading(true);
    setMessage(null);
    try {
      const data = await getStudentsForAttendance(selectedClass, selectedSection, date);
      setStudents(data);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to fetch students.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedSection && date) {
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedClass, selectedSection, date]);

  const handleStatusChange = (studentId, status) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, remarks } : s));
  };

  const markAll = (status) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveAttendance(date, selectedClass, selectedSection, students);
      setMessage({ type: 'success', text: 'Attendance saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save attendance.' });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(s => s.status === 'Present').length;
  const absentCount = students.filter(s => s.status === 'Absent').length;
  const lateCount = students.filter(s => s.status === 'Late').length;
  const halfDayCount = students.filter(s => s.status === 'Half Day').length;

  return (
    <div>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
          <label>Attendance Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
        </div>
        <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
          <label>Class</label>
          <select value={selectedClass} onChange={e => {
            setSelectedClass(e.target.value);
            const availableSections = sectionsByClass[e.target.value] || [];
            setSelectedSection(availableSections.length > 0 ? availableSections[0] : '');
          }}>
            <option value="">-- Select Class --</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: '1', minWidth: '150px', marginBottom: 0 }}>
          <label>Section</label>
          <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedClass}>
            {selectedClass && (sectionsByClass[selectedClass] || []).map(s => <option key={s} value={s}>Section {s}</option>)}
          </select>
        </div>
        <div>
          <button className="btn btn-secondary" onClick={fetchStudents} disabled={loading || !selectedClass} style={{ height: '38px' }}>
            {loading ? <Loader2 size={16} className="spin" /> : 'Load List'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{ 
          padding: '12px 16px', 
          marginBottom: '24px', 
          borderRadius: '6px', 
          background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', 
          color: message.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {selectedClass && !loading && students.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px', background: '#f9f9fa', borderRadius: '8px', border: '1px dashed var(--border)' }}>
          <AlertCircle size={32} color="var(--text-tertiary)" style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>No Students Found</h3>
          <p style={{ margin: 0, color: 'var(--text-tertiary)', fontSize: '13px' }}>
            There are no active students in {selectedClass} - {selectedSection}.
          </p>
        </div>
      )}

      {students.length > 0 && (
        <div>
          {/* Dashboard Stats for Attendance */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Present</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#14532d' }}>{presentCount}</div>
              </div>
              <Check size={32} color="#22c55e" opacity={0.2} />
            </div>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: 600, textTransform: 'uppercase' }}>Absent</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#7f1d1d' }}>{absentCount}</div>
              </div>
              <X size={32} color="#ef4444" opacity={0.2} />
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#b45309', fontWeight: 600, textTransform: 'uppercase' }}>Late / Half Day</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#92400e' }}>{lateCount + halfDayCount}</div>
              </div>
              <Clock size={32} color="#f59e0b" opacity={0.2} />
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600, textTransform: 'uppercase' }}>Total Strength</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a' }}>{students.length}</div>
              </div>
              <UsersIcon size={32} color="#64748b" opacity={0.2} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Mark Attendance</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 12px' }} onClick={() => markAll('Present')}>Mark All Present</button>
              <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '4px 12px' }} onClick={() => markAll('Absent')}>Mark All Absent</button>
            </div>
          </div>

          <div className="table-container" style={{ overflow: 'visible' }}>
            <table style={{ minWidth: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Roll No</th>
                  <th>Student Name</th>
                  <th style={{ width: '300px' }}>Attendance Status</th>
                  <th>Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id} style={{ 
                    background: student.status === 'Absent' ? '#fef2f2' : student.status === 'Late' || student.status === 'Half Day' ? '#fffbeb' : 'transparent' 
                  }}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {student.roll_number || '-'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{student.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{student.student_id}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {['Present', 'Absent', 'Late', 'Half Day'].map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleStatusChange(student.id, status)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: student.status === status ? 'none' : '1px solid var(--border)',
                              background: student.status === status ? (
                                status === 'Present' ? '#22c55e' : 
                                status === 'Absent' ? '#ef4444' : 
                                '#f59e0b'
                              ) : '#fff',
                              color: student.status === status ? '#fff' : 'var(--text-secondary)',
                              transition: 'all 0.2s ease',
                              boxShadow: student.status === status ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                            }}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={student.remarks} 
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        placeholder="Reason (if absent/late)" 
                        style={{ padding: '6px 12px', width: '100%', fontSize: '13px', background: 'transparent' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', padding: '16px', background: '#f9f9fa', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <button className="btn" onClick={handleSave} disabled={saving} style={{ padding: '12px 32px', fontSize: '15px' }}>
              {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Attendance Register'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Icon to save import
function UsersIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
