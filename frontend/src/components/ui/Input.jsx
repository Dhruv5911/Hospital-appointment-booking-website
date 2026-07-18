export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="input-wrapper">
        {Icon && (
          <span className="form-icon">
            <Icon size={18} />
          </span>
        )}
        <input
          className={`form-input ${Icon ? 'form-input-icon' : ''} ${error ? 'error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
