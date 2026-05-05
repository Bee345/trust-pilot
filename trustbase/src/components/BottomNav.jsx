import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, ShieldCheck, Menu, Plus } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/reports-list', icon: Search, label: 'Reports' },
  { to: '/report-scam', icon: Plus, label: 'Report', isCTA: true },
  { to: '/verified-profile', icon: ShieldCheck, label: 'Verified' },
  { to: '/more', icon: Menu, label: 'More' },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      zIndex: 1000,
      paddingBottom: 'env(safe-area-inset-bottom)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '72px',
        padding: '0 8px',
      }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label, isCTA }) => {
          const isActive = location.pathname === to;

          if (isCTA) {
            return (
              <NavLink
                key={to}
                to={to}
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
              >
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E53935, #C62828)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(229,57,53,0.45)',
                  marginTop: '-18px',
                  transition: 'all 0.2s ease',
                  border: '3px solid white',
                }}>
                  <Icon size={24} color="white" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: '10px', fontWeight: '600', color: '#E53935', lineHeight: '1' }}>
                  {label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1, padding: '4px 0' }}
            >
              {({ isActive }) => (
                <>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '12px',
                    background: isActive ? 'rgba(229,57,53,0.1)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}>
                    <Icon 
                      size={22} 
                      color={isActive ? '#E53935' : '#B0BEC5'} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? '#E53935' : '#B0BEC5',
                    lineHeight: '1',
                    transition: 'all 0.2s ease',
                  }}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
