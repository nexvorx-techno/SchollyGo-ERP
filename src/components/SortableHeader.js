import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

export default function SortableHeader({ label, sortKey, currentSortConfig, requestSort, style = {} }) {
  let sortIcon = <ArrowUpDown size={14} color="var(--text-tertiary)" />;
  
  if (currentSortConfig && currentSortConfig.key === sortKey) {
    sortIcon = currentSortConfig.direction === 'ascending' 
      ? <ArrowUp size={14} color="var(--accent)" /> 
      : <ArrowDown size={14} color="var(--accent)" />;
  }

  const isSorted = currentSortConfig && currentSortConfig.key === sortKey;

  return (
    <th 
      onClick={() => requestSort(sortKey)} 
      style={{ 
        cursor: 'pointer', 
        userSelect: 'none',
        background: isSorted ? 'rgba(0,0,0,0.03)' : 'inherit',
        ...style 
      }}
      title={`Sort by ${label}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: style.textAlign === 'center' ? 'center' : 'flex-start' }}>
        <span style={{ color: isSorted ? 'var(--accent)' : 'inherit', fontWeight: isSorted ? 600 : 500 }}>
          {label}
        </span>
        {sortIcon}
      </div>
    </th>
  );
}
