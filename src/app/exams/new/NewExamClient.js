'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader } from 'lucide-react';
import { getMappedSubjects, createExam } from '../actions';

export default function NewExamClient({ classes, sections }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    term_name: '',
    class_name: '',
    section_name: ''
  });
  
  const [subjects, setSubjects] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch subjects whenever class changes
  useEffect(() => {
    async function fetchSubjects() {
      if (formData.class_name) {
        setLoadingSubjects(true);
        const mapped = await getMappedSubjects(formData.class_name);
        setSubjects(mapped);
        
        // Initialize schedules for new subjects
        const newSchedules = {};
        mapped.forEach(sub => {
          newSchedules[sub] = { exam_date: '', start_time: '', end_time: '' };
        });
        setSchedules(newSchedules);
        
        setLoadingSubjects(false);
      } else {
        setSubjects([]);
        setSchedules({});
      }
    }
    fetchSubjects();
  }, [formData.class_name]);

  const handleScheduleChange = (subject, field, value) => {
    setSchedules(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (subjects.length === 0) {
      alert("No subjects mapped to this class. Please assign subjects in Master Settings first.");
      return;
    }
    
    // Validate that all dates and times are filled
    for (const sub of subjects) {
      const s = schedules[sub];
      if (!s.exam_date || !s.start_time || !s.end_time) {
        alert(`Please fill all schedule details for ${sub}`);
        return;
      }
    }

    setSaving(true);
    
    const payload = {
      ...formData,
      schedules: subjects.map(sub => ({
        subject_name: sub,
        exam_date: schedules[sub].exam_date,
        start_time: schedules[sub].start_time,
        end_time: schedules[sub].end_time
      }))
    };
    
    await createExam(payload);
    router.push('/exams');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Meta Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Term of Exam *</label>
          <select 
            className="form-control" 
            required 
            value={formData.term_name} 
            onChange={(e) => setFormData({...formData, term_name: e.target.value})}
          >
            <option value="">Select Term</option>
            <option value="Unit Test">Unit Test</option>
            <option value="Term 1">Term 1</option>
            <option value="Term 2">Term 2</option>
            <option value="Term 3">Term 3</option>
            <option value="FA 1 (Formative Assessment)">FA 1 (Formative Assessment)</option>
            <option value="FA 2 (Formative Assessment)">FA 2 (Formative Assessment)</option>
            <option value="Quarterly Exam">Quarterly Exam</option>
            <option value="Half Yearly Exam">Half Yearly Exam</option>
            <option value="Annual Exam">Annual Exam</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Class *</label>
          <select 
            className="form-control" 
            required 
            value={formData.class_name} 
            onChange={(e) => setFormData({...formData, class_name: e.target.value})}
          >
            <option value="">Select Class</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Section *</label>
          <select 
            className="form-control" 
            required 
            value={formData.section_name} 
            onChange={(e) => setFormData({...formData, section_name: e.target.value})}
          >
            <option value="">Select Section</option>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />

      {/* Dynamic Subject Schedule Table */}
      <div>
        <h3 style={{ marginBottom: '16px' }}>Subject Schedule</h3>
        
        {!formData.class_name ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
            Please select a class to view subjects.
          </div>
        ) : loadingSubjects ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Loader size={24} className="spin" style={{ margin: '0 auto 8px auto' }} />
            Loading subjects...
          </div>
        ) : subjects.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--danger)', background: '#fff0f0', border: '1px solid #ffd6d6', borderRadius: '8px' }}>
            No subjects are currently assigned to {formData.class_name}. Please map subjects in Master Settings first.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border)' }}>
              <thead>
                <tr style={{ background: '#f9f9fa', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Subject</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date of Exam *</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Start Time *</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>End Time *</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, idx) => (
                  <tr key={sub} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{sub}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <input 
                        type="date" 
                        required
                        className="form-control" 
                        value={schedules[sub]?.exam_date || ''}
                        onChange={(e) => handleScheduleChange(sub, 'exam_date', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <input 
                        type="time" 
                        required
                        className="form-control" 
                        value={schedules[sub]?.start_time || ''}
                        onChange={(e) => handleScheduleChange(sub, 'start_time', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <input 
                        type="time" 
                        required
                        className="form-control" 
                        value={schedules[sub]?.end_time || ''}
                        onChange={(e) => handleScheduleChange(sub, 'end_time', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
        <button type="button" className="btn btn-secondary" onClick={() => router.push('/exams')}>Cancel</button>
        <button type="submit" className="btn" disabled={saving || subjects.length === 0}>
          {saving ? <><Loader size={16} className="spin" /> Scheduling...</> : <><Save size={16} /> Schedule Exam</>}
        </button>
      </div>

    </form>
  );
}
