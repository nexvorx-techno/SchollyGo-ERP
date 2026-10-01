'use client';

import { useState } from 'react';
import { Printer, Download, Bell, X } from 'lucide-react';

export default function StudentLedgerClient({ student, receipts = [], totalPaid = 0, masterFees = null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifyMethod, setNotifyMethod] = useState('Email');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsapp, setSendWhatsapp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let emailSuccess = true;
      let whatsappSuccess = true;

      if (sendEmail && email !== 'N/A') {
        const res = await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            studentName: student.name,
            studentDetails: student,
            receipts,
            totalPaid,
            masterFees
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to send email');
        }
      }

      if (sendWhatsapp) {
        // WhatsApp is not fully implemented yet, just simulate success
        console.log(`Simulated sending WhatsApp to ${mobile}`);
      }

      alert('Pending fees notification processed successfully!');
      setIsModalOpen(false);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatContact = (contactStr) => {
    if (!contactStr) return 'N/A';
    try {
      const parsed = JSON.parse(contactStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const first = parsed[0];
        if (first.code && first.num) return `${first.code} ${first.num}`;
        if (first.num) return first.num;
        if (first.email) return first.email;
        if (typeof first === 'string') return first;
      }
    } catch (e) {
      // Return as is if not JSON
    }
    return contactStr;
  };

  const mobile = formatContact(student?.father_mobile || student?.whatsapp_number);
  const email = formatContact(student?.father_email);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="btn" style={{ backgroundColor: '#f59e0b', color: 'white' }}>
        <Bell size={16} /> Send Notification
      </button>
      <button onClick={handlePrint} className="btn" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
        <Printer size={16} /> Print Ledger
      </button>
      <button className="btn" style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }} onClick={() => alert('Download PDF feature coming soon.')}>
        <Download size={16} /> Export PDF
      </button>

      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '400px',
            maxWidth: '90%',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              padding: '16px 20px', 
              borderBottom: '1px solid var(--border)', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Send Fees Notification</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                disabled={isLoading}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <form onSubmit={handleSendNotification}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">Notification Method</label>
                  <select 
                    className="form-input" 
                    value={notifyMethod} 
                    onChange={(e) => {
                      const method = e.target.value;
                      setNotifyMethod(method);
                      setSendEmail(method === 'Email' || method === 'Both');
                      setSendWhatsapp(method === 'Whatsapp' || method === 'Both');
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border)' }}
                    disabled={isLoading}
                  >
                    <option value="Both">Both Email & Whatsapp</option>
                    <option value="Whatsapp">Whatsapp Only</option>
                    <option value="Email">Email Only</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="form-label" style={{ marginBottom: '4px' }}>Confirm Contact Details</label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: (notifyMethod === 'Email' || notifyMethod === 'Both') ? 1 : 0.5 }}>
                    <input 
                      type="checkbox" 
                      checked={sendEmail} 
                      onChange={(e) => setSendEmail(e.target.checked)} 
                      disabled={isLoading || notifyMethod === 'Whatsapp'}
                    />
                    <span>Email: <strong>{email}</strong></span>
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: (notifyMethod === 'Whatsapp' || notifyMethod === 'Both') ? 1 : 0.5 }}>
                    <input 
                      type="checkbox" 
                      checked={sendWhatsapp} 
                      onChange={(e) => setSendWhatsapp(e.target.checked)}
                      disabled={isLoading || notifyMethod === 'Email'}
                    />
                    <span>Whatsapp: <strong>{mobile}</strong></span>
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isLoading}>Cancel</button>
                  <button type="submit" className="btn" disabled={isLoading || (!sendEmail && !sendWhatsapp)}>
                    {isLoading ? 'Sending...' : 'Send Now'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
