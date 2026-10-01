'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { punchAttendance } from './actions';
import { Fingerprint, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AttendanceKioskPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  const inputRef = useRef(null);

  // Auto-focus input on load and after interactions
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handlePunch = async (e) => {
    e.preventDefault();
    if (!employeeId.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const result = await punchAttendance(employeeId);
      
      if (result.error) {
        setFeedback({ type: 'error', message: result.error });
      } else {
        setFeedback({ type: 'success', message: result.message });
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setEmployeeId(''); // Reset input immediately for next person
      inputRef.current?.focus(); // Re-focus
      
      // Clear feedback message after 4 seconds
      setTimeout(() => {
        setFeedback(null);
      }, 4000);
    }
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '40px auto', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      padding: '0 24px' 
    }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <Link href="/staff" className="btn btn-secondary">Exit Kiosk</Link>
      </div>

      <div className="panel" style={{ 
        width: '100%', 
        padding: '48px 32px', 
        textAlign: 'center',
        background: 'var(--bg-surface)',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'rgba(37, 99, 235, 0.1)', 
          borderRadius: '40px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 24px auto'
        }}>
          <Fingerprint size={40} color="var(--accent)" />
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Staff Attendance Kiosk
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Scan your ID card or enter your Employee ID below to punch in.
        </p>

        <form onSubmit={handlePunch}>
          <input
            ref={inputRef}
            type="text"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            disabled={isSubmitting}
            placeholder="Scan or Type Employee ID..."
            style={{
              width: '100%',
              padding: '16px 24px',
              fontSize: '20px',
              textAlign: 'center',
              borderRadius: '8px',
              border: '2px solid var(--accent)',
              marginBottom: '16px',
              outline: 'none',
              boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.1)'
            }}
            autoComplete="off"
          />
          <button 
            type="submit" 
            className="btn" 
            disabled={isSubmitting || !employeeId.trim()}
            style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 600, borderRadius: '8px' }}
          >
            {isSubmitting ? 'Processing...' : 'Punch'}
          </button>
        </form>

        {/* Feedback Area */}
        <div style={{ height: '80px', marginTop: '32px' }}>
          {feedback && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '8px',
              background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${feedback.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
              color: feedback.type === 'success' ? '#166534' : '#991b1b',
              animation: 'fadeIn 0.3s ease-in-out'
            }}>
              {feedback.type === 'success' ? <CheckCircle2 size={24} color="#22c55e" /> : <AlertCircle size={24} color="#ef4444" />}
              <span style={{ fontSize: '16px', fontWeight: 500 }}>{feedback.message}</span>
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
