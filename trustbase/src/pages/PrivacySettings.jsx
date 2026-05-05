import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Users, Search, Phone, MapPin } from 'lucide-react';

const PRIVACY_OPTIONS = [
  {
    section: 'Profile Visibility',
    items: [
      {
        key: 'profile_public',
        label: 'Public Profile',
        desc: 'Anyone can see your name and report history',
        icon: Eye,
        iconBg: '#EEF2FF',
        iconColor: '#1565C0',
        options: ['Everyone', 'Verified Users Only', 'Nobody'],
        defaultOption: 'Everyone',
      },
      {
        key: 'show_in_search',
        label: 'Appear in Search',
        desc: 'Your profile appears when others search your number',
        icon: Search,
        iconBg: '#FFF5F5',
        iconColor: '#E53935',
        options: ['Yes', 'No'],
        defaultOption: 'Yes',
      },
    ],
  },
  {
    section: 'Contact Info',
    items: [
      {
        key: 'show_phone',
        label: 'Show Phone Number',
        desc: 'Display your phone number on your public profile',
        icon: Phone,
        iconBg: '#F0FFF4',
        iconColor: '#00C853',
        options: ['Everyone', 'Nobody'],
        defaultOption: 'Nobody',
      },
      {
        key: 'show_location',
        label: 'Show Location',
        desc: 'Show your city/state on your profile',
        icon: MapPin,
        iconBg: '#FFF8F0',
        iconColor: '#FF9800',
        options: ['Everyone', 'Nobody'],
        defaultOption: 'Everyone',
      },
    ],
  },
  {
    section: 'Data & Reports',
    items: [
      {
        key: 'anonymous_reports',
        label: 'Anonymous Reports by Default',
        desc: 'Your name is hidden from all new reports you submit',
        icon: Users,
        iconBg: '#F3E5F5',
        iconColor: '#9C27B0',
        options: ['Always', 'Never', 'Ask Each Time'],
        defaultOption: 'Ask Each Time',
      },
    ],
  },
];

export default function PrivacySettings() {
  const navigate = useNavigate();
  const [selections, setSelections] = useState(
    Object.fromEntries(
      PRIVACY_OPTIONS.flatMap(s => s.items).map(item => [item.key, item.defaultOption])
    )
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2B3C 0%, #0D1B2A 100%)',
        padding: '20px 20px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <ArrowLeft size={20} color="white" />
          </button>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: 0 }}>Privacy Settings</h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: '0 0 0 48px' }}>
          Control what others can see about you
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', marginTop: '-20px', position: 'relative', zIndex: 10, padding: '24px', minHeight: 'calc(100vh - 120px)' }}>

        {saved && (
          <div style={{ background: '#F0FFF4', border: '1.5px solid #C6F6D5', borderRadius: '14px', padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', animation: 'fadeIn 0.3s ease' }}>
            <span style={{ fontSize: '18px' }}>✅</span>
            <p style={{ fontSize: '13px', fontWeight: '700', color: '#1B5E20', margin: 0 }}>Privacy settings saved successfully!</p>
          </div>
        )}

        <p style={{ fontSize: '13px', color: '#8896A5', lineHeight: '1.6', marginBottom: '24px' }}>
          These settings control how your profile and activity appear to other TrustBase users.
          Your identity is never sold or shared with third parties.
        </p>

        {PRIVACY_OPTIONS.map((section, sIdx) => (
          <div key={section.section} style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#B0BEC5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              {section.section}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                const current = selections[item.key];
                return (
                  <div key={item.key} style={{ background: 'white', borderRadius: '18px', border: '1px solid #ECEFF1', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ padding: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '13px', background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={18} color={item.iconColor} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 2px 0' }}>{item.label}</p>
                        <p style={{ fontSize: '12px', color: '#8896A5', margin: 0, lineHeight: '1.4' }}>{item.desc}</p>
                      </div>
                    </div>

                    {/* Option Pills */}
                    <div style={{ padding: '0 16px 14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {item.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setSelections({ ...selections, [item.key]: opt })}
                          style={{
                            padding: '7px 14px', borderRadius: '20px',
                            border: current === opt ? `1.5px solid ${item.iconColor}` : '1.5px solid #ECEFF1',
                            background: current === opt ? item.iconBg : '#F8F9FA',
                            color: current === opt ? item.iconColor : '#8896A5',
                            fontSize: '12px', fontWeight: '700',
                            cursor: 'pointer', transition: 'all 0.15s ease',
                          }}
                        >
                          {current === opt ? '✓ ' : ''}{opt}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Data Usage Note */}
        <div style={{ background: '#F0F4FF', borderRadius: '16px', padding: '16px', marginBottom: '24px', border: '1px solid #D6E0FF' }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#1565C0', margin: '0 0 6px 0' }}>🔒 Your Data is Safe</p>
          <p style={{ fontSize: '12px', color: '#546E7A', margin: 0, lineHeight: '1.6' }}>
            TrustBase never sells your personal information. All data is encrypted and stored securely.
            You can request a full data export or deletion at any time.
          </p>
        </div>

        <button className="btn-primary" onClick={handleSave} style={{ borderRadius: '14px', marginBottom: '12px' }}>
          Save Privacy Settings
        </button>
        <button
          style={{ width: '100%', padding: '13px', borderRadius: '14px', background: 'none', border: '1.5px solid #ECEFF1', color: '#8896A5', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
        >
          Request My Data Export
        </button>

        <div style={{ height: '100px' }} />
      </div>
    </div>
  );
}
