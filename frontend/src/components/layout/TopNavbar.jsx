import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, Settings, Sparkles, HeartPulse } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './TopNavbar.css';

export default function TopNavbar({ user, onMenuClick }) {
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const basePath = user?.role === 'hospital_admin' ? '/hospital' : '/patient';

  return (
    <header className={`topnav ${scrolled ? 'topnav-scrolled' : ''}`}>
      {/* LEFT: Hamburger + Logo + Search */}
      <div className="topnav-left">
        <button className="topnav-btn topnav-hamburger" onClick={onMenuClick} aria-label="Toggle menu">
          <Menu size={20} />
        </button>

        <Link to="/" className="topnav-logo">
          <div className="topnav-logo-icon">
            <HeartPulse size={22} />
          </div>
          <span className="topnav-logo-text">MediBook</span>
        </Link>

        <button className="topnav-btn topnav-search-btn desktop-only" onClick={() => navigate(`${basePath}/search`)} aria-label="Search">
          <Search size={18} />
        </button>
      </div>

      {/* CENTER: Empty */}
      <div className="topnav-center" />

      {/* RIGHT: Notifications + Theme + Upgrade + Profile + Settings */}
      <div className="topnav-right">
        <button className="topnav-btn desktop-only" onClick={() => navigate(`${basePath}/notifications`)} aria-label="Notifications">
          <Bell size={18} />
          <span className="topnav-notification-dot" />
        </button>

        <button className="topnav-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="topnav-upgrade desktop-only" onClick={() => navigate(`${basePath}/settings`)}>
          <Sparkles size={14} />
          <span>Upgrade to Pro</span>
        </button>

        <Link to={`${basePath}/profile`} className="topnav-avatar" aria-label="Profile">
          <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, #00E5A8, #38BDF8)' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
        </Link>

        <button className="topnav-btn desktop-only" onClick={() => navigate(`${basePath}/settings`)} aria-label="Settings">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
