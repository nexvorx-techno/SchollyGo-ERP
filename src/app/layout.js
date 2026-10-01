import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { cookies } from 'next/headers';
import {
  Bell,
  LogOut,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import SessionSelector from '@/components/SessionSelector';
import Omnibar from '@/components/Omnibar';
import Sidebar from '@/components/Sidebar';
import RefreshButton from '@/components/RefreshButton';
import GlobalShortcuts from '@/components/GlobalShortcuts';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SchollyGO ERP',
  description: 'Enterprise School Management System',
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');
  const isAuthenticated = !!session?.value;

  let currentUser = null;
  if (isAuthenticated) {
    const { getDb } = await import('@/lib/db');
    const db = await getDb();
    
    const masterUsername = process.env.ADMIN_USERNAME || 'admin';
    if (session.value === masterUsername) {
      currentUser = { role: 'Super Admin', permissions: null };
    } else {
      currentUser = await db.get('SELECT role, permissions FROM users WHERE username = ?', [session.value]);
    }
  }

  async function handleLogout() {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('auth_session');
    redirect('/login');
  }

  const { headers } = await import('next/headers');
  const reqHeaders = await headers();
  const pathname = reqHeaders.get('x-pathname') || '';
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/pay');

  // If not authenticated or accessing a public route, render without the ERP sidebar/topbar
  if (!isAuthenticated || isPublicRoute) {
    return (
      <html lang="en">
        <body 
          className={inter.className} 
          style={{ 
            backgroundColor: '#0b0d14', 
            backgroundImage: "radial-gradient(ellipse at 50% 15%, rgba(250, 197, 44, 0.08) 0%, transparent 65%), url('/bg-texture.png')", 
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto, 240px 240px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            minHeight: '100vh', 
            margin: 0 
          }}
        >
          {children}
        </body>
      </html>
    );
  }

  // Full ERP Layout for authenticated users
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="app-container">
          {/* ERP Sidebar */}
          <Sidebar currentUser={currentUser} />
          
          <Omnibar currentUser={currentUser} />
          <GlobalShortcuts />
          
          <div className="main-wrapper">
            {/* ERP Topbar */}
            <header className="topbar">
              <div className="topbar-search">
                <SessionSelector />
              </div>
              <div className="topbar-profile" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <RefreshButton />
                <Bell size={18} color="var(--text-secondary)" />
                <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }}></div>
                <div style={{ background: 'var(--accent)', color: 'var(--accent-contrast, #111827)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {(session?.value || 'A').charAt(0).toUpperCase()}
                </div>
                <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{session?.value || 'Administrator'}</span>
                
                <form action={handleLogout} style={{ marginLeft: '16px' }}>
                  <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: 'var(--danger)', fontWeight: 500 }}>
                    <LogOut size={14} /> Logout
                  </button>
                </form>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="main-content">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
