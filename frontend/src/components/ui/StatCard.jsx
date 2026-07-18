export default function StatCard({ icon, iconBg, value, label, trend, className = '' }) {
  return (
    <div className={`stat-card ${className}`}>
      <div
        className="stat-card-icon"
        style={{ background: iconBg || 'var(--accent-muted)', color: iconBg ? 'white' : 'var(--accent)' }}
      >
        {icon}
      </div>
      <div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
        {trend && (
          <div style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--weight-semibold)',
            color: trend > 0 ? 'var(--success)' : 'var(--danger)',
            marginTop: '4px',
          }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}
