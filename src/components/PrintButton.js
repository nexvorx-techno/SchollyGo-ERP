'use client';
import { useRouter } from 'next/navigation';
import { Printer } from 'lucide-react';

export default function PrintButton({ receiptId }) {
  const router = useRouter();

  const handlePrint = () => {
    if (receiptId) {
      router.push(`/fees/receipt/${receiptId}`);
    } else {
      window.print();
    }
  };

  return (
    <button 
      onClick={handlePrint}
      className="btn" 
      style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '6px 12px', fontSize: '13px' }}
    >
      <Printer size={14} />
      Print
    </button>
  );
}
