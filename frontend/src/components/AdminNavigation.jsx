import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Camera, LogOut, LayoutDashboard } from 'lucide-react';
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

  const handleNavClick = (e, path) => {
    if (location.pathname === path) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    confirm("Voulez-vous vraiment vous déconnecter ?", async () => {
      await logout();
      navigate('/mnccadmin');
    });
  };

  return (
    <>
      {/* Mobile TabBar : Uniquement les icônes essentielles */}
      <nav className="mobile-tab-bar admin-nav glass">
        <div className="nav-items">
          <NavLink to="/mnccadmin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleNavClick(e, '/mnccadmin/dashboard')}>
            <LayoutDashboard size={24} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/mnccadmin/scan" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleNavClick(e, '/mnccadmin/scan')}>
            <Camera size={24} />
            <span>Scanner</span>
          </NavLink>

          <button onClick={handleLogout} className="nav-item logout-nav-btn">
            <LogOut size={24} />
            <span>Quitter</span>
          </button>
        </div>
      </nav>

      {/* PC Sidebar : Avec logo et design complet */}
      <aside className="pc-sidebar admin-nav glass">
        <div className="nav-logo-pc">
          <img src="https://res.cloudinary.com/dqueeyulc/image/upload/q_auto/f_auto/v1778560493/cdf28651-47ff-41a9-84e8-bb7f08543fc0.png" alt="" />
          <span>Hub Admin</span>
        </div>

        <div className="nav-items">
          <NavLink to="/mnccadmin/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleNavClick(e, '/mnccadmin/dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/mnccadmin/scan" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleNavClick(e, '/mnccadmin/scan')}>
            <Camera size={20} />
            <span>Scanner</span>
          </NavLink>

          <button onClick={handleLogout} className="nav-item logout-nav-btn">
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminNavigation;
