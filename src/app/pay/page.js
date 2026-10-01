'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function PaymentPortal() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState('');

  const [paymentType, setPaymentType] = useState('full');
  const [customAmount, setCustomAmount] = useState('');
  const [customAmountError, setCustomAmountError] = useState('');

  useEffect(() => {
    if (!studentId) {
      setError("Invalid student ID. Please use the link provided in your email.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId })
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch invoice details');
        }
        
        setOrderData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [studentId]);

  const handlePayment = async () => {
    if (!orderData || !window.Razorpay) return;

    let finalAmountToPay = orderData.breakdown.totalPendingBalance;
    if (paymentType === 'partial') {
      const val = parseFloat(customAmount);
      if (isNaN(val) || val <= 0) {
        setCustomAmountError("Please enter a valid amount greater than 0.");
        return;
      }
      if (val > orderData.breakdown.totalPendingBalance) {
        setCustomAmountError(`Amount cannot exceed the pending balance (₹${orderData.breakdown.totalPendingBalance.toFixed(2)}).`);
        return;
      }
      finalAmountToPay = val;
    }

    setPaymentProcessing(true);
    setCustomAmountError('');

    try {
      // Create order with custom amount if necessary
      let orderId = orderData.orderId;
      let orderAmount = orderData.amount; // default full amount in paise
      
      if (paymentType === 'partial') {
        const res = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId, customAmount: finalAmountToPay })
        });
        const partialData = await res.json();
        if (!res.ok) throw new Error(partialData.error || 'Failed to create partial order');
        orderId = partialData.orderId;
        orderAmount = partialData.amount;
      }

      const options = {
        key: orderData.key_id,
        amount: orderAmount,
        currency: orderData.currency,
        name: "SchollyGO ERP",
        description: `Fee Payment for ${orderData.studentDetails.name}`,
        order_id: orderId,
        handler: async function (response) {
          // Calculate distribution: late fees first, then base fees
          const amountPaidRs = orderAmount / 100;
          const lateFeePaid = Math.min(amountPaidRs, orderData.breakdown.pendingLateFee);
          const tuitionPaid = amountPaidRs - lateFeePaid;

          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                studentId: studentId,
                amountPaid: amountPaidRs,
                lateFeePaid: lateFeePaid,
                tuitionPaid: tuitionPaid
              })
            });
            
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setPaymentSuccess(true);
              setReceiptNumber(verifyData.receiptNumber);
            } else {
              setError(verifyData.error || "Payment verification failed.");
            }
          } catch (err) {
            setError("An error occurred while verifying your payment.");
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: orderData.studentDetails.name,
          email: orderData.studentDetails.email || "",
          contact: orderData.studentDetails.contact || ""
        },
        theme: {
          color: "#f97316"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
          setError("Payment failed. Please try again.");
          setPaymentProcessing(false);
      });
      rzp.open();

    } catch (err) {
      setError(err.message);
      setPaymentProcessing(false);
    }
  };


  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontWeight: '500' }}>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '32px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Payment Error</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', backgroundColor: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Try Again</button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Payment Successful!</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Thank you. Your fees have been successfully paid and recorded in the system.</p>
          
          <div style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '6px', marginBottom: '32px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Receipt Number:</span>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>{receiptNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Amount Paid:</span>
              <span style={{ fontWeight: '600', color: '#1e293b' }}>₹{(orderData.amount / 100).toFixed(2)}</span>
            </div>
          </div>
          
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>You may now close this window.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}} />
      
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', maxWidth: '500px', width: '100%', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          
          {/* Header */}
          <div style={{ backgroundColor: '#161822', padding: '32px 24px', textAlign: 'center', color: 'white', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <img src="/schollygo-logo.png" alt="SchollyGO" style={{ height: '36px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.02em', margin: 0 }}>SchollyGO</h1>
              <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(250, 197, 44, 0.18)', color: '#FAC52C', border: '1px solid rgba(250, 197, 44, 0.4)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>ERP</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Secure Fee Payment Portal</p>
          </div>

          {/* Body */}
          <div style={{ padding: '32px 24px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Student Details</h2>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Name:</span>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{orderData.studentDetails.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Class:</span>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{orderData.studentDetails.class}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Student ID:</span>
                  <span style={{ fontWeight: '500', color: '#0f172a' }}>{orderData.studentDetails.student_id}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Fee Breakdown</h2>
              <div style={{ padding: '16px 0', borderBottom: '1px dashed #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#475569' }}>Pending Base Fees</span>
                  <span style={{ fontWeight: '500', color: '#334155' }}>₹{orderData.breakdown.pendingBaseFee.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Late Fees</span>
                  <span style={{ fontWeight: '500', color: '#b91c1c' }}>₹{orderData.breakdown.pendingLateFee.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Total Payable Amount</span>
                <span style={{ fontSize: '24px', fontWeight: '700', color: '#f97316' }}>₹{orderData.breakdown.totalPendingBalance.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Payment Options</h2>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: paymentType === 'full' ? '2px solid #f97316' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', marginBottom: '12px', backgroundColor: paymentType === 'full' ? '#fff7ed' : 'white', transition: 'all 0.2s' }}>
                <input type="radio" name="paymentType" value="full" checked={paymentType === 'full'} onChange={() => setPaymentType('full')} style={{ width: '18px', height: '18px', accentColor: '#f97316' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>Pay Full Amount</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Clear all pending dues (₹{orderData.breakdown.totalPendingBalance.toFixed(2)})</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: paymentType === 'partial' ? '2px solid #f97316' : '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', backgroundColor: paymentType === 'partial' ? '#fff7ed' : 'white', transition: 'all 0.2s' }}>
                <input type="radio" name="paymentType" value="partial" checked={paymentType === 'partial'} onChange={() => setPaymentType('partial')} style={{ width: '18px', height: '18px', accentColor: '#f97316' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#1e293b' }}>Pay Custom Amount</div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Make a partial payment towards your balance</div>
                </div>
              </label>

              {paymentType === 'partial' && (
                <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Enter Custom Amount (₹)</label>
                  <input 
                    type="number" 
                    placeholder="E.g. 5000"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setCustomAmountError('');
                    }}
                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: customAmountError ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }}
                  />
                  {customAmountError && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', fontWeight: '500' }}>{customAmountError}</p>}
                </div>
              )}
            </div>

            <button 
              onClick={handlePayment} 
              disabled={paymentProcessing}
              style={{ 
                width: '100%', 
                padding: '16px', 
                backgroundColor: paymentProcessing ? '#fdba74' : '#f97316', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '16px', 
                fontWeight: '700', 
                cursor: paymentProcessing ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {paymentProcessing ? (
                <>
                  <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '8px' }} />
                  Processing...
                </>
              ) : 'Proceed to Secure Payment'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                🔒 Secured by Razorpay
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
