'use client';

import { RefreshCw } from 'lucide-react';

export default function RefreshButton() {
  return (
    <button 
      onClick={() => window.location.reload()} 
      style={{ 
        background: 'transparent', 
        border: 'none', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}
      title="Refresh Data"
    >
      <RefreshCw size={18} />
    </button>
  );
}
