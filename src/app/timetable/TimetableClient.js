'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Search, Edit2, Trash2, Calendar, Clock, Loader, Folder, X, Settings } from 'lucide-react';
import { 
  getScheduleMetadata, saveScheduleMetadata, 
  fetchTimetable, savePeriod, deletePeriod, 
  autoFetchSubjectTeacher 
} from './actions';
import ConfirmModal from '@/components/ConfirmModal';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const formatTimeAMPM = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hours = parseInt(h, 10);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours.toString().padStart(2, '0')}:${m} ${suffix}`;
};

export default function TimetableClient({ classes, sectionsByClass, subjectsByClass }) {
  // Navigation State
  const [activeClass, setActiveClass] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  
  // Data State
  const [scheduleData, setScheduleData] = useState(null); // The loaded timetable
  const [metadata, setMetadata] = useState(null); // The settings and school timings
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [createModal, setCreateModal] = useState({ isOpen: false });
  const [assignModal, setAssignModal] = useState({ isOpen: false, day: '', period: null, existingId: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null });
  
  // Create Schedule Form
  const [createForm, setCreateForm] = useState({ class_name: '', section_name: '', lunchStart: '', lunchEnd: '' });
  const [autoTeacher, setAutoTeacher] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  // Assign Period Form
  const [assignForm, setAssignForm] = useState({ subject: '', teacherId: '', teacherName: '', start: '', end: '' });
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignError, setAssignError] = useState('');

  // Load schedule when activeClass and activeSection are set
  useEffect(() => {
    if (activeClass && activeSection) {
      loadSchedule(activeClass, activeSection);
    } else {
      setScheduleData(null);
      setMetadata(null);
    }
  }, [activeClass, activeSection]);

  const loadSchedule = async (className, sectionName) => {
    setLoading(true);
    const meta = await getScheduleMetadata(className, sectionName);
    const periods = await fetchTimetable(className, sectionName);
    
    setMetadata(meta);
    setScheduleData(periods);
    setLoading(false);
  };

  const openCreateModal = async () => {
    setCreateLoading(true);
    setCreateForm({ class_name: activeClass, section_name: activeSection, lunchStart: '', lunchEnd: '' });
    
    const meta = await getScheduleMetadata(activeClass, activeSection);
    if (meta.settings) {
      setCreateForm(prev => ({ ...prev, lunchStart: meta.settings.lunch_start_time || '', lunchEnd: meta.settings.lunch_end_time || '' }));
    }
    setAutoTeacher(meta.classTeacher);
    
    setCreateLoading(false);
    setCreateModal({ isOpen: true });
  };

  const handleSaveMetadata = async (e) => {
    e.preventDefault();
    setLoading(true);
    await saveScheduleMetadata(
      activeClass, activeSection, 
      createForm.lunchStart, createForm.lunchEnd, 
      autoTeacher ? autoTeacher.id : null
    );
    setCreateModal({ isOpen: false });
    await loadSchedule(activeClass, activeSection);
  };

  const openAssignModal = (day, periodNumber) => {
    // Find if period exists
    const existing = scheduleData.find(p => p.day_of_week === day && p.period_number === periodNumber);
    
    if (existing) {
      setAssignForm({
        subject: existing.subject,
        teacherId: existing.teacher_id,
        teacherName: existing.teacher_name,
        start: existing.start_time,
        end: existing.end_time
      });
      setAssignModal({ isOpen: true, day, period: periodNumber, existingId: existing.id });
    } else {
      setAssignForm({ subject: '', teacherId: '', teacherName: '', start: '', end: '' });
      setAssignModal({ isOpen: true, day, period: periodNumber, existingId: null });
    }
    setAssignError('');
  };

  const handleSubjectChange = async (e) => {
    const sub = e.target.value;
    setAssignForm(prev => ({ ...prev, subject: sub }));
    
    if (sub) {
      const teacher = await autoFetchSubjectTeacher(activeClass, activeSection, sub);
      if (teacher) {
        setAssignForm(prev => ({ ...prev, teacherId: teacher.id, teacherName: teacher.name }));
      } else {
        setAssignForm(prev => ({ ...prev, teacherId: '', teacherName: 'No mapping found' }));
      }
    }
  };

  const handleSavePeriod = async (e) => {
    e.preventDefault();
    setAssignError('');
    
    // Validate bounds
    if (assignForm.start >= assignForm.end) {
      setAssignError('End time must be after the start time.');
      return;
    }

    if (metadata?.masterClass) {
      const { start_time, end_time } = metadata.masterClass;
      if (start_time && assignForm.start < start_time) {
        setAssignError(`Start time cannot be earlier than school start time (${start_time})`);
        return;
      }
      if (end_time && assignForm.end > end_time) {
        setAssignError(`End time cannot be later than school end time (${end_time})`);
        return;
      }
    }
    
    setAssignSaving(true);
    
    const payload = {
      class_name: activeClass,
      section_name: activeSection,
      day_of_week: assignModal.day,
      period_number: assignModal.period,
      subject: assignForm.subject,
      teacher_id: assignForm.teacherId || null,
      start_time: assignForm.start,
      end_time: assignForm.end
    };
    
    const res = await savePeriod(payload);
    
    if (res.success) {
      setAssignModal({ isOpen: false, day: '', period: null, existingId: null });
      await loadSchedule(activeClass, activeSection);
    } else {
      setAssignError(res.message);
    }
    setAssignSaving(false);
  };

  const handleDeletePeriod = async () => {
    if (!deleteConfirm.id) return;
    setLoading(true);
    await deletePeriod(deleteConfirm.id);
    setDeleteConfirm({ isOpen: false, id: null });
    await loadSchedule(activeClass, activeSection);
  };

  // Helper to render grid cells
  const getPeriodCell = (day, pNum) => {
    if (!scheduleData) return null;
    const p = scheduleData.find(x => x.day_of_week === day && x.period_number === pNum);
    
    if (p) {
      return (
        <div className="period-cell filled" onClick={() => openAssignModal(day, pNum)}>
          <div className="subject">{p.subject}</div>
          <div className="teacher">{p.teacher_name || 'No Teacher'}</div>
          <div className="time">{formatTimeAMPM(p.start_time)} - {formatTimeAMPM(p.end_time)}</div>
          <div className="actions">
            <button className="icon-btn edit" onClick={(e) => { e.stopPropagation(); openAssignModal(day, pNum); }}><Edit2 size={12} /></button>
            <button className="icon-btn delete" onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, id: p.id }); }}><Trash2 size={12} /></button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="period-cell empty" onClick={() => openAssignModal(day, pNum)}>
        <span>+ Assign</span>
      </div>
    );
  };

  const classSubjects = subjectsByClass[activeClass] || [];
  const classSections = activeClass && sectionsByClass[activeClass] ? sectionsByClass[activeClass] : [];

  return (
    <div>
      <div className="panel" style={{ padding: '24px', minHeight: '60vh' }}>
        
        {/* VIEW 1: All Class Folders Grid */}
        {!activeClass && (
          <>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Double-click a class folder to view its sections.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '24px' }}>
              {classes.map(cls => (
                <div 
                  key={cls} 
                  className="folder-card"
                  onDoubleClick={() => setActiveClass(cls)}
                  title={`Double-click to open ${cls}`}
                >
                  <Folder size={64} color="#64748b" fill="#cbd5e1" style={{ marginBottom: '12px' }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>{cls}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* VIEW 2: Section Folders Grid */}
        {activeClass && !activeSection && (
          <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  onClick={() => setActiveClass(null)}
                  style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  title="Back to Classes"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Folder size={28} color="var(--accent)" fill="var(--accent)" fillOpacity={0.2} />
                  <h2 style={{ margin: 0, fontSize: '20px' }}>{activeClass} Sections</h2>
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Double-click a section to open its Timetable.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '24px' }}>
              {classSections.length > 0 ? classSections.map(sec => (
                <div 
                  key={sec} 
                  className="folder-card"
                  onDoubleClick={() => setActiveSection(sec)}
                  title={`Double-click to open Section ${sec}`}
                >
                  <Folder size={64} color="#f59e0b" fill="#fde68a" style={{ marginBottom: '12px' }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>Section {sec}</span>
                </div>
              )) : (
                <div style={{ color: 'var(--text-tertiary)' }}>No sections mapped to {activeClass} yet.</div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: Timetable Grid */}
        {activeClass && activeSection && (
          <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  onClick={() => setActiveSection(null)}
                  style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  title="Back to Sections"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={28} color="var(--accent)" />
                  <h2 style={{ margin: 0, fontSize: '20px' }}>
                    {activeClass} - {activeSection} Timetable
                    {metadata?.classTeacher && (
                      <span style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500, marginLeft: '12px', borderLeft: '2px solid var(--border)', paddingLeft: '12px' }}>
                        Class Teacher - {metadata.classTeacher.name}
                      </span>
                    )}
                  </h2>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" onClick={openCreateModal}>
                  <Settings size={16} /> Timetable Settings
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Loader size={32} className="spin" style={{ margin: '0 auto 16px auto' }} />
                <p>Loading schedule...</p>
              </div>
            ) : scheduleData && (
              <div className="timetable-container">
                <div className="timetable-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>Weekly Schedule</h3>
                  </div>
                  {metadata?.masterClass && (
                    <span className="badge" style={{ background: '#e2e8f0', color: 'var(--text-secondary)' }}>
                      School Timing: {formatTimeAMPM(metadata.masterClass.start_time)} - {formatTimeAMPM(metadata.masterClass.end_time)}
                    </span>
                  )}
                </div>
                
                <div className="grid-wrapper">
                  <table className="timetable-grid">
                    <thead>
                      <tr>
                        <th className="corner">Day / Period</th>
                        <th>Period 1</th>
                        <th>Period 2</th>
                        <th>Period 3</th>
                        <th>Period 4</th>
                        <th className="break-col">Break</th>
                        <th>Period 5</th>
                        <th>Period 6</th>
                        <th>Period 7</th>
                        <th>Period 8</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map(day => (
                        <tr key={day}>
                          <td className="day-name">{day}</td>
                          <td>{getPeriodCell(day, 1)}</td>
                          <td>{getPeriodCell(day, 2)}</td>
                          <td>{getPeriodCell(day, 3)}</td>
                          <td>{getPeriodCell(day, 4)}</td>
                          {day === 'Monday' ? (
                            <td rowSpan={6} className="lunch-break-cell">
                              <div className="vertical-text">LUNCH BREAK<br/>
                                {metadata?.settings?.lunch_start_time && metadata?.settings?.lunch_end_time && (
                                  <small>{formatTimeAMPM(metadata.settings.lunch_start_time)} - {formatTimeAMPM(metadata.settings.lunch_end_time)}</small>
                                )}
                              </div>
                            </td>
                          ) : null}
                          <td>{getPeriodCell(day, 5)}</td>
                          <td>{getPeriodCell(day, 6)}</td>
                          <td>{getPeriodCell(day, 7)}</td>
                          <td>{getPeriodCell(day, 8)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      
      {/* Timetable Settings Modal */}
      {createModal.isOpen && (
        <div className="modal-overlay">
          <div className="panel modal-content" style={{ width: '450px' }}>
            <h2 style={{ margin: '0 0 24px 0' }}>Timetable Settings</h2>
            {createLoading ? (
               <div style={{ textAlign: 'center', padding: '32px' }}><Loader className="spin" size={24} /></div>
            ) : (
              <form onSubmit={handleSaveMetadata} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Class</label>
                  <input type="text" className="form-control" value={activeClass} readOnly disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Section</label>
                  <input type="text" className="form-control" value={activeSection} readOnly disabled />
                </div>

                <div className="form-group">
                  <label className="form-label">Class Teacher</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={autoTeacher ? autoTeacher.name : 'No mapped teacher found'} 
                      readOnly 
                      disabled
                    />
                  </div>
                  <small style={{ color: 'var(--text-secondary)' }}>Auto-fetched from Master Settings.</small>
                </div>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Lunch Start Time</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      value={createForm.lunchStart}
                      onChange={e => setCreateForm(prev => ({...prev, lunchStart: e.target.value}))}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Lunch End Time</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      value={createForm.lunchEnd}
                      onChange={e => setCreateForm(prev => ({...prev, lunchEnd: e.target.value}))}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setCreateModal({ isOpen: false })}>Cancel</button>
                  <button type="submit" className="btn" disabled={loading}>{loading ? 'Saving...' : 'Save Details'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Assign Period Modal */}
      {assignModal.isOpen && (
        <div className="modal-overlay">
          <div className="panel modal-content" style={{ width: '500px' }}>
            <h2 style={{ margin: '0 0 24px 0' }}>Assign {assignModal.day}, Period {assignModal.period}</h2>
            
            {assignError && (
              <div style={{ background: '#ffebe6', color: '#bf2600', padding: '12px', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>
                {assignError}
              </div>
            )}
            
            <form onSubmit={handleSavePeriod} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select 
                  className="form-control" 
                  required
                  value={assignForm.subject}
                  onChange={handleSubjectChange}
                >
                  <option value="">Select Subject</option>
                  {classSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Subject Teacher</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={assignForm.teacherName || ''} 
                  placeholder="Will auto-fetch based on subject"
                  readOnly 
                  disabled
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Start Time *</label>
                  <input 
                    type="time" 
                    className="form-control" 
                    required
                    value={assignForm.start}
                    onChange={e => setAssignForm(prev => ({...prev, start: e.target.value}))}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">End Time *</label>
                  <input 
                    type="time" 
                    className="form-control" 
                    required
                    value={assignForm.end}
                    onChange={e => setAssignForm(prev => ({...prev, end: e.target.value}))}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setAssignModal({ isOpen: false })}>Cancel</button>
                <button type="submit" className="btn" disabled={assignSaving}>
                  {assignSaving ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal 
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        onConfirm={handleDeletePeriod}
        title="Delete Period"
        message="Are you sure you want to remove this assignment? It will become empty."
        loading={loading}
      />

      {/* CSS Styles specific to Timetable */}
      <style dangerouslySetInnerHTML={{__html: `
        .timetable-container {
          padding: 0;
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 8px;
        }
        .grid-wrapper {
          overflow-x: auto;
          padding: 16px;
        }
        .timetable-grid {
          width: 100%;
          border-collapse: collapse;
          min-width: 1000px;
        }
        .timetable-grid th, .timetable-grid td {
          border: 1px solid #e1e4e8;
          text-align: center;
          padding: 0;
          height: 80px;
        }
        .timetable-grid th {
          background: #f8f9fa;
          padding: 12px;
          font-weight: 600;
          color: #333;
          height: auto;
        }
        .timetable-grid th.corner {
          background: #eef2f5;
        }
        .timetable-grid .day-name {
          background: #f76707;
          color: white;
          font-weight: 600;
          padding: 16px;
          width: 120px;
        }
        .break-col {
          width: 40px;
        }
        .lunch-break-cell {
          background: #fff8e6;
          color: #b08d4b;
          font-weight: bold;
          vertical-align: middle;
        }
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
          margin: 0 auto;
          letter-spacing: 2px;
        }
        .period-cell {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .period-cell.empty {
          color: #adb5bd;
          background: #fff;
        }
        .period-cell.empty:hover {
          background: #f8f9fa;
          color: var(--accent);
        }
        .period-cell.filled {
          background: #fff;
          padding: 8px;
        }
        .period-cell.filled:hover {
          background: #f1f3f5;
        }
        .period-cell .subject {
          font-weight: 600;
          color: #212529;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .period-cell .teacher {
          font-size: 12px;
          color: #495057;
        }
        .period-cell .time {
          font-size: 11px;
          color: #868e96;
          margin-top: 4px;
        }
        .period-cell .actions {
          position: absolute;
          top: 4px;
          right: 4px;
          display: none;
          gap: 4px;
        }
        .period-cell:hover .actions {
          display: flex;
        }
        .icon-btn {
          border: none;
          background: #fff;
          border-radius: 4px;
          padding: 4px;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .icon-btn.edit { color: var(--accent); }
        .icon-btn.delete { color: var(--danger); }
        
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); z-index: 1000;
          display: flex; alignItems: center; justifyContent: center;
        }
      `}} />
    </div>
  );
}
