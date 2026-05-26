import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, AlertTriangle } from 'lucide-react';
import { getSocket } from '../lib/socket';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function handleNewReport(report) {
      setNotifications(prev => [
        {
          id: report.id ?? Date.now(),
          title: 'New Scam Report',
          desc: `A new ${report.risk_level ?? ''} risk report was filed for ${report.business_name || report.phone || 'an entity'}.`,
          time: new Date().toLocaleTimeString(),
          read: false,
        },
        ...prev,
      ]);
    }

    socket.on('new_report', handleNewReport);
    return () => { socket.off('new_report', handleNewReport); };
  }, []);

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
        <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' }}>Notifications</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 }}>Live scam alerts from your community</p>
      </div>

      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', marginTop: '-20px', position: 'relative', zIndex: 10, minHeight: 'calc(100vh - 120px)', padding: '20px 20px 100px' }}>

        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#F5F6FA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Bell size={32} color="#B0BEC5" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1A2B3C', marginBottom: '6px' }}>No notifications yet</h3>
            <p style={{ fontSize: '14px', color: '#8896A5' }}>New scam reports will appear here in real time</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map(n => (
              <div
                key={n.id}
                style={{
                  background: n.read ? 'white' : '#FFF5F5',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  border: `1px solid ${n.read ? '#ECEFF1' : 'rgba(229,57,53,0.15)'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: '#FFF5F5', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertTriangle size={20} color="#E53935" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 4px 0' }}>{n.title}</p>
                  <p style={{ fontSize: '13px', color: '#546E7A', margin: '0 0 6px 0', lineHeight: '1.5' }}>{n.desc}</p>
                  <span style={{ fontSize: '11px', color: '#B0BEC5' }}>{n.time}</span>
                </div>
                {!n.read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E53935', flexShrink: 0, marginTop: '4px' }}/>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
