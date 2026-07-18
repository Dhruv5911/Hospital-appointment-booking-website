import { Link } from 'react-router-dom';
import { HeartPulse, ArrowRight, Calendar, Brain, Pill, Shield, Building2, Star, Activity, Users, CheckCircle, Sparkles } from 'lucide-react';
import './Landing.css';

const features = [
  { icon: <Calendar size={24} />, title: 'Smart Appointments', desc: 'Book appointments with top doctors from verified hospitals in seconds.' },
  { icon: <Brain size={24} />, title: 'AI Symptom Checker', desc: 'Chat with our AI to get instant health insights and recommendations.' },
  { icon: <Pill size={24} />, title: 'Online Pharmacy', desc: 'Order medicines, track deliveries, and manage prescriptions digitally.' },
  { icon: <Shield size={24} />, title: 'Emergency SOS', desc: 'One-tap emergency alerts with AI risk prediction and ambulance booking.' },
  { icon: <Building2 size={24} />, title: 'Find Hospitals', desc: 'Discover nearby hospitals with ratings, reviews, and real-time availability.' },
  { icon: <Activity size={24} />, title: 'Health Dashboard', desc: 'Track vitals, BMI, water intake, and get personalized health scores.' },
];

const stats = [
  { value: '50K+', label: 'Active Patients' },
  { value: '2,500+', label: 'Verified Doctors' },
  { value: '500+', label: 'Partner Hospitals' },
  { value: '99.9%', label: 'Uptime' },
];

const testimonials = [
  { name: 'Ananya Patel', role: 'Patient', text: 'MediBook transformed how I manage my health. Booking appointments is so easy now!', rating: 5 },
  { name: 'Dr. Rajesh Kumar', role: 'Cardiologist', text: 'The AI symptom checker is impressive. It helps patients describe symptoms accurately.', rating: 5 },
  { name: 'Sneha Verma', role: 'Patient', text: 'The pharmacy feature saves me so much time. Medicine delivery right to my door!', rating: 4 },
];

export default function Landing() {
  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <Link to="/" className="landing-logo">
          <div className="landing-logo-icon"><HeartPulse size={20} /></div>
          <span>MediBook</span>
        </Link>
        <nav className="landing-nav">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#about" className="landing-nav-link">About</a>
          <Link to="/login" className="landing-nav-link">Sign In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-blob landing-hero-blob-1" />
        <div className="landing-hero-blob landing-hero-blob-2" />
        <div className="landing-hero-content animate-fade-in-up">
          <div className="landing-hero-badge"><Sparkles size={14} /> AI-Powered Healthcare Platform</div>
          <h1 className="landing-hero-title">Your Health,<br /><span>Reimagined</span></h1>
          <p className="landing-hero-text">Book appointments, consult with AI, order medicines, and manage your entire health journey — all in one beautiful platform.</p>
          <div className="landing-hero-actions">
            <Link to="/signup" className="btn btn-glow btn-lg">Get Started Free <ArrowRight size={18} /></Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats animate-fade-in-up">
        {stats.map((s, i) => (
          <div key={i} className="landing-stat">
            <span className="landing-stat-value">{s.value}</span>
            <span className="landing-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="landing-features">
        <div className="landing-section-header animate-fade-in-up">
          <h2>Everything you need<br />for better healthcare</h2>
          <p>A comprehensive platform designed to make healthcare accessible, intelligent, and seamless.</p>
        </div>
        <div className="landing-features-grid">
          {features.map((f, i) => (
            <div key={i} className="landing-feature-card glass-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="landing-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="about" className="landing-testimonials">
        <div className="landing-section-header animate-fade-in-up">
          <h2>Loved by patients<br />and doctors alike</h2>
          <p>Join thousands of users who trust MediBook for their healthcare needs.</p>
        </div>
        <div className="landing-testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="landing-testimonial-card glass-card-static animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="landing-testimonial-stars">
                {Array.from({ length: t.rating }, (_, j) => <Star key={j} size={14} fill="var(--warning)" color="var(--warning)" />)}
              </div>
              <p className="landing-testimonial-text">"{t.text}"</p>
              <div className="landing-testimonial-author">
                <div className="avatar avatar-sm" style={{ background: 'var(--accent-gradient)' }}>{t.name[0]}</div>
                <div>
                  <p className="landing-testimonial-name">{t.name}</p>
                  <p className="landing-testimonial-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta animate-fade-in-up">
        <div className="landing-cta-inner">
          <h2>Ready to take control<br />of your health?</h2>
          <p>Join MediBook today — it's free to get started.</p>
          <Link to="/signup" className="btn btn-glow btn-lg">Create Free Account <ArrowRight size={18} /></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} MediBook. All rights reserved. Made with ❤️ for better healthcare.</p>
      </footer>
    </div>
  );
}
