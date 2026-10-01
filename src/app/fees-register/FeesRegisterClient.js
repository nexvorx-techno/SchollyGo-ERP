'use client';

import { useState, useMemo } from 'react';
import { Search, Bell, Check, X, Filter } from 'lucide-react';
import { bulkSendReminders } from './actions';

export default function FeesRegisterClient({ initialData }) {
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Pending Fees', 'Fees Paid'
  const [classFilter, setClassFilter] = useState('All');
  
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationMethod, setNotificationMethod] = useState('Both'); // 'WhatsApp', 'Email', 'Both'
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Extract unique classes for the filter dropdown
  const uniqueClasses = useMemo(() => {
    const classes = new Set(initialData.map(d => d.class).filter(Boolean));
    return ['All', ...Array.from(classes).sort()];
  }, [initialData]);

  // Filter the data
  const filteredData = useMemo(() => {
    return data.filter(student => {
      // Search
      const matchesSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
      
      // Class filter
      const matchesClass = classFilter === 'All' || student.class === classFilter;
      
      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [data, searchTerm, statusFilter, classFilter]);

  // Handle Checkboxes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allFilteredIds = filteredData.map(d => d.id);
      setSelectedIds(new Set(allFilteredIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const getPrimaryMobile = (student) => {
    try {
      const primary = student.primary_contact === 'Mother' ? student.mother_mobile : student.father_mobile;
      if (primary) {
        const parsed = JSON.parse(primary);
        if (parsed && parsed.length > 0 && parsed[0].num) {
          return `${parsed[0].code} ${parsed[0].num}`;
        }
      }
      
      const secondary = student.primary_contact === 'Mother' ? student.father_mobile : student.mother_mobile;
      if (secondary) {
        const parsed = JSON.parse(secondary);
        if (parsed && parsed.length > 0 && parsed[0].num) {
          return `${parsed[0].code} ${parsed[0].num}`;
        }
      }
    } catch (e) {}
    return '-';
  };

  // Notification action
  const handleSendNotification = async () => {
    if (selectedIds.size === 0) return;
    
    setIsSending(true);
    try {
      const idsArray = Array.from(selectedIds);
      const res = await bulkSendReminders(idsArray, notificationMethod);
      if (res.success) {
        setSuccessMessage(`Successfully sent reminders to ${res.count} students via ${res.method}.`);
        setIsModalOpen(false);
        setSelectedIds(new Set());
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send notifications.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      {/* Success Toast */}
      {successMessage && (
        <div style={{ padding: '16px', background: '#e3fcef', color: '#006644', border: '1px solid #00a36c', borderRadius: '4px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
          <Check size={18} /> {successMessage}
        </div>
      )}

      {/* Filters & Bulk Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid var(--border)' }}>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder="Search student..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 12px 10px 36px', border: '1px solid var(--border)', borderRadius: '4px', width: '100%' }}
            />
          </div>

          {/* Class Filter */}
          <div style={{ position: 'relative' }}>
            <Filter size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <select 
              value={classFilter} 
              onChange={(e) => setClassFilter(e.target.value)}
              style={{ padding: '10px 12px 10px 32px', border: '1px solid var(--border)', borderRadius: '4px', minWidth: '150px' }}
            >
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ position: 'relative' }}>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '4px', minWidth: '150px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending Fees">Pending Fees</option>
              <option value="Partial Paid">Partial Paid</option>
              <option value="Fees Paid">Fees Paid</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button 
            className="btn" 
            disabled={selectedIds.size === 0} 
            onClick={() => setIsModalOpen(true)}
            style={{ opacity: selectedIds.size === 0 ? 0.5 : 1, transition: 'all 0.2s' }}
          >
            <Bell size={16} /> Send Reminder ({selectedIds.size})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={filteredData.length > 0 && selectedIds.size === filteredData.length}
                  onChange={handleSelectAll}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
              </th>
              <th>Student ID</th>
              <th>Adm No</th>
              <th>Name</th>
              <th>Class</th>
              <th>Parent Contact</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Total Paid (₹)</th>
              <th style={{ textAlign: 'right' }}>Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                  No students found matching filters.
                </td>
              </tr>
            ) : (
              filteredData.map(student => (
                <tr key={student.id} onClick={() => handleSelectRow(student.id)} style={{ cursor: 'pointer', background: selectedIds.has(student.id) ? '#f0f4ff' : 'transparent' }}>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(student.id)}
                      onChange={() => {}} // Handled by row click
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </td>
                  <td style={{ fontWeight: 600 }}>{student.student_id}</td>
                  <td>{student.admission_number || '-'}</td>
                  <td style={{ fontWeight: 500 }}>{student.name}</td>
                  <td>{student.class}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{getPrimaryMobile(student)}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {student.primary_contact || 'Father'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      background: student.status === 'Fees Paid' ? '#e3fcef' : student.status === 'Partial Paid' ? '#fef08a' : '#fef2f2', 
                      color: student.status === 'Fees Paid' ? '#006644' : student.status === 'Partial Paid' ? '#854d0e' : '#991b1b', 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 
                    }}>
                      {student.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--brand-primary)' }}>
                    {student.total_paid.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--danger)' }}>
                    {student.balance ? student.balance.toFixed(2) : '0.00'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Notification Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '8px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                <Bell size={20} color="var(--brand-primary)" /> Bulk Reminder
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
              You are about to send a fees reminder to <strong>{selectedIds.size} student(s)</strong>. Please select the notification channel.
            </p>

            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Notification Channel</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', background: notificationMethod === 'WhatsApp' ? '#f0fdf4' : '#fff', borderColor: notificationMethod === 'WhatsApp' ? '#16a34a' : 'var(--border)' }}>
                  <input type="radio" checked={notificationMethod === 'WhatsApp'} onChange={() => setNotificationMethod('WhatsApp')} style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontWeight: 500 }}>WhatsApp Only</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', background: notificationMethod === 'Email' ? '#f0f4ff' : '#fff', borderColor: notificationMethod === 'Email' ? 'var(--brand-primary)' : 'var(--border)' }}>
                  <input type="radio" checked={notificationMethod === 'Email'} onChange={() => setNotificationMethod('Email')} style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontWeight: 500 }}>Email Only</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', background: notificationMethod === 'Both' ? '#f5f3ff' : '#fff', borderColor: notificationMethod === 'Both' ? '#8b5cf6' : 'var(--border)' }}>
                  <input type="radio" checked={notificationMethod === 'Both'} onChange={() => setNotificationMethod('Both')} style={{ width: '16px', height: '16px' }} />
                  <span style={{ fontWeight: 500 }}>Both WhatsApp & Email</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn" style={{ flex: 1, padding: '12px' }} onClick={handleSendNotification} disabled={isSending}>
                {isSending ? 'Sending...' : 'Confirm & Send'}
              </button>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={() => setIsModalOpen(false)} disabled={isSending}>
                Cancel
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
