import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Star, Share2, MessageCircle, Phone, Globe, MapPin, ShieldCheck, Award } from 'lucide-react';

const reviews = [
  { id: 1, name: 'Amaka O.', initials: 'AO', rating: 5, text: 'Bought a dress and it arrived in 2 days, exactly as described. Very professional packaging.', time: '1 week ago', color: '#E53935' },
  { id: 2, name: 'Bayo K.', initials: 'BK', rating: 5, text: 'Ordered shoes. Quick delivery and very responsive customer service. Will order again!', time: '2 weeks ago', color: '#9C27B0' },
  { id: 3, name: 'Chidinma E.', initials: 'CE', rating: 4, text: 'Good quality products but delivery took a bit longer than expected. Overall I\'m satisfied.', time: '1 month ago', color: '#1565C0' },
];

export default function VerifiedProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div style={{ background: '#F5F6FA', minHeight: '100vh' }}>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
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

      {/* Cover Banner */}
      <div style={{
        height: '140px',
        background: 'linear-gradient(135deg, #E53935 0%, #9C27B0 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-30px', top: '-30px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }}/>
        <div style={{ position: 'absolute', left: '30%', bottom: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}/>
      </div>

      {/* Profile Info */}
      <div style={{ background: 'white', padding: '0 20px 20px', position: 'relative' }}>
        {/* Avatar + Share */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-40px', marginBottom: '16px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '80px', height: '80px',
              background: 'linear-gradient(135deg, #E53935, #9C27B0)',
              borderRadius: '22px',
              border: '3px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: '800', color: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}>
              EF
            </div>
            <div style={{
              position: 'absolute', bottom: '-4px', right: '-4px',
              background: '#00C853', borderRadius: '50%',
              width: '24px', height: '24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid white',
            }}>
              <CheckCircle2 size={13} color="white" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: '#F5F6FA', border: '1.5px solid #ECEFF1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <Share2 size={16} color="#546E7A" />
            </button>
            <button style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: '#F5F6FA', border: '1.5px solid #ECEFF1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
              <MessageCircle size={16} color="#546E7A" />
            </button>
          </div>
        </div>

        {/* Name + Badge */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1A2B3C', margin: 0 }}>
              Elite Fashion Store
            </h1>
            <div style={{
              background: '#00C853', borderRadius: '6px',
              padding: '3px 8px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <ShieldCheck size={12} color="white" />
              <span style={{ fontSize: '10px', color: 'white', fontWeight: '700' }}>VERIFIED</span>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: '#8896A5', margin: '0 0 10px 0' }}>
            Fashion & Accessories • Lagos, Nigeria
          </p>

          {/* Stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={16} color="#FFD700" fill="#FFD700" />
              ))}
            </div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C' }}>4.9</span>
            <span style={{ fontSize: '13px', color: '#8896A5' }}>(128 reviews)</span>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '0', background: '#F8F9FA', borderRadius: '14px', overflow: 'hidden', marginBottom: '16px' }}>
          {[
            { label: 'Trust Score', value: '98/100', color: '#00C853' },
            { label: 'Since', value: '2018', color: '#1A2B3C' },
            { label: 'Reviews', value: '128+', color: '#1A2B3C' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: '1px', background: '#ECEFF1' }}/>}
              <div style={{ flex: 1, padding: '14px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: '800', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: '#8896A5', fontWeight: '500', marginTop: '2px' }}>{s.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{
            flex: 1, padding: '13px',
            background: 'linear-gradient(135deg, #00C853, #1B5E20)',
            border: 'none', borderRadius: '14px',
            color: 'white', fontWeight: '700', fontSize: '14px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            boxShadow: '0 4px 20px rgba(0,200,83,0.3)',
          }}>
            <Phone size={16} /> Contact
          </button>
          <button className="btn-primary" style={{ flex: 1, borderRadius: '14px', fontSize: '14px', padding: '13px' }}>
            🌐 Visit Shop
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #ECEFF1', padding: '0 20px', marginTop: '8px' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {['about', 'reviews', 'badges'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '14px 8px',
                border: 'none', background: 'none',
                fontSize: '13px', fontWeight: '700',
                cursor: 'pointer',
                color: activeTab === tab ? '#E53935' : '#8896A5',
                borderBottom: `2px solid ${activeTab === tab ? '#E53935' : 'transparent'}`,
                transition: 'all 0.2s ease',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '20px' }}>
        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 10px 0' }}>About</h3>
              <p style={{ fontSize: '13px', color: '#546E7A', lineHeight: '1.6', margin: 0 }}>
                Elite Fashion Store is a trusted online boutique specializing in high-quality fashion, accessories, 
                and footwear. We've been serving Nigerian customers since 2018 with fast delivery nationwide and 
                a commitment to authentic products.
              </p>
            </div>

            {[
              { icon: '📍', label: 'Location', value: '15 Broad Street, Lagos Island' },
              { icon: '📞', label: 'Phone', value: '08012345678' },
              { icon: '🌐', label: 'Website', value: 'elitfashion.ng' },
              { icon: '📅', label: 'Member Since', value: 'January 2018' },
              { icon: '🏢', label: 'CAC Number', value: 'RC-1234567' },
            ].map(item => (
              <div key={item.label} style={{ background: 'white', borderRadius: '14px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: '11px', color: '#8896A5', margin: '0 0 2px 0' }}>{item.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A2B3C', margin: 0 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.3s ease' }}>
            {reviews.map((r, idx) => (
              <div key={r.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', animation: `fadeInUp 0.4s ease ${idx * 0.1}s both` }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                    {r.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: 0 }}>{r.name}</p>
                      <span style={{ fontSize: '11px', color: '#B0BEC5' }}>{r.time}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={12} color="#FFD700" fill={s <= r.rating ? '#FFD700' : '#E0E0E0'} />
                      ))}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#546E7A', lineHeight: '1.6', margin: 0 }}>{r.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'badges' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.3s ease' }}>
            {[
              { emoji: '✅', title: 'Identity Verified', desc: 'Real identity confirmed by TrustBase team', color: '#00C853', bg: '#F0FFF4' },
              { emoji: '🏢', title: 'CAC Registered', desc: 'Business registered with Corporate Affairs Commission', color: '#1565C0', bg: '#E3F2FD' },
              { emoji: '⭐', title: 'Top Rated', desc: 'Maintains 4.8+ star average rating', color: '#FF9800', bg: '#FFF8F0' },
              { emoji: '🚀', title: 'Quick Responder', desc: 'Responds to messages within 30 minutes', color: '#9C27B0', bg: '#F3E5F5' },
              { emoji: '🛡️', title: 'Zero Reports', desc: 'No scam reports on record — clean history', color: '#00C853', bg: '#F0FFF4' },
            ].map((badge, idx) => (
              <div key={badge.title} style={{ background: 'white', borderRadius: '16px', padding: '16px', display: 'flex', gap: '14px', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', animation: `fadeInUp 0.4s ease ${idx * 0.08}s both` }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                  {badge.emoji}
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A2B3C', margin: '0 0 4px 0' }}>{badge.title}</p>
                  <p style={{ fontSize: '12px', color: '#8896A5', margin: 0, lineHeight: '1.4' }}>{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom spacer */}
      <div style={{ height: '100px' }}/>
    </div>
  );
}
