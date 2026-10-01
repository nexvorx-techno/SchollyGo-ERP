'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export default function SessionSelector() {
  const today = new Date();
  
  const [session, setSession] = useState(() => {
    const year = today.getFullYear();
    if (today.getMonth() < 3) {
      return `${year - 1}-${year}`;
    }
    return `${year}-${year + 1}`;
  });

  // Load from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('academic_session');
    if (saved) setSession(saved);
  }, []);

  const handleChange = (e) => {
    const newSession = e.target.value;
    setSession(newSession);
    localStorage.setItem('academic_session', newSession);
    // Optionally trigger a page reload to fetch data for the new session
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '4px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
      <Calendar size={14} color="var(--text-secondary)" />
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Academic Year:</span>
      <select 
        value={session} 
        onChange={handleChange}
        style={{ 
          border: 'none', 
          background: 'transparent', 
          fontSize: '13px', 
          fontWeight: 600, 
          color: 'var(--text-primary)',
          cursor: 'pointer',
          outline: 'none',
          padding: 0
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const startYear = today.getFullYear() - 2 + i;
          const sessionString = `${startYear}-${startYear + 1}`;
          return <option key={sessionString} value={sessionString}>{sessionString}</option>;
        })}
      </select>
    </div>
  );
}
