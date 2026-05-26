import { useEffect, useRef } from 'react';
import { X, Phone, Building2, AlertTriangle, Calendar, ThumbsUp } from 'lucide-react';
import { timeAgo } from '../utils/format';

const RISK_CONFIG = {
  high:   { label: 'HIGH RISK', bg: '#FFF5F5', color: '#E53935', border: 'rgba(229,57,53,0.2)' },
  medium: { label: 'CAUTION',   bg: '#FFF8F0', color: '#FF9800', border: 'rgba(255,152,0,0.2)' },
  low:    { label: 'LOW RISK',  bg: '#F0FFF4', color: '#00C853', border: 'rgba(0,200,83,0.2)'  },
};

export default function ReportDetailModal({ report, onClose }) {
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!report) {return;}

    triggerRef.current = document.activeElement;
    panelRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(e) {
      if (e.key === 'Escape') {onClose();}

      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      triggerRef.current?.focus();
    };
  }, [report, onClose]);

  if (!report) {return null;}

  const risk = RISK_CONFIG[report.risk_level] || RISK_CONFIG.low;
  const reporterLabel = report.anonymous ? 'Anonymous' : 'Community Member';
  const amountLost = report.amount_lost
    ? `₦${Number(report.amount_lost).toLocaleString('en-NG')}`
    : null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Report details"
        aria-describedby="modal-description"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '24px 24px 0 0',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          outline: 'none',
          animation: 'slideUp 0.25s ease',
        }}
      >
        <div style={{ height: '4px', background: risk.color === '#E53935'
          ? 'linear-gradient(90deg, #E53935, #C62828)'
          : risk.color === '#FF9800'
            ? 'linear-gradient(90deg, #FF9800, #E65100)'
            : 'linear-gradient(90deg, #00C853, #1B5E20)',
          borderRadius: '24px 24px 0 0',
        }} />

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <span style={{
                background: risk.bg,
                color: risk.color,
                border: `1px solid ${risk.border}`,
                fontSize: '10px', fontWeight: '800',
                padding: '4px 10px', borderRadius: '20px',
                letterSpacing: '0.5px', display: 'inline-block', marginBottom: '8px',
              }}>
                {risk.label}
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1A2B3C', margin: 0 }}>
                {report.business_name || report.scam_type || 'Report Details'}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Close report details"
              style={{
                background: '#F5F6FA', border: 'none', borderRadius: '12px',
                width: '36px', height: '36px', flexShrink: 0, marginLeft: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={18} color="#546E7A" />
            </button>
          </div>

          <div id="modal-description" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {report.phone && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={16} color="#E53935" />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#B0BEC5', margin: '0 0 2px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</p>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#1A2B3C', margin: 0 }}>{report.phone}</p>
                </div>
              </div>
            )}

            {report.business_name && (
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F0F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={16} color="#1565C0" />
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#B0BEC5', margin: '0 0 2px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Business</p>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#1A2B3C', margin: 0 }}>{report.business_name}</p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFF8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={16} color="#FF9800" />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#B0BEC5', margin: '0 0 2px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Scam Type</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: 0 }}>{report.scam_type}</p>
              </div>
            </div>

            {amountLost && (
              <div style={{ background: '#FFF5F5', borderRadius: '14px', padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>💸</span>
                <div>
                  <p style={{ fontSize: '11px', color: '#B0BEC5', margin: '0 0 2px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Amount Lost</p>
                  <p style={{ fontSize: '18px', fontWeight: '800', color: '#E53935', margin: 0 }}>{amountLost}</p>
                </div>
              </div>
            )}

            <div>
              <p style={{ fontSize: '11px', color: '#B0BEC5', margin: '0 0 6px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</p>
              <p style={{ fontSize: '14px', color: '#546E7A', lineHeight: '1.6', margin: 0, background: '#F8F9FA', borderRadius: '12px', padding: '12px' }}>
                {report.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, background: '#F8F9FA', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                  <ThumbsUp size={14} color="#8896A5" />
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#1A2B3C' }}>{report.upvote_count ?? 0}</span>
                </div>
                <p style={{ fontSize: '11px', color: '#B0BEC5', margin: 0 }}>Found helpful</p>
              </div>
              <div style={{ flex: 1, background: '#F8F9FA', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Calendar size={14} color="#8896A5" />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#1A2B3C' }}>{timeAgo(report.created_at)}</span>
                </div>
                <p style={{ fontSize: '11px', color: '#B0BEC5', margin: 0 }}>Reported</p>
              </div>
            </div>

            <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E8EDF2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                👤
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#B0BEC5', margin: '0 0 2px 0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reported by</p>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#546E7A', margin: 0 }}>{reporterLabel}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
