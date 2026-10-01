'use client';

import { useState } from 'react';
import { Save, UserCheck, Trash2 } from 'lucide-react';
import { assignClassTeacher, removeClassTeacher } from '../actions';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';
import { useSortableData } from '@/hooks/useSortableData';
import SortableHeader from '@/components/SortableHeader';

export default function ClassTeachersClient({ classes, sections, staff, initialAllocations }) {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState(classes[0]?.class_name || '');
  const [selectedSection, setSelectedSection] = useState(sections[0]?.section_name || '');
  const [loading, setLoading] = useState(false);
  const { items: sortedAllocations, requestSort, sortConfig } = useSortableData(initialAllocations);

  // Find the currently assigned teacher for the selected class/section combination
  const currentAllocation = initialAllocations.find(a => a.class_name === selectedClass && a.section_name === selectedSection);
  const [selectedStaff, setSelectedStaff] = useState(currentAllocation ? currentAllocation.staff_id : '');

  // Update selected staff when class or section changes
  const handleSelectionChange = (cls, sec) => {
    setSelectedClass(cls);
    setSelectedSection(sec);
    const alloc = initialAllocations.find(a => a.class_name === cls && a.section_name === sec);
    setSelectedStaff(alloc ? alloc.staff_id : '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('class_name', selectedClass);
    formData.append('section_name', selectedSection);
    formData.append('staff_id', selectedStaff);
    
    await assignClassTeacher(formData);
    setLoading(false);
    setLoading(false);
    router.refresh();
  };
    
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, className: '', sectionName: '' });

  const handleRemoveClick = (className, sectionName) => {
    setConfirmModal({ isOpen: true, className, sectionName });
  };

  const executeRemove = async () => {
    setLoading(true);
    await removeClassTeacher(confirmModal.className, confirmModal.sectionName);
    setLoading(false);
    setConfirmModal({ isOpen: false, className: '', sectionName: '' });
    router.refresh();
  };

  return (
    <>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, className: '', sectionName: '' })}
        onConfirm={executeRemove}
        title="Remove Allocation"
        message={`Are you sure you want to remove the class teacher for ${confirmModal.className} - Section ${confirmModal.sectionName}?`}
        loading={loading}
      />
      <div className="page-header">
        <div>
          <div className="breadcrumb">Master Settings / Class Teacher Allocation</div>
          <h1 className="page-title">Class Teacher Allocation</h1>
        </div>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
          Assign a primary Class Teacher to each Class and Section combination.
        </p>

        <form onSubmit={handleSave}>
          <div className="form-row" style={{ maxWidth: '800px', marginBottom: '32px' }}>
            <div className="form-group">
              <label>Select Class</label>
              <select value={selectedClass} onChange={(e) => handleSelectionChange(e.target.value, selectedSection)} required>
                <option value="" disabled>Select a class...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.class_name}>{c.class_name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Select Section</label>
              <select value={selectedSection} onChange={(e) => handleSelectionChange(selectedClass, e.target.value)} required>
                <option value="" disabled>Select a section...</option>
                {sections.map(s => (
                  <option key={s.id} value={s.section_name}>{s.section_name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedClass && selectedSection && (
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <UserCheck size={18} color="var(--accent)" />
                <h3 style={{ margin: 0 }}>Assign Teacher for {selectedClass} - Section {selectedSection}</h3>
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
        <h3>Current Allocations</h3>
        <div className="table-container" style={{ marginTop: '16px' }}>
          <table>
            <thead>
              <tr>
                <SortableHeader label="Class" sortKey="class_name" currentSortConfig={sortConfig} requestSort={requestSort} />
                <SortableHeader label="Section" sortKey="section_name" currentSortConfig={sortConfig} requestSort={requestSort} />
                <SortableHeader label="Assigned Teacher" sortKey="staff_name" currentSortConfig={sortConfig} requestSort={requestSort} />
                <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedAllocations.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>No teachers allocated yet.</td></tr>
              ) : (
                sortedAllocations.map((alloc, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{alloc.class_name}</td>
                    <td>{alloc.section_name}</td>
                    <td>{alloc.staff_name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleRemoveClick(alloc.class_name, alloc.section_name)}
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
