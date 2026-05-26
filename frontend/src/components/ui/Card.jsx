export default function Card({ children, onClick, style }) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined}
      style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #ECEFF1',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
