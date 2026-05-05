import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ShieldCheck, AlertTriangle, TrendingUp, ChevronRight, Star, Zap, Users, Shield } from 'lucide-react';

const recentSearches = [
  { id: 1, query: '08034567890', risk: 'high', label: 'High Risk' },
  { id: 2, query: 'Lagos Gadgets Store', risk: 'safe', label: 'Verified' },
  { id: 3, query: '07025678901', risk: 'medium', label: 'Caution' },
];

const recentReports = [
  {
    id: 1, name: 'Fraudulent iPhone Seller',
    amount: '₦220,000', time: '2 hours ago',
    type: 'Online Scam', risk: 'high',
  },
  {
    id: 2, name: 'Fake Loan Officer',
    amount: '₦50,000', time: '5 hours ago',
    type: 'Financial Fraud', risk: 'high',
  },
  {
    id: 3, name: 'Ada Boutique',
    amount: '₦12,000', time: '1 day ago',
    type: 'Product Scam', risk: 'medium',
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate('/search-results');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
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
        {/* Background decoration */}
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
            <h1 style={{ color: 'white', fontSize: '20px', fontWeight: '800' }}>TrustBase</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => navigate('/notifications')} style={{
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
              JD
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
                flex: 1,
                border: 'none',
                padding: '14px 16px 14px 46px',
                borderRadius: '14px',
                fontSize: '14px',
                outline: 'none',
                color: '#1A2B3C',
                fontFamily: 'Inter, sans-serif',
                background: 'transparent',
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                background: 'linear-gradient(135deg, #E53935, #C62828)',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 16px',
                cursor: 'pointer',
                color: 'white',
                fontWeight: '700',
                fontSize: '13px',
                whiteSpace: 'nowrap',
                margin: '4px',
                transition: 'all 0.2s ease',
              }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        background: 'white',
        margin: '0',
        padding: '16px 20px',
        display: 'flex',
        borderBottom: '1px solid #ECEFF1',
      }}>
        {[
          { value: '12,450+', label: 'Reports', color: '#E53935', emoji: '📊' },
          { value: '3,200+', label: 'Flagged', color: '#FF9800', emoji: '🚩' },
          { value: '850+', label: 'Verified Biz', color: '#00C853', emoji: '✅' },
        ].map((stat, i) => (
          <React.Fragment key={stat.label}>
            {i > 0 && <div style={{ width: '1px', background: '#ECEFF1', margin: '0 4px' }}/>}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '800', color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', color: '#8896A5', fontWeight: '500', marginTop: '2px' }}>
                {stat.label}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '20px 20px 0' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1A2B3C', marginBottom: '12px' }}>Quick Actions</h2>
        <div className="grid-2">
          {[
            { 
              icon: '⚠️', title: 'Report a Scam', desc: 'Flag suspicious activity',
              bg: '#FFF5F5', border: '#FFE0E0', action: '/report-scam',
            },
            { 
              icon: '🔍', title: 'Bulk Check', desc: 'Search multiple numbers',
              bg: '#F0F4FF', border: '#D6E0FF', action: '/search-results',
            },
            { 
              icon: '✅', title: 'Get Verified', desc: 'Build your trust score',
              bg: '#F0FFF4', border: '#C6F6D5', action: '/get-verified',
            },
            { 
              icon: '📋', title: 'My Reports', desc: 'View your submissions',
              bg: '#FFFAF0', border: '#FEEBC8', action: '/my-reports',
            },
          ].map(item => (
            <div
              key={item.title}
              onClick={() => navigate(item.action)}
              style={{
                background: item.bg,
                border: `1.5px solid ${item.border}`,
                borderRadius: '16px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1A2B3C', marginBottom: '2px' }}>
                {item.title}
              </div>
              <div style={{ fontSize: '11px', color: '#8896A5' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1A2B3C' }}>Latest Reports</h2>
          <span 
            onClick={() => navigate('/reports-list')}
            style={{ fontSize: '13px', color: '#E53935', fontWeight: '600', cursor: 'pointer' }}
          >
            See all
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recentReports.map((report, idx) => (
            <div
              key={report.id}
              onClick={() => navigate('/reports-list')}
              style={{
                background: 'white',
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #ECEFF1',
                transition: 'all 0.2s ease',
                animation: `fadeInUp 0.4s ease ${idx * 0.1}s both`,
              }}
            >
              <div style={{
                width: '44px', height: '44px',
                borderRadius: '12px',
                background: report.risk === 'high' ? '#FFF5F5' : '#FFF8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <AlertTriangle size={20} color={report.risk === 'high' ? '#E53935' : '#FF9800'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#1A2B3C', margin: 0, marginBottom: '2px' }}>
                    {report.name}
                  </p>
                  <span style={{
                    fontSize: '10px', fontWeight: '700',
                    padding: '2px 8px', borderRadius: '20px',
                    background: report.risk === 'high' ? '#FFF5F5' : '#FFF8F0',
                    color: report.risk === 'high' ? '#E53935' : '#FF9800',
                    flexShrink: 0, marginLeft: '8px',
                  }}>
                    {report.risk === 'high' ? 'HIGH RISK' : 'CAUTION'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#E53935', fontWeight: '600' }}>{report.amount}</span>
                  <span style={{ fontSize: '12px', color: '#B0BEC5' }}>{report.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Banner */}
      <div style={{ padding: '20px', paddingBottom: '0' }}>
        <div
          onClick={() => navigate('/get-verified')}
          style={{
            background: 'linear-gradient(135deg, #1A2B3C 0%, #0D1B2A 100%)',
            borderRadius: '18px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
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

      {/* Spacer for bottom nav */}
      <div style={{ height: '100px' }}/>
    </div>
  );
}
