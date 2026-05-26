import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, Plus } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import ReportDetailModal from '../components/ReportDetailModal';

const STATUS_CONFIG = {
  under_review: { label: 'Under Review', bg: '#FFF8F0', color: '#FF9800', icon: <Clock size={12} color="#FF9800" /> },
  published: { label: 'Published', bg: '#F0FFF4', color: '#00C853', icon: <CheckCircle2 size={12} color="#00C853" /> },
  rejected: { label: 'Rejected', bg: '#FFF5F5', color: '#E53935', icon: null },
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

export default function MyReports() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('reports');
  const { reports, loading, error } = useReports({ mine: true });
  const [selectedReport, setSelectedReport] = useState(null);

  const totalUpvotes = reports.reduce((acc, r) => acc + (r.upvote_count ?? 0), 0);
  const published = reports.filter(r => r.status === 'published').length;

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>

      <div style={{
        background: 'linear-gradient(135deg, #1A2B3C 0%, #0D1B2A 100%)',
        padding: '20px 20px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginBottom: '16px' }}
        >
          <ArrowLeft size={20} color="white" />
        </button>
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>My Activity</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>Your reports and community contributions</p>
      </div>

      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', marginTop: '-20px', position: 'relative', zIndex: 10, minHeight: 'calc(100vh - 120px)' }}>

        <div style={{ display: 'flex', padding: '20px 20px 0' }}>
          {[
            { label: 'Total Reports', value: reports.length, color: '#E53935' },
            { label: 'Published', value: published, color: '#00C853' },
            { label: 'Helped', value: totalUpvotes, color: '#FF9800' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: '1px', background: '#ECEFF1', margin: '8px 0' }}/>}
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: s.color, marginBottom: '2px' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#8896A5' }}>{s.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div style={{ padding: '16px 20px' }}>
          <div style={{ background: '#F5F6FA', borderRadius: '12px', padding: '4px', display: 'flex' }}>
            {[{ key: 'reports', label: 'Reports' }].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  background: tab === t.key ? 'white' : 'transparent',
                  fontSize: '13px', fontWeight: '700',
                  color: tab === t.key ? '#E53935' : '#8896A5',
                  cursor: 'pointer',
                  boxShadow: tab === t.key ? '0 2px 10px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 20px 100px' }}>
          {loading && (
            <div aria-live="polite" style={{ textAlign: 'center', padding: '40px', color: '#8896A5', fontSize: '14px' }}>
              Loading your reports...
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

          {!loading && !error && reports.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A2B3C' }}>No reports yet</h3>
              <p style={{ fontSize: '14px', color: '#8896A5' }}>Submit your first report to help your community</p>
            </div>
          )}

          {!loading && !error && reports.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reports.map((report) => {
                const statusConf = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.under_review;
                return (
                  <div
                    key={report.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${report.business_name || report.phone || 'report'}`}
                    onClick={() => setSelectedReport(report)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedReport(report); } }}
                    style={{
                      background: 'white', borderRadius: '18px',
                      border: '1px solid #ECEFF1',
                      overflow: 'hidden',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ height: '3px', background: report.status === 'published' ? 'linear-gradient(90deg, #00C853, #1B5E20)' : 'linear-gradient(90deg, #FF9800, #E65100)' }}/>
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 2px 0' }}>
                            {report.business_name || report.phone || 'Unknown'}
                          </h3>
                          <p style={{ fontSize: '12px', color: '#8896A5', margin: 0 }}>{report.scam_type}</p>
                        </div>
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: '4px',
                          background: statusConf.bg, color: statusConf.color,
                          fontSize: '11px', fontWeight: '700',
                          padding: '4px 10px', borderRadius: '20px',
                        }}>
                          {statusConf.icon}{statusConf.label}
                        </span>
                      </div>

                      <p style={{ fontSize: '13px', color: '#546E7A', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                        {report.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#B0BEC5' }}>
                          📅 {timeAgo(report.created_at)}
                        </span>
                        <span style={{ fontSize: '12px', color: '#8896A5' }}>
                          👍 {report.upvote_count ?? 0} found helpful
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

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
        </div>
      </div>

      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
