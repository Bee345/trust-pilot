const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, #E53935, #C62828)',
    color: 'white',
    border: 'none',
  },
  secondary: {
    background: '#F5F6FA',
    color: '#1A2B3C',
    border: '1.5px solid #ECEFF1',
  },
  ghost: {
    background: 'none',
    color: '#E53935',
    border: 'none',
  },
};

export default function Button({ children, variant = 'primary', disabled, onClick, style, 'aria-label': ariaLabel }) {
  const base = VARIANTS[variant] ?? VARIANTS.primary;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      style={{
        ...base,
        padding: '14px 20px',
        borderRadius: '12px',
        fontSize: '15px',
        fontWeight: '700',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        width: '100%',
        outline: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
