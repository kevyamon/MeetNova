import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Camera, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './TabBar.css';

const AdminNavigation = () => {
  const { logout, isAuthenticated } = useAuth();
  const { confirm } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.pathname.startsWith('/mnccadmin') || location.pathname === '/mnccadmin' || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    confirm("Voulez-vous vraiment vous déconnecter ?", async () => {
      await logout();
      navigate('/mnccadmin');
    });
  };

  const navContent = (
    <>
      <div className="nav-logo-pc">
        <img src="https://res.cloudinary.com/dqueeyulc/image/upload/q_auto/f_auto/v1778560493/cdf28651-47ff-41a9-84e8-bb7f08543fc0.png" alt="Admin Hub" />
        <span>Hub Admin</span>
      </div>

      <div className="nav-items">
        <NavLink to="/mnccadmin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={24} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/mnccadmin/scan" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Camera size={24} />
          <span>Scanner</span>
        </NavLink>

        <button onClick={handleLogout} className="nav-item logout-nav-btn">
          <LogOut size={24} />
          <span>Quitter</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile TabBar Admin */}
      <nav className="mobile-tab-bar admin-nav glass">
        <div className="nav-items">
          {navContent}
        </div>
      </nav>

      {/* PC Sidebar Admin */}
      <aside className="pc-sidebar admin-nav glass">
        {navContent}
      </aside>
    </>
  );
};

export default AdminNavigation;
