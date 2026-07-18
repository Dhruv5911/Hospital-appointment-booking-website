import { Link } from 'react-router-dom';
import { HeartPulse, ExternalLink, MessageCircle, Users, Mail, ArrowRight } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Top Section */}
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                <HeartPulse size={20} />
              </div>
              <span className="footer-logo-text">MediBook</span>
            </Link>
            <p className="footer-description">
              AI-powered healthcare platform for booking appointments, managing medicines, and accessing smart health tools.
            </p>
            <div className="footer-socials">
              <a href="#" className="footer-social-link" aria-label="Twitter"><MessageCircle size={16} /></a>
              <a href="#" className="footer-social-link" aria-label="LinkedIn"><Users size={16} /></a>
              <a href="#" className="footer-social-link" aria-label="GitHub"><ExternalLink size={16} /></a>
              <a href="#" className="footer-social-link" aria-label="Email"><Mail size={16} /></a>
            </div>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4 className="footer-col-title">Company</h4>
            <Link to="/about" className="footer-link">About</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
            <a href="#" className="footer-link">Careers</a>
            <a href="#" className="footer-link">Blog</a>
          </div>

          {/* Legal */}
          <div className="footer-col">
            <h4 className="footer-col-title">Legal</h4>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Cookie Policy</a>
            <a href="#" className="footer-link">HIPAA Compliance</a>
          </div>

          {/* Newsletter */}
          <div className="footer-col">
            <h4 className="footer-col-title">Stay Updated</h4>
            <p className="footer-newsletter-text">Get the latest health tips and platform updates.</p>
            <div className="footer-newsletter">
              <input
                type="email"
                placeholder="Enter your email"
                className="footer-newsletter-input"
              />
              <button className="footer-newsletter-btn" aria-label="Subscribe">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">© {currentYear} MediBook. All rights reserved.</p>
          <p className="footer-made">Made with ❤️ for better healthcare</p>
        </div>
      </div>
    </footer>
  );
}
