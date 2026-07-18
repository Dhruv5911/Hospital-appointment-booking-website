export default function Spinner({ size = 24, color, className = '' }) {
  return (
    <div
      className={`animate-spin ${className}`}
      style={{
        width: size,
        height: size,
        border: `3px solid rgba(255,255,255,0.1)`,
        borderTopColor: color || 'var(--accent)',
        borderRadius: '50%',
        flexShrink: 0,
      }}
    />
  );
}
