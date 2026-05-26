import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Search, Clock } from 'lucide-react';
import { api } from '../lib/api';
import ReportDetailModal from '../components/ReportDetailModal';

const RISK_COLORS = {
  high: { bg: '#FFF5F5', text: '#E53935', border: 'rgba(229,57,53,0.15)', label: 'HIGH RISK' },
  medium: { bg: '#FFF8F0', text: '#FF9800', border: 'rgba(255,152,0,0.15)', label: 'CAUTION' },
  low: { bg: '#F0FFF4', text: '#00C853', border: 'rgba(0,200,83,0.15)', label: 'LOW RISK' },
};

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function ReportsList() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => setLoading(true));
    const riskParam = activeFilter !== 'all' ? `&risk_level=${activeFilter}` : '';
    api.get(`/api/reviews?page=${page}&limit=20${riskParam}`)
      .then(data => {
        if (cancelled) return;
        setReports(data?.reports ?? []);
      })
      .catch(err => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [page, activeFilter]);

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'high', label: 'High Risk' },
    { key: 'medium', label: 'Medium' },
    { key: 'low', label: 'Low Risk' },
  ];

  const filtered = reports.filter(r => {
    const haystack = `${r.business_name || ''} ${r.phone || ''} ${r.description || ''}`.toLowerCase();
    return !searchQuery || haystack.includes(searchQuery.toLowerCase());
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
            aria-label="Go back"
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
              onClick={() => { setActiveFilter(f.key); setPage(1); }}
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
            {filtered.filter(r => r.risk_level === 'high').length} High Risk Reports in your area
          </p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', margin: 0 }}>
            Stay safe — always verify before sending money
          </p>
        </div>
      </div>

      {/* Report Cards */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading && (
          <div aria-live="polite" style={{ textAlign: 'center', padding: '40px 20px', color: '#8896A5' }}>
            Loading reports...
          </div>
        )}

        {error && !loading && (
          <div style={{
            background: '#FFF5F5', border: '1px solid #FFC5C5', borderRadius: '12px',
            padding: '14px', fontSize: '13px', color: '#C62828',
          }}>
            {error}
          </div>
        )}

        {!loading && !error && filtered.map((report, idx) => {
          const risk = report.risk_level || 'low';
          const riskStyle = RISK_COLORS[risk] || RISK_COLORS.low;
          const title = report.business_name || report.scam_type;
          const number = report.phone || '—';
          const amount = report.amount_lost
            ? `₦${Number(report.amount_lost).toLocaleString()}`
            : null;
          return (
            <div
              key={report.id}
              role="button"
              tabIndex={0}
              aria-label={`View details for ${report.business_name || report.phone || 'report'}`}
              onClick={() => setSelectedReport(report)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedReport(report); } }}
              style={{
                background: 'white',
                borderRadius: '18px',
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                border: '1px solid #ECEFF1',
                animation: `fadeInUp 0.4s ease ${idx * 0.05}s both`,
                cursor: 'pointer',
              }}
            >
              <div style={{
                height: '3px',
                background: risk === 'high'
                  ? 'linear-gradient(90deg, #E53935, #C62828)'
                  : risk === 'medium'
                    ? 'linear-gradient(90deg, #FF9800, #E65100)'
                    : 'linear-gradient(90deg, #00C853, #1B5E20)',
              }}/>

              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 4px 0' }}>
                      {title}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#8896A5', margin: 0 }}>{number}</p>
                  </div>
                  <span style={{
                    background: riskStyle.bg, color: riskStyle.text,
                    border: `1px solid ${riskStyle.border}`,
                    fontSize: '10px', fontWeight: '800',
                    padding: '4px 10px', borderRadius: '20px',
                    flexShrink: 0, marginLeft: '10px', letterSpacing: '0.5px',
                  }}>
                    {riskStyle.label}
                  </span>
                </div>

                {amount && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: '#FFF5F5', borderRadius: '8px',
                    padding: '6px 10px', marginBottom: '10px',
                  }}>
                    <span style={{ fontSize: '16px' }}>💸</span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#E53935' }}>
                      {amount} lost
                    </span>
                  </div>
                )}

                <p style={{ fontSize: '13px', color: '#546E7A', lineHeight: '1.5', margin: '0 0 12px 0' }}>
                  {report.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} color="#B0BEC5" />
                    <span style={{ fontSize: '11px', color: '#8896A5' }}>{timeAgo(report.created_at)}</span>
                  </div>
                  <span style={{
                    background: '#F5F6FA', color: '#8896A5',
                    fontSize: '10px', fontWeight: '600',
                    padding: '3px 8px', borderRadius: '6px',
                  }}>
                    {report.scam_type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A2B3C', marginBottom: '8px' }}>No reports found</h3>
            <p style={{ fontSize: '14px', color: '#8896A5' }}>Try adjusting your search or filters</p>
          </div>
        )}

        {!loading && !error && reports.length >= 20 && (
          <button
            onClick={() => setPage(p => p + 1)}
            style={{
              padding: '12px', borderRadius: '12px',
              background: 'white', border: '1px solid #ECEFF1',
              color: '#1A2B3C', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            }}
          >
            Load more →
          </button>
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

      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}
