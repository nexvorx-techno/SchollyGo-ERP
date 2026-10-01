'use client';

import { useState } from 'react';
import { BookOpen, Calendar, PlusCircle, X, Trash2 } from 'lucide-react';
import { createExam, addExamSchedule, deleteExamSchedule } from './actions';
import { useRouter } from 'next/navigation';
import ConfirmModal from '@/components/ConfirmModal';

export default function ExamsClient({ initialExams, initialSchedules, classes, classSubjects }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(null); // stores the exam object
  const [loading, setLoading] = useState(false);
  
  // State for Schedule Modal
  const [scheduleClass, setScheduleClass] = useState('');
  const availableScheduleSubjects = classSubjects.filter(cs => cs.class_name === scheduleClass).map(cs => cs.subject_name);

  // State for Create Exam Modal
  const [examClass, setExamClass] = useState('All Classes');
  const availableExamSubjects = examClass === 'All Classes' ? [] : classSubjects.filter(cs => cs.class_name === examClass).map(cs => cs.subject_name);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const academicYear = localStorage.getItem('academic_session') || '2024-2025';
    formData.append('academic_year', academicYear);
    
    await createExam(formData);
    setLoading(false);
    setShowModal(false);
    router.refresh();
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    formData.append('exam_id', showScheduleModal.id);
    await addExamSchedule(formData);
    setLoading(false);
    e.target.reset();
    router.refresh();
  };

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const handleDeleteScheduleClick = (id) => {
    setConfirmModal({ isOpen: true, id });
  };

  const executeDeleteSchedule = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('id', confirmModal.id);
    await deleteExamSchedule(formData);
    setLoading(false);
    setConfirmModal({ isOpen: false, id: null });
    router.refresh();
  };

  const getSchedulesForExam = (examId) => initialSchedules.filter(s => s.exam_id === examId);

  return (
    <>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={executeDeleteSchedule}
        title="Delete Schedule"
        message="Are you sure you want to delete this schedule? This action cannot be undone."
        loading={loading}
      />
      <div className="page-header">
        <div>
          <div className="breadcrumb">Academics / Exam Counseling</div>
          <h1 className="page-title">Exam Management</h1>
        </div>
        <button className="btn" onClick={() => setShowModal(true)}>
          <PlusCircle size={16} /> Create New Exam
        </button>
      </div>

      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          <div onClick={() => setShowModal(true)} style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px', cursor: 'pointer', transition: 'all 0.2s ease', ':hover': { borderColor: 'var(--accent)' } }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', marginBottom: '16px' }}>
              <PlusCircle size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Create Master Exam</h3>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center' }}>Set up a new examination term (e.g. Mid Term) for classes.</p>
          </div>

          {initialExams.length === 0 ? (
            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
              <BookOpen size={32} opacity={0.3} style={{ marginBottom: '16px' }} />
              <p>No exams created yet.</p>
            </div>
          ) : (
            initialExams.map(exam => {
              const examSchedules = getSchedulesForExam(exam.id);
              return (
              <div key={exam.id} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {exam.term} • {exam.academic_year} {exam.class && exam.class !== 'All Classes' ? `• ${exam.class}` : ''}
                    </span>
                    <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 700 }}>
                      {exam.name} {exam.subject ? `(${exam.subject})` : ''}
                    </h3>
                  </div>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: 600 }}>Active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '12px' }}>
                  <Calendar size={16} />
                  {exam.start_date} to {exam.end_date}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '24px' }}>
                  {examSchedules.length} subjects scheduled
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowScheduleModal(exam)}>Manage Schedule</button>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => alert('Results feature coming soon')}>View Results</button>
                </div>
              </div>
            )})
          )}

        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Create Master Exam</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Exam Name</label>
                <input type="text" name="name" required placeholder="e.g. Mid Term Exam 2024" />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Term</label>
                  <select name="term" required>
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                    <option value="Half Yearly">Half Yearly</option>
                    <option value="Annual Exam">Annual Exam</option>
                    <option value="FA 1">Formative Assessment 1 (FA 1)</option>
                    <option value="FA 2">Formative Assessment 2 (FA 2)</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Class</label>
                  <select name="class" value={examClass} onChange={(e) => setExamClass(e.target.value)} required>
                    <option value="All Classes">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Subject (Optional)</label>
                <select name="subject">
                  <option value="">All Subjects (Master Term)</option>
                  {availableExamSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Start Date</label>
                  <input type="date" name="start_date" required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>End Date</label>
                  <input type="date" name="end_date" required />
                </div>
              </div>
              <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>{loading ? 'Creating...' : 'Create Exam'}</button>
            </form>
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '800px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Manage Schedule: {showScheduleModal.name}</h3>
              <button onClick={() => setShowScheduleModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', gap: '24px' }}>
              {/* Add New Schedule Form */}
              <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Schedule a Subject</h4>
                <form onSubmit={handleAddSchedule}>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Class</label>
                      <select name="class" value={scheduleClass} onChange={(e) => setScheduleClass(e.target.value)} required>
                        <option value="" disabled>Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.class_name}>{c.class_name}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Section</label>
                      <select name="section" required>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <select name="subject" required>
                      {availableScheduleSubjects.length === 0 && <option value="" disabled>Select a class with subjects</option>}
                      {availableScheduleSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Exam Date</label>
                    <input type="date" name="exam_date" required min={showScheduleModal.start_date} max={showScheduleModal.end_date} />
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Start Time</label>
                      <input type="time" name="start_time" required />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>End Time</label>
                      <input type="time" name="end_time" required />
                    </div>
                  </div>
                  <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Adding...' : 'Add to Schedule'}
                  </button>
                </form>
              </div>

              {/* Scheduled Subjects List */}
              <div style={{ flex: 1.5 }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Current Schedule</h4>
                {getSchedulesForExam(showScheduleModal.id).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)', fontSize: '13px', background: '#f9f9fa', borderRadius: '8px' }}>
                    No subjects scheduled for this exam yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {getSchedulesForExam(showScheduleModal.id).map(s => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: '4px' }}>{s.subject} ({s.class}-{s.section})</div>
                          <div style={{ color: 'var(--text-secondary)' }}>{s.exam_date} | {s.start_time} - {s.end_time}</div>
                        </div>
                        <button 
                          onClick={() => handleDeleteScheduleClick(s.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                          title="Remove from schedule"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
