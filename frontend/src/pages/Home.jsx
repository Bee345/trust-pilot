import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ShieldCheck, AlertTriangle, Zap } from 'lucide-react';
import { api } from '../lib/api';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('trustbase_user') || '{}');
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'Me';

  useEffect(() => {
    api.get('/api/reviews?limit=3')
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.reports ?? []);
        setRecentReports(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate('/search-results', { state: { query: searchQuery.trim() } });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const riskColor = (level) => level === 'HIGH' ? '#E53935' : level === 'MEDIUM' ? '#FF9800' : '#00C853';
  const riskBg   = (level) => level === 'HIGH' ? '#FFF5F5' : level === 'MEDIUM' ? '#FFF8F0' : '#F0FFF4';

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
        padding: '20px 20px 36px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-50px', right: '-50px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.07)',
        }}/>
        <div style={{
          position: 'absolute', bottom: '-20px', left: '30%',
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }}/>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', marginBottom: '2px' }}>Good afternoon 👋</p>
            <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '800' }}>
              {user.name ? user.name.split(' ')[0] : 'TrustBase'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => navigate('/notifications')} aria-label="Notifications" style={{
              width: '38px', height: '38px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '50%', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(10px)',
              position: 'relative',
            }}>
              <Bell size={18} color="white" />
              <div style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '8px', height: '8px',
                background: '#FFD700', borderRadius: '50%',
                border: '2px solid #C62828',
              }}/>
            </button>
            <div onClick={() => navigate('/profile')} style={{
              width: '38px', height: '38px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '800', fontSize: '14px', color: 'white',
            }}>
              {initials}
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '4px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          position: 'relative',
        }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: '16px', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color={searchFocused ? '#E53935' : '#B0BEC5'} />
            </div>
            <input
              type="text"
              placeholder="Search phone number or business..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                flex: 1, border: 'none',
                padding: '14px 16px 14px 46px',
                borderRadius: '14px', fontSize: '14px',
                outline: 'none', color: '#1A2B3C',
                fontFamily: 'Inter, sans-serif', background: 'transparent',
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                background: 'linear-gradient(135deg, #E53935, #C62828)',
                border: 'none', borderRadius: '12px',
                padding: '10px 16px', cursor: 'pointer',
                color: 'white', fontWeight: '700', fontSize: '13px',
                whiteSpace: 'nowrap', margin: '4px',
              }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        background: 'white', margin: '0', padding: '16px 20px',
        display: 'flex', borderBottom: '1px solid #ECEFF1',
      }}>
        {[
          { value: '12,450+', label: 'Reports', color: '#E53935' },
          { value: '3,200+', label: 'Flagged', color: '#FF9800' },
          { value: '850+', label: 'Verified Biz', color: '#00C853' },
        ].map((stat, i) => (
          <React.Fragment key={stat.label}>
            {i > 0 && <div style={{ width: '1px', background: '#ECEFF1', margin: '0 4px' }}/>}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: '#8896A5', fontWeight: '500', marginTop: '2px' }}>{stat.label}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '20px 20px 0' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1A2B3C', marginBottom: '12px' }}>Quick Actions</h2>
        <div className="grid-2">
          {[
            { icon: '⚠️', title: 'Report a Scam', desc: 'Flag suspicious activity', action: '/report-scam' },
            { icon: '🔍', title: 'Bulk Check', desc: 'Search multiple numbers', action: '/search-results' },
            { icon: '✅', title: 'Get Verified', desc: 'Build your trust score', action: '/get-verified' },
            { icon: '📋', title: 'My Reports', desc: 'View your submissions', action: '/my-reports' },
          ].map(item => (
            <div
              key={item.title}
              onClick={() => navigate(item.action)}
              style={{
                background: 'white', border: '1.5px solid #ECEFF1',
                borderRadius: '16px', padding: '16px',
                cursor: 'pointer',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A2B3C', marginBottom: '2px' }}>{item.title}</div>
              <div style={{ fontSize: '11px', color: '#8896A5' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Reports */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1A2B3C' }}>Latest Reports</h2>
          <span onClick={() => navigate('/reports-list')} style={{ fontSize: '13px', color: '#E53935', fontWeight: '600', cursor: 'pointer' }}>
            See all
          </span>
        </div>

        {loading ? (
          <div aria-live="polite" style={{ textAlign: 'center', padding: '24px', color: '#8896A5', fontSize: '13px' }}>Loading...</div>
        ) : recentReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#8896A5', fontSize: '13px' }}>No reports yet</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentReports.map((report) => (
              <div
                key={report.id}
                onClick={() => navigate('/reports-list')}
                style={{
                  background: 'white', borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  border: '1px solid #ECEFF1',
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: riskBg(report.risk_level),
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <AlertTriangle size={20} color={riskColor(report.risk_level)} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A2B3C', margin: 0, marginBottom: '2px' }}>
                      {report.business_name || report.phone}
                    </p>
                    <span style={{
                      fontSize: '10px', fontWeight: '700',
                      padding: '2px 8px', borderRadius: '20px',
                      background: riskBg(report.risk_level),
                      color: riskColor(report.risk_level),
                      flexShrink: 0, marginLeft: '8px',
                    }}>
                      {report.risk_level || 'UNKNOWN'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {report.amount_lost && (
                      <span style={{ fontSize: '12px', color: '#E53935', fontWeight: '600' }}>
                        ₦{Number(report.amount_lost).toLocaleString()} lost
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: '#B0BEC5' }}>
                      {report.created_at ? timeAgo(report.created_at) : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trust Banner */}
      <div style={{ padding: '20px', paddingBottom: '0' }}>
        <div
          onClick={() => navigate('/get-verified')}
          style={{
            background: 'linear-gradient(135deg, #1A2B3C 0%, #0D1B2A 100%)',
            borderRadius: '18px', padding: '20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            cursor: 'pointer', position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', right: '-20px', top: '-20px',
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'rgba(229,57,53,0.15)',
          }}/>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(229,57,53,0.2)', borderRadius: '20px',
              padding: '3px 10px', marginBottom: '8px',
            }}>
              <Zap size={12} color="#E53935" />
              <span style={{ fontSize: '11px', color: '#E53935', fontWeight: '700' }}>NEW</span>
            </div>
            <p style={{ color: 'white', fontWeight: '700', fontSize: '15px', margin: '0 0 4px 0' }}>
              Get Your Business Verified
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>
              Build trust and get more customers
            </p>
          </div>
          <div style={{
            background: '#E53935', borderRadius: '12px',
            padding: '10px 14px', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <ShieldCheck size={16} color="white" />
            <span style={{ color: 'white', fontSize: '12px', fontWeight: '700' }}>Verify</span>
          </div>
        </div>
      </div>

      <div style={{ height: '100px' }}/>
    </div>
  );
}
