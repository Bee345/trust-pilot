import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, ShieldCheck, Fingerprint, Smartphone, Key, ChevronRight, Check } from 'lucide-react';

export default function PrivacySecurity() {
  const navigate = useNavigate();
  const [twoFA, setTwoFA] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordChanged(true);
    setShowPasswordForm(false);
    setTimeout(() => setPasswordChanged(false), 3000);
  };

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2B3C 0%, #0D1B2A 100%)',
        padding: '20px 20px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={20} color="white" />
          </button>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: 0 }}>Privacy & Security</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: '0 0 0 48px' }}>
          Protect your account and data
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', marginTop: '-20px', position: 'relative', zIndex: 10, padding: '24px', minHeight: 'calc(100vh - 120px)' }}>

        {/* Security Score */}
        <div style={{
          background: 'linear-gradient(135deg, #1A2B3C, #0D1B2A)',
          borderRadius: '20px', padding: '20px', marginBottom: '24px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '0 0 4px 0' }}>Security Score</p>
              <p style={{ color: 'white', fontSize: '28px', fontWeight: '900', margin: 0 }}>72<span style={{ fontSize: '16px', fontWeight: '500', color: 'rgba(255,255,255,0.6)' }}>/100</span></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ background: '#FF9800', color: 'white', fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px' }}>Moderate</span>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: '6px 0 0 0' }}>Enable 2FA to improve</p>
            </div>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px' }}>
            <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg, #FF9800, #FFD700)', borderRadius: '4px' }} />
          </div>
        </div>

        {/* Password Change */}
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#B0BEC5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Password</h3>

        {passwordChanged && (
          <div style={{ background: '#F0FFF4', border: '1.5px solid #C6F6D5', borderRadius: '14px', padding: '14px', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
            <Check size={18} color="#00C853" />
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#1B5E20', margin: 0 }}>Password changed successfully!</p>
          </div>
        )}

        <div style={{ background: 'white', border: '1.5px solid #ECEFF1', borderRadius: '16px', marginBottom: '20px', overflow: 'hidden' }}>
          <div
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
          >
            <div style={{ width: '40px', height: '40px', background: '#EEF2FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Key size={18} color="#1565C0" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: 0 }}>Change Password</p>
              <p style={{ fontSize: '12px', color: '#8896A5', margin: 0 }}>Last changed: Never</p>
            </div>
            <ChevronRight size={16} color="#D0D8E4" style={{ transform: showPasswordForm ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} style={{ padding: '0 16px 16px', borderTop: '1px solid #F5F6FA' }}>
              <div style={{ marginBottom: '12px', paddingTop: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#546E7A', display: 'block', marginBottom: '6px' }}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter current password"
                    value={passwords.current}
                    onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                    style={{ borderRadius: '10px', paddingRight: '44px', fontSize: '14px' }}
                    required
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#B0BEC5', display: 'flex' }}>
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#546E7A', display: 'block', marginBottom: '6px' }}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Min. 8 characters"
                    value={passwords.newPass}
                    onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
                    style={{ borderRadius: '10px', paddingRight: '44px', fontSize: '14px' }}
                    required
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#B0BEC5', display: 'flex' }}>
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#546E7A', display: 'block', marginBottom: '6px' }}>Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Repeat new password"
                  value={passwords.confirm}
                  onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                  style={{ borderRadius: '10px', fontSize: '14px' }}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ borderRadius: '12px', padding: '13px', fontSize: '14px' }}>
                Update Password
              </button>
            </form>
          )}
        </div>

        {/* Security Toggles */}
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#B0BEC5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Security</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {[
            {
              icon: ShieldCheck, iconBg: '#F0FFF4', iconColor: '#00C853',
              label: 'Two-Factor Authentication',
              desc: twoFA ? 'Enabled — your account is extra secure' : 'Adds an extra layer of security on login',
              value: twoFA, setter: setTwoFA,
            },
            {
              icon: Fingerprint, iconBg: '#EEF2FF', iconColor: '#1565C0',
              label: 'Biometric Login',
              desc: biometric ? 'Using fingerprint / Face ID' : 'Enable fingerprint or Face ID login',
              value: biometric, setter: setBiometric,
            },
            {
              icon: Smartphone, iconBg: '#FFF8F0', iconColor: '#FF9800',
              label: 'Login Alerts',
              desc: loginAlerts ? 'You\'ll be notified of new sign-ins' : 'Get notified when you sign in on a new device',
              value: loginAlerts, setter: setLoginAlerts,
            },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} style={{ background: 'white', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', border: '1px solid #ECEFF1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={item.iconColor} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 2px 0' }}>{item.label}</p>
                  <p style={{ fontSize: '12px', color: item.value ? '#00C853' : '#8896A5', margin: 0 }}>{item.desc}</p>
                </div>
                <div
                  onClick={() => item.setter(!item.value)}
                  style={{ width: '48px', height: '26px', borderRadius: '13px', background: item.value ? '#E53935' : '#E0E4EC', position: 'relative', cursor: 'pointer', transition: 'background 0.2s ease', flexShrink: 0 }}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: item.value ? '25px' : '3px', transition: 'left 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Sessions */}
        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#B0BEC5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Active Sessions</h3>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #ECEFF1', overflow: 'hidden', marginBottom: '24px' }}>
          {[
            { device: 'Chrome on Windows 11', location: 'Lagos, Nigeria', current: true, time: 'Right now' },
            { device: 'Safari on iPhone 14', location: 'Lagos, Nigeria', current: false, time: '2 days ago' },
          ].map((session, i) => (
            <div key={i} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: i < 1 ? '1px solid #F5F6FA' : 'none' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: session.current ? '#F0FFF4' : '#F5F6FA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={18} color={session.current ? '#00C853' : '#8896A5'} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 2px 0' }}>{session.device}</p>
                <p style={{ fontSize: '12px', color: '#8896A5', margin: 0 }}>{session.location} · {session.time}</p>
              </div>
              {session.current ? (
                <span style={{ fontSize: '11px', fontWeight: '700', background: '#F0FFF4', color: '#00C853', padding: '3px 10px', borderRadius: '20px' }}>Current</span>
              ) : (
                <button style={{ fontSize: '12px', fontWeight: '700', color: '#E53935', background: '#FFF5F5', border: '1px solid rgba(229,57,53,0.2)', padding: '4px 10px', borderRadius: '20px', cursor: 'pointer' }}>
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div style={{ background: '#FFF5F5', border: '1.5px solid rgba(229,57,53,0.2)', borderRadius: '16px', padding: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#E53935', margin: '0 0 12px 0' }}>Danger Zone</h4>
          <button style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'none', border: '1.5px solid rgba(229,57,53,0.3)', color: '#E53935', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            Delete Account
          </button>
        </div>

        <div style={{ height: '100px' }} />
      </div>
    </div>
  );
}
