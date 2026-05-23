import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, ArrowRight, Phone, Lock, ChevronLeft } from 'lucide-react';
import { api } from '../lib/api';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.post('/api/auth/login', formData);
      localStorage.setItem('trustbase_token', data.token);
      localStorage.setItem('trustbase_user', JSON.stringify(data.user));
      onLogin(data.user);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(160deg, #ffebee 0%, #ffffff 40%, #f5f6fa 100%)',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
        padding: '48px 24px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', position: 'relative' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={20} color="white" />
          </div>
          <span style={{ color: 'white', fontSize: '20px', fontWeight: '800' }}>TrustBase</span>
        </div>

        <h1 style={{ 
          color: 'white', fontSize: '28px', fontWeight: '800', lineHeight: '1.2',
          marginBottom: '8px', position: 'relative',
        }}>
          Welcome back 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', position: 'relative' }}>
          Sign in to keep protecting yourself
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
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1A2B3C', marginBottom: '6px' }}>Sign In</h2>
        <p style={{ fontSize: '13px', color: '#8896A5', marginBottom: '24px' }}>Enter your credentials to continue</p>

        {error && (
          <div style={{
            background: '#FFF5F5', border: '1px solid #FFC5C5', borderRadius: '10px',
            padding: '12px 14px', fontSize: '13px', color: '#C62828', marginBottom: '8px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                <Phone size={18} color={focused === 'phone' ? '#E53935' : '#B0BEC5'} />
              </div>
              <input
                type="tel"
                className="form-control"
                placeholder="08012345678"
                required
                style={{ paddingLeft: '44px', borderRadius: '12px' }}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused('')}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <span style={{ fontSize: '13px', color: '#E53935', fontWeight: '600', cursor: 'pointer' }}>
                Forgot password?
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                <Lock size={18} color={focused === 'password' ? '#E53935' : '#B0BEC5'} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter your password"
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
              marginTop: '8px', borderRadius: '14px', fontSize: '16px', padding: '16px',
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
                Signing In...
              </>
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ fontSize: '14px', color: '#8896A5' }}>
            Don't have an account?{' '}
            <span 
              onClick={() => navigate('/signup')} 
              style={{ color: '#E53935', fontWeight: '700', cursor: 'pointer' }}
            >
              Sign Up Free
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
