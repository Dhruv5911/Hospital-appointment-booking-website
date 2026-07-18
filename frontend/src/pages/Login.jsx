import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HeartPulse, Mail, Lock, Eye, EyeOff, Globe, Laptop } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import validators from '../utils/validators';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    const emailErr = validators.email(email);
    const pwErr = validators.required(password, 'Password');
    if (emailErr) errs.email = emailErr;
    if (pwErr) errs.password = pwErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success('Welcome back!');
      navigate(data.user.role === 'patient' ? '/patient' : '/hospital');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated Background Blobs */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />

      <div className="login-container animate-scale-in">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <HeartPulse size={24} />
          </div>
          <span className="login-logo-text">MediBook</span>
        </div>

        {/* Glass Card */}
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome back</h1>
            <p>Sign in to access your health dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <span className="form-icon"><Mail size={18} /></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: null }); }}
                  className={`form-input form-input-icon ${errors.email ? 'error' : ''}`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="form-icon"><Lock size={18} /></span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: null }); }}
                  className={`form-input form-input-icon ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="login-pw-toggle"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            {/* Remember & Forgot */}
            <div className="login-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="login-remember-text">Remember me</span>
              </label>
              <Link to="/forgot-password" className="login-forgot">Forgot password?</Link>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg login-submit">
              {loading ? (
                <div className="animate-spin" style={{ width: 20, height: 20, border: '2.5px solid rgba(11,17,32,0.3)', borderTopColor: 'var(--bg-primary)', borderRadius: '50%' }} />
              ) : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="divider-text">or continue with</div>

          {/* Social */}
          <div className="login-social">
            <button className="login-social-btn">
              <Globe size={18} />
              <span>Google</span>
            </button>
            <button className="login-social-btn">
              <Laptop size={18} />
              <span>Microsoft</span>
            </button>
          </div>

          {/* Sign up link */}
          <p className="login-signup">
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
