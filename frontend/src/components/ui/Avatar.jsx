const COLORS = [
  'linear-gradient(135deg, #00E5A8, #38BDF8)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #f59e0b, #ef4444)',
  'linear-gradient(135deg, #3b82f6, #06b6d4)',
  'linear-gradient(135deg, #22c55e, #10b981)',
  'linear-gradient(135deg, #ec4899, #8b5cf6)',
];

function getColorFromName(name = '') {
  const index = name.charCodeAt(0) % COLORS.length;
  return COLORS[index] || COLORS[0];
}

export default function Avatar({ name = '', size = 'md', src, className = '' }) {
  const sizeClass = `avatar-${size}`;
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`avatar ${sizeClass} ${className}`}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <div
      className={`avatar ${sizeClass} ${className}`}
      style={{ background: getColorFromName(name) }}
    >
      {initials || 'U'}
    </div>
  );
}
