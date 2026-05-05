import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, AlertTriangle, Search, MapPin, Clock, ChevronRight } from 'lucide-react';

const REPORTS = [
  {
    id: 1,
    title: 'Fraudulent iPhone Seller',
    number: '08012345678',
    amount: '₦220,000',
    description: 'Paid for iPhone 13 Pro, seller blocked me immediately. Same account has been scamming people since 2023.',
    time: '2 days ago',
    location: 'Lagos',
    risk: 'high',
    type: 'Online Scam',
    upvotes: 24,
    image: null,
  },
  {
    id: 2,
    title: 'Clothing Vendor Scam',
    number: '07098765432',
    amount: '₦45,000',
    description: 'Ordered branded clothes, made full payment. Vendor delivered wrong sizes and refuses refund. Went off-grid after.',
    time: '1 week ago',
    location: 'Abuja',
    risk: 'high',
    type: 'Product Scam',
    upvotes: 18,
    image: null,
  },
  {
    id: 3,
    title: 'POS Agent Fraud',
    number: '09023456789',
    amount: '₦15,000',
    description: 'Pretended to be a POS agent near a busy market, collected N15,000 cash but never funded my account.',
    time: '2 weeks ago',
    location: 'Port Harcourt',
    risk: 'medium',
    type: 'POS Fraud',
    upvotes: 11,
    image: null,
  },
  {
    id: 4,
    title: 'Fake Loan App Operator',
    number: '08056781234',
    amount: '₦8,000',
    description: 'Collected processing fee of N8,000 for a loan that was never disbursed. Blocked my number afterward.',
    time: '3 weeks ago',
    location: 'Kano',
    risk: 'medium',
    type: 'Loan Scam',
    upvotes: 9,
    image: null,
  },
  {
    id: 5,
    title: 'Fake Recruitment Agency',
    number: '08087654321',
    amount: '₦35,000',
    description: 'Promised overseas job placement after collecting a processing fee. The job offer was completely fake.',
    time: '1 month ago',
    location: 'Ibadan',
    risk: 'high',
    type: 'Job Scam',
    upvotes: 32,
    image: null,
  },
];

const RISK_COLORS = {
  high: { bg: '#FFF5F5', text: '#E53935', border: 'rgba(229,57,53,0.15)', label: 'HIGH RISK' },
  medium: { bg: '#FFF8F0', text: '#FF9800', border: 'rgba(255,152,0,0.15)', label: 'CAUTION' },
  low: { bg: '#F0FFF4', text: '#00C853', border: 'rgba(0,200,83,0.15)', label: 'LOW RISK' },
};

export default function ReportsList() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'high', label: 'High Risk' },
    { key: 'medium', label: 'Caution' },
  ];

  const filtered = REPORTS.filter(r => {
    const matchFilter = activeFilter === 'all' || r.risk === activeFilter;
    const matchSearch = !searchQuery || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.number.includes(searchQuery) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: 'white',
        padding: '16px 20px',
        borderBottom: '1px solid #ECEFF1',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#F5F6FA', border: 'none', borderRadius: '10px',
              width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <ArrowLeft size={20} color="#1A2B3C" />
          </button>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: '800', color: '#1A2B3C', margin: 0 }}>Community Reports</h1>
            <p style={{ fontSize: '12px', color: '#8896A5', margin: 0 }}>{filtered.length} reports found</p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            <Search size={16} color="#B0BEC5" />
          </div>
          <input
            type="text"
            placeholder="Search reports..."
            className="form-control"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '38px', borderRadius: '10px',
              height: '40px', fontSize: '13px',
              padding: '0 12px 0 36px',
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeFilter === f.key 
                  ? (f.key === 'high' ? '#E53935' : f.key === 'medium' ? '#FF9800' : '#1A2B3C')
                  : '#F5F6FA',
                color: activeFilter === f.key ? 'white' : '#8896A5',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
        padding: '16px 20px',
        display: 'flex', gap: '16px', alignItems: 'center',
      }}>
        <AlertTriangle size={20} color="#FFD700" fill="rgba(255,215,0,0.3)" />
        <div>
          <p style={{ color: 'white', fontWeight: '700', fontSize: '13px', margin: 0 }}>
            {filtered.filter(r => r.risk === 'high').length} High Risk Reports in your area
          </p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', margin: 0 }}>
            Stay safe — always verify before sending money
          </p>
        </div>
      </div>

      {/* Report Cards */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((report, idx) => {
          const riskStyle = RISK_COLORS[report.risk] || RISK_COLORS.low;
          return (
            <div
              key={report.id}
              style={{
                background: 'white',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                border: '1px solid #ECEFF1',
                animation: `fadeInUp 0.4s ease ${idx * 0.08}s both`,
                cursor: 'pointer',
              }}
            >
              {/* Card top bar */}
              <div style={{
                height: '3px',
                background: report.risk === 'high' 
                  ? 'linear-gradient(90deg, #E53935, #C62828)'
                  : 'linear-gradient(90deg, #FF9800, #E65100)',
              }}/>
              
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 4px 0' }}>
                      {report.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#8896A5', margin: 0 }}>{report.number}</p>
                  </div>
                  <span style={{
                    background: riskStyle.bg,
                    color: riskStyle.text,
                    border: `1px solid ${riskStyle.border}`,
                    fontSize: '10px', fontWeight: '800',
                    padding: '4px 10px', borderRadius: '20px',
                    flexShrink: 0, marginLeft: '10px',
                    letterSpacing: '0.5px',
                  }}>
                    {riskStyle.label}
                  </span>
                </div>

                {/* Amount */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: '#FFF5F5', borderRadius: '8px',
                  padding: '6px 10px', marginBottom: '10px',
                }}>
                  <span style={{ fontSize: '16px' }}>💸</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#E53935' }}>
                    {report.amount} lost
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: '#546E7A', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                  {report.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="#B0BEC5" />
                      <span style={{ fontSize: '11px', color: '#8896A5' }}>{report.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} color="#B0BEC5" />
                      <span style={{ fontSize: '11px', color: '#8896A5' }}>{report.time}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{
                      background: '#F5F6FA', color: '#8896A5',
                      fontSize: '10px', fontWeight: '600',
                      padding: '3px 8px', borderRadius: '6px',
                    }}>
                      {report.type}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ 
                  display: 'flex', gap: '8px', marginTop: '12px',
                  paddingTop: '12px', borderTop: '1px solid #F5F6FA',
                }}>
                  <button style={{
                    flex: 1, padding: '8px', borderRadius: '10px',
                    background: '#FFF5F5', border: '1px solid #FFE0E0',
                    color: '#E53935', fontSize: '12px', fontWeight: '600',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  }}>
                    👍 Helpful ({report.upvotes})
                  </button>
                  <button style={{
                    flex: 1, padding: '8px', borderRadius: '10px',
                    background: '#F5F6FA', border: '1px solid #ECEFF1',
                    color: '#546E7A', fontSize: '12px', fontWeight: '600',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                  }}>
                    💬 Comment
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A2B3C', marginBottom: '8px' }}>No reports found</h3>
            <p style={{ fontSize: '14px', color: '#8896A5' }}>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <div style={{
        position: 'fixed', bottom: '90px', right: '20px',
      }}>
        <button
          onClick={() => navigate('/report-scam')}
          style={{
            background: 'linear-gradient(135deg, #E53935, #C62828)',
            border: 'none', borderRadius: '20px',
            padding: '14px 20px',
            color: 'white', fontWeight: '700', fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(229,57,53,0.4)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          ⚠️ Report
        </button>
      </div>
    </div>
  );
}
