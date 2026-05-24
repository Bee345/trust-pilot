export default function Input({ id, label, type = 'text', placeholder, value, onChange, error, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          htmlFor={id}
          style={{ fontSize: '12px', fontWeight: '600', color: '#546E7A' }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? 'true' : undefined}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: '12px',
          border: `1.5px solid ${error ? '#E53935' : '#ECEFF1'}`,
          fontSize: '14px',
          color: '#1A2B3C',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      {error && (
        <span id={`${id}-error`} role="alert" style={{ fontSize: '12px', color: '#E53935' }}>
          {error}
        </span>
      )}
    </div>
  );
}
