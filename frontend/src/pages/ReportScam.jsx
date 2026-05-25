import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Phone, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

const SCAM_TYPES = [
  'Online Marketplace Scam',
  'Fake Product / Non-delivery',
  'POS Fraud',
  'Investment / Ponzi',
  'Romantic Scam',
  'Loan / Finance Fraud',
  'Job / Recruitment Scam',
  'Other',
];

export default function ReportScam() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    phone: '', business: '', scamType: '',
    description: '', amount: '', evidence: null,
    anonymous: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [riskLevel, setRiskLevel] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) { return; }
    setForm(prev => ({ ...prev, evidence: { name: file.name, size: file.size, type: file.type } }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate(-1);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        phone: form.phone || undefined,
        businessName: form.business || undefined,
        scamType: form.scamType,
        description: form.description,
        amountLost: form.amount ? Number(form.amount) : undefined,
        anonymous: form.anonymous,
        evidenceFilename: form.evidence?.name || null,
      };
      const res = await api.post('/api/reviews', payload);
      setRiskLevel(res?.report?.risk_level ?? null);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ 
        background: 'white', minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', textAlign: 'center',
      }}>
        <div style={{
          width: '100px', height: '100px',
          background: 'linear-gradient(135deg, #00C853, #1B5E20)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '24px',
          boxShadow: '0 8px 40px rgba(0,200,83,0.3)',
          animation: 'bounceIn 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        }}>
          <CheckCircle2 size={52} color="white" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1A2B3C', marginBottom: '12px' }}>
          Report Submitted! 🎉
        </h2>
        <p style={{ color: '#8896A5', fontSize: '15px', lineHeight: '1.6', marginBottom: riskLevel ? '16px' : '32px' }}>
          Thank you for helping protect the community. Your report is under review and will be visible soon.
        </p>
        {riskLevel && (
          <div style={{
            display: 'inline-block', padding: '8px 18px', borderRadius: '999px',
            fontSize: '13px', fontWeight: '700', marginBottom: '32px',
            background: riskLevel === 'high' ? '#FFEBEE' : riskLevel === 'medium' ? '#FFF8E1' : '#E8F5E9',
            color: riskLevel === 'high' ? '#C62828' : riskLevel === 'medium' ? '#EF6C00' : '#2E7D32',
          }}>
            Risk Level: {riskLevel.toUpperCase()}
          </div>
        )}

        <div style={{
          background: '#F0FFF4', borderRadius: '16px', padding: '20px',
          width: '100%', marginBottom: '32px',
          border: '1.5px solid #C6F6D5',
        }}>
          <h4 style={{ color: '#1B5E20', fontWeight: '700', margin: '0 0 12px 0', fontSize: '14px' }}>
            What happens next?
          </h4>
          {[
            'Your report is queued for community review',
            'Our team will verify severity within 24 hours',
            'Confirmed reports are made searchable publicly',
            'You earn Trust Points for contributing reports',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#00C853', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: '700', flexShrink: 0, marginTop: '1px',
              }}>
                {i + 1}
              </div>
              <span style={{ fontSize: '13px', color: '#2E7D32', lineHeight: '1.5' }}>{item}</span>
            </div>
          ))}
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate('/home')}
          style={{ borderRadius: '14px', marginBottom: '12px' }}
        >
          Back to Home
        </button>
        <button
          style={{
            background: 'none', border: 'none', color: '#E53935',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: '10px',
          }}
          onClick={() => { setSubmitted(false); setStep(1); setForm({ phone: '', business: '', scamType: '', description: '', amount: '', evidence: null, anonymous: false }); }}
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
        padding: '20px 20px 40px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}/>

        <button onClick={handleBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '16px' }}>
          <ArrowLeft size={20} color="white" />
        </button>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 8px 0' }}>Report a Scammer</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>Help protect your community</p>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '16px', position: 'relative' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ 
              flex: 1, height: '4px', borderRadius: '2px',
              background: s <= step ? 'white' : 'rgba(255,255,255,0.3)',
              transition: 'background 0.3s ease',
            }}/>
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', marginTop: '6px', marginBottom: 0 }}>
          Step {step} of 3
        </p>
      </div>

      {/* Form Body */}
      <div style={{
        flex: 1, background: 'white',
        borderRadius: '24px 24px 0 0',
        marginTop: '-20px', padding: '24px',
        paddingBottom: '80px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
        position: 'relative', zIndex: 10,
      }}>

        {step === 1 && (
          <div style={{ animation: 'fadeInUp 0.3s ease' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A2B3C', marginBottom: '6px' }}>Scammer Details</h2>
            <p style={{ fontSize: '13px', color: '#8896A5', marginBottom: '24px' }}>Tell us who scammed you</p>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="#E53935" /> Phone Number *
                </span>
              </label>
              <input
                type="tel"
                className="form-control"
                placeholder="e.g. 08012345678"
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                style={{ borderRadius: '12px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={14} color="#E53935" /> Business Name (Optional)
                </span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Lagos Gadgets Online"
                value={form.business}
                onChange={e => setForm({...form, business: e.target.value})}
                style={{ borderRadius: '12px' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">Type of Scam *</label>
              <div className="grid-2">
                {SCAM_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({...form, scamType: type})}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      border: form.scamType === type ? '2px solid #E53935' : '1.5px solid #ECEFF1',
                      background: form.scamType === type ? '#FFF5F5' : '#FAFBFC',
                      color: form.scamType === type ? '#E53935' : '#546E7A',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeInUp 0.3s ease' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A2B3C', marginBottom: '6px' }}>What Happened?</h2>
            <p style={{ fontSize: '13px', color: '#8896A5', marginBottom: '24px' }}>Describe the incident in detail</p>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Your Story *</label>
              <textarea
                className="form-control"
                rows={6}
                placeholder="Describe exactly what happened — the more detail you provide, the more it helps others avoid the same trap."
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                style={{ borderRadius: '12px', resize: 'none', lineHeight: '1.6' }}
              />
              <p style={{ fontSize: '11px', color: '#B0BEC5', marginTop: '4px' }}>
                {form.description.length}/500 characters
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Amount Lost (Optional)</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', fontWeight: '700', color: '#1A2B3C' }}>
                  ₦
                </div>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0"
                  value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  style={{ paddingLeft: '32px', borderRadius: '12px' }}
                />
              </div>
            </div>

            {/* Anonymous toggle */}
            <div style={{
              background: '#F8F9FA',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setForm({...form, anonymous: !form.anonymous})}
            >
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A2B3C', margin: '0 0 2px 0' }}>
                  🥷 Submit Anonymously
                </p>
                <p style={{ fontSize: '12px', color: '#8896A5', margin: 0 }}>
                  Your identity will be hidden from other users
                </p>
              </div>
              <div style={{
                width: '48px', height: '26px',
                borderRadius: '13px',
                background: form.anonymous ? '#E53935' : '#E0E0E0',
                position: 'relative',
                transition: 'background 0.2s ease',
              }}>
                <div style={{
                  width: '20px', height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '3px',
                  left: form.anonymous ? '25px' : '3px',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}/>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: 'fadeInUp 0.3s ease' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A2B3C', marginBottom: '6px' }}>Add Evidence</h2>
            <p style={{ fontSize: '13px', color: '#8896A5', marginBottom: '24px' }}>Screenshots or photos help strengthen your report</p>

            {/* Upload Area */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <div
              role="button"
              aria-label="Upload evidence file"
              tabIndex={0}
              style={{
                border: `2px dashed ${form.evidence ? '#00C853' : '#E0E4EC'}`,
                borderRadius: '16px',
                padding: '32px',
                textAlign: 'center',
                background: form.evidence ? '#F0FFF4' : '#FAFBFC',
                cursor: 'pointer',
                marginBottom: '20px',
                transition: 'all 0.2s ease',
              }}
              onClick={() => fileInputRef.current.click()}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { fileInputRef.current.click(); } }}
              onMouseEnter={e => { if (!form.evidence) { e.currentTarget.style.borderColor = '#E53935'; e.currentTarget.style.background = '#FFF5F5'; } }}
              onMouseLeave={e => { if (!form.evidence) { e.currentTarget.style.borderColor = '#E0E4EC'; e.currentTarget.style.background = '#FAFBFC'; } }}
            >
              <div style={{
                width: '60px', height: '60px',
                background: form.evidence ? 'linear-gradient(135deg, #00C853, #1B5E20)' : 'linear-gradient(135deg, #E53935, #C62828)',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                {form.evidence ? <CheckCircle2 size={28} color="white" /> : <Camera size={28} color="white" />}
              </div>
              {form.evidence ? (
                <>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#1B5E20', margin: '0 0 4px 0' }}>File Selected</p>
                  <p style={{ fontSize: '12px', color: '#2E7D32', margin: '0 0 12px 0', wordBreak: 'break-all' }}>{form.evidence.name}</p>
                  <span style={{ background: '#E8F5E9', color: '#00C853', fontSize: '12px', fontWeight: '600', padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(0,200,83,0.2)' }}>
                    Change File
                  </span>
                </>
              ) : (
                <>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 4px 0' }}>Upload Evidence</p>
                  <p style={{ fontSize: '12px', color: '#8896A5', margin: '0 0 12px 0' }}>Tap to upload screenshots, chat logs, or receipts</p>
                  <span style={{ background: '#FFF5F5', color: '#E53935', fontSize: '12px', fontWeight: '600', padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(229,57,53,0.2)' }}>
                    Choose File
                  </span>
                </>
              )}
            </div>

            {/* Review Summary */}
            <div style={{
              background: '#F8F9FA', borderRadius: '14px', padding: '16px', marginBottom: '20px',
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 12px 0' }}>
                📋 Report Summary
              </h4>
              {[
                { label: 'Phone', value: form.phone || 'Not provided' },
                { label: 'Business', value: form.business || 'N/A' },
                { label: 'Scam Type', value: form.scamType || 'Not selected' },
                { label: 'Amount Lost', value: form.amount ? `₦${parseInt(form.amount).toLocaleString()}` : 'Not specified' },
                { label: 'Anonymous', value: form.anonymous ? 'Yes' : 'No' },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '6px 0',
                  borderBottom: '1px solid #ECEFF1',
                }}>
                  <span style={{ fontSize: '12px', color: '#8896A5' }}>{item.label}</span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#1A2B3C' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{
              background: '#FFF8F0', borderRadius: '12px', padding: '14px',
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              border: '1px solid rgba(255,152,0,0.2)',
              marginBottom: '20px',
            }}>
              <AlertCircle size={18} color="#FF9800" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '12px', color: '#E65100', margin: 0, lineHeight: '1.5' }}>
                Filing false reports is a violation of our terms of service and may result in account suspension.
                Only report genuine scams you have personally experienced.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div role="alert" style={{
            background: '#FFF5F5', border: '1px solid #FFC5C5', borderRadius: '10px',
            padding: '12px 14px', fontSize: '13px', color: '#C62828', marginBottom: '12px',
          }}>
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              style={{
                flex: 1, padding: '15px',
                borderRadius: '14px',
                background: '#F5F6FA', border: '1.5px solid #ECEFF1',
                color: '#546E7A', fontWeight: '700', fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            onClick={step < 3 ? handleNext : handleSubmit}
            className="btn-primary"
            disabled={loading || (step === 1 && !form.phone)}
            style={{ flex: 2, borderRadius: '14px', fontSize: '15px', padding: '15px' }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
                Submitting...
              </div>
            ) : step < 3 ? `Continue →` : '🚀 Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
