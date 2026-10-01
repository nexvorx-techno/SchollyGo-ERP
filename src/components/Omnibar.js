'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, GraduationCap, Users, CalendarDays, BookOpen, FileText, CreditCard, Receipt, UserCheck, Settings, FolderKanban, HelpCircle, ShieldCheck, ClipboardList } from 'lucide-react';

const MODULES = [
  { name: 'Dashboard', path: '/', icon: <GraduationCap size={18} />, category: 'Core' },
  
  // Master Settings
  { name: 'Universal Subjects', path: '/master/subjects', icon: <FolderKanban size={18} />, category: 'Master Settings' },
  { name: 'Subject Assignment', path: '/master/class-subjects', icon: <FolderKanban size={18} />, category: 'Master Settings' },
  { name: 'Class & Sections', path: '/master/class-sections', icon: <FolderKanban size={18} />, category: 'Master Settings' },
  { name: 'Class Teachers', path: '/master/class-teachers', icon: <UserCheck size={18} />, category: 'Master Settings' },
  { name: 'Subject Teachers', path: '/master/subject-teachers', icon: <Users size={18} />, category: 'Master Settings' },
  { name: 'Fees Structure', path: '/master/fees-structure', icon: <Receipt size={18} />, category: 'Master Settings' },
  
  // Accounting & Finance
  { name: 'Fees Receipt Entry', path: '/fees', icon: <Receipt size={18} />, category: 'Accounting & Finance' },
  { name: 'Student Ledger', path: '/ledger', icon: <BookOpen size={18} />, category: 'Accounting & Finance' },
  { name: 'Expenses Payment Entry', path: '/expenses', icon: <CreditCard size={18} />, category: 'Accounting & Finance' },
  { name: 'Day Book', path: '/daybook', icon: <FileText size={18} />, category: 'Accounting & Finance' },
  { name: 'Fees Register', path: '/fees-register', icon: <ClipboardList size={18} />, category: 'Accounting & Finance' },

  // Academics
  { name: 'Students Hub', path: '/students', icon: <Users size={18} />, category: 'Academics' },
  { name: 'Student Attendance', path: '/attendance', icon: <CalendarDays size={18} />, category: 'Academics' },
  { name: 'Exam Counseling', path: '/exams', icon: <BookOpen size={18} />, category: 'Academics' },
  { name: 'Time Table', path: '/timetable', icon: <CalendarDays size={18} />, category: 'Academics' },
  { name: 'Home Work', path: '/homework', icon: <BookOpen size={18} />, category: 'Academics' },
  { name: 'Q & A Forum', path: '/qna', icon: <HelpCircle size={18} />, category: 'Academics' },
  { name: 'Result Management', path: '/results', icon: <FileText size={18} />, category: 'Academics' },
  { name: 'Report Cards', path: '/report-card', icon: <FileText size={18} />, category: 'Academics' },

  // Human Resources
  { name: 'Employee Records', path: '/staff', icon: <Users size={18} />, category: 'Human Resources' },
  { name: 'Attendance Tracking', path: '/staff/attendance', icon: <CalendarDays size={18} />, category: 'Human Resources' },
  { name: 'Payroll Processing', path: '/payroll', icon: <Receipt size={18} />, category: 'Human Resources' },

  // System
  { name: 'User Lists', path: '/users', icon: <Users size={18} />, category: 'System' },
  { name: 'User Roles', path: '/users/roles', icon: <ShieldCheck size={18} />, category: 'System' },
  { name: 'Settings', path: '/settings', icon: <Settings size={18} />, category: 'System' },
];

export default function Omnibar({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef(null);

  const role = currentUser?.role || 'User';
  let permissions = {};
  if (currentUser?.permissions) {
    try {
      permissions = JSON.parse(currentUser.permissions);
    } catch (e) {}
  }

  const hasAccess = (moduleName, subModuleName) => {
    if (role === 'Super Admin') return true;
    if (moduleName === 'Core') return true;
    
    if (role === 'Admin' && (!permissions || Object.keys(permissions).length === 0)) {
      if (moduleName === 'System' && (subModuleName === 'User Lists' || subModuleName === 'User Roles')) return false;
      return true;
    }

    const modPerms = permissions[moduleName];
    if (modPerms && typeof modPerms.readWrite === 'boolean') {
      return modPerms.readWrite || modPerms.editDelete;
    }
    if (subModuleName) {
      const subPerms = modPerms?.[subModuleName];
      return subPerms?.readWrite || subPerms?.editDelete;
    }
    if (modPerms && typeof modPerms === 'object') {
      return Object.values(modPerms).some(sub => sub.readWrite || sub.editDelete);
    }
    return false;
  };
  
  const allowedModules = MODULES.filter(m => {
    if (m.name === 'Dashboard') return true;
    
    // Now that the MODULES list names match the Sidebar subModule names perfectly, 
    // we just pass m.category as the moduleName and m.name as the subModuleName.
    const moduleName = m.category;
    const subModuleName = m.name;
    
    return hasAccess(moduleName, subModuleName);
  });
  
  const filteredModules = allowedModules.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setSearch('');
        setSelectedIndex(0);
      }
      
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleNavigation = (path) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleModalKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredModules.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredModules[selectedIndex]) {
        handleNavigation(filteredModules[selectedIndex].path);
      }
    }
  };

  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current && listRef.current.children[selectedIndex]) {
      listRef.current.children[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsOpen(false)}>
      <div 
        style={{ 
          background: '#ffffff', 
          width: '500px', 
          maxWidth: '90%', 
          borderRadius: '2px', 
          border: '1px solid #204169', 
          boxShadow: '4px 4px 10px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
        onKeyDown={handleModalKeyDown}
      >
        {/* Tally Prime Style Header */}
        <div style={{ padding: '6px 12px', background: '#204169', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 'bold' }}>
          <span>List of Modules</span>
          <span style={{ cursor: 'pointer', padding: '0 4px' }} onClick={() => setIsOpen(false)}>✕</span>
        </div>
        
        {/* Search Input Area */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #c0c0c0', background: '#eef2f5' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #7a9bb8', padding: '4px 8px' }}>
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Search (e.g., Attendance)" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '13px', padding: 0 }}
            />
          </div>
        </div>
        
        {/* Results List */}
        <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '4px 0', background: '#ffffff' }}>
          {filteredModules.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
              No items found
            </div>
          ) : (
            <div ref={listRef}>
              {filteredModules.map((mod, i) => {
                const isSelected = i === selectedIndex;
                return (
                  <div 
                    key={mod.path}
                    onClick={() => handleNavigation(mod.path)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 12px',
                      cursor: 'pointer',
                      background: isSelected ? '#204169' : 'transparent',
                      color: isSelected ? '#ffffff' : '#000000',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ opacity: isSelected ? 1 : 0.7 }}>{mod.icon}</span>
                      <span style={{ fontSize: '13px' }}>{mod.name}</span>
                    </div>
                    <div style={{ fontSize: '11px', opacity: isSelected ? 0.8 : 0.5, fontStyle: 'italic' }}>
                      {mod.category}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div style={{ background: '#f5f5f5', padding: '4px 12px', fontSize: '11px', color: '#333', borderTop: '1px solid #c0c0c0', display: 'flex', justifyContent: 'space-between' }}>
          <span>Press <b>Enter</b> to Select</span>
          <span>Press <b>Esc</b> to Close</span>
        </div>
      </div>
    </div>
  );
}
