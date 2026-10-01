'use client';
import { useState } from 'react';
import Link from 'next/link';
import { User, Trash2 } from 'lucide-react';
import { useSortableData } from '@/hooks/useSortableData';
import SortableHeader from '@/components/SortableHeader';
import { formatDate } from '@/lib/formatDate';
import ConfirmModal from '@/components/ConfirmModal';
import { deleteUser } from './actions';
import { useRouter } from 'next/navigation';

export default function UsersTableClient({ initialUsers, isSuperAdmin }) {
  const router = useRouter();
  const { items: sortedUsers, requestSort, sortConfig } = useSortableData(initialUsers);
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    await deleteUser(deleteModal.id);
    setDeleting(false);
    setDeleteModal({ isOpen: false, id: null, name: '' });
    router.refresh();
  };

  if (initialUsers.length === 0) return null;

  return (
    <>
      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete the user "${deleteModal.name}"? This action cannot be undone.`}
        loading={deleting}
      />
      <table style={{ marginTop: '16px' }}>
        <thead>
          <tr>
            <SortableHeader label="Username" sortKey="username" currentSortConfig={sortConfig} requestSort={requestSort} />
            <SortableHeader label="Linked Staff Member" sortKey="staff_name" currentSortConfig={sortConfig} requestSort={requestSort} />
            <SortableHeader label="Role" sortKey="role" currentSortConfig={sortConfig} requestSort={requestSort} />
            <SortableHeader label="Created At" sortKey="created_at" currentSortConfig={sortConfig} requestSort={requestSort} />
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user.id}>
              <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '6px', borderRadius: '50%', color: 'var(--text-secondary)' }}>
                  <User size={14} />
                </div>
                {user.username}
              </td>
              <td>
                {user.staff_name ? (
                  <>
                    <div style={{ fontWeight: 500 }}>{user.staff_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{user.staff_role}</div>
                  </>
                ) : (
                  <span style={{ color: 'var(--text-tertiary)' }}>No linked staff</span>
                )}
              </td>
              <td>
                <span style={{ 
                  background: user.role === 'Super Admin' ? 'rgba(239, 68, 68, 0.1)' : user.role === 'Admin' ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-secondary)', 
                  color: user.role === 'Super Admin' ? '#ef4444' : user.role === 'Admin' ? 'var(--accent)' : 'var(--text-secondary)',
                  padding: '4px 12px', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  fontWeight: 500
                }}>
                  {user.role}
                </span>
              </td>
              <td>{formatDate(user.created_at)}</td>
              <td>
                {/* Only Super Admins can edit/delete other Super Admins */}
                {(isSuperAdmin || user.role !== 'Super Admin') ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link href={`/users/edit/${user.id}`} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
                      Edit User
                    </Link>
                    <button 
                      className="btn" 
                      style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--danger)', color: 'white', border: 'none' }}
                      onClick={() => setDeleteModal({ isOpen: true, id: user.id, name: user.username })}
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Restricted</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
