import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Camera, MapPin, Phone, Mail, ShieldCheck, Star, FileText, Check } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: 'John Doe',
    phone: '08012345678',
    email: 'johndoe@email.com',
    location: 'Lagos, Nigeria',
    bio: 'Protecting myself and my community from online scams 🛡️',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'absolute', top: '16px', left: '16px', zIndex: 200,
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
          border: 'none', borderRadius: '10px',
          width: '38px', height: '38px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <ArrowLeft size={20} color="#1A2B3C" />
      </button>

      {/* Cover */}
      <div style={{
        height: '160px',
        background: 'linear-gradient(135deg, #1A2B3C 0%, #E53935 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ position: 'absolute', left: '20%', bottom: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      </div>

      {/* Profile Info */}
      <div style={{ background: 'white', padding: '0 20px 20px', position: 'relative' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-44px', marginBottom: '16px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '88px', height: '88px',
              background: 'linear-gradient(135deg, #E53935, #C62828)',
              borderRadius: '24px',
              border: '4px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', fontWeight: '900', color: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}>
              JD
            </div>
            <button style={{
              position: 'absolute', bottom: '-4px', right: '-4px',
              width: '28px', height: '28px',
              background: '#1A2B3C', borderRadius: '50%',
              border: '3px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <Camera size={13} color="white" />
            </button>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: editing ? '#FFF5F5' : '#F5F6FA',
              border: `1.5px solid ${editing ? 'rgba(229,57,53,0.3)' : '#ECEFF1'}`,
              borderRadius: '12px', padding: '8px 16px',
              color: editing ? '#E53935' : '#546E7A',
              fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            }}
          >
            <Edit2 size={14} />
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {saved && (
          <div style={{ background: '#F0FFF4', border: '1.5px solid #C6F6D5', borderRadius: '12px', padding: '12px', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
            <Check size={16} color="#00C853" />
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#1B5E20', margin: 0 }}>Profile updated successfully!</p>
          </div>
        )}

        {!editing ? (
          <>
            <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1A2B3C', margin: 0 }}>{form.name}</h1>
              <span style={{ background: '#FFF3E0', color: '#FF9800', fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' }}>UNVERIFIED</span>
            </div>
            <p style={{ fontSize: '13px', color: '#8896A5', margin: '0 0 12px 0' }}>{form.bio}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {[
                { icon: Phone, value: form.phone },
                { icon: Mail, value: form.email },
                { icon: MapPin, value: form.location },
              ].map(({ icon: Icon, value }) => (
                <div key={value} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Icon size={14} color="#B0BEC5" />
                  <span style={{ fontSize: '13px', color: '#546E7A' }}>{value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} style={{ marginBottom: '16px' }}>
            {[
              { key: 'name', label: 'Full Name', type: 'text' },
              { key: 'phone', label: 'Phone Number', type: 'tel' },
              { key: 'email', label: 'Email Address', type: 'email' },
              { key: 'location', label: 'Location', type: 'text' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#546E7A', display: 'block', marginBottom: '6px' }}>{field.label}</label>
                <input
                  type={field.type}
                  className="form-control"
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  style={{ borderRadius: '12px', fontSize: '14px' }}
                />
              </div>
            ))}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#546E7A', display: 'block', marginBottom: '6px' }}>Bio</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                style={{ borderRadius: '12px', resize: 'none', fontSize: '14px' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ borderRadius: '12px', fontSize: '15px' }}>
              Save Changes
            </button>
          </form>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', background: '#F8F9FA', borderRadius: '16px', overflow: 'hidden' }}>
          {[
            { label: 'Reports', value: '3', icon: '📋' },
            { label: 'Helpful Votes', value: '46', icon: '👍' },
            { label: 'Trust Points', value: '120', icon: '⭐' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: '1px', background: '#ECEFF1' }} />}
              <div style={{ flex: 1, padding: '16px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#1A2B3C' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#8896A5', fontWeight: '500' }}>{s.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Verification Prompt */}
      <div style={{ padding: '16px 20px' }}>
        <div
          onClick={() => navigate('/get-verified')}
          style={{
            background: 'linear-gradient(135deg, #E53935, #C62828)',
            borderRadius: '18px', padding: '18px',
            display: 'flex', alignItems: 'center', gap: '14px',
            cursor: 'pointer', boxShadow: '0 6px 24px rgba(229,57,53,0.3)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShieldCheck size={28} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'white', fontWeight: '800', fontSize: '15px', margin: '0 0 4px 0' }}>Get Verified</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0 }}>Add a verified badge to your profile — from ₦2,000</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px', flexShrink: 0 }}>
            <Star size={18} color="white" fill="white" />
          </div>
        </div>
      </div>

      {/* Recent Reports section */}
      <div style={{ padding: '0 20px', marginBottom: '100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1A2B3C', margin: 0 }}>My Recent Reports</h3>
          <span onClick={() => navigate('/my-reports')} style={{ fontSize: '13px', color: '#E53935', fontWeight: '600', cursor: 'pointer' }}>See all</span>
        </div>
        {[
          { target: '08098765432', status: 'Under Review', statusColor: '#FF9800', bg: '#FFF8F0', time: '2 days ago' },
          { target: 'Ada Chioma Boutique', status: 'Published', statusColor: '#00C853', bg: '#F0FFF4', time: '1 week ago' },
        ].map((r, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', border: '1px solid #ECEFF1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#FFF5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={18} color="#E53935" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 2px 0' }}>{r.target}</p>
              <p style={{ fontSize: '11px', color: '#B0BEC5', margin: 0 }}>{r.time}</p>
            </div>
            <span style={{ background: r.bg, color: r.statusColor, fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' }}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
