'use client';
import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { useSortableData } from '@/hooks/useSortableData';
import SortableHeader from '@/components/SortableHeader';

export default function FeesMasterTable({ initialClasses, updateAction }) {
  const [classes, setClasses] = useState(initialClasses);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ tuition_fee: 0, bus_fee: 0, admission_fee: 0, caution_money: 0, other_fee: 0, late_fee_type: 'None', late_fee_amount: 0, due_date_day: 10, duration_type: 'Monthly' });
  
  const { items: sortedClasses, requestSort, sortConfig } = useSortableData(classes);

  const handleEditClick = (cls) => {
    setEditingId(cls.id);
    setEditForm({ tuition_fee: cls.tuition_fee, bus_fee: cls.bus_fee, admission_fee: cls.admission_fee, caution_money: cls.caution_money, other_fee: cls.other_fee, late_fee_type: cls.late_fee_type || 'None', late_fee_amount: cls.late_fee_amount, due_date_day: cls.due_date_day || 10, duration_type: cls.duration_type || 'Monthly' });
  };

  const handleSave = async (id) => {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('tuition_fee', editForm.tuition_fee);
    formData.append('bus_fee', editForm.bus_fee);
    formData.append('admission_fee', editForm.admission_fee);
    formData.append('caution_money', editForm.caution_money);
    formData.append('other_fee', editForm.other_fee);
    formData.append('late_fee_type', editForm.late_fee_type);
    formData.append('late_fee_amount', editForm.late_fee_amount);
    formData.append('due_date_day', editForm.due_date_day);
    formData.append('duration_type', editForm.duration_type);
    
    // Call server action
    await updateAction(formData);
    
    // Update local state
    setClasses(classes.map(c => c.id === id ? { ...c, ...editForm } : c));
    setEditingId(null);
  };

  return (
    <div className="panel">
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left', background: '#f9f9fa' }}>
            <SortableHeader label="Class Level" sortKey="class_name" currentSortConfig={sortConfig} requestSort={requestSort} style={{ padding: '16px 24px' }} />
            <SortableHeader label="Fee Duration" sortKey="duration_type" currentSortConfig={sortConfig} requestSort={requestSort} style={{ padding: '16px 24px' }} />
            <SortableHeader label="Tuition Fee" sortKey="tuition_fee" currentSortConfig={sortConfig} requestSort={requestSort} style={{ padding: '16px 24px' }} />
            <SortableHeader label="Admission Fee" sortKey="admission_fee" currentSortConfig={sortConfig} requestSort={requestSort} style={{ padding: '16px 24px' }} />
            <SortableHeader label="Caution Money" sortKey="caution_money" currentSortConfig={sortConfig} requestSort={requestSort} style={{ padding: '16px 24px' }} />
            <SortableHeader label="Default Bus Fee" sortKey="bus_fee" currentSortConfig={sortConfig} requestSort={requestSort} style={{ padding: '16px 24px' }} />
            <SortableHeader label="Late Applicable" sortKey="late_fee_type" currentSortConfig={sortConfig} requestSort={requestSort} style={{ padding: '16px 24px' }} />
            <SortableHeader label="Other Fees" sortKey="other_fee" currentSortConfig={sortConfig} requestSort={requestSort} style={{ padding: '16px 24px' }} />
            <th style={{ padding: '16px 24px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedClasses.map((cls) => (
            <tr key={cls.id} style={{ borderBottom: '1px solid var(--border)', background: editingId === cls.id ? '#f4f5f7' : 'transparent' }}>
              <td style={{ padding: '16px 24px', fontWeight: 600 }}>{cls.class_name}</td>
              <td style={{ padding: '16px 24px' }}>
                {editingId === cls.id ? (
                  <select 
                    value={editForm.duration_type} 
                    onChange={e => setEditForm({ ...editForm, duration_type: e.target.value })}
                    style={{ width: '120px', padding: '6px 8px' }}
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                  </select>
                ) : (
                  <span style={{ color: 'var(--text-secondary)' }}>{cls.duration_type || 'Monthly'}</span>
                )}
              </td>
              <td style={{ padding: '16px 24px' }}>
                {editingId === cls.id ? (
                  <input 
                    type="number" 
                    value={editForm.tuition_fee} 
                    onChange={e => setEditForm({ ...editForm, tuition_fee: Number(e.target.value) })}
                    style={{ width: '120px', padding: '6px 8px' }}
                  />
                ) : (
                  <span style={{ fontWeight: 600, color: 'var(--accent)' }}>₹{cls.tuition_fee.toFixed(2)}</span>
                )}
              </td>
              <td style={{ padding: '16px 24px' }}>
                {editingId === cls.id ? (
                  <input 
                    type="number" 
                    value={editForm.admission_fee} 
                    onChange={e => setEditForm({ ...editForm, admission_fee: Number(e.target.value) })}
                    style={{ width: '120px', padding: '6px 8px' }}
                  />
                ) : (
                  <span>₹{(cls.admission_fee || 0).toFixed(2)}</span>
                )}
              </td>
              <td style={{ padding: '16px 24px' }}>
                {editingId === cls.id ? (
                  <input 
                    type="number" 
                    value={editForm.caution_money} 
                    onChange={e => setEditForm({ ...editForm, caution_money: Number(e.target.value) })}
                    style={{ width: '120px', padding: '6px 8px' }}
                  />
                ) : (
                  <span>₹{(cls.caution_money || 0).toFixed(2)}</span>
                )}
              </td>
              <td style={{ padding: '16px 24px' }}>
                {editingId === cls.id ? (
                  <input 
                    type="number" 
                    value={editForm.bus_fee} 
                    onChange={e => setEditForm({ ...editForm, bus_fee: Number(e.target.value) })}
                    style={{ width: '120px', padding: '6px 8px' }}
                  />
                ) : (
                  <span>₹{cls.bus_fee.toFixed(2)}</span>
                )}
              </td>
              <td style={{ padding: '16px 24px' }}>
                {editingId === cls.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '140px' }}>
                    <select 
                      value={editForm.late_fee_type} 
                      onChange={e => setEditForm({ ...editForm, late_fee_type: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                    >
                      <option value="None">No Late Fee</option>
                      <option value="Per Day">Per Day Penalty</option>
                      <option value="Fixed">Fixed Amount</option>
                    </select>
                    {editForm.late_fee_type !== 'None' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '13px' }}>₹</span>
                          <input 
                            type="number" 
                            value={editForm.late_fee_amount} 
                            onChange={e => setEditForm({ ...editForm, late_fee_amount: Number(e.target.value) })}
                            style={{ width: '100%', padding: '6px 8px 6px 22px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                            placeholder="Amount"
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Due Day:</span>
                          <input 
                            type="number" 
                            min="1"
                            max="31"
                            value={editForm.due_date_day} 
                            onChange={e => setEditForm({ ...editForm, due_date_day: Number(e.target.value) })}
                            style={{ width: '60px', padding: '4px 8px', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}
                            title="Day of the month (1-31)"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                    <span style={{ 
                      background: cls.late_fee_type !== 'None' ? '#fee2e2' : '#f3f4f6', 
                      color: cls.late_fee_type !== 'None' ? '#991b1b' : '#6b7280', 
                      padding: '4px 10px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      display: 'inline-block',
                      whiteSpace: 'nowrap'
                    }}>
                      {cls.late_fee_type !== 'None' 
                        ? `₹${(cls.late_fee_amount || 0).toFixed(2)} ${cls.late_fee_type === 'Per Day' ? '/ day' : '(Fixed)'}` 
                        : 'No Late Fee'}
                    </span>
                    {cls.late_fee_type !== 'None' && (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Due: {cls.due_date_day || 10}th of month
                      </span>
                    )}
                  </div>
                )}
              </td>
              <td style={{ padding: '16px 24px' }}>
                {editingId === cls.id ? (
                  <input 
                    type="number" 
                    value={editForm.other_fee} 
                    onChange={e => setEditForm({ ...editForm, other_fee: Number(e.target.value) })}
                    style={{ width: '120px', padding: '6px 8px' }}
                  />
                ) : (
                  <span>₹{cls.other_fee.toFixed(2)}</span>
                )}
              </td>
              <td style={{ padding: '16px 24px' }}>
                {editingId === cls.id ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleSave(cls.id)} className="btn" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      <Save size={14} /> Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      <X size={14} /> Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleEditClick(cls)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    <Edit2 size={14} /> Edit Rates
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
