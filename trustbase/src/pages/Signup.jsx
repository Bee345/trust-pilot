import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, ArrowRight, Phone, User, Lock } from 'lucide-react';

export default function Signup({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin();
      navigate('/home');
    }, 1200);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(160deg, #ffebee 0%, #ffffff 40%, #f5f6fa 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
        padding: '48px 24px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '160px', height: '160px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }}/>
        <div style={{
          position: 'absolute', bottom: '-30px', left: '-30px',
          width: '100px', height: '100px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }}/>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', position: 'relative' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}>
            <ShieldCheck size={20} color="white" />
          </div>
          <span style={{ color: 'white', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.3px' }}>TrustBase</span>
        </div>

        <h1 style={{ 
          color: 'white', 
          fontSize: '28px', 
          fontWeight: '800', 
          lineHeight: '1.2',
          marginBottom: '8px',
          position: 'relative',
        }}>
          Verify before<br/>you pay 🔒
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '400', position: 'relative' }}>
          Join 50,000+ Nigerians staying scam-free
        </p>
      </div>

      {/* Form Card */}
      <div style={{
        flex: 1,
        background: 'white',
        borderRadius: '28px 28px 0 0',
        marginTop: '-24px',
        padding: '28px 24px',
        boxShadow: '0 -4px 30px rgba(0,0,0,0.05)',
        position: 'relative',
        zIndex: 10,
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A2B3C', marginBottom: '6px' }}>Create Account</h2>
        <p style={{ fontSize: '13px', color: '#8896A5', marginBottom: '24px' }}>It's free and takes less than a minute</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                <User size={18} color={focused === 'name' ? '#E53935' : '#B0BEC5'} />
              </div>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Chioma Okonkwo"
                required
                style={{ paddingLeft: '44px', borderRadius: '12px' }}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused('')}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                <Phone size={18} color={focused === 'phone' ? '#E53935' : '#B0BEC5'} />
              </div>
              <input
                type="tel"
                className="form-control"
                placeholder="e.g. 08012345678"
                required
                style={{ paddingLeft: '44px', borderRadius: '12px' }}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused('')}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                <Lock size={18} color={focused === 'password' ? '#E53935' : '#B0BEC5'} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Create a strong password"
                required
                style={{ paddingLeft: '44px', paddingRight: '44px', borderRadius: '12px' }}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#B0BEC5', padding: 0,
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            style={{ 
              marginTop: '8px', 
              borderRadius: '14px', 
              fontSize: '16px', 
              padding: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div style={{ 
                  width: '18px', height: '18px', 
                  border: '2px solid rgba(255,255,255,0.4)', 
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}/>
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Terms */}
        <p style={{ fontSize: '11px', color: '#B0BEC5', textAlign: 'center', marginTop: '16px', lineHeight: '1.6' }}>
          By signing up, you agree to our{' '}
          <span style={{ color: '#E53935', fontWeight: '600', cursor: 'pointer' }}>Terms of Service</span>
          {' '}and{' '}
          <span style={{ color: '#E53935', fontWeight: '600', cursor: 'pointer' }}>Privacy Policy</span>
        </p>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ fontSize: '14px', color: '#8896A5' }}>
            Already have an account?{' '}
            <span 
              onClick={() => navigate('/login')} 
              style={{ color: '#E53935', fontWeight: '700', cursor: 'pointer' }}
            >
              Log In
            </span>
          </p>
        </div>

        {/* Trust Indicators */}
        <div style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
          marginTop: '24px', padding: '16px', 
          background: '#F8F9FA', borderRadius: '12px',
        }}>
          {[
            { emoji: '🔐', text: 'Secure' },
            { emoji: '🇳🇬', text: 'Made for Nigeria' },
            { emoji: '⚡', text: 'Instant Search' },
          ].map(item => (
            <div key={item.text} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', marginBottom: '2px' }}>{item.emoji}</div>
              <div style={{ fontSize: '10px', color: '#8896A5', fontWeight: '500' }}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
