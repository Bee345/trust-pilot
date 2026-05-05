import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, AlertTriangle, CheckCircle2, ChevronRight, MessageCircle, Share2, Flag } from 'lucide-react';

export default function SearchResults() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('08012345678');
  const [activeTab, setActiveTab] = useState('risk'); // 'risk' or 'safe'

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>
      
      {/* Search Header */}
      <div style={{
        background: 'white',
        padding: '16px 20px',
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
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                paddingLeft: '38px',
                borderRadius: '10px',
                fontSize: '14px',
                height: '40px',
                padding: '0 12px 0 36px',
              }}
            />
          </div>
          <button style={{
            background: '#E53935', border: 'none', borderRadius: '10px',
            color: 'white', fontSize: '13px', fontWeight: '700',
            padding: '0 16px', height: '40px', cursor: 'pointer', flexShrink: 0,
          }}>
            Go
          </button>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        
        {/* Result Summary */}
        <div style={{
          background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
          borderRadius: '20px',
          padding: '20px',
          marginBottom: '16px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', right: '-30px', top: '-30px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}/>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '52px', height: '52px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}>
              <AlertTriangle size={28} color="#FFD700" fill="rgba(255,215,0,0.3)" />
            </div>
            <div>
              <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '800', margin: 0, marginBottom: '2px' }}>
                HIGH RISK ⚠️
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: 0 }}>
                {query} • 3 Reports Found
              </p>
            </div>
          </div>

          {/* Risk Score Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>Risk Score</span>
              <span style={{ fontSize: '12px', color: 'white', fontWeight: '700' }}>87/100</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px' }}>
              <div style={{ 
                width: '87%', height: '100%', 
                background: 'linear-gradient(90deg, #FFD700, #FF6B6B)',
                borderRadius: '3px',
                transition: 'width 1s ease',
              }}/>
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Fraudulent Seller', 'Blocked After Payment', 'Multiple Victims'].map(tag => (
              <span key={tag} style={{
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                fontSize: '11px', fontWeight: '600',
                padding: '4px 10px', borderRadius: '20px',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/reports-list')}
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

        {/* Summary Cards */}
        <div className="grid-3" style={{ marginBottom: '20px' }}>
          {[
            { label: 'Reports', value: '3', icon: '📊', color: '#E53935', bg: '#FFF5F5' },
            { label: 'Amount Lost', value: '₦285k', icon: '💸', color: '#FF9800', bg: '#FFF8F0' },
            { label: 'Victims', value: '5+', icon: '👥', color: '#9C27B0', bg: '#FFF0FF' },
          ].map(item => (
            <div key={item.label} style={{
              background: item.bg, borderRadius: '14px',
              padding: '14px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{item.icon}</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '10px', color: '#8896A5', fontWeight: '500' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Report Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: 0 }}>Report Details</h3>
          {[
            {
              title: 'Fraudulent iPhone Seller',
              desc: 'Paid for iPhone 13 Pro. Seller blocked after receiving ₦220,000.',
              amount: '₦220,000',
              time: '2 days ago',
              type: 'Online Scam',
            },
            {
              title: 'Clothing Vendor Scam',
              desc: 'Ordered clothes, vendor disappeared after payment.',
              amount: '₦45,000',
              time: '1 week ago',
              type: 'Product Scam',
            },
            {
              title: 'POS Agent Fraud',
              desc: 'Collected cash for POS transaction but didn\'t complete it.',
              amount: '₦20,000',
              time: '2 weeks ago',
              type: 'POS Fraud',
            },
          ].map((r, i) => (
            <div
              key={i}
              style={{
                background: 'white', borderRadius: '14px',
                padding: '16px', border: '1px solid #ECEFF1',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: 0 }}>{r.title}</h4>
                <span style={{
                  background: '#FFF5F5', color: '#E53935',
                  fontSize: '10px', fontWeight: '700',
                  padding: '3px 8px', borderRadius: '20px',
                  flexShrink: 0, marginLeft: '8px',
                }}>
                  {r.type}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#8896A5', margin: '0 0 10px 0', lineHeight: '1.5' }}>{r.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#E53935' }}>{r.amount} lost</span>
                <span style={{ fontSize: '11px', color: '#B0BEC5' }}>{r.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Safe Result Card (also shown) */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          border: '1.5px solid #C6F6D5',
          marginBottom: '20px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #00C853 0%, #1B5E20 100%)',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <CheckCircle2 size={24} color="white" />
            <div>
              <h3 style={{ color: 'white', margin: 0, fontSize: '16px', fontWeight: '700' }}>Also Searched: Elite Fashion Store</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '12px' }}>Verified & Trusted Business</p>
            </div>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#00C853' }}>98</div>
                <div style={{ fontSize: '11px', color: '#8896A5' }}>Trust Score</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#1A2B3C' }}>120+</div>
                <div style={{ fontSize: '11px', color: '#8896A5' }}>Reviews</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#1A2B3C' }}>6yr</div>
                <div style={{ fontSize: '11px', color: '#8896A5' }}>Active</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
