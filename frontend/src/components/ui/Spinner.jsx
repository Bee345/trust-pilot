export default function Spinner({ size = 24, color = '#E53935' }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `3px solid rgba(0,0,0,0.08)`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0,
      }}
    />
  );
}
