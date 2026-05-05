import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Briefcase, Check, Lock, ShieldCheck, Star, ChevronRight } from 'lucide-react';

export default function GetVerified() {
  const navigate = useNavigate();
  const [type, setType] = useState('individual');
  const [step, setStep] = useState('select'); // 'select' | 'payment' | 'success'
  const [loading, setLoading] = useState(false);

  const plans = {
    individual: {
      price: '₦2,000',
      title: 'Individual Verification',
      subtitle: 'For freelancers & individuals',
      features: [
        'Government ID verification',
        'Verified badge on your profile',
        'Priority in search results',
        'Monthly trust report',
        '30-day money back guarantee',
      ],
      color: '#E53935',
      gradient: 'linear-gradient(135deg, #E53935, #C62828)',
    },
    business: {
      price: '₦5,000',
      title: 'Business Verification',
      subtitle: 'For businesses & vendors',
      features: [
        'CAC registration verification',
        'Business profile page',
        'Verified badge & trust seal',
        'Priority in search results',
        'Quarterly trust audit',
        'Scam protection certificate',
      ],
      color: '#1565C0',
      gradient: 'linear-gradient(135deg, #1565C0, #0D47A1)',
    },
  };

  const plan = plans[type];

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 2000);
  };

  if (step === 'success') {
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
          animation: 'bounceIn 0.6s ease',
        }}>
          <ShieldCheck size={50} color="white" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1A2B3C', marginBottom: '12px' }}>
          Application Submitted! 🎉
        </h2>
        <p style={{ color: '#8896A5', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
          We've received your verification request. Our team will review and contact you within 1-2 business days.
        </p>
        <button className="btn-primary" style={{ borderRadius: '14px', marginBottom: '12px' }} onClick={() => navigate('/verification-status')}>
          Track Verification Status
        </button>
        <button style={{ background: 'none', border: 'none', color: '#8896A5', cursor: 'pointer', fontSize: '14px' }} onClick={() => navigate('/home')}>
          Back to Home
        </button>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>
        <div style={{ background: plan.gradient, padding: '20px 20px 40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}/>
          <button onClick={() => setStep('select')} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '16px' }}>
            <ArrowLeft size={20} color="white" />
          </button>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>Complete Payment</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>{plan.title}</p>
        </div>

        <div style={{ background: 'white', borderRadius: '24px 24px 0 0', marginTop: '-20px', padding: '24px', position: 'relative', zIndex: 10 }}>
          {/* Order Summary */}
          <div style={{ background: '#F8F9FA', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 14px 0' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#546E7A' }}>{plan.title}</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C' }}>{plan.price}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#546E7A' }}>Processing fee</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C' }}>₦0</span>
            </div>
            <div style={{ height: '1px', background: '#ECEFF1', margin: '12px 0' }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#1A2B3C' }}>Total</span>
              <span style={{ fontSize: '20px', fontWeight: '800', color: plan.color }}>{plan.price}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', marginBottom: '12px' }}>Choose Payment Method</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {[
              { icon: '💳', label: 'Card Payment', sub: 'Visa, Mastercard' },
              { icon: '🏦', label: 'Bank Transfer', sub: 'Direct bank transfer' },
              { icon: '📱', label: 'USSD', sub: 'Pay with USSD code' },
            ].map((m, i) => (
              <div key={m.label} style={{
                border: `1.5px solid ${i === 0 ? plan.color : '#ECEFF1'}`,
                borderRadius: '14px', padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: '12px',
                background: i === 0 ? (type === 'individual' ? '#FFF5F5' : '#EEF2FF') : 'white',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: '24px' }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: 0 }}>{m.label}</p>
                  <p style={{ fontSize: '12px', color: '#8896A5', margin: 0 }}>{m.sub}</p>
                </div>
                {i === 0 && <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: plan.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={12} color="white" strokeWidth={3} />
                </div>}
              </div>
            ))}
          </div>

          <button
            className="btn-primary"
            onClick={handlePayment}
            disabled={loading}
            style={{ borderRadius: '14px', padding: '16px', fontSize: '16px', background: plan.gradient }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
                Processing Payment...
              </div>
            ) : `Pay ${plan.price}`}
          </button>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <Lock size={14} color="#B0BEC5" />
            <span style={{ fontSize: '12px', color: '#B0BEC5' }}>Secured by Paystack • 256-bit encryption</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)', padding: '20px 20px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}/>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '16px' }}>
          <ArrowLeft size={20} color="white" />
        </button>
        <ShieldCheck size={36} color="rgba(255,255,255,0.9)" style={{ marginBottom: '8px' }} />
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 0 6px 0' }}>Get Verified</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>
          Build trust. Get more customers. Stay safe.
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', marginTop: '-20px', padding: '24px', position: 'relative', zIndex: 10, minHeight: 'calc(100vh - 140px)' }}>
        
        {/* Type Selector */}
        <div style={{ background: '#F5F6FA', borderRadius: '14px', padding: '4px', marginBottom: '24px', display: 'flex' }}>
          <button
            onClick={() => setType('individual')}
            style={{
              flex: 1, padding: '12px 8px',
              borderRadius: '12px', border: 'none',
              background: type === 'individual' ? 'white' : 'transparent',
              cursor: 'pointer', transition: 'all 0.2s ease',
              boxShadow: type === 'individual' ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <User size={22} color={type === 'individual' ? '#E53935' : '#8896A5'} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: type === 'individual' ? '#E53935' : '#8896A5' }}>Individual</span>
              <span style={{ fontSize: '10px', color: '#B0BEC5' }}>₦2,000</span>
            </div>
          </button>
          <button
            onClick={() => setType('business')}
            style={{
              flex: 1, padding: '12px 8px',
              borderRadius: '12px', border: 'none',
              background: type === 'business' ? 'white' : 'transparent',
              cursor: 'pointer', transition: 'all 0.2s ease',
              boxShadow: type === 'business' ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Briefcase size={22} color={type === 'business' ? '#1565C0' : '#8896A5'} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: type === 'business' ? '#1565C0' : '#8896A5' }}>Business</span>
              <span style={{ fontSize: '10px', color: '#B0BEC5' }}>₦5,000</span>
            </div>
          </button>
        </div>

        {/* Plan Card */}
        <div style={{
          background: plan.gradient, borderRadius: '20px',
          padding: '24px', marginBottom: '24px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600', margin: '0 0 4px 0', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {plan.subtitle}
              </p>
              <h2 style={{ color: 'white', fontSize: '32px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>
                {plan.price}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: 0 }}>one-time fee</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '14px', padding: '10px', backdropFilter: 'blur(10px)' }}>
              {type === 'individual' ? <User size={28} color="white" /> : <Briefcase size={28} color="white" />}
            </div>
          </div>

          {plan.features.map(feat => (
            <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={12} color="white" strokeWidth={3} />
              </div>
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.95)' }}>{feat}</span>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div style={{ background: '#F8F9FA', borderRadius: '14px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex' }}>
            {['#E53935', '#9C27B0', '#1565C0'].map((c, i) => (
              <div key={c} style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: '2px solid white', marginLeft: i > 0 ? '-8px' : '0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'white' }}>
                {['A', 'B', 'C'][i]}
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A2B3C', margin: 0 }}>
              850+ businesses verified this month
            </p>
            <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
              {[1,2,3,4,5].map(s => <Star key={s} size={11} color="#FFD700" fill="#FFD700" />)}
              <span style={{ fontSize: '11px', color: '#8896A5', marginLeft: '4px' }}>4.9/5 satisfaction</span>
            </div>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() => setStep('payment')}
          style={{ borderRadius: '14px', padding: '16px', fontSize: '16px', background: plan.gradient, marginBottom: '12px' }}
        >
          🚀 Get {type === 'individual' ? 'Verified' : 'Business Verified'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <Lock size={14} color="#B0BEC5" />
          <span style={{ fontSize: '12px', color: '#B0BEC5' }}>30-day money-back guarantee • Secure payment</span>
        </div>
      </div>
    </div>
  );
}
