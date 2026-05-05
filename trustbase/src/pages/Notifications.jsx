import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, ShieldAlert, MessageCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'alert',
    title: 'New Scam Reported Near You',
    desc: 'A new HIGH RISK report was filed for a number in Lagos. Stay alert.',
    time: '2 hours ago',
    read: false,
    icon: AlertTriangle,
    color: '#E53935',
    bg: '#FFF5F5',
  },
  {
    id: 2,
    type: 'report',
    title: 'Your Report Was Published',
    desc: 'Your report on "Ada Chioma Boutique" has been verified and is now live.',
    time: '1 day ago',
    read: false,
    icon: CheckCircle2,
    color: '#00C853',
    bg: '#F0FFF4',
  },
  {
    id: 3,
    type: 'info',
    title: 'Verification Update',
    desc: 'Your verification application is currently under review. Expected: 1-2 business days.',
    time: '2 days ago',
    read: true,
    icon: Info,
    color: '#FF9800',
    bg: '#FFF8F0',
  },
  {
    id: 4,
    type: 'comment',
    title: 'Someone upvoted your report',
    desc: '18 people found your report on "Ada Chioma Boutique" helpful.',
    time: '3 days ago',
    read: true,
    icon: MessageCircle,
    color: '#1565C0',
    bg: '#EEF2FF',
  },
  {
    id: 5,
    type: 'alert',
    title: 'Number You Searched Was Reported',
    desc: '08098765432 (a number you searched) now has 3 new reports. Check before sending money.',
    time: '5 days ago',
    read: true,
    icon: Bell,
    color: '#E53935',
    bg: '#FFF5F5',
  },
];

const NOTIFICATION_SETTINGS = [
  { key: 'scam_alerts', label: 'Scam Alerts Near You', desc: 'Get notified when new reports are near your area', enabled: true },
  { key: 'report_updates', label: 'Report Status Updates', desc: 'Updates on your submitted reports', enabled: true },
  { key: 'verification', label: 'Verification Updates', desc: 'Changes to your verification status', enabled: true },
  { key: 'community', label: 'Community Activity', desc: 'Upvotes and comments on your reports', enabled: false },
  { key: 'promotions', label: 'Promotions & News', desc: 'TrustBase news and offers', enabled: false },
];

export default function Notifications() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('inbox');
  const [settings, setSettings] = useState(
    Object.fromEntries(NOTIFICATION_SETTINGS.map(s => [s.key, s.enabled]))
  );
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
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
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: 0 }}>Notifications</h1>
          {unreadCount > 0 && (
            <span style={{ background: '#E53935', color: 'white', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' }}>
              {unreadCount} new
            </span>
          )}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: '0 0 0 48px' }}>
          Stay updated on scam alerts & your reports
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', marginTop: '-20px', position: 'relative', zIndex: 10, minHeight: 'calc(100vh - 120px)' }}>
        {/* Tabs */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{ background: '#F5F6FA', borderRadius: '12px', padding: '4px', display: 'flex', marginBottom: '16px' }}>
            {[{ key: 'inbox', label: `Inbox${unreadCount > 0 ? ` (${unreadCount})` : ''}` }, { key: 'settings', label: 'Settings' }].map(t => (
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
          {tab === 'inbox' && (
            <>
              {unreadCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                  <button
                    onClick={markAllRead}
                    style={{ background: 'none', border: 'none', color: '#E53935', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Mark all as read
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {notifications.map((notif, idx) => {
                  const Icon = notif.icon;
                  return (
                    <div
                      key={notif.id}
                      onClick={() => setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                      style={{
                        background: notif.read ? 'white' : '#FAFBFF',
                        borderRadius: '16px',
                        padding: '14px 16px',
                        display: 'flex', gap: '12px', alignItems: 'flex-start',
                        border: notif.read ? '1px solid #ECEFF1' : `1.5px solid ${notif.color}33`,
                        boxShadow: notif.read ? '0 2px 8px rgba(0,0,0,0.04)' : `0 4px 16px ${notif.color}15`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        animation: `fadeInUp 0.4s ease ${idx * 0.07}s both`,
                      }}
                    >
                      {!notif.read && (
                        <div style={{
                          position: 'absolute', top: '14px', right: '12px',
                          width: '8px', height: '8px',
                          borderRadius: '50%', background: '#E53935',
                        }} />
                      )}
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '14px',
                        background: notif.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={22} color={notif.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>
                        <p style={{ fontSize: '14px', fontWeight: notif.read ? '600' : '700', color: '#1A2B3C', margin: '0 0 4px 0' }}>
                          {notif.title}
                        </p>
                        <p style={{ fontSize: '12px', color: '#8896A5', margin: '0 0 6px 0', lineHeight: '1.5' }}>
                          {notif.desc}
                        </p>
                        <span style={{ fontSize: '11px', color: '#B0BEC5', fontWeight: '500' }}>{notif.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {tab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '13px', color: '#8896A5', marginBottom: '4px', lineHeight: '1.5' }}>
                Choose which notifications you want to receive. You can change these at any time.
              </p>
              {NOTIFICATION_SETTINGS.map((s, idx) => (
                <div
                  key={s.key}
                  style={{
                    background: 'white', borderRadius: '16px', padding: '16px',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    border: '1px solid #ECEFF1',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    animation: `fadeInUp 0.3s ease ${idx * 0.07}s both`,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 3px 0' }}>{s.label}</p>
                    <p style={{ fontSize: '12px', color: '#8896A5', margin: 0 }}>{s.desc}</p>
                  </div>
                  <div
                    onClick={() => setSettings({ ...settings, [s.key]: !settings[s.key] })}
                    style={{
                      width: '48px', height: '26px', borderRadius: '13px',
                      background: settings[s.key] ? '#E53935' : '#E0E4EC',
                      position: 'relative', cursor: 'pointer',
                      transition: 'background 0.2s ease', flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: 'white',
                      position: 'absolute', top: '3px',
                      left: settings[s.key] ? '25px' : '3px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
