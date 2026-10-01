import { useState, useMemo } from 'react';

export function useSortableData(items, initialConfig = null) {
  const [sortConfig, setSortConfig] = useState(initialConfig);

  const sortedItems = useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle null/undefined
        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';
        
        // Handle numbers vs strings naturally
        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue)) && aValue !== '' && bValue !== '') {
          const numA = Number(aValue);
          const numB = Number(bValue);
          if (numA < numB) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (numA > numB) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        } else {
          const strA = String(aValue);
          const strB = String(bValue);
          const compareResult = strA.localeCompare(strB, undefined, { numeric: true, sensitivity: 'base' });
          return sortConfig.direction === 'ascending' ? compareResult : -compareResult;
        }
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
}
