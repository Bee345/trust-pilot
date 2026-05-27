import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Award, Phone, Star } from 'lucide-react';
import { api } from '../lib/api';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-NG', { year: 'numeric', month: 'short' });
}

function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

const AVATAR_COLORS = ['#E53935', '#9C27B0', '#1565C0', '#00897B', '#FF6F00', '#5C6BC0'];

export default function VerifiedProfile() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api.get('/api/companies/verified');
        if (!cancelled) {
          setUsers(data.users || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Something went wrong');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>

      <div style={{
        height: '140px',
        background: 'linear-gradient(135deg, #E53935 0%, #9C27B0 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '0 20px 16px',
      }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          style={{
            position: 'absolute', top: '16px', left: '16px', zIndex: 200,
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            border: 'none', borderRadius: '10px',
            width: '38px', height: '38px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <ArrowLeft size={20} color="#1A2B3C" />
        </button>
        <div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>
            Verified Profiles
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>
            People and businesses verified by TrustBase
          </p>
        </div>
      </div>

      <div style={{ padding: '20px' }}>

        {loading && (
          <div role="status" aria-live="polite" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: '40px', height: '40px', border: '3px solid #ECEFF1',
              borderTopColor: '#E53935', borderRadius: '50%',
              margin: '0 auto 12px',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: '#8896A5', fontSize: '14px' }}>Loading verified profiles...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!loading && error && (
          <div role="alert" style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'white', borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>!</div>
            <p style={{ color: '#E53935', fontSize: '14px', fontWeight: '600' }}>{error}</p>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'white', borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <ShieldCheck size={48} color="#ECEFF1" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 8px 0' }}>
              No verified profiles yet
            </h3>
            <p style={{ fontSize: '13px', color: '#8896A5', margin: 0, lineHeight: '1.6' }}>
              Verified individuals and businesses will appear here once they complete the TrustBase verification process.
            </p>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {users.map((user, idx) => (
              <div key={user.id} style={{
                background: 'white', borderRadius: '16px', padding: '16px',
                display: 'flex', gap: '14px', alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '700', fontSize: '18px', flexShrink: 0,
                  position: 'relative',
                }}>
                  {getInitials(user.name)}
                  <div style={{
                    position: 'absolute', bottom: '-3px', right: '-3px',
                    background: '#00C853', borderRadius: '50%',
                    width: '18px', height: '18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid white',
                  }}>
                    <ShieldCheck size={10} color="white" />
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <p style={{
                      fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: 0,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {user.name}
                    </p>
                    <span style={{
                      fontSize: '10px', fontWeight: '600', color: '#00C853',
                      background: '#F0FFF4', borderRadius: '4px', padding: '2px 6px',
                      flexShrink: 0,
                    }}>
                      {user.verification_type === 'business' ? 'Business' : 'Individual'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#8896A5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} /> {user.phone}
                    </span>
                    <span style={{ fontSize: '12px', color: '#8896A5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={12} /> {user.trust_points || 0} pts
                    </span>
                  </div>

                  <p style={{ fontSize: '11px', color: '#B0BEC5', margin: '4px 0 0 0' }}>
                    Verified since {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: '100px' }} />
    </div>
  );
}
