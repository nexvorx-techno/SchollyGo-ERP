'use client';

import { useState } from 'react';
import { Book, Plus, Send, X, CheckCircle } from 'lucide-react';
import { assignHomework } from './actions';

export default function HomeWorkClient({ initialHomework }) {
  const [homeworks, setHomeworks] = useState(initialHomework);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    await assignHomework(formData);
    setLoading(false);
    setShowModal(false);
    window.location.reload();
  };

  const handleSendAlert = (e) => {
    e.preventDefault();
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 3000);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Academics / Home Work Management</div>
          <h1 className="page-title">Home Work & Daily Diary</h1>
        </div>
        <button className="btn" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Assign Home Work
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div className="panel" style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '16px', color: 'var(--text-primary)' }}>Recent Assignments</h3>
          
          {homeworks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
              <Book size={32} opacity={0.3} style={{ marginBottom: '16px' }} />
              <p>No homework assigned yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {homeworks.map(hw => (
                <div key={hw.id} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: '#fff', display: 'flex', gap: '16px' }}>
                  <div style={{ background: '#f0fdfa', color: '#0d9488', width: '48px', height: '48px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '20px' }}>
                    {hw.subject.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px' }}>{hw.subject} <span style={{ color: 'var(--text-tertiary)', fontSize: '12px', fontWeight: 400 }}>({hw.class} - {hw.section})</span></h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Assigned: {hw.assigned_date}</span>
                    </div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {hw.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#ef4444' }}>Due: {hw.due_date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel" style={{ padding: '24px', alignSelf: 'start' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-primary)' }}>Quick Notifications</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            Send an SMS or WhatsApp notification to parents regarding today's homework diary.
          </p>
          <form onSubmit={handleSendAlert}>
            <div className="form-group">
              <label>Select Class & Section</label>
              <select required>
                <option value="">-- Select --</option>
                <option value="Class 10 - A">Class 10 - A</option>
                <option value="Class 10 - B">Class 10 - B</option>
                <option value="Class 12 - A">Class 12 - A</option>
              </select>
            </div>
            {alertSent ? (
               <div style={{ color: '#166534', background: '#f0fdf4', padding: '8px', borderRadius: '4px', border: '1px solid #bbf7d0', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                 <CheckCircle size={14} /> Alerts Sent Successfully
               </div>
            ) : (
              <button className="btn" type="submit" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <Send size={14} /> Send WhatsApp Alert
              </button>
            )}
          </form>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Assign Home Work</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Class</label>
                  <select name="class" required>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Section</label>
                  <select name="section" required>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Subject</label>
                  <select name="subject" required>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English">English</option>
                    <option value="Social Studies">Social Studies</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Due Date</label>
                  <input type="date" name="due_date" required min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="form-group">
                <label>Description & Instructions</label>
                <textarea name="description" required rows={4}></textarea>
              </div>
              <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>{loading ? 'Assigning...' : 'Assign Home Work'}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
