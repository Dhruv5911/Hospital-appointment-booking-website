import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import './Login.css';

export default function ForgotPassword() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      toast.success('Reset link sent!');
    }, 1500);
  };

  return (
    <div className="login-page">
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-container animate-scale-in">
        <div className="login-logo">
          <div className="login-logo-icon"><HeartPulse size={24} /></div>
          <span className="login-logo-text">MediBook</span>
        </div>
        <div className="login-card">
          {sent ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius)', background: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-5)', color: 'var(--accent)' }}>
                <CheckCircle size={28} />
              </div>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>Check your email</h2>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-base)', marginBottom: 'var(--space-6)' }}>We've sent a password reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong></p>
              <Link to="/login" className="btn btn-primary">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <div className="login-header">
                <h1>Forgot password?</h1>
                <p>Enter your email and we'll send a reset link</p>
              </div>
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <span className="form-icon"><Mail size={18} /></span>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input form-input-icon" placeholder="you@example.com" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary btn-lg login-submit">
                  {loading ? <div className="animate-spin" style={{ width: 20, height: 20, border: '2.5px solid rgba(11,17,32,0.3)', borderTopColor: 'var(--bg-primary)', borderRadius: '50%' }} /> : 'Send Reset Link'}
                </button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
                <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
