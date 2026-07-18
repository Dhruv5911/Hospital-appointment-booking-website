import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import Footer from './Footer';

export default function DashboardLayout({ user, onLogout, role = 'patient' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="layout-wrapper">
      {/* Fixed Top Navbar */}
      <TopNavbar
        user={user}
        onMenuClick={() => setSidebarOpen(prev => !prev)}
      />

      {/* Sidebar Overlay (not always visible) */}
      <Sidebar
        user={user}
        onLogout={onLogout}
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area — Full width, no sidebar offset */}
      <main className="layout-main">
        <div className="page-container">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}
