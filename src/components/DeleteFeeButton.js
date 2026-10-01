'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteFeeEntry } from '@/app/fees/actions';
import { useRouter } from 'next/navigation';
import ConfirmModal from './ConfirmModal';

export default function DeleteFeeButton({ receiptId, receiptNumber }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteFeeEntry(receiptId);
    setLoading(false);
    setShowConfirm(false);
    router.refresh();
  };

  return (
    <>
      <button 
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        style={{ 
          background: 'none', 
          border: '1px solid var(--danger)', 
          color: 'var(--danger)',
          padding: '4px 8px', 
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '13px',
          opacity: loading ? 0.5 : 1
        }}
        title="Delete Receipt"
      >
        <Trash2 size={14} />
        {loading ? '...' : 'Delete'}
      </button>

      <ConfirmModal 
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Receipt"
        message={`Are you sure you want to delete receipt ${receiptNumber}? This action cannot be undone and will permanently remove this fee entry.`}
        loading={loading}
      />
    </>
  );
}
