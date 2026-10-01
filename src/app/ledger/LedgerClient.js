'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function LedgerClient({ classes, sectionsByClass, initialClass, initialSection, initialSearch }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedClass, setSelectedClass] = useState(initialClass || 'All');
  const [selectedSection, setSelectedSection] = useState(initialSection || 'All');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (selectedClass && selectedClass !== 'All') {
      params.set('class', selectedClass);
    }
    if (selectedSection && selectedSection !== 'All') {
      params.set('section', selectedSection);
    }
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }

    // Always push to /ledger, even if all params are empty
    router.push(`/ledger${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // If "All" is selected for class, we don't strictly need to show sections, but let's keep it as "All"
  const sectionsForClass = selectedClass && selectedClass !== 'All' ? (sectionsByClass[selectedClass] || []) : [];

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 200px' }}>
        <label className="form-label" style={{ fontWeight: '500' }}>Class</label>
        <select
          className="form-input"
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedSection('All');
          }}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '4px' }}
        >
          <option value="All">All Classes</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 200px' }}>
        <label className="form-label" style={{ fontWeight: '500' }}>Section</label>
        <select
          className="form-input"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          disabled={selectedClass === 'All'}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '4px' }}
        >
          <option value="All">All Sections</option>
          {sectionsForClass.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '2 1 300px' }}>
        <label className="form-label" style={{ fontWeight: '500' }}>Search Student</label>
        <input
          type="text"
          className="form-input"
          placeholder="Search by Name, Roll No, Student ID, or Mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '4px' }}
        />
      </div>

      <button type="submit" className="btn btn-secondary" style={{ height: '38px', flex: '0 0 auto', padding: '0 20px' }}>
        <Search size={16} /> Load Students
      </button>
    </form>
  );
}
