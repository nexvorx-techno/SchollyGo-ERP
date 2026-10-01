'use client';
import { useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

export default function LoginForm({ handleLogin }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
      <div>
        <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#cbd5e1' }}>Username</label>
        <div style={{ position: 'relative' }}>
          <User size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: '#64748b' }} />
          <input 
            type="text" 
            id="username" 
            name="username" 
            required 
            style={{ 
              width: '100%', 
              padding: '11px 12px 11px 40px', 
              borderRadius: '8px', 
              background: '#0d111a',
              border: '1px solid rgba(255, 255, 255, 0.12)', 
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            placeholder="Enter username"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#cbd5e1' }}>Password</label>
        <div style={{ position: 'relative' }}>
          <Lock size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: '#64748b' }} />
          <input 
            type={showPassword ? 'text' : 'password'} 
            id="password" 
            name="password" 
            required 
            style={{ 
              width: '100%', 
              padding: '11px 42px 11px 40px', 
              borderRadius: '8px', 
              background: '#0d111a',
              border: '1px solid rgba(255, 255, 255, 0.12)', 
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            placeholder="Enter password"
          />
          <div 
            style={{ position: 'absolute', right: '12px', top: '12px', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        className="btn" 
        style={{ 
          width: '100%', 
          padding: '12px', 
          marginTop: '8px', 
          fontSize: '14px',
          fontWeight: 700,
          background: 'var(--accent)',
          color: 'var(--accent-contrast, #111827)'
        }}
      >
        Sign In
      </button>
    </form>
  );
}
