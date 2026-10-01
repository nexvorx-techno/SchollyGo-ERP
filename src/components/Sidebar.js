'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  Users, 
  UserCheck, 
  GraduationCap, 
  Receipt, 
  CreditCard, 
  Settings,
  CalendarDays,
  BookOpen,
  FileText,
  HelpCircle,
  FolderKanban,
  Database,
  Monitor,
  LayoutDashboard,
  MinusSquare,
  PlusSquare,
  Truck,
  ClipboardList,
  Wrench,
  PackageOpen,
  ClipboardCheck,
  Handshake,
  FileBadge,
  UserPlus,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

export default function Sidebar({ currentUser }) {
  const pathname = usePathname();
  const sidebarRef = useRef(null);
  const [expandedGroup, setExpandedGroup] = useState(null);

  const toggleGroup = (group) => {
    setExpandedGroup(prev => prev === group ? null : group);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {};
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const role = currentUser?.role || 'User';
  let permissions = {};
  if (currentUser?.permissions) {
    try {
      permissions = JSON.parse(currentUser.permissions);
    } catch (e) {}
  }

  const hasAccess = (moduleName, subModuleName) => {
    if (role === 'Super Admin') return true;
    
    // If Admin and no specific permissions are set, they get full access (legacy support)
    if (role === 'Admin' && (!permissions || Object.keys(permissions).length === 0)) {
      if (moduleName === 'System' && (subModuleName === 'User Lists' || subModuleName === 'User Roles')) return false; // Except user creation
      return true;
    }

    const modPerms = permissions[moduleName];
    
    // Legacy flat permissions check
    if (modPerms && typeof modPerms.readWrite === 'boolean') {
      return modPerms.readWrite || modPerms.editDelete;
    }
    
    // Granular sub-module check
    if (subModuleName) {
      const subPerms = modPerms?.[subModuleName];
      return subPerms?.readWrite || subPerms?.editDelete;
    }
    
    // Top-level module visibility check (show if ANY sub-module is accessible)
    if (modPerms && typeof modPerms === 'object') {
      return Object.values(modPerms).some(sub => sub.readWrite || sub.editDelete);
    }
    
    return false;
  };

  const GroupHeader = ({ id, title, icon, iconColor, isOpen }) => (
    <div 
      onClick={() => toggleGroup(id)}
      style={{ 
        display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '6px 12px',
        color: 'var(--sidebar-text)', transition: 'all 0.2s', userSelect: 'none', background: 'transparent'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>
          {isOpen ? <MinusSquare size={14} /> : <PlusSquare size={14} />}
        </span>
        <span style={{ color: iconColor }}>{icon}</span>
        <span style={{ fontSize: '13px', fontWeight: 500 }}>{title}</span>
      </div>
    </div>
  );

  const NavLink = ({ href, icon, iconColor, label, indentLevel = 1 }) => {
    const isActive = pathname === href;
    return (
      <Link 
        href={href} 
        onClick={() => setExpandedGroup(null)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: `6px 12px`, paddingLeft: `${12 + (indentLevel * 22)}px`,
          color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
          background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
          textDecoration: 'none', fontSize: '13px', fontWeight: isActive ? 600 : 500,
          transition: 'all 0.2s',
          borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
          borderRadius: '0 6px 6px 0',
          marginRight: '8px'
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--sidebar-hover)' }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
      >
        <span style={{ color: isActive ? 'var(--sidebar-active-text)' : iconColor }}>{icon}</span>
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <aside className="sidebar" ref={sidebarRef} style={{ overflowY: 'auto' }}>
      <div className="sidebar-header" style={{ position: 'sticky', top: 0, background: 'rgba(11, 13, 20, 0.95)', backdropFilter: 'blur(10px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/schollygo-logo.png" alt="SchollyGO" style={{ height: '30px', width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(250, 197, 44, 0.15)', color: '#FAC52C', border: '1px solid rgba(250, 197, 44, 0.3)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>ERP</span>
        </div>
      </div>
      
      <nav className="sidebar-nav" style={{ paddingBottom: '32px' }} onClick={(e) => {
        if (e.target === e.currentTarget) setExpandedGroup(null);
      }}>
        <NavLink href="/" icon={<LayoutDashboard size={16} />} iconColor="#f59e0b" label="Dashboard" indentLevel={0} />

        {hasAccess('Master Settings') && (
          <>
            <GroupHeader id="master" title="Master Settings" icon={<Database size={16} />} iconColor="#3b82f6" isOpen={expandedGroup === 'master'} />
            {expandedGroup === 'master' && (
              <div>
                {hasAccess('Master Settings', 'Universal Subjects') && <NavLink href="/master/subjects" icon={<FolderKanban size={16} />} iconColor="#8b5cf6" label="Universal Subjects" indentLevel={1} />}
                {hasAccess('Master Settings', 'Subject Assignment') && <NavLink href="/master/class-subjects" icon={<Building2 size={16} />} iconColor="#10b981" label="Subject Assignment" indentLevel={1} />}
                {hasAccess('Master Settings', 'Class & Sections') && <NavLink href="/master/class-sections" icon={<Briefcase size={16} />} iconColor="#f97316" label="Class & Sections" indentLevel={1} />}
                {hasAccess('Master Settings', 'Class Teachers') && <NavLink href="/master/class-teachers" icon={<UserCheck size={16} />} iconColor="#a855f7" label="Class Teachers" indentLevel={1} />}
                {hasAccess('Master Settings', 'Subject Teachers') && <NavLink href="/master/subject-teachers" icon={<Users size={16} />} iconColor="#3b82f6" label="Subject Teachers" indentLevel={1} />}
                {hasAccess('Master Settings', 'Fees Structure') && <NavLink href="/master/fees-structure" icon={<Receipt size={16} />} iconColor="#f43f5e" label="Fees Structure" indentLevel={1} />}
              </div>
            )}
          </>
        )}

        {hasAccess('Accounting & Finance') && (
          <>
            <GroupHeader id="finance" title="Accounting & Finance" icon={<CreditCard size={16} />} iconColor="#ef4444" isOpen={expandedGroup === 'finance'} />
            {expandedGroup === 'finance' && (
              <div>
                {hasAccess('Accounting & Finance', 'Fees Receipt Entry') && <NavLink href="/fees" icon={<Receipt size={16} />} iconColor="#10b981" label="Fees Receipt Entry" indentLevel={1} />}
                {hasAccess('Accounting & Finance', 'Student Ledger') && <NavLink href="/ledger" icon={<BookOpen size={16} />} iconColor="#3b82f6" label="Student Ledger" indentLevel={1} />}
                {hasAccess('Accounting & Finance', 'Expenses Payment Entry') && <NavLink href="/expenses" icon={<CreditCard size={16} />} iconColor="#f59e0b" label="Expenses Payment Entry" indentLevel={1} />}
                {hasAccess('Accounting & Finance', 'Day Book') && <NavLink href="/daybook" icon={<FileText size={16} />} iconColor="#8b5cf6" label="Day Book" indentLevel={1} />}
                {hasAccess('Accounting & Finance', 'Fees Register') && <NavLink href="/fees-register" icon={<ClipboardList size={16} />} iconColor="#ec4899" label="Fees Register" indentLevel={1} />}
              </div>
            )}
          </>
        )}

        {hasAccess('Academics') && (
          <>
            <GroupHeader id="academics" title="Academics" icon={<GraduationCap size={16} />} iconColor="#10b981" isOpen={expandedGroup === 'academics'} />
            {expandedGroup === 'academics' && (
              <div>
                {hasAccess('Academics', 'Students Hub') && <NavLink href="/students" icon={<Users size={16} />} iconColor="#3b82f6" label="Students Hub" indentLevel={1} />}
                {hasAccess('Academics', 'Student Attendance') && <NavLink href="/attendance" icon={<CalendarDays size={16} />} iconColor="#f97316" label="Student Attendance" indentLevel={1} />}
                {hasAccess('Academics', 'Exam Counseling') && <NavLink href="/exams" icon={<BookOpen size={16} />} iconColor="#8b5cf6" label="Exam Counseling" indentLevel={1} />}
                {hasAccess('Academics', 'Time Table') && <NavLink href="/timetable" icon={<CalendarDays size={16} />} iconColor="#f43f5e" label="Time Table" indentLevel={1} />}
                {hasAccess('Academics', 'Home Work') && <NavLink href="/homework" icon={<BookOpen size={16} />} iconColor="#0ea5e9" label="Home Work" indentLevel={1} />}
                {hasAccess('Academics', 'Q & A Forum') && <NavLink href="/qna" icon={<HelpCircle size={16} />} iconColor="#14b8a6" label="Q & A Forum" indentLevel={1} />}
                {hasAccess('Academics', 'Result Management') && <NavLink href="/results" icon={<FileText size={16} />} iconColor="#8b5cf6" label="Result Management" indentLevel={1} />}
                {hasAccess('Academics', 'Report Cards') && <NavLink href="/report-card" icon={<FileBadge size={16} />} iconColor="#ec4899" label="Report Cards" indentLevel={1} />}
              </div>
            )}
          </>
        )}
        
        {hasAccess('Human Resources') && (
          <>
            <GroupHeader id="hr" title="Human Resources" icon={<UserCheck size={16} />} iconColor="#f59e0b" isOpen={expandedGroup === 'hr'} />
            {expandedGroup === 'hr' && (
              <div>
                {hasAccess('Human Resources', 'Employee Records') && <NavLink href="/staff" icon={<Users size={16} />} iconColor="#3b82f6" label="Employee Records" indentLevel={1} />}
                {hasAccess('Human Resources', 'Attendance Tracking') && <NavLink href="/staff/attendance" icon={<CalendarDays size={16} />} iconColor="#10b981" label="Attendance Tracking" indentLevel={1} />}
                {hasAccess('Human Resources', 'Payroll Processing') && <NavLink href="/payroll" icon={<Receipt size={16} />} iconColor="#8b5cf6" label="Payroll Processing" indentLevel={1} />}
              </div>
            )}
          </>
        )}

        {hasAccess('System') && (
          <>
            <GroupHeader id="system" title="System" icon={<Monitor size={16} />} iconColor="#64748b" isOpen={expandedGroup === 'system'} />
            {expandedGroup === 'system' && (
              <div>
                {hasAccess('System', 'User Lists') && <NavLink href="/users" icon={<Users size={16} />} iconColor="#3b82f6" label="User Lists" indentLevel={1} />}
                {hasAccess('System', 'User Roles') && <NavLink href="/users/roles" icon={<ShieldCheck size={16} />} iconColor="#f59e0b" label="User Roles" indentLevel={1} />}
                {hasAccess('System', 'Settings') && <NavLink href="/settings" icon={<Settings size={16} />} iconColor="#64748b" label="Settings" indentLevel={1} />}
              </div>
            )}
          </>
        )}
      </nav>
    </aside>
  );
}
