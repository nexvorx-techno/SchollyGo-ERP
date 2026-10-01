'use client';
import { useState } from 'react';
import { Eye, Edit, Trash2, XCircle, Send } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';
import { deleteExam, updateExamStatus, sendExamNotification } from './actions';
import { useRouter } from 'next/navigation';

export default function ExamsListClient({ initialExams, schedulesMap }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, name: '' });
  const [confirmCancel, setConfirmCancel] = useState({ isOpen: false, id: null, name: '' });
  const [viewModal, setViewModal] = useState({ isOpen: false, exam: null, schedules: [] });
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDynamicStatus = (exam) => {
    if (exam.status === 'Cancelled') return 'Cancelled';
    
    if (!exam.first_exam_date || !exam.last_exam_date) return 'Unknown';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today for fair comparison
    
    const firstDate = new Date(exam.first_exam_date);
    const lastDate = new Date(exam.last_exam_date);
    
    if (today > lastDate) return 'Completed';
    if (today >= firstDate && today <= lastDate) return 'Ongoing';
    return 'Upcoming';
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Completed': return { background: '#e3fcef', color: '#006644' };
      case 'Ongoing': return { background: '#deebff', color: '#0747a6' };
      case 'Upcoming': return { background: '#fff0b3', color: '#172b4d' };
      case 'Cancelled': return { background: '#ffebe6', color: '#bf2600' };
      default: return { background: 'var(--bg-secondary)', color: 'var(--text-secondary)' };
    }
  };

  const executeDelete = async () => {
    setLoading(true);
    await deleteExam(confirmDelete.id);
    setLoading(false);
    setConfirmDelete({ isOpen: false, id: null, name: '' });
    router.refresh();
  };

  const executeCancel = async () => {
    setLoading(true);
    await updateExamStatus(confirmCancel.id, 'Cancelled');
    setLoading(false);
    setConfirmCancel({ isOpen: false, id: null, name: '' });
    router.refresh();
  };

  const handleSendToParents = async (examId) => {
    setSendingWhatsapp(true);
    const result = await sendExamNotification(examId);
    setSendingWhatsapp(false);
    alert(result.message);
  };

  return (
    <>
      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, name: '' })}
        onConfirm={executeDelete}
        title="Delete Exam"
        message={`Are you sure you want to permanently delete "${confirmDelete.name}"? This will remove all associated schedules.`}
        loading={loading}
      />
      
      <ConfirmModal 
        isOpen={confirmCancel.isOpen}
        onClose={() => setConfirmCancel({ isOpen: false, id: null, name: '' })}
        onConfirm={executeCancel}
        title="Cancel Exam"
        message={`Are you sure you want to mark "${confirmCancel.name}" as Cancelled?`}
        loading={loading}
      />

      {/* View Modal */}
      {viewModal.isOpen && viewModal.exam && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="panel" style={{ width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0' }}>{viewModal.exam.term_name} Date Sheet</h2>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {viewModal.exam.class_name} - {viewModal.exam.section_name}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleSendToParents(viewModal.exam.id)} 
                  className="btn" 
                  disabled={sendingWhatsapp}
                  style={{ background: '#25D366', borderColor: '#25D366' }}
                >
                  <Send size={16} /> 
                  {sendingWhatsapp ? 'Sending...' : 'Send to Parents'}
                </button>
                <button onClick={() => setViewModal({ isOpen: false, exam: null, schedules: [] })} className="btn btn-secondary">Close</button>
              </div>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)' }}>
              <thead>
                <tr style={{ background: '#f9f9fa', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Subject</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Timing</th>
                </tr>
              </thead>
              <tbody>
                {viewModal.schedules.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{s.subject_name}</td>
                    <td style={{ padding: '12px 16px' }}>{formatDate(s.exam_date)}</td>
                    <td style={{ padding: '12px 16px' }}>{s.start_time} - {s.end_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <table style={{ marginTop: '16px' }}>
        <thead>
          <tr style={{ background: '#f9f9fa', borderBottom: '2px solid var(--border)' }}>
            <th style={{ padding: '16px 24px', textAlign: 'left' }}>Term</th>
            <th style={{ padding: '16px 24px', textAlign: 'left' }}>Class & Section</th>
            <th style={{ padding: '16px 24px', textAlign: 'left' }}>Duration</th>
            <th style={{ padding: '16px 24px', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '16px 24px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {initialExams.map((exam) => {
            const dynamicStatus = getDynamicStatus(exam);
            const statusStyle = getStatusStyle(dynamicStatus);
            
            return (
              <tr key={exam.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 600 }}>{exam.term_name}</td>
                <td style={{ padding: '16px 24px', fontWeight: 500 }}>
                  <div style={{ background: 'var(--bg-secondary)', display: 'inline-block', padding: '4px 8px', borderRadius: '4px' }}>
                    {exam.class_name} {exam.section_name}
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  {exam.first_exam_date && exam.last_exam_date ? (
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(exam.first_exam_date)} to {formatDate(exam.last_exam_date)}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-tertiary)' }}>No dates assigned</span>
                  )}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    ...statusStyle,
                    padding: '4px 12px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {dynamicStatus}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => setViewModal({ isOpen: true, exam, schedules: schedulesMap[exam.id] || [] })}
                      className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      <Eye size={14} /> View
                    </button>
                    {dynamicStatus !== 'Cancelled' && (
                      <button 
                        onClick={() => setConfirmCancel({ isOpen: true, id: exam.id, name: `${exam.term_name} (${exam.class_name} ${exam.section_name})` })}
                        className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', color: '#ff991f', borderColor: '#ff991f' }}
                      >
                        <XCircle size={14} /> Cancel
                      </button>
                    )}
                    <button 
                      onClick={() => setConfirmDelete({ isOpen: true, id: exam.id, name: `${exam.term_name} (${exam.class_name} ${exam.section_name})` })}
                      className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
