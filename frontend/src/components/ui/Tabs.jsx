export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`tabs ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id || tab}
          className={`tab ${(tab.id || tab) === activeTab ? 'active' : ''}`}
          onClick={() => onChange(tab.id || tab)}
        >
          {tab.icon && <span style={{ marginRight: '6px', display: 'inline-flex' }}>{tab.icon}</span>}
          {tab.label || tab}
          {tab.count !== undefined && (
            <span style={{
              marginLeft: '6px',
              background: 'rgba(255,255,255,0.08)',
              padding: '1px 8px',
              borderRadius: '9999px',
              fontSize: 'var(--text-xs)',
            }}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
