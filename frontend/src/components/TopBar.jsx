import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TopBar = ({ title, rightElement, showBack = false, transparent = false }) => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: transparent ? 'transparent' : '#fff',
      borderBottom: transparent ? 'none' : '1px solid #F0F2F5',
      minHeight: '56px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: !transparent ? 'blur(10px)' : 'none',
    }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        {showBack && (
          <button 
            onClick={() => navigate(-1)} 
            style={{
              background: '#F5F6FA',
              border: 'none',
              borderRadius: '10px',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              transition: 'background 0.15s ease',
            }}
            onMouseDown={e => e.currentTarget.style.background = '#ECEFF1'}
            onMouseUp={e => e.currentTarget.style.background = '#F5F6FA'}
          >
            <ArrowLeft size={20} color="#1A2B3C" />
          </button>
        )}
      </div>
      
      <div style={{ flex: 2, display: 'flex', justifyContent: 'center' }}>
        {title && (
          <h1 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#1A2B3C',
            margin: 0,
            textAlign: 'center',
            letterSpacing: '-0.2px',
          }}>
            {title}
          </h1>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
        {rightElement}
      </div>
    </div>
  );
};

export default TopBar;
