import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';
import { GraduationCap } from 'lucide-react';

export default async function LoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams?.error;

  async function handleLogin(formData) {
    'use server';

    const username = formData.get('username');
    const password = formData.get('password');

    const db = await getDb();

    let isValid = false;

    // MASTER OVERRIDE: Always allow admin/admin regardless of DB state
    const masterUsername = process.env.ADMIN_USERNAME || 'admin';
    const masterPassword = process.env.ADMIN_PASSWORD || 'admin';

    if (username === masterUsername && password === masterPassword) {
      isValid = true;
    } else {
      // Check database for normal users
      const user = await db.get('SELECT password_hash FROM users WHERE username = ?', [username]);
      if (user && verifyPassword(password, user.password_hash)) {
        isValid = true;
      }
    }

    if (isValid) {
      const cookieStore = await cookies();

      // Setting a cookie without 'maxAge' or 'expires' makes it a Session Cookie
      // It will be destroyed when the Electron window/browser closes.
      cookieStore.set({
        name: 'auth_session',
        value: username,
        httpOnly: true,
        path: '/',
      });

      redirect('/');
    } else {
      redirect('/login?error=1');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: '1060px', margin: '0 auto', alignItems: 'stretch', gap: '64px', flexWrap: 'wrap', justifyContent: 'center' }}>

        {/* Left Side: School Profile */}
        <div style={{
          flex: '1 1 400px',
          maxWidth: '460px',
          background: 'rgba(15, 19, 26, 0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>

        {/* Premium School Logo Container */}
        <div className="school-logo-hover" style={{ 
          width: '120px', height: '120px', 
          background: 'linear-gradient(135deg, #FFC72C 0%, #d97706 100%)', 
          borderRadius: '32px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '32px',
          boxShadow: '0 20px 40px -10px rgba(255, 199, 44, 0.4), inset 0 2px 10px rgba(255,255,255,0.3)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <GraduationCap size={64} color="#ffffff" strokeWidth={1.5} style={{ transform: 'rotate(5deg)' }} />
        </div>
        
        <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>ABC Schools</h2>
        
        <p style={{ color: '#9CA3AF', fontSize: '15px', margin: '0 0 40px 0', lineHeight: 1.5, maxWidth: '280px', fontWeight: 500 }}>
          Premium Education Campus<br/>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>Raipur, Chhattisgarh</span>
        </p>

        <div style={{ width: '32px', height: '4px', background: 'rgba(255, 199, 44, 0.5)', borderRadius: '2px', marginBottom: '8px' }}></div>
      </div>

        {/* Vertical Line Partition */}
        <div style={{
          width: '1px',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.01), rgba(255,255,255,0.15), rgba(255,255,255,0.01))',
          flexShrink: 0,
          margin: '20px 0'
        }}></div>

        {/* Right Side: Login Form with Glassmorphism */}
        <div className="login-hover-card" style={{
          flex: '1 1 400px',
          maxWidth: '440px',
          background: '#12161F',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 199, 44, 0.03)',
          padding: '48px 40px',
          textAlign: 'left',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column'
        }}>

          {/* Logo and ERP tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', justifyContent: 'center' }}>
            <img src="/schollygo-logo-transparent.png" alt="SchollyGO" style={{ height: '56px', width: 'auto', objectFit: 'contain' }} />
            <div style={{ height: '36px', width: '2px', background: 'rgba(255,255,255,0.1)' }}></div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#FFC72C', letterSpacing: '1px' }}>ERP</span>
          </div>

          {/* Header Tagline & Main Heading */}
          <p style={{ margin: '0 0 4px 0', color: '#FFC72C', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Welcome Back
          </p>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', margin: '0 0 32px 0', letterSpacing: '-0.5px' }}>
            Sign In to Your Account
          </h1>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              Invalid username or password
            </div>
          )}

          <LoginForm handleLogin={handleLogin} />
        </div>
      </div>

      {/* Global Bottom Footer Tagline */}
      <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', marginTop: '64px', textAlign: 'center' }}>
        YOUR SCHOOL <span style={{ color: '#FFC72C', margin: '0 8px' }}>|</span> YOUR ERP <span style={{ color: '#FFC72C', margin: '0 8px' }}>|</span> YOUR PROGRESS
      </p>
    </div>
  );
}
