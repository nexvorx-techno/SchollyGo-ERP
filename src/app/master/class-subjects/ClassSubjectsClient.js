'use client';

import { useState } from 'react';
import { Save, Folder, X, Plus, Trash2, Edit } from 'lucide-react';
import { assignSubjectToClass } from '../actions';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';

export default function ClassSubjectsClient({ classes, subjects, initialMappings }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null); // The class name currently opened
  const [activeModalClass, setActiveModalClass] = useState(null); // The class name currently being edited in modal
  const [selectedSubjects, setSelectedSubjects] = useState(new Set());
  
  // Subject Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerSelected, setPickerSelected] = useState(new Set());
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, subjectName: '' });

  // Helper to get subjects mapped to a specific class
  const getMappedSubjects = (className) => {
    return initialMappings.filter(m => m.class_name === className).map(m => m.subject_name);
  };

  const openEditModal = (className) => {
    const mapped = getMappedSubjects(className);
    const newSet = new Set(mapped);
    setSelectedSubjects(newSet);
    setActiveModalClass(className);
  };

  const handleAddSubject = () => {
    if (pickerSelected.size === 0) return;
    const newSet = new Set(selectedSubjects);
    pickerSelected.forEach(sub => newSet.add(sub));
    setSelectedSubjects(newSet);
    
    setIsPickerOpen(false);
    setPickerSelected(new Set());
    setPickerSearch('');
  };

  const handleRemoveSubjectClick = (subjectName) => {
    setConfirmModal({ isOpen: true, subjectName });
  };

  const handleRemoveSubject = () => {
    const newSet = new Set(selectedSubjects);
    newSet.delete(confirmModal.subjectName);
    setSelectedSubjects(newSet);
    setConfirmModal({ isOpen: false, subjectName: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('class_name', activeModalClass);
    Array.from(selectedSubjects).forEach(sub => formData.append('subjects', sub));
    
    await assignSubjectToClass(formData);
    
    setLoading(false);
    setActiveModalClass(null);
    router.refresh();
  };

  return (
    <>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, subjectName: '' })}
        onConfirm={handleRemoveSubject}
        title="Remove Subject"
        message={`Are you sure you want to remove ${confirmModal.subjectName} from this class?`}
        loading={false}
      />
      <div className="page-header">
        <div>
          <div className="breadcrumb">Master Settings / Stream & Subject Assign</div>
          <h1 className="page-title">Subject Assignment Master</h1>
        </div>
      </div>

      <div className="panel" style={{ padding: '24px', minHeight: '60vh' }}>
        
        {/* VIEW 1: All Folders Grid */}
        {!activeFolder && (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Double-click a folder to open and manage subjects for that class.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '24px' }}>
              {classes.map(cls => (
                <div 
                  key={cls.id} 
                  className="folder-card"
                  onDoubleClick={() => setActiveFolder(cls.class_name)}
                  title={`Double-click to open ${cls.class_name}`}
                >
                  <Folder size={64} color="#64748b" fill="#cbd5e1" style={{ marginBottom: '12px' }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>{cls.class_name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{getMappedSubjects(cls.class_name).length} subjects</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* VIEW 2: Opened Folder */}
        {activeFolder && (
          <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  onClick={() => setActiveFolder(null)}
                  style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  title="Back to Folders"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Folder size={28} color="var(--accent)" fill="var(--accent)" fillOpacity={0.2} />
                  <h2 style={{ margin: 0, fontSize: '20px' }}>{activeFolder}</h2>
                </div>
              </div>
              <button className="btn" onClick={() => openEditModal(activeFolder)}>
                <Edit size={16} /> Edit Subjects
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              {getMappedSubjects(activeFolder).length === 0 ? (
                <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '32px 0' }}>
                  This folder is empty. Click "Edit Subjects" to add subjects to {activeFolder}.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {getMappedSubjects(activeFolder).map(subName => (
                    <div key={subName} style={{ display: 'flex', alignItems: 'center', background: '#fff', color: 'var(--text-primary)', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      {subName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal (Add/Delete Checkboxes) */}
      {activeModalClass && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '600px', maxWidth: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Edit size={24} color="var(--accent)" />
                <h3 style={{ margin: 0, fontSize: '18px' }}>Assign Subjects for {activeModalClass}</h3>
              </div>
              <button onClick={() => setActiveModalClass(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={24} /></button>
            </div>
            
            <div style={{ overflowY: 'visible', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
              
              {/* Add New Subject Section */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="btn"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} /> Add Subject
                </button>
              </div>

              {/* Added Subjects List */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Currently Assigned Subjects</label>
                {selectedSubjects.size === 0 ? (
                  <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                    No subjects assigned yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Array.from(selectedSubjects).map(subName => {
                      const masterSub = subjects.find(s => s.subject_name === subName);
                      return (
                        <div key={subName} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{subName}</span>
                            {masterSub?.subject_code && <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>({masterSub.subject_code})</span>}
                          </div>
                          <button 
                            type="button"
                            onClick={() => handleRemoveSubjectClick(subName)}
                            style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s' }}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-secondary" onClick={() => setActiveModalClass(null)} disabled={loading}>
                Cancel
              </button>
              <button className="btn" onClick={handleSave} disabled={loading} style={{ minWidth: '150px' }}>
                <Save size={16} /> {loading ? 'Saving...' : 'Save Subjects'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Picker Modal (Layer 2) */}
      {isPickerOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease-in-out' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Select Master Subject</h3>
            
            <input 
              type="text" 
              placeholder="Search subjects..." 
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              style={{ padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', marginBottom: '16px', fontSize: '14px' }}
            />

            <div style={{ overflowY: 'auto', flex: 1, border: '1px solid var(--border)', borderRadius: '6px', background: '#f8fafc' }}>
              {subjects
                .filter(s => !selectedSubjects.has(s.subject_name))
                .filter(s => s.subject_name.toLowerCase().includes(pickerSearch.toLowerCase()) || (s.subject_code && s.subject_code.toLowerCase().includes(pickerSearch.toLowerCase())))
                .map(sub => {
                  const isPicked = pickerSelected.has(sub.subject_name);
                  return (
                    <div 
                      key={sub.id}
                      onClick={() => {
                        const newPicked = new Set(pickerSelected);
                        if (newPicked.has(sub.subject_name)) {
                          newPicked.delete(sub.subject_name);
                        } else {
                          newPicked.add(sub.subject_name);
                        }
                        setPickerSelected(newPicked);
                      }}
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px', 
                        borderBottom: '1px solid var(--border)', 
                        cursor: 'pointer',
                        background: isPicked ? '#e0e7ff' : 'transparent',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, color: isPicked ? '#4f46e5' : 'var(--text-primary)' }}>{sub.subject_name}</div>
                        {sub.subject_code && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Code: {sub.subject_code}</div>}
                      </div>
                      <input 
                        type="checkbox" 
                        checked={isPicked} 
                        readOnly
                        style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                      />
                    </div>
                  );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => { setIsPickerOpen(false); setPickerSelected(new Set()); }}>
                Cancel
              </button>
              <button className="btn" onClick={handleAddSubject} disabled={pickerSelected.size === 0} style={{ minWidth: '100px' }}>
                OK {pickerSelected.size > 0 ? `(${pickerSelected.size})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
