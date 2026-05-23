import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

const RISK_GRADIENT = {
  HIGH:   'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
  MEDIUM: 'linear-gradient(135deg, #FF9800 0%, #E65100 100%)',
  LOW:    'linear-gradient(135deg, #00C853 0%, #1B5E20 100%)',
};

const RISK_COLOR = { HIGH: '#E53935', MEDIUM: '#FF9800', LOW: '#00C853' };
const RISK_BG    = { HIGH: '#FFF5F5', MEDIUM: '#FFF8F0', LOW: '#F0FFF4' };

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export default function SearchResults() {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState(location.state?.query || '');
  const [inputValue, setInputValue] = useState(location.state?.query || '');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = useCallback(async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const data = await api.get(`/api/companies/search?q=${encodeURIComponent(q.trim())}`);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query) search(query);
  }, [query, search]);

  const handleGo = () => {
    if (inputValue.trim() && inputValue.trim() !== query) {
      setQuery(inputValue.trim());
    } else if (inputValue.trim()) {
      search(inputValue.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleGo();
  };

  const riskLevel = results?.riskAssessment?.level || 'LOW';
  const riskScore = results?.riskAssessment?.score ?? 0;
  const tags = results?.riskAssessment?.tags || [];
  const reports = results?.reports || [];

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>

      {/* Search Header */}
      <div style={{
        background: 'white', padding: '16px 20px',
        borderBottom: '1px solid #ECEFF1',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: '#F5F6FA', border: 'none', borderRadius: '10px',
              width: '38px', height: '38px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <ArrowLeft size={20} color="#1A2B3C" />
          </button>
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              <Search size={16} color="#B0BEC5" />
            </div>
            <input
              type="text"
              className="form-control"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ paddingLeft: '38px', borderRadius: '10px', fontSize: '14px', height: '40px', padding: '0 12px 0 36px' }}
            />
          </div>
          <button
            onClick={handleGo}
            style={{
              background: '#E53935', border: 'none', borderRadius: '10px',
              color: 'white', fontSize: '13px', fontWeight: '700',
              padding: '0 16px', height: '40px', cursor: 'pointer', flexShrink: 0,
            }}
          >
            Go
          </button>
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
              width: '32px', height: '32px', margin: '0 auto 12px',
              border: '3px solid #ECEFF1', borderTop: '3px solid #E53935',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }}/>
            <p style={{ color: '#8896A5', fontSize: '14px' }}>Searching database...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{
            background: '#FFF5F5', border: '1px solid #FFE0E0',
            borderRadius: '14px', padding: '16px', textAlign: 'center', color: '#C62828', fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {/* Empty prompt (no query yet) */}
        {!loading && !error && !query && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#8896A5' }}>
            <Search size={48} color="#ECEFF1" style={{ marginBottom: '12px' }} />
            <p style={{ fontSize: '14px' }}>Enter a phone number or business name to search</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && results && (
          <>
            {/* Risk Summary Card */}
            {reports.length === 0 ? (
              <div style={{
                background: 'linear-gradient(135deg, #00C853 0%, #1B5E20 100%)',
                borderRadius: '20px', padding: '20px', marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '52px', height: '52px', background: 'rgba(255,255,255,0.15)',
                    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckCircle2 size={28} color="white" />
                  </div>
                  <div>
                    <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', margin: 0, marginBottom: '2px' }}>
                      ALL CLEAR
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: 0 }}>
                      {query} • No reports found
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                background: RISK_GRADIENT[riskLevel] || RISK_GRADIENT.HIGH,
                borderRadius: '20px', padding: '20px', marginBottom: '16px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', right: '-30px', top: '-30px',
                  width: '120px', height: '120px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                }}/>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '52px', height: '52px', background: 'rgba(255,255,255,0.15)',
                    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <AlertTriangle size={28} color="#FFD700" fill="rgba(255,215,0,0.3)" />
                  </div>
                  <div>
                    <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', margin: 0, marginBottom: '2px' }}>
                      {riskLevel} RISK {riskLevel === 'HIGH' ? '⚠️' : riskLevel === 'MEDIUM' ? '⚡' : ''}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: 0 }}>
                      {query} • {reports.length} Report{reports.length !== 1 ? 's' : ''} Found
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>Risk Score</span>
                    <span style={{ fontSize: '12px', color: 'white', fontWeight: '700' }}>{riskScore}/100</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px' }}>
                    <div style={{
                      width: `${riskScore}%`, height: '100%',
                      background: 'linear-gradient(90deg, #FFD700, #FF6B6B)',
                      borderRadius: '3px', transition: 'width 1s ease',
                    }}/>
                  </div>
                </div>

                {tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {tags.map(tag => (
                      <span key={tag} style={{
                        background: 'rgba(255,255,255,0.15)',
                        color: 'white', fontSize: '11px', fontWeight: '600',
                        padding: '4px 10px', borderRadius: '20px',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {reports.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  onClick={() => navigate('/reports-list', { state: { query } })}
                  className="btn-primary"
                  style={{ flex: 1, borderRadius: '12px', padding: '13px', fontSize: '14px' }}
                >
                  📋 View Full Report
                </button>
                <button
                  onClick={() => navigate('/report-scam')}
                  style={{
                    flex: 1, borderRadius: '12px', padding: '13px', fontSize: '14px',
                    background: '#FFF5F5', color: '#E53935', border: '1.5px solid #FFE0E0',
                    fontWeight: '700', cursor: 'pointer',
                  }}
                >
                  ⚠️ Add Report
                </button>
              </div>
            )}

            {/* Summary Cards */}
            {reports.length > 0 && (
              <div className="grid-3" style={{ marginBottom: '20px' }}>
                {[
                  { label: 'Reports', value: String(reports.length), icon: '📊', color: '#E53935', bg: '#FFF5F5' },
                  {
                    label: 'Amount Lost',
                    value: '₦' + (reports.reduce((s, r) => s + (Number(r.amount_lost) || 0), 0) / 1000).toFixed(0) + 'k',
                    icon: '💸', color: '#FF9800', bg: '#FFF8F0',
                  },
                  { label: 'Victims', value: `${reports.length}+`, icon: '👥', color: '#9C27B0', bg: '#FFF0FF' },
                ].map(item => (
                  <div key={item.label} style={{ background: item.bg, borderRadius: '14px', padding: '14px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', marginBottom: '4px' }}>{item.icon}</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: '10px', color: '#8896A5', fontWeight: '500' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Report List */}
            {reports.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: 0 }}>Report Details</h3>
                {reports.map((r, i) => (
                  <div key={r.id || i} style={{
                    background: 'white', borderRadius: '14px',
                    padding: '16px', border: '1px solid #ECEFF1',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: 0 }}>
                        {r.business_name || r.phone}
                      </h4>
                      <span style={{
                        background: RISK_BG[r.risk_level] || '#FFF5F5',
                        color: RISK_COLOR[r.risk_level] || '#E53935',
                        fontSize: '10px', fontWeight: '700',
                        padding: '3px 8px', borderRadius: '20px',
                        flexShrink: 0, marginLeft: '8px',
                      }}>
                        {r.scam_type}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#8896A5', margin: '0 0 10px 0', lineHeight: '1.5' }}>
                      {r.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {r.amount_lost && (
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#E53935' }}>
                          ₦{Number(r.amount_lost).toLocaleString()} lost
                        </span>
                      )}
                      <span style={{ fontSize: '11px', color: '#B0BEC5' }}>
                        {r.created_at ? timeAgo(r.created_at) : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No reports — safe prompt */}
            {reports.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <button
                  onClick={() => navigate('/report-scam')}
                  style={{
                    background: '#FFF5F5', color: '#E53935',
                    border: '1.5px solid #FFE0E0', borderRadius: '12px',
                    padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                  }}
                >
                  ⚠️ Report this number
                </button>
                <p style={{ fontSize: '12px', color: '#B0BEC5', marginTop: '8px' }}>
                  Know something? Help protect others.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
