'use client';
import React, { useState } from 'react';
import { Save, Search, User, X, Check, Shield } from 'lucide-react';
import Link from 'next/link';

const MODULES_LIST = {
  'Master Settings': ['Universal Subjects', 'Subject Assignment', 'Class & Sections', 'Class Teachers', 'Subject Teachers', 'Fees Structure'],
  'Accounting & Finance': ['Fees Receipt Entry', 'Student Ledger', 'Expenses Payment Entry', 'Day Book', 'Fees Register'],
  'Academics': ['Students Hub', 'Student Attendance', 'Exam Counseling', 'Time Table', 'Home Work', 'Q & A Forum', 'Result Management', 'Report Cards'],
  'Human Resources': ['Employee Records', 'Attendance Tracking', 'Payroll Processing'],
  'System': ['User Lists', 'User Roles', 'Settings']
};

export default function UserForm({ staffList = [], userList = [], classList = [], initialData = null, isEdit = false, saveUserAction }) {
  // Try parsing existing JSON fields if editing
  const existingPermissions = initialData?.permissions ? JSON.parse(initialData.permissions) : {};
  let existingClasses = { classes: [], sections: [] };
  if (initialData?.assigned_classes) {
    try {
      const parsed = JSON.parse(initialData.assigned_classes);
      if (Array.isArray(parsed)) {
        existingClasses = { classes: parsed, sections: [] };
      } else if (parsed && typeof parsed === 'object') {
        existingClasses = parsed;
      }
    } catch (e) { }
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);

  const initialStaff = initialData?.staff_id ? staffList.find(s => s.id === initialData.staff_id) : null;
  const [selectedStaff, setSelectedStaff] = useState(initialStaff);

  const [username, setUsername] = useState(initialData?.username || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialData?.role || 'User');

  // RBAC State
  const [permissions, setPermissions] = useState(() => {
    const init = {};
    Object.keys(MODULES_LIST).forEach(mod => {
      init[mod] = {};
      const legacyMod = existingPermissions[mod];
      const isLegacyFlat = legacyMod && typeof legacyMod.readWrite === 'boolean';

      MODULES_LIST[mod].forEach(sub => {
        if (isLegacyFlat) {
          init[mod][sub] = { readWrite: legacyMod.readWrite, editDelete: legacyMod.editDelete };
        } else {
          init[mod][sub] = legacyMod?.[sub] || { readWrite: false, editDelete: false };
        }
      });
    });
    return init;
  });

  const [assignedClasses, setAssignedClasses] = useState(existingClasses);
  const [approvalRequired, setApprovalRequired] = useState(initialData?.approval_required === 1);
  const [reportingTo, setReportingTo] = useState(initialData?.reporting_to || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const filteredStaff = staffList.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.employee_id && s.employee_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectStaff = (staff) => {
    setSelectedStaff(staff);
    setShowStaffModal(false);
    setSearchTerm('');
    if (!isEdit && !username) {
      if (staff.employee_id) {
        setUsername(staff.employee_id.toLowerCase());
      } else {
        setUsername(staff.name.toLowerCase().replace(/\s+/g, '.'));
      }
    }
  };

  const handlePermissionChange = (module, submodule, type, value) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [submodule]: {
          ...prev[module][submodule],
          [type]: value,
          ...(type === 'editDelete' && value ? { readWrite: true } : {})
        }
      }
    }));
  };

  const handleClassToggle = (className) => {
    setAssignedClasses(prev =>
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      if (selectedStaff) {
        formData.append('staff_id', selectedStaff.id);
      }
      formData.append('username', username);
      if (password) {
        formData.append('password', password);
      }
      formData.append('role', role);
      formData.append('permissions', JSON.stringify(permissions));
      formData.append('assigned_classes', JSON.stringify(assignedClasses));
      formData.append('approval_required', approvalRequired ? '1' : '0');
      if (reportingTo) {
        formData.append('reporting_to', reportingTo);
      }

      const result = await saveUserAction(formData);

      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="panel">
        <div style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 24px 0', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            {isEdit ? 'Edit User Account' : 'Create New User Account'}
          </h3>

          {error && (
            <div style={{ background: '#fef2f2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '24px', fontSize: '14px', border: '1px solid #f87171' }}>
              {error}
            </div>
          )}

          {/* Employee Link Section */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>1. Employee Details</h4>

            {selectedStaff ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {selectedStaff.doc_photo ? (
                    <img src={selectedStaff.doc_photo} alt={selectedStaff.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={32} color="#94a3b8" />
                  )}
                </div>

                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Name</div>
                    <div style={{ fontWeight: 600 }}>{selectedStaff.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Employee ID</div>
                    <div style={{ fontWeight: 500 }}>{selectedStaff.employee_id || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Designation & Dept</div>
                    <div style={{ fontWeight: 500 }}>{selectedStaff.role} {selectedStaff.department ? `(${selectedStaff.department})` : ''}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Contact</div>
                    <div style={{ fontWeight: 500 }}>{selectedStaff.contact || 'N/A'} / {selectedStaff.email || 'N/A'}</div>
                  </div>
                </div>

                {!isEdit && (
                  <button type="button" onClick={() => setSelectedStaff(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="btn"
                onClick={() => setShowStaffModal(true)}
                style={{ background: '#fff', color: 'var(--text-primary)', border: '1px dashed var(--border)', width: '100%', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
              >
                <Search size={24} color="var(--text-secondary)" />
                <span style={{ fontWeight: 500 }}>Find Employee from Records</span>
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            {/* Credentials */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>2. Login Credentials</h4>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="e.g. john.doe"
                  disabled={isEdit}
                />
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>{isEdit ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!isEdit}
                  placeholder={isEdit ? "Enter new password to change" : "Choose a strong password"}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>3. User Type</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Super Admin', 'Admin', 'User'].map(r => (
                  <label key={r} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', border: `1px solid ${role === r ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '6px', background: role === r ? '#f0f9ff' : '#fff', cursor: 'pointer' }}>
                    <input type="radio" name="role" value={r} checked={role === r} onChange={() => setRole(r)} style={{ marginTop: '4px' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: role === r ? 'var(--accent)' : 'var(--text-primary)' }}>{r}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {r === 'Super Admin' && 'Full 100% access to everything.'}
                        {r === 'Admin' && 'Full access except user creation.'}
                        {r === 'User' && 'Custom access to specific modules, classes, and actions.'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic RBAC for 'User' and 'Admin' Roles */}
          {(role === 'User' || role === 'Admin') && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
              <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} /> 4. Custom Permissions
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                {/* Module Access */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Module Access (Granular)</label>
                  <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: 'var(--bg-secondary)', textAlign: 'left', fontSize: '13px' }}>
                        <tr>
                          <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>Module / Sub-Module</th>
                          <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', textAlign: 'center', width: '100px' }}>Read/Write</th>
                          <th style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', textAlign: 'center', width: '100px' }}>Edit/Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(MODULES_LIST).map(mod => (
                          <React.Fragment key={mod}>
                            {/* Group Header */}
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                              <td colSpan={3} style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                {mod}
                              </td>
                            </tr>
                            {/* Sub-modules */}
                            {MODULES_LIST[mod].map(sub => (
                              <tr key={sub} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '8px 12px', paddingLeft: '32px', fontSize: '13px' }}>{sub}</td>
                                <td style={{ textAlign: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={permissions[mod]?.[sub]?.readWrite || false}
                                    onChange={(e) => handlePermissionChange(mod, sub, 'readWrite', e.target.checked)}
                                  />
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <input
                                    type="checkbox"
                                    checked={permissions[mod]?.[sub]?.editDelete || false}
                                    onChange={(e) => handlePermissionChange(mod, sub, 'editDelete', e.target.checked)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ margin: 0 }}>Class & Section Assignment</label>
                      {classList.length > 0 && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 600, color: 'var(--accent)' }}>
                          <input
                            type="checkbox"
                            checked={classList.every(c => assignedClasses[c.class_name])}
                            onChange={(e) => {
                              if (e.target.checked) {
                                const allAssigned = {};
                                classList.forEach(c => {
                                  allAssigned[c.class_name] = [...c.sections];
                                });
                                setAssignedClasses(allAssigned);
                              } else {
                                setAssignedClasses({});
                              }
                            }}
                          />
                          Select All Classes
                        </label>
                      )}
                    </div>
                    <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {classList.map(c => {
                        const isClassSelected = !!assignedClasses[c.class_name];
                        const selectedSections = assignedClasses[c.class_name] || [];

                        return (
                          <div key={c.class_name} style={{ border: '1px solid var(--bg-secondary)', borderRadius: '6px', padding: '12px', background: isClassSelected ? '#f8fafc' : '#fff' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, marginBottom: isClassSelected ? '12px' : '0' }}>
                              <input
                                type="checkbox"
                                checked={isClassSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    // By default, when they check the class, select all its available sections
                                    setAssignedClasses(prev => ({ ...prev, [c.class_name]: [...c.sections] }));
                                  } else {
                                    setAssignedClasses(prev => {
                                      const copy = { ...prev };
                                      delete copy[c.class_name];
                                      return copy;
                                    });
                                  }
                                }}
                              />
                              {c.class_name}
                            </label>

                            {isClassSelected && (
                              <div style={{ paddingLeft: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                {c.sections.length > 0 ? c.sections.map(s => (
                                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                                    <input
                                      type="checkbox"
                                      checked={selectedSections.includes(s)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setAssignedClasses(prev => ({
                                            ...prev,
                                            [c.class_name]: [...prev[c.class_name], s]
                                          }));
                                        } else {
                                          setAssignedClasses(prev => ({
                                            ...prev,
                                            [c.class_name]: prev[c.class_name].filter(sec => sec !== s)
                                          }));
                                        }
                                      }}
                                    />
                                    Section {s}
                                  </label>
                                )) : (
                                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>No sections assigned to this class.</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {classList.length === 0 && <div style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>No classes available</div>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Approval Workflow</label>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                        <input type="radio" checked={!approvalRequired} onChange={() => { setApprovalRequired(false); setReportingTo(''); }} /> No Approval Required
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                        <input type="radio" checked={approvalRequired} onChange={() => setApprovalRequired(true)} /> Yes
                      </label>
                    </div>

                    {approvalRequired && (
                      <div>
                        <select value={reportingTo} onChange={e => setReportingTo(e.target.value)} required={approvalRequired}>
                          <option value="">-- Select Reporting Person --</option>
                          {userList.filter(u => u.id !== initialData?.id).map(u => (
                            <option key={u.id} value={u.id}>{u.username}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', background: 'var(--bg-secondary)', display: 'flex', gap: '16px', borderRadius: '0 0 8px 8px' }}>
          <button type="submit" className="btn" disabled={isSubmitting}>
            <Save size={16} /> {isSubmitting ? 'Saving...' : (isEdit ? 'Update User' : 'Create User Account')}
          </button>
          <Link href="/users" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>

      {/* Employee Search Modal */}
      {showStaffModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', width: '500px', borderRadius: '8px', display: 'flex', flexDirection: 'column', maxHeight: '80vh', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Select Employee</h3>
              <button type="button" onClick={() => setShowStaffModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '16px', borderBottom: '1px solid var(--bg-secondary)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Search by name or Employee ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '36px', width: '100%' }}
                  autoFocus
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {filteredStaff.length > 0 ? (
                filteredStaff.map(staff => (
                  <div
                    key={staff.id}
                    onClick={() => handleSelectStaff(staff)}
                    style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', borderBottom: '1px solid var(--bg-secondary)' }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {staff.doc_photo ? (
                        <img src={staff.doc_photo} alt={staff.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User size={20} color="#94a3b8" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px' }}>{staff.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {staff.role} • {staff.employee_id || 'No ID'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No employees found matching "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
