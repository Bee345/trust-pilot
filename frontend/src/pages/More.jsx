import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, ShieldCheck, Info, HelpCircle, 
  Headphones, FileBadge, FileText, Settings, 
  Share2, Star, LogOut, Bell, Lock, Eye 
} from 'lucide-react';

function MenuSection({ title, children }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <p style={{ 
        fontSize: '11px', fontWeight: '700', color: '#B0BEC5',
        textTransform: 'uppercase', letterSpacing: '1px',
        padding: '12px 20px 8px',
      }}>
        {title}
      </p>
      <div style={{ background: 'white' }}>
        {children}
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, iconBg, title, subtitle, onClick, badge, isDestructive = false }) {
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center',
        padding: '14px 20px',
        borderBottom: '1px solid #F8F9FA',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        gap: '14px',
      }}
      onMouseDown={e => e.currentTarget.style.background = '#F8F9FA'}
      onMouseUp={e => e.currentTarget.style.background = 'white'}
      onMouseLeave={e => e.currentTarget.style.background = 'white'}
    >
      <div style={{
        width: '40px', height: '40px',
        background: iconBg || '#F5F6FA',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={18} color={isDestructive ? '#E53935' : '#546E7A'} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ 
          fontSize: '14px', fontWeight: '600',
          color: isDestructive ? '#E53935' : '#1A2B3C',
          margin: 0, marginBottom: subtitle ? '2px' : 0,
        }}>
          {title}
        </p>
        {subtitle && <p style={{ fontSize: '12px', color: '#8896A5', margin: 0 }}>{subtitle}</p>}
      </div>
      {badge && (
        <span style={{
          background: '#E53935', color: 'white',
          fontSize: '10px', fontWeight: '700',
          padding: '3px 8px', borderRadius: '20px',
          marginRight: '4px',
        }}>
          {badge}
        </span>
      )}
      <ChevronRight size={16} color="#D0D8E4" />
    </div>
  );
}

export default function More() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2B3C 0%, #0D1B2A 100%)',
        padding: '20px 20px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }}/>
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 0 4px 0', position: 'relative' }}>
          Menu
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0, position: 'relative' }}>
          Your account & settings
        </p>
      </div>

      {/* Profile Card */}
      <div style={{
        background: 'white',
        borderRadius: '24px 24px 0 0',
        marginTop: '-20px',
        position: 'relative', zIndex: 10,
        paddingTop: '20px',
      }}>
        <div
          onClick={() => navigate('/profile')}
          style={{
            margin: '0 20px 16px',
            background: 'linear-gradient(135deg, #F8F9FA, #FFFFFF)',
            border: '1.5px solid #ECEFF1',
            borderRadius: '20px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
          }}
        >
          {/* Avatar */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '58px', height: '58px',
              background: 'linear-gradient(135deg, #E53935, #C62828)',
              borderRadius: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: '800', color: 'white',
              boxShadow: '0 4px 14px rgba(229,57,53,0.3)',
            }}>
              JD
            </div>
            {/* Unverified badge */}
            <div style={{
              position: 'absolute', bottom: '-4px', right: '-4px',
              background: '#FF9800', borderRadius: '10px',
              padding: '2px 6px',
              fontSize: '9px', fontWeight: '800',
              color: 'white', border: '2px solid white',
            }}>
              FREE
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#1A2B3C', margin: '0 0 2px 0' }}>
              John Doe
            </h2>
            <p style={{ fontSize: '13px', color: '#8896A5', margin: '0 0 8px 0' }}>08012345678</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{
                background: '#FFF3E0', color: '#FF9800',
                fontSize: '10px', fontWeight: '700',
                padding: '3px 8px', borderRadius: '20px',
              }}>
                Unverified
              </span>
              <span style={{
                background: '#F0F4FF', color: '#1565C0',
                fontSize: '10px', fontWeight: '700',
                padding: '3px 8px', borderRadius: '20px',
              }}>
                3 Reports
              </span>
            </div>
          </div>

          <div style={{
            background: '#E53935', color: 'white',
            fontSize: '11px', fontWeight: '700',
            padding: '8px 12px', borderRadius: '12px',
            flexShrink: 0,
          }}>
            Edit
          </div>
        </div>

        {/* Get Verified CTA */}
        <div
          onClick={() => navigate('/get-verified')}
          style={{
            margin: '0 20px 16px',
            background: 'linear-gradient(135deg, #E53935, #C62828)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(229,57,53,0.3)',
          }}
        >
          <ShieldCheck size={28} color="white" />
          <div style={{ flex: 1 }}>
            <p style={{ color: 'white', fontWeight: '700', fontSize: '14px', margin: 0 }}>Get Verified Today</p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: 0 }}>
              Build trust from just ₦2,000
            </p>
          </div>
          <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
        </div>

        {/* Menu Sections */}
        <MenuSection title="Discover">
          <MenuItem icon={Info} iconBg="#EEF2FF" title="How TrustBase Works" subtitle="Learn about our verification system" />
          <MenuItem icon={ShieldCheck} iconBg="#F0FFF4" title="Safety Tips" subtitle="Avoid online scams in Nigeria" />
          <MenuItem icon={HelpCircle} iconBg="#FFF8F0" title="Frequently Asked Questions" subtitle="Get help quickly" />
          <MenuItem icon={Headphones} iconBg="#EEF2FF" title="Contact Support" subtitle="We respond within 2 hours" badge="24/7" />
        </MenuSection>

        <MenuSection title="Account">
          <MenuItem 
            icon={FileBadge} iconBg="#F0FFF4" 
            title="My Verifications" subtitle="Track your verification status"
            onClick={() => navigate('/verification-status')} 
          />
          <MenuItem 
            icon={FileText} iconBg="#FFF5F5" 
            title="My Reports" subtitle="View and manage your submitted reports"
            onClick={() => navigate('/my-reports')} 
            badge="3"
          />
          <MenuItem 
            icon={Bell} iconBg="#FFF8F0" title="Notifications" subtitle="Manage alerts and updates"
            onClick={() => navigate('/notifications')} 
          />
          <MenuItem icon={Lock} iconBg="#F0F4FF" title="Privacy & Security" subtitle="Manage your data and account" onClick={() => navigate('/privacy-security')} />
          <MenuItem icon={Eye} iconBg="#F5F6FA" title="Privacy Settings" subtitle="Control what others see" onClick={() => navigate('/privacy-settings')} />
        </MenuSection>

        <MenuSection title="Community">
          <MenuItem icon={Share2} iconBg="#F0FFF4" title="Share TrustBase" subtitle="Help a friend stay safe" />
          <MenuItem icon={Star} iconBg="#FFF8F0" title="Rate Our App" subtitle="You're using v1.2.0" />
        </MenuSection>

        {/* Log Out */}
        <div style={{ padding: '8px 20px 40px' }}>
          <div
            style={{
              background: '#FFF5F5',
              border: '1.5px solid rgba(229,57,53,0.15)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <MenuItem
              icon={LogOut}
              iconBg="#FFE8E8"
              title="Log Out"
              isDestructive
            />
          </div>
          <p style={{ textAlign: 'center', fontSize: '11px', color: '#B0BEC5', marginTop: '20px' }}>
            TrustBase v1.2.0 • Made with ❤️ in Nigeria
          </p>
        </div>
      </div>
    </div>
  );
}
