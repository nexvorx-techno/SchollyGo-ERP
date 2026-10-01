'use client';

import { useState } from 'react';
import { Save, BookOpen, Trash2 } from 'lucide-react';
import { assignSubjectTeacher, removeSubjectTeacher } from '../actions';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';
import { useSortableData } from '@/hooks/useSortableData';
import SortableHeader from '@/components/SortableHeader';

export default function SubjectTeachersClient({ classes, sections, subjects, classSubjects, staff, initialAllocations }) {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState(classes[0]?.class_name || '');
  const [selectedSection, setSelectedSection] = useState(sections[0]?.section_name || '');
  
  // Filter subjects based on the class mapping
  const availableSubjects = classSubjects.filter(cs => cs.class_name === selectedClass).map(cs => cs.subject_name);
  const [selectedSubject, setSelectedSubject] = useState(availableSubjects[0] || '');
  
  const [loading, setLoading] = useState(false);
  
  const { items: sortedAllocations, requestSort, sortConfig } = useSortableData(initialAllocations);

  // Find current allocation
  const currentAllocation = initialAllocations.find(a => 
    a.class_name === selectedClass && 
    a.section_name === selectedSection &&
    a.subject_name === selectedSubject
  );
  const [selectedStaff, setSelectedStaff] = useState(currentAllocation ? currentAllocation.staff_id : '');

  const handleSelectionChange = (cls, sec, sub) => {
    setSelectedClass(cls);
    setSelectedSection(sec);
    
    let activeSub = sub;
    if (cls !== selectedClass) {
      const newAvailable = classSubjects.filter(cs => cs.class_name === cls).map(cs => cs.subject_name);
      activeSub = newAvailable[0] || '';
    }
    setSelectedSubject(activeSub);
    
    const alloc = initialAllocations.find(a => a.class_name === cls && a.section_name === sec && a.subject_name === activeSub);
    setSelectedStaff(alloc ? alloc.staff_id : '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('class_name', selectedClass);
    formData.append('section_name', selectedSection);
    formData.append('subject_name', selectedSubject);
    formData.append('staff_id', selectedStaff);
    
    await assignSubjectTeacher(formData);
    setLoading(false);
    setLoading(false);
    router.refresh();
  };
    
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, className: '', sectionName: '', subjectName: '' });

  const handleRemoveClick = (className, sectionName, subjectName) => {
    setConfirmModal({ isOpen: true, className, sectionName, subjectName });
  };

  const executeRemove = async () => {
    setLoading(true);
    await removeSubjectTeacher(confirmModal.className, confirmModal.sectionName, confirmModal.subjectName);
    setLoading(false);
    setConfirmModal({ isOpen: false, className: '', sectionName: '', subjectName: '' });
    router.refresh();
  };

  return (
    <>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, className: '', sectionName: '', subjectName: '' })}
        onConfirm={executeRemove}
        title="Remove Allocation"
        message={`Are you sure you want to remove the ${confirmModal.subjectName} teacher for ${confirmModal.className} - Section ${confirmModal.sectionName}?`}
        loading={loading}
      />
      <div className="page-header">
        <div>
          <div className="breadcrumb">Master Settings / Subject Teacher Master</div>
          <h1 className="page-title">Subject Teacher Master</h1>
        </div>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
          Assign specific subject teachers for a Class and Section. Only subjects allocated to the class in the "Stream & Subject Assign" module will appear here.
        </p>

        <form onSubmit={handleSave}>
          <div className="form-row" style={{ maxWidth: '800px', marginBottom: '32px' }}>
            <div className="form-group">
              <label>Select Class</label>
              <select value={selectedClass} onChange={(e) => handleSelectionChange(e.target.value, selectedSection, selectedSubject)} required>
                <option value="" disabled>Select a class...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.class_name}>{c.class_name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Select Section</label>
              <select value={selectedSection} onChange={(e) => handleSelectionChange(selectedClass, e.target.value, selectedSubject)} required>
                <option value="" disabled>Select a section...</option>
                {sections.map(s => (
                  <option key={s.id} value={s.section_name}>{s.section_name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Select Subject</label>
              <select value={selectedSubject} onChange={(e) => handleSelectionChange(selectedClass, selectedSection, e.target.value)} required>
                {availableSubjects.length === 0 && <option value="" disabled>No subjects mapped</option>}
                {availableSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedClass && selectedSection && selectedSubject && (
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <BookOpen size={18} color="var(--accent)" />
                <h3 style={{ margin: 0 }}>Assign {selectedSubject} Teacher for {selectedClass} - Section {selectedSection}</h3>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>Select Staff Member</label>
                <select value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}>
                  <option value="">-- No Teacher Assigned --</option>
                  {staff.map(st => (
                    <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                  ))}
                </select>
              </div>

              <button className="btn" type="submit" disabled={loading} style={{ width: '200px' }}>
                <Save size={16} /> {loading ? 'Saving...' : 'Save Allocation'}
              </button>
            </div>
          )}
        </form>
      </div>
      
      <div className="panel" style={{ padding: '24px', marginTop: '24px' }}>
        <h3>Current Subject Allocations</h3>
        <div className="table-container" style={{ marginTop: '16px' }}>
          <table>
            <thead>
              <tr>
                <SortableHeader label="Class" sortKey="class_name" currentSortConfig={sortConfig} requestSort={requestSort} />
                <SortableHeader label="Section" sortKey="section_name" currentSortConfig={sortConfig} requestSort={requestSort} />
                <SortableHeader label="Subject" sortKey="subject_name" currentSortConfig={sortConfig} requestSort={requestSort} />
                <SortableHeader label="Assigned Teacher" sortKey="staff_name" currentSortConfig={sortConfig} requestSort={requestSort} />
                <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedAllocations.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No subject teachers allocated yet.</td></tr>
              ) : (
                sortedAllocations.map((alloc, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{alloc.class_name}</td>
                    <td>{alloc.section_name}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 500 }}>{alloc.subject_name}</td>
                    <td>{alloc.staff_name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleRemoveClick(alloc.class_name, alloc.section_name, alloc.subject_name)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}
                        title="Remove Allocation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
