'use client';
import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import { useSortableData } from '@/hooks/useSortableData';
import SortableHeader from '@/components/SortableHeader';
import { useState } from 'react';
import { deleteStudent } from './actions';
import ConfirmModal from '@/components/ConfirmModal';
import { useRouter } from 'next/navigation';

export default function StudentsTableClient({ initialStudents }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, name: '' });
  const { items: sortedStudents, requestSort, sortConfig } = useSortableData(initialStudents);

  const executeDelete = async () => {
    setLoading(true);
    await deleteStudent(confirmModal.id);
    setLoading(false);
    setConfirmModal({ isOpen: false, id: null, name: '' });
    router.refresh();
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
      
      // Fallback if primary is empty
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

  if (initialStudents.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No students found.
      </div>
    );
  }

  return (
    <>
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null, name: '' })}
        onConfirm={executeDelete}
        title="Delete Student"
        message={`Are you sure you want to delete student "${confirmModal.name}"? This action cannot be undone.`}
        loading={loading}
      />
      <table>
      <thead>
        <tr>
          <SortableHeader label="Student ID" sortKey="student_id" currentSortConfig={sortConfig} requestSort={requestSort} />
          <SortableHeader label="Name" sortKey="name" currentSortConfig={sortConfig} requestSort={requestSort} />
          <SortableHeader label="Class" sortKey="class" currentSortConfig={sortConfig} requestSort={requestSort} />
          <SortableHeader label="Section" sortKey="section" currentSortConfig={sortConfig} requestSort={requestSort} />
          <SortableHeader label="Adm No" sortKey="admission_number" currentSortConfig={sortConfig} requestSort={requestSort} />
          <SortableHeader label="Parent Contact" sortKey="father_mobile" currentSortConfig={sortConfig} requestSort={requestSort} />
          <SortableHeader label="Status" sortKey="status" currentSortConfig={sortConfig} requestSort={requestSort} />
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedStudents.map((student) => (
          <tr key={student.id}>
            <td style={{ fontWeight: 600 }}>{student.student_id}</td>
            <td style={{ fontWeight: 500 }}>{student.name}</td>
            <td>{student.class}</td>
            <td>{student.section}</td>
            <td>{student.admission_number}</td>
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
                background: '#e3fcef', color: '#006644', 
                padding: '2px 6px', borderRadius: '3px', fontSize: '11px', fontWeight: 600 
              }}>
                {student.status}
              </span>
            </td>
            <td style={{ display: 'flex', gap: '8px' }}>
              <Link href={`/students/edit/${student.id}`} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }}>
                <Edit size={12} /> Edit Details
              </Link>
              <button 
                onClick={() => setConfirmModal({ isOpen: true, id: student.id, name: student.name })}
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
