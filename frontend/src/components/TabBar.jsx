import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, Newspaper, Smartphone, Download } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import './TabBar.css';

const Navigation = () => {
  const { canInstall, installPWA } = usePWA();
  const location = useLocation();

  if (location.pathname.startsWith('/mnccadmin')) {
    return null;
  }

  const handleTabClick = (e, path) => {
    if (location.pathname === path) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePCInstall = () => {
    if (canInstall) {
      installPWA();
    } else {
      alert("Pour installer MeetNova sur PC :\n1. Cliquez sur l'icône d'installation dans la barre d'adresse (en haut à droite)\n2. Ou allez dans le menu du navigateur > Installer MeetNova");
    }
  };

  return (
    <>
      {/* Mobile TabBar */}
      <nav className="mobile-tab-bar glass">
        <div className="nav-items">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleTabClick(e, '/')}>
            <Calendar size={24} />
            <span>Événements</span>
          </NavLink>

          <NavLink to="/news" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleTabClick(e, '/news')}>
            <Newspaper size={24} />
            <span>Actualités</span>
          </NavLink>

          {canInstall && (
            <button onClick={installPWA} className="nav-item install-btn">
              <div className="install-icon-wrapper">
                <Smartphone size={24} />
              </div>
              <span>Installer</span>
            </button>
          )}
        </div>
      </nav>

      {/* PC Sidebar */}
      <aside className="pc-sidebar glass">
        <div className="nav-logo-pc">
          <img src="https://res.cloudinary.com/dqueeyulc/image/upload/q_auto/f_auto/v1778560493/cdf28651-47ff-41a9-84e8-bb7f08543fc0.png" alt="MeetNova" />
          <span>MeetNova</span>
        </div>

        <div className="nav-items">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleTabClick(e, '/')}>
            <Calendar size={20} />
            <span>Événements</span>
          </NavLink>

          <NavLink to="/news" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleTabClick(e, '/news')}>
            <Newspaper size={20} />
            <span>Actualités</span>
          </NavLink>

          {/* Toujours visible sur PC */}
          <button onClick={handlePCInstall} className="nav-item pc-install-btn">
            <Download size={20} />
            <span>Installer l'appli</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navigation;
