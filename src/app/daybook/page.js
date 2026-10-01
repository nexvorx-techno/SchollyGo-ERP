'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, Filter, Search, ArrowUpRight, ArrowDownRight, Wallet, Calculator, X } from 'lucide-react';

export default function DayBookPage() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // By default show current date
  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  
  const [filterType, setFilterType] = useState('date'); // 'date', 'period', 'custom', 'yearly'
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [customStart, setCustomStart] = useState(today);
  const [customEnd, setCustomEnd] = useState(today);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  
  const [entryType, setEntryType] = useState('All'); // 'All', 'Income', 'Expense'
  const [isTallyOpen, setIsTallyOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    let start = today;
    let end = today;
    
    if (filterType === 'date') {
      start = selectedDate;
      end = selectedDate;
    } else if (filterType === 'period') {
      const d = new Date();
      if (selectedPeriod === 'today') {
        start = today;
        end = today;
      } else if (selectedPeriod === 'this_week') {
        const first = d.getDate() - d.getDay(); 
        start = new Date(d.setDate(first)).toISOString().split('T')[0];
        end = new Date(d.setDate(first + 6)).toISOString().split('T')[0];
      } else if (selectedPeriod === 'this_month') {
        start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
      }
    } else if (filterType === 'custom') {
      start = customStart;
      end = customEnd;
    } else if (filterType === 'yearly') {
      start = new Date(parseInt(selectedYear), 0, 1).toISOString().split('T')[0];
      end = new Date(parseInt(selectedYear), 11, 31).toISOString().split('T')[0];
    }

    try {
      const res = await fetch(`/api/daybook?startDate=${start}&endDate=${end}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
        setSummary(json.summary);
      } else {
        setError(json.error || 'Failed to fetch day book');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, selectedDate, selectedPeriod, customStart, customEnd, selectedYear]);

  const filteredData = data.filter(item => entryType === 'All' || item.type === entryType);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Accounting & Finance / Day Book</div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={28} color="var(--primary)" /> Day Book
          </h1>
        </div>
        <button 
          className="btn"
          onClick={() => setIsTallyOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Calculator size={18} /> Show Tally
        </button>
      </div>

      <div className="panel">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', padding: '20px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Filter Mode</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--border)', width: '200px' }}
            >
              <option value="date">Specific Date</option>
              <option value="period">Period Wise</option>
              <option value="custom">From - To Date</option>
              <option value="yearly">Yearly Wise</option>
            </select>
          </div>

          {filterType === 'date' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Select Date</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ padding: '9px 14px', borderRadius: '4px', border: '1px solid var(--border)' }}
              />
            </div>
          )}

          {filterType === 'period' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Select Period</label>
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--border)', width: '200px' }}
              >
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
              </select>
            </div>
          )}

          {filterType === 'custom' && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>From Date</label>
                <input 
                  type="date" 
                  value={customStart} 
                  onChange={(e) => setCustomStart(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: '4px', border: '1px solid var(--border)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>To Date</label>
                <input 
                  type="date" 
                  value={customEnd} 
                  onChange={(e) => setCustomEnd(e.target.value)}
                  style={{ padding: '9px 14px', borderRadius: '4px', border: '1px solid var(--border)' }}
                />
              </div>
            </div>
          )}

          {filterType === 'yearly' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Select Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--border)', width: '150px' }}
              >
                {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Entries to View</label>
            <select 
              value={entryType} 
              onChange={(e) => setEntryType(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--border)', width: '150px' }}
            >
              <option value="All">All Entries</option>
              <option value="Income">Income</option>
              <option value="Expense">Expenses</option>
            </select>
          </div>

          <button 
            onClick={fetchData}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}
          >
            <Search size={16} /> Search
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Mode</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--danger)' }}>{error}</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No transactions found.</td></tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        background: item.type === 'Income' ? '#e3fcef' : '#fef2f2',
                        color: item.type === 'Income' ? '#006644' : '#991b1b'
                      }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500' }}>
                      {item.category}
                    </td>
                    <td style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {item.description || '-'}
                    </td>
                    <td style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {item.mode}
                    </td>
                    <td style={{ fontSize: '14px', fontWeight: '700', textAlign: 'right', color: item.type === 'Income' ? '#059669' : '#dc2626' }}>
                      {item.type === 'Income' ? '+' : '-'} ₹{item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isTallyOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '8px', width: '90%', maxWidth: '900px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px' }}>
                <Calculator size={24} color="var(--brand-primary)" /> Day Book Tally
              </h3>
              <button onClick={() => setIsTallyOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} color="var(--text-secondary)"/></button>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Showing totals for the currently applied filters ({filterType}).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <div style={{ background: '#ecfdf5', padding: '24px', borderRadius: '8px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: '#d1fae5', padding: '12px', borderRadius: '50%' }}>
                  <ArrowUpRight size={24} color="#059669" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#065f46', fontWeight: '600', textTransform: 'uppercase' }}>Total Income</div>
                  <div style={{ fontSize: '28px', color: '#047857', fontWeight: '700' }}>₹{summary.totalIncome.toFixed(2)}</div>
                </div>
              </div>
              
              <div style={{ background: '#fef2f2', padding: '24px', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '50%' }}>
                  <ArrowDownRight size={24} color="#dc2626" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#991b1b', fontWeight: '600', textTransform: 'uppercase' }}>Total Expenses</div>
                  <div style={{ fontSize: '28px', color: '#b91c1c', fontWeight: '700' }}>₹{summary.totalExpense.toFixed(2)}</div>
                </div>
              </div>

              <div style={{ background: '#f0f9ff', padding: '24px', borderRadius: '8px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: '#e0f2fe', padding: '12px', borderRadius: '50%' }}>
                  <Wallet size={24} color="#0284c7" />
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#075985', fontWeight: '600', textTransform: 'uppercase' }}>Net Balance</div>
                  <div style={{ fontSize: '28px', color: '#0369a1', fontWeight: '700' }}>₹{summary.netBalance.toFixed(2)}</div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
