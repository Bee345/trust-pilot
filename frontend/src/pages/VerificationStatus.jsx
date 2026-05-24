import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../lib/api';

const STATUS_CONFIG = {
  done: { bg: '#00C853', icon: <CheckCircle2 size={20} color="white" /> },
  current: { bg: '#FF9800', icon: <Clock size={18} color="white" /> },
  pending: { bg: '#E0E4EC', icon: null },
};

const STAGE_ORDER = ['pending_payment', 'payment_received', 'under_review', 'approved'];

function buildSteps(verification) {
  if (!verification) {
    return [
      { id: 1, title: 'No application found', time: '', desc: 'Start your verification to track its status.', status: 'pending' },
    ];
  }

  const currentIdx = STAGE_ORDER.indexOf(verification.status);
  const createdAt = verification.created_at ? new Date(verification.created_at).toLocaleString() : '';
  const reviewedAt = verification.reviewed_at ? new Date(verification.reviewed_at).toLocaleString() : 'Pending';

  if (verification.status === 'rejected') {
    return [
      { id: 1, title: 'Application Submitted', time: createdAt, desc: 'Your verification application was received.', status: 'done' },
      { id: 2, title: 'Rejected', time: reviewedAt, desc: 'Your application was rejected. Contact support for details.', status: 'current' },
    ];
  }

  return [
    { id: 1, title: 'Application Submitted', time: createdAt, desc: 'Your verification application was received.', status: currentIdx > 0 ? 'done' : 'current' },
    { id: 2, title: 'Payment Received', time: currentIdx >= 1 ? 'Confirmed' : 'Pending', desc: 'Your Paystack payment has been confirmed.', status: currentIdx > 1 ? 'done' : currentIdx === 1 ? 'current' : 'pending' },
    { id: 3, title: 'Under Review', time: currentIdx >= 2 ? 'In progress' : 'Pending', desc: 'Our team is verifying your identity and documents.', status: currentIdx > 2 ? 'done' : currentIdx === 2 ? 'current' : 'pending' },
    { id: 4, title: 'Approved & Verified', time: currentIdx === 3 ? reviewedAt : 'Pending', desc: 'Your verified badge is active across all searches.', status: currentIdx === 3 ? 'done' : 'pending' },
  ];
}

export default function VerificationStatus() {
  const navigate = useNavigate();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/verify/status')
      .then(data => setVerification(data?.verification ?? null))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const steps = buildSteps(verification);

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2B3C 0%, #0D1B2A 100%)',
        padding: '20px 20px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '16px' }}
        >
          <ArrowLeft size={20} color="white" />
        </button>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>
          Verification Status
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>
          Track your verification progress
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', marginTop: '-20px', padding: '24px', position: 'relative', zIndex: 10, minHeight: 'calc(100vh - 120px)' }}>

        {loading && (
          <div aria-live="polite" style={{ textAlign: 'center', padding: '40px 20px', color: '#8896A5' }}>
            Loading verification status...
          </div>
        )}

        {error && !loading && (
          <div style={{
            background: '#FFF5F5', border: '1px solid #FFC5C5', borderRadius: '12px',
            padding: '14px', fontSize: '13px', color: '#C62828', marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {/* Status Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF8F0, #FFFAF5)',
          border: '1.5px solid rgba(255,152,0,0.3)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '52px', height: '52px',
            background: 'linear-gradient(135deg, #FF9800, #E65100)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Clock size={28} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '800', color: '#E65100', margin: '0 0 2px 0' }}>
              Under Review
            </p>
            <p style={{ fontSize: '12px', color: '#8896A5', margin: '0 0 6px 0' }}>
              Application ID: #TBV-2024-8821
            </p>
            <div style={{
              background: 'rgba(255,152,0,0.15)',
              borderRadius: '6px',
              padding: '3px 10px',
              display: 'inline-block',
            }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#FF9800' }}>Est. 1-2 Business Days</span>
            </div>
          </div>
        </div>

        {/* Progress: 2/4 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1A2B3C' }}>Verification Progress</span>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#FF9800' }}>2 of 4 steps</span>
          </div>
          <div style={{ height: '8px', background: '#ECEFF1', borderRadius: '4px' }}>
            <div style={{
              width: '50%', height: '100%',
              background: 'linear-gradient(90deg, #00C853, #FF9800)',
              borderRadius: '4px',
              transition: 'width 1s ease',
            }}/>
          </div>
        </div>

        {/* Timeline */}
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', marginBottom: '16px' }}>Step-by-Step Progress</h3>
        <div style={{ position: 'relative' }}>
          {/* Connector line */}
          <div style={{
            position: 'absolute',
            left: '20px', top: '24px', bottom: '60px',
            width: '2px',
            background: 'linear-gradient(180deg, #00C853 50%, #ECEFF1 50%)',
            zIndex: 0,
          }}/>

          {steps.map((step) => {
            const conf = STATUS_CONFIG[step.status];
            return (
              <div key={step.id} style={{
                display: 'flex', gap: '16px',
                marginBottom: '20px',
                position: 'relative', zIndex: 1,
              }}>
                {/* Icon */}
                <div style={{
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  background: conf.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: step.status !== 'pending' ? `0 4px 14px ${conf.bg}55` : 'none',
                  border: step.status === 'pending' ? '2px solid #ECEFF1' : 'none',
                  zIndex: 2,
                  transition: 'all 0.3s ease',
                }}>
                  {conf.icon || <span style={{ fontSize: '14px', fontWeight: '700', color: '#B0BEC5' }}>{step.id}</span>}
                </div>

                {/* Content */}
                <div style={{
                  flex: 1,
                  background: step.status === 'current' ? '#FFF8F0' : step.status === 'done' ? '#F0FFF4' : 'white',
                  border: `1.5px solid ${step.status === 'current' ? 'rgba(255,152,0,0.25)' : step.status === 'done' ? 'rgba(0,200,83,0.2)' : '#ECEFF1'}`,
                  borderRadius: '14px',
                  padding: '14px 16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: step.status === 'pending' ? '#B0BEC5' : '#1A2B3C',
                      margin: 0,
                    }}>
                      {step.title}
                    </h4>
                    {step.status === 'done' && (
                      <span style={{ fontSize: '10px', background: '#E8F5E9', color: '#00C853', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>
                        DONE
                      </span>
                    )}
                    {step.status === 'current' && (
                      <span style={{ fontSize: '10px', background: '#FFF3E0', color: '#FF9800', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#B0BEC5', margin: '0 0 6px 0' }}>{step.time}</p>
                  <p style={{ fontSize: '13px', color: step.status === 'pending' ? '#B0BEC5' : '#546E7A', margin: 0, lineHeight: '1.5' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* What's Next */}
        <div style={{
          background: 'linear-gradient(135deg, #1A2B3C, #0D1B2A)',
          borderRadius: '18px',
          padding: '20px',
          marginTop: '8px',
          marginBottom: '24px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Phone size={18} color="#FFD700" />
            <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', margin: 0 }}>What Happens Next?</p>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
            Our verification team may call you on <strong style={{ color: 'white' }}>08012345678</strong> for a quick 5-minute confirmation call.
            Please keep your phone available during business hours (Mon–Fri, 9AM–5PM).
          </p>
        </div>

        {/* Actions */}
        <button
          onClick={() => navigate('/get-verified')}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px',
            background: '#F5F6FA', border: '1.5px solid #ECEFF1',
            color: '#546E7A', fontWeight: '700', fontSize: '14px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <ShieldCheck size={18} color="#E53935" />
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}
