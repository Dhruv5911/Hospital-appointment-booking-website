import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HeartPulse, User, Mail, Phone, Lock, Eye, EyeOff, Globe, Globe2, Laptop, Stethoscope, Shield, Activity, Pill } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import validators from '../utils/validators';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', country: '', agree: false });
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key, val) => { setForm(p => ({ ...p, [key]: val })); setErrors(p => ({ ...p, [key]: null })); };

  const getStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 6) s++;
    if (pw.length >= 10) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(s, 5);
  };

  const strength = getStrength(form.password);
  const strengthLabels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColors = ['', '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#00E5A8'];

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    const emailErr = validators.email(form.email);
    if (emailErr) errs.email = emailErr;
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (form.password.length < 6) errs.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.agree) errs.agree = 'You must agree to terms';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password, role: 'patient' });
      toast.success('Account created!');
      navigate(data.user.role === 'patient' ? '/patient' : '/hospital');
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const floatingIcons = [
    { Icon: Stethoscope, style: { top: '15%', left: '10%', animationDelay: '0s' } },
    { Icon: Shield, style: { top: '30%', right: '15%', animationDelay: '1s' } },
    { Icon: Activity, style: { bottom: '25%', left: '20%', animationDelay: '2s' } },
    { Icon: HeartPulse, style: { top: '55%', right: '10%', animationDelay: '0.5s' } },
    { Icon: Pill, style: { bottom: '15%', right: '25%', animationDelay: '1.5s' } },
  ];

  return (
    <div className="signup-page">
      <div className="signup-container animate-fade-in">
        {/* LEFT PANEL — Illustration Area */}
        <div className="signup-left">
          <div className="signup-left-bg" />
          {/* Floating Icons */}
          {floatingIcons.map(({ Icon, style }, i) => (
            <div key={i} className="signup-floating-icon animate-float-slow" style={style}>
              <Icon size={24} />
            </div>
          ))}
          <div className="signup-left-content">
            <div className="signup-left-logo">
              <HeartPulse size={28} />
              <span>MediBook</span>
            </div>
            <h2 className="signup-left-title">Your health journey<br />starts here</h2>
            <p className="signup-left-text">Join thousands of patients who trust MediBook for their healthcare needs.</p>
            <div className="signup-left-features">
              {['AI-powered health insights', 'Book appointments instantly', 'Online pharmacy & delivery', 'Emergency prediction system'].map((f, i) => (
                <div key={i} className="signup-feature-item">
                  <div className="signup-feature-check">✓</div>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — Form */}
        <div className="signup-right">
          <div className="signup-right-inner">
            <div className="signup-form-header">
              <h1>Create your account</h1>
              <p>Fill in the details to get started</p>
            </div>

            <form onSubmit={handleSignup} className="signup-form">
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <span className="form-icon"><User size={18} /></span>
                  <input type="text" value={form.name} onChange={e => set('name', e.target.value)} className={`form-input form-input-icon ${errors.name ? 'error' : ''}`} placeholder="John Doe" />
                </div>
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <span className="form-icon"><Mail size={18} /></span>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={`form-input form-input-icon ${errors.email ? 'error' : ''}`} placeholder="you@example.com" />
                </div>
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-wrapper">
                  <span className="form-icon"><Phone size={18} /></span>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className={`form-input form-input-icon ${errors.phone ? 'error' : ''}`} placeholder="+91 98765 43210" />
                </div>
                {errors.phone && <p className="form-error">{errors.phone}</p>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <span className="form-icon"><Lock size={18} /></span>
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} className={`form-input form-input-icon ${errors.password ? 'error' : ''}`} placeholder="Min 6 characters" style={{ paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="login-pw-toggle"><EyeOff size={18} style={{ display: showPw ? 'block' : 'none' }} /><Eye size={18} style={{ display: showPw ? 'none' : 'block' }} /></button>
                </div>
                {form.password && (
                  <div className="signup-strength">
                    <div className="signup-strength-bar">
                      <div className="signup-strength-fill" style={{ width: `${(strength / 5) * 100}%`, background: strengthColors[strength] }} />
                    </div>
                    <span style={{ color: strengthColors[strength], fontSize: 'var(--text-xs)', fontWeight: 600 }}>{strengthLabels[strength]}</span>
                  </div>
                )}
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="form-icon"><Lock size={18} /></span>
                  <input type={showCpw ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} className={`form-input form-input-icon ${errors.confirmPassword ? 'error' : ''}`} placeholder="Re-enter password" style={{ paddingRight: '44px' }} />
                  <button type="button" onClick={() => setShowCpw(!showCpw)} className="login-pw-toggle">{showCpw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
              </div>

              {/* Country */}
              <div className="form-group">
                <label className="form-label">Country</label>
                <div className="input-wrapper">
                  <span className="form-icon"><Globe size={18} /></span>
                  <select value={form.country} onChange={e => set('country', e.target.value)} className="form-select" style={{ paddingLeft: '44px' }}>
                    <option value="">Select country</option>
                    <option value="IN">India</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>

              {/* Terms */}
              <label className="checkbox-wrapper">
                <input type="checkbox" className="checkbox" checked={form.agree} onChange={e => set('agree', e.target.checked)} />
                <span className="signup-terms-text">I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
              </label>
              {errors.agree && <p className="form-error">{errors.agree}</p>}

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg login-submit">
                {loading ? <div className="animate-spin" style={{ width: 20, height: 20, border: '2.5px solid rgba(11,17,32,0.3)', borderTopColor: 'var(--bg-primary)', borderRadius: '50%' }} /> : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="divider-text" style={{ margin: 'var(--space-5) 0' }}>or sign up with</div>

            {/* Social */}
            <div className="login-social">
              <button className="login-social-btn"><Globe2 size={18} /><span>Google</span></button>
              <button className="login-social-btn"><Laptop size={18} /><span>Microsoft</span></button>
            </div>

            <p className="login-signup">Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
