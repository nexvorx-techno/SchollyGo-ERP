'use client';

import { useState } from 'react';
import { addClass, addSection, deleteClass, deleteSection, assignSectionToClass } from '../actions';
import { useRouter } from 'next/navigation';
import { Trash2, Edit } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { useSortableData } from '@/hooks/useSortableData';
import SortableHeader from '@/components/SortableHeader';

export default function ClassSectionsClient({ initialClasses, initialSections, initialMappings }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { items: sortedClasses, requestSort: requestClassSort, sortConfig: classSortConfig } = useSortableData(initialClasses);
  const { items: sortedSections, requestSort: requestSectionSort, sortConfig: sectionSortConfig } = useSortableData(initialSections);

  const handleAddClass = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    await addClass(formData);
    e.target.reset();
    setLoading(false);
    router.refresh();
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    await addSection(formData);
    e.target.reset();
    setLoading(false);
    router.refresh();
  };

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, name: '', type: '' });

  const handleRemoveClassClick = (id, name) => {
    setConfirmModal({ isOpen: true, id, name, type: 'class' });
  };

  const handleRemoveSectionClick = (id, name) => {
    setConfirmModal({ isOpen: true, id, name, type: 'section' });
  };

  const executeDelete = async () => {
    setLoading(true);
    if (confirmModal.type === 'class') {
      await deleteClass(confirmModal.id);
    } else if (confirmModal.type === 'section') {
      await deleteSection(confirmModal.id);
    }
    setLoading(false);
    setConfirmModal({ ...confirmModal, isOpen: false });
    router.refresh();
  };

  // Section Assignment Modal State
  const [assignModal, setAssignModal] = useState({ isOpen: false, className: '' });
  const [selectedSections, setSelectedSections] = useState(new Set());

  const openAssignModal = (className) => {
    const validSectionNames = new Set(initialSections.map(s => s.section_name));
    const existing = (initialMappings[className] || []).filter(sec => validSectionNames.has(sec));
    setSelectedSections(new Set(existing));
    setAssignModal({ isOpen: true, className });
  };

  const handleToggleSection = (sectionName) => {
    const newSet = new Set(selectedSections);
    if (newSet.has(sectionName)) {
      newSet.delete(sectionName);
    } else {
      newSet.add(sectionName);
    }
    setSelectedSections(newSet);
  };

  const handleSaveAssignments = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('class_name', assignModal.className);
    Array.from(selectedSections).forEach(sec => formData.append('sections', sec));
    
    await assignSectionToClass(formData);
    
    setLoading(false);
    setAssignModal({ isOpen: false, className: '' });
    router.refresh();
  };

  return (
    <>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeDelete}
        title={`Delete ${confirmModal.type === 'class' ? 'Class' : 'Section'}`}
        message={`Are you sure you want to delete ${confirmModal.type === 'class' ? 'class' : 'section'} "${confirmModal.name}"? This action cannot be undone.`}
        loading={loading}
      />
      <div className="page-header">
        <div>
          <div className="breadcrumb">Master Settings / Class & Section Master</div>
          <h1 className="page-title">Class & Section Master</h1>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3>Master Classes</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '16px' }}>Define classes (e.g. Class 1, LKG)</p>
          
          <form onSubmit={handleAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" name="class_name" required placeholder="Class Name" style={{ flex: 1, padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }} />
              <input type="text" name="stream" placeholder="Stream (Optional)" style={{ flex: 1, padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Start Time:</span>
                <input type="time" name="start_time" required style={{ flex: 1, padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>End Time:</span>
                <input type="time" name="end_time" required style={{ flex: 1, padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }} />
              </div>
              <button className="btn" type="submit" disabled={loading} style={{ padding: '8px 24px' }}>Add</button>
            </div>
          </form>

          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <table style={{ margin: 0 }}>
              <thead>
                <tr>
                  <SortableHeader label="Class Name" sortKey="class_name" currentSortConfig={classSortConfig} requestSort={requestClassSort} />
                  <SortableHeader label="Stream" sortKey="stream" currentSortConfig={classSortConfig} requestSort={requestClassSort} />
                  <th>Timing</th>
                  <th>Sections</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedClasses.map(c => {
                  const validSectionNames = new Set(initialSections.map(s => s.section_name));
                  const mappedSecs = (initialMappings[c.class_name] || []).filter(sec => validSectionNames.has(sec));
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500 }}>{c.class_name}</td>
                      <td>{c.stream || '-'}</td>
                      <td>
                        {c.start_time && c.end_time ? (
                          <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            {c.start_time} - {c.end_time}
                          </span>
                        ) : '-'}
                      </td>
                      <td>
                        {mappedSecs.length > 0 ? (
                          <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#4f46e5', padding: '4px 8px', borderRadius: '4px' }}>
                            {mappedSecs.length} assigned
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>None</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => openAssignModal(c.class_name)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '4px' }}
                          title="Assign Sections"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleRemoveClassClick(c.id, c.class_name)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}
                          title="Delete Class"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel" style={{ padding: '24px' }}>
          <h3>Master Sections</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', marginBottom: '16px' }}>Define sections (e.g. A, B, C)</p>
          
          <form onSubmit={handleAddSection} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <input type="text" name="section_name" required placeholder="Section Name" style={{ flex: 1, padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }} />
            <button className="btn" type="submit" disabled={loading}>Add</button>
          </form>

          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <table style={{ margin: 0 }}>
              <thead>
                <tr>
                  <SortableHeader label="Section Name" sortKey="section_name" currentSortConfig={sectionSortConfig} requestSort={requestSectionSort} />
                  <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedSections.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.section_name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleRemoveSectionClick(s.id, s.section_name)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}
                        title="Delete Section"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {assignModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Assign Sections to {assignModal.className}</h3>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '24px', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px' }}>
              {initialSections.length === 0 ? (
                <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px 0' }}>No sections defined in master.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {initialSections.map(sec => (
                    <label key={sec.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedSections.has(sec.section_name)}
                        onChange={() => handleToggleSection(sec.section_name)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                      />
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{sec.section_name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setAssignModal({ isOpen: false, className: '' })}>Cancel</button>
              <button className="btn" onClick={handleSaveAssignments} disabled={loading}>
                {loading ? 'Saving...' : 'Save Assignments'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
