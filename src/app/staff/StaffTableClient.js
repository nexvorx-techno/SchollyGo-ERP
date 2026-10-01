'use client';
import Link from 'next/link';
import { useSortableData } from '@/hooks/useSortableData';
import SortableHeader from '@/components/SortableHeader';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deleteStaff } from './actions';
import ConfirmModal from '@/components/ConfirmModal';
import { useRouter } from 'next/navigation';

export default function StaffTableClient({ initialStaff }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, name: '' });
  const { items: sortedStaff, requestSort, sortConfig } = useSortableData(initialStaff);

  const executeDelete = async () => {
    setLoading(true);
    await deleteStaff(confirmModal.id);
    setLoading(false);
    setConfirmModal({ isOpen: false, id: null, name: '' });
    router.refresh();
  };

  if (initialStaff.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No staff members found. Add staff to get started.
      </div>
    );
  }

  return (
    <>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null, name: '' })}
        onConfirm={executeDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete staff member "${confirmModal.name}"? This action cannot be undone.`}
        loading={loading}
      />
      <table>
      <thead>
        <tr>
          <SortableHeader label="ID" sortKey="id" currentSortConfig={sortConfig} requestSort={requestSort} />
          <SortableHeader label="Name" sortKey="name" currentSortConfig={sortConfig} requestSort={requestSort} />
          <SortableHeader label="Role" sortKey="role" currentSortConfig={sortConfig} requestSort={requestSort} />
          <SortableHeader label="Department" sortKey="department" currentSortConfig={sortConfig} requestSort={requestSort} />
          <SortableHeader label="Contact" sortKey="contact" currentSortConfig={sortConfig} requestSort={requestSort} />
          <SortableHeader label="Base Salary" sortKey="base_salary" currentSortConfig={sortConfig} requestSort={requestSort} />
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedStaff.map((member) => (
          <tr key={member.id}>
            <td>{member.id}</td>
            <td style={{ fontWeight: 500 }}>{member.name}</td>
            <td>
              <span style={{ 
                background: '#e9ecef',
                padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 
              }}>
                {member.role}
              </span>
            </td>
            <td>{member.department}</td>
            <td>{member.contact}</td>
            <td style={{ fontWeight: 600 }}>₹{(member.base_salary || 0).toFixed(2)}</td>
            <td style={{ display: 'flex', gap: '8px' }}>
              <Link href={`/staff/edit/${member.id}`} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
                Edit Details
              </Link>
              <button 
                onClick={() => setConfirmModal({ isOpen: true, id: member.id, name: member.name })}
                className="btn btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                <Trash2 size={12} /> Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </>
  );
}
