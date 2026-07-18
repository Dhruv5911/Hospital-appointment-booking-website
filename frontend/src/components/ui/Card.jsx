export default function Card({ children, className = '', hover = true, glass = false, onClick }) {
  const baseClass = glass ? 'glass-card' : 'card';
  const hoverClass = hover ? '' : 'glass-card-static';

  return (
    <div
      className={`${glass && !hover ? hoverClass : baseClass} ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      {children}
    </div>
  );
}
