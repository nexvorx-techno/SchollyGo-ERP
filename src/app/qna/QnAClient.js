'use client';

import { useState } from 'react';
import { ThumbsUp, MessageSquare, X, Plus } from 'lucide-react';
import { askQuestion, answerQuestion } from './actions';

export default function QnAClient({ initialQuestions }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [showAskModal, setShowAskModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(null); // id of question
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    await askQuestion(formData);
    setLoading(false);
    setShowAskModal(false);
    window.location.reload(); // Quick refresh to get new data
  };

  const handleAnswer = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    formData.append('id', showAnswerModal);
    await answerQuestion(formData);
    setLoading(false);
    setShowAnswerModal(null);
    window.location.reload();
  };

  return (
    <>
      <div className="panel">
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px', background: '#f8fafc', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>Discussion Forum</div>
          <button className="btn" onClick={() => setShowAskModal(true)}>
            <Plus size={16} /> Ask Question
          </button>
        </div>

        <div>
          {questions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-secondary)' }}>
              <h3>No questions asked yet.</h3>
              <p>Be the first to start a discussion!</p>
            </div>
          ) : (
            questions.map(q => (
              <div key={q.id} style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '12px', fontWeight: 600 }}>{q.subject}</span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', background: '#f1f5f9', color: '#475569', borderRadius: '12px', fontWeight: 600 }}>{q.class} - {q.section}</span>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--accent)' }}>{q.question}</h3>
                  {q.topic && <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Topic: {q.topic}</p>}
                  
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    <span>Posted on {q.date_posted}</span>
                  </div>

                  {q.answer && (
                    <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
                      <strong style={{ fontSize: '12px', color: '#166534', display: 'block', marginBottom: '4px' }}>Teacher's Response:</strong>
                      <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>{q.answer}</div>
                    </div>
                  )}
                  {!q.answer && (
                    <div style={{ marginTop: '16px' }}>
                      <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => setShowAnswerModal(q.id)}>Write an Answer</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showAskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Ask a Question</h3>
              <button onClick={() => setShowAskModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAsk}>
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
              <div className="form-group">
                <label>Subject</label>
                <input type="text" name="subject" required />
              </div>
              <div className="form-group">
                <label>Topic (Optional)</label>
                <input type="text" name="topic" />
              </div>
              <div className="form-group">
                <label>Question</label>
                <textarea name="question" required rows={4}></textarea>
              </div>
              <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>{loading ? 'Submitting...' : 'Post Question'}</button>
            </form>
          </div>
        </div>
      )}

      {showAnswerModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Write an Answer</h3>
              <button onClick={() => setShowAnswerModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAnswer}>
              <div className="form-group">
                <label>Your Response</label>
                <textarea name="answer" required rows={4}></textarea>
              </div>
              <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>{loading ? 'Submitting...' : 'Post Answer'}</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
