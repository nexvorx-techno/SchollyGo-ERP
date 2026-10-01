'use client';
import { useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

export default function LoginForm({ handleLogin }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <div>
        <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#9CA3AF' }}>Email or Username</label>
        <div style={{ position: 'relative' }}>
          <User size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: '#6B7280' }} />
          <input 
            type="text" 
            id="username" 
            name="username" 
            required 
            style={{ 
              width: '100%', 
              padding: '13px 16px 13px 44px', 
              borderRadius: '12px', 
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              color: '#ffffff',
              fontSize: '15px',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            placeholder="Enter your email or username"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#9CA3AF' }}>Password</label>
        <div style={{ position: 'relative' }}>
          <Lock size={18} style={{ position: 'absolute', left: '16px', top: '15px', color: '#6B7280' }} />
          <input 
            type={showPassword ? 'text' : 'password'} 
            id="password" 
            name="password" 
            required 
            style={{ 
              width: '100%', 
              padding: '13px 46px 13px 44px', 
              borderRadius: '12px', 
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)', 
              color: '#ffffff',
              fontSize: '15px',
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            placeholder="Enter your password"
          />
          <div 
            style={{ position: 'absolute', right: '16px', top: '15px', color: '#6B7280', cursor: 'pointer' }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginTop: '-4px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9CA3AF', cursor: 'pointer' }}>
          <input type="checkbox" className="dark-checkbox" />
          Remember Me
        </label>
        <a href="#" style={{ color: '#FFC72C', fontWeight: 600, textDecoration: 'none' }}>Forgot Password?</a>
      </div>

      <button 
        type="submit" 
        style={{ 
          width: '100%', 
          padding: '16px', 
          marginTop: '12px', 
          fontSize: '15px',
          fontWeight: 700,
          background: '#FFC72C',
          color: '#0B0E14',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 14px rgba(255, 199, 44, 0.25)'
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 199, 44, 0.35)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 199, 44, 0.25)'; }}
      >
        Sign In
      </button>
    </form>
  );
}
