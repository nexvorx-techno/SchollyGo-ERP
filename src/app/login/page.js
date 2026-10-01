import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';

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
    <div style={{ 
      background: 'rgba(22, 24, 34, 0.94)', 
      backdropFilter: 'blur(16px)',
      width: '100%', 
      maxWidth: '420px', 
      borderRadius: '16px', 
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px -10px rgba(250, 197, 44, 0.08)', 
      padding: '40px 36px', 
      textAlign: 'center',
      color: '#ffffff'
    }}>
      
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <img src="/schollygo-logo.png" alt="SchollyGO" style={{ height: '44px', width: 'auto', objectFit: 'contain' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em', margin: 0 }}>
          SchollyGO
        </h1>
        <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(250, 197, 44, 0.18)', color: '#FAC52C', border: '1px solid rgba(250, 197, 44, 0.4)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '1px' }}>ERP</span>
      </div>

      <p style={{ margin: '0 0 28px 0', color: '#94a3b8', fontSize: '14px' }}>Sign in to access your school portal</p>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          Invalid username or password
        </div>
      )}

      <LoginForm handleLogin={handleLogin} />
    </div>
  );
}
