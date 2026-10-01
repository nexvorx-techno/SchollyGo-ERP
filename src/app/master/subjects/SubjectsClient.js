'use client';

import { useState } from 'react';
import { PlusCircle, X, Trash2, FolderKanban } from 'lucide-react';
import { createSubject, deleteSubject } from '../actions';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';
import { useSortableData } from '@/hooks/useSortableData';
import SortableHeader from '@/components/SortableHeader';

export default function SubjectsClient({ initialSubjects }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [cwPages, setCwPages] = useState('');

  const { items: sortedSubjects, requestSort, sortConfig } = useSortableData(initialSubjects);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setSubjectName(val);
    
    if (val.length === 0) {
      setSubjectCode('');
      return;
    }

    const prefix = val.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X');
    const currentSuffix = subjectCode.includes('-') ? subjectCode.split('-')[1] : Math.floor(100 + Math.random() * 900);
    setSubjectCode(`${prefix}-${currentSuffix}`);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!cwPages) {
      alert("Please select the No of pages for CW Copy.");
      return;
    }
    setLoading(true);
    const formData = new FormData(e.target);
    // cw_pages is added via hidden input, so it's already in formData
    await createSubject(formData);
    setLoading(false);
    setShowModal(false);
    setSubjectName('');
    setSubjectCode('');
    setCwPages('');
    router.refresh();
  };

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const handleDeleteClick = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const executeDelete = async () => {
    setLoading(true);
    await deleteSubject(confirmModal.id);
    setLoading(false);
    setConfirmModal({ isOpen: false, id: null });
    router.refresh();
  };

  return (
    <>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={executeDelete}
        title="Delete Subject"
        message="Are you sure you want to delete this universal subject? This may affect mapping in other modules."
        loading={loading}
      />
      <div className="page-header">
        <div>
          <div className="breadcrumb">Master Settings / Create Subjects</div>
          <h1 className="page-title">Universal Subjects Master</h1>
        </div>
        <button className="btn" onClick={() => setShowModal(true)}>
          <PlusCircle size={16} /> Create New Subject
        </button>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
          Define universal subjects here. Once created, you can assign them to specific classes in the Stream & Subject Assign Master.
        </p>

        {initialSubjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-tertiary)', background: '#f8fafc', borderRadius: '12px' }}>
            <FolderKanban size={48} opacity={0.2} style={{ marginBottom: '16px' }} />
            <h3>No subjects defined yet</h3>
            <p>Click the button above to create your first universal subject.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <SortableHeader label="Subject Name" sortKey="subject_name" currentSortConfig={sortConfig} requestSort={requestSort} />
                  <SortableHeader label="Subject Code" sortKey="subject_code" currentSortConfig={sortConfig} requestSort={requestSort} />
                  <SortableHeader label="Book Name" sortKey="book_name" currentSortConfig={sortConfig} requestSort={requestSort} />
                  <SortableHeader label="Author" sortKey="author_name" currentSortConfig={sortConfig} requestSort={requestSort} />
                  <SortableHeader label="Chapters" sortKey="total_chapters" currentSortConfig={sortConfig} requestSort={requestSort} style={{ textAlign: 'center' }} />
                  <SortableHeader label="CW Pages" sortKey="cw_pages" currentSortConfig={sortConfig} requestSort={requestSort} style={{ textAlign: 'center' }} />
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedSubjects.map((sub, idx) => (
                  <tr key={sub.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 500 }}>{sub.subject_name}</td>
                    <td><span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>{sub.subject_code || 'N/A'}</span></td>
                    <td>{sub.book_name || '-'}</td>
                    <td><span style={{ color: 'var(--text-secondary)' }}>{sub.author_name || '-'}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      {sub.total_chapters ? (
                        <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                          {sub.total_chapters}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {sub.cw_pages ? (
                        <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                          {sub.cw_pages}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleDeleteClick(sub.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: '4px' }}
                        title="Delete Subject"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Create New Subject</h3>
              <button onClick={() => { setShowModal(false); setSubjectName(''); setSubjectCode(''); setCwPages(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Subject Name *</label>
                  <input 
                    type="text" 
                    name="subject_name" 
                    required 
                    placeholder="e.g. Mathematics"
                    value={subjectName}
                    onChange={handleNameChange}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Subject Code</label>
                  <input 
                    type="text" 
                    name="subject_code" 
                    readOnly 
                    value={subjectCode}
                    style={{ background: '#f8fafc', color: 'var(--text-secondary)', cursor: 'not-allowed' }}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Book Name *</label>
                <input 
                  type="text" 
                  name="book_name" 
                  required 
                  placeholder="e.g. Oxford Secondary Math" 
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Total Chapters / Topics *</label>
                  <input 
                    type="number" 
                    name="total_chapters" 
                    required 
                    min="1"
                    placeholder="e.g. 15" 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Writer / Author Name</label>
                  <input 
                    type="text" 
                    name="author_name" 
                    placeholder="e.g. John Doe" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>No of pages CW Copy *</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['100pg', '200pg', '300pg'].map(pg => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setCwPages(pg)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: cwPages === pg ? '2px solid var(--accent)' : '1px solid var(--border)',
                        background: cwPages === pg ? '#fff1f2' : '#f8fafc',
                        color: cwPages === pg ? 'var(--accent)' : 'var(--text-secondary)',
                        fontWeight: cwPages === pg ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: 'none'
                      }}
                    >
                      {pg}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="cw_pages" value={cwPages} />
              </div>

              <button className="btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
                {loading ? 'Saving...' : 'Save Subject'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
