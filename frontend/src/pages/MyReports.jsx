import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Clock, CheckCircle2, MessageCircle, Plus } from 'lucide-react';

const MY_REPORTS = [
  {
    id: 1,
    type: 'phone',
    target: '08098765432',
    label: 'Phone Number',
    excerpt: 'Person claiming to be a loan officer. Collected ₦50,000 processing fee and disappeared.',
    time: '2 days ago',
    status: 'under_review',
    upvotes: 3,
    risk: 'high',
  },
  {
    id: 2,
    type: 'business',
    target: 'Ada Chioma Boutique',
    label: 'Business',
    excerpt: 'Paid ₦12,000 for a dress. Sent a completely wrong item and refuses all refunds or exchange.',
    time: '1 week ago',
    status: 'published',
    upvotes: 18,
    risk: 'high',
  },
  {
    id: 3,
    type: 'phone',
    target: '07034567890',
    label: 'Phone Number',
    excerpt: 'Property rental scam — showed fake property, collected agency fees then vanished.',
    time: '3 weeks ago',
    status: 'published',
    upvotes: 25,
    risk: 'high',
  },
];

const MY_COMMENTS = [
  {
    id: 1,
    reportTitle: 'Fraudulent iPhone Seller',
    comment: 'This happened to me too! Same phone number. Lost N150k. Please be careful.',
    time: '3 days ago',
    likes: 8,
  },
  {
    id: 2,
    reportTitle: 'POS Agent Fraud',
    comment: 'I reported this same guy in Ikeja. He uses a disguised POS machine.',
    time: '2 weeks ago',
    likes: 5,
  },
];

const STATUS_CONFIG = {
  under_review: { label: 'Under Review', bg: '#FFF8F0', color: '#FF9800', icon: <Clock size={12} color="#FF9800" /> },
  published: { label: 'Published', bg: '#F0FFF4', color: '#00C853', icon: <CheckCircle2 size={12} color="#00C853" /> },
  rejected: { label: 'Rejected', bg: '#FFF5F5', color: '#E53935', icon: null },
};

export default function MyReports() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('reports');

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2B3C 0%, #0D1B2A 100%)',
        padding: '20px 20px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '16px' }}
        >
          <ArrowLeft size={20} color="white" />
        </button>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>My Activity</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>Your reports and community contributions</p>
      </div>

      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', marginTop: '-20px', position: 'relative', zIndex: 10, minHeight: 'calc(100vh - 120px)' }}>
        
        {/* Stats Row */}
        <div style={{ display: 'flex', padding: '20px 20px 0' }}>
          {[
            { label: 'Total Reports', value: MY_REPORTS.length, color: '#E53935', bg: '#FFF5F5' },
            { label: 'Published', value: MY_REPORTS.filter(r => r.status === 'published').length, color: '#00C853', bg: '#F0FFF4' },
            { label: 'Helped', value: `${MY_REPORTS.reduce((acc, r) => acc + r.upvotes, 0)}`, color: '#FF9800', bg: '#FFF8F0' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: '1px', background: '#ECEFF1', margin: '8px 0' }}/>}
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  fontSize: '20px', fontWeight: '800', color: s.color,
                  marginBottom: '2px',
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '11px', color: '#8896A5' }}>{s.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ padding: '16px 20px' }}>
          <div style={{ background: '#F5F6FA', borderRadius: '12px', padding: '4px', display: 'flex' }}>
            {[
              { key: 'reports', label: `Reports (${MY_REPORTS.length})` },
              { key: 'comments', label: `Comments (${MY_COMMENTS.length})` },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  background: tab === t.key ? 'white' : 'transparent',
                  fontSize: '13px', fontWeight: '700',
                  color: tab === t.key ? '#E53935' : '#8896A5',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: tab === t.key ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 20px 100px' }}>
          {tab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {MY_REPORTS.map((report, idx) => {
                const statusConf = STATUS_CONFIG[report.status];
                return (
                  <div key={report.id} style={{
                    background: 'white', borderRadius: '18px',
                    border: '1px solid #ECEFF1',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    animation: `fadeInUp 0.4s ease ${idx * 0.08}s both`,
                  }}>
                    {/* Top bar accent */}
                    <div style={{ height: '3px', background: report.status === 'published' ? 'linear-gradient(90deg, #00C853, #1B5E20)' : 'linear-gradient(90deg, #FF9800, #E65100)' }}/>
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 2px 0' }}>
                            {report.target}
                          </h3>
                          <p style={{ fontSize: '12px', color: '#8896A5', margin: 0 }}>{report.label}</p>
                        </div>
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          background: statusConf.bg, color: statusConf.color,
                          fontSize: '11px', fontWeight: '700',
                          padding: '4px 10px', borderRadius: '20px',
                        }}>
                          {statusConf.icon}
                          {statusConf.label}
                        </span>
                      </div>

                      <p style={{ fontSize: '13px', color: '#546E7A', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                        {report.excerpt}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#B0BEC5' }}>📅 {report.time}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', color: '#8896A5' }}>👍 {report.upvotes} found helpful</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Submit CTA */}
              <button
                onClick={() => navigate('/report-scam')}
                style={{
                  width: '100%', padding: '16px',
                  borderRadius: '16px',
                  border: '2px dashed #E53935',
                  background: '#FFF5F5',
                  color: '#E53935', fontWeight: '700', fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <Plus size={18} />
                Report Another Scammer
              </button>
            </div>
          )}

          {tab === 'comments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {MY_COMMENTS.map((c, idx) => (
                <div key={c.id} style={{
                  background: 'white', borderRadius: '16px',
                  border: '1px solid #ECEFF1',
                  padding: '16px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  animation: `fadeInUp 0.4s ease ${idx * 0.1}s both`,
                }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #E53935, #C62828)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageCircle size={18} color="white" />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: '#8896A5', margin: 0 }}>Comment on</p>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#E53935', margin: 0 }}>{c.reportTitle}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#546E7A', lineHeight: '1.5', margin: '0 0 10px 0' }}>
                    "{c.comment}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: '#B0BEC5' }}>{c.time}</span>
                    <span style={{ fontSize: '12px', color: '#8896A5' }}>❤️ {c.likes} likes</span>
                  </div>
                </div>
              ))}

              {MY_COMMENTS.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A2B3C' }}>No comments yet</h3>
                  <p style={{ fontSize: '14px', color: '#8896A5' }}>Start engaging with community reports</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
