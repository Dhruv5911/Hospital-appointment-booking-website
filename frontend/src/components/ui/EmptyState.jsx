export default function EmptyState({ icon, title, text, action, className = '' }) {
  return (
    <div className={`empty-state ${className}`}>
      {icon && (
        <div className="empty-state-icon">
          {icon}
        </div>
      )}
      {title && <h3 className="empty-state-title">{title}</h3>}
      {text && <p className="empty-state-text">{text}</p>}
      {action && <div style={{ marginTop: 'var(--space-5)' }}>{action}</div>}
    </div>
  );
}
