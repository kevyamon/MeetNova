import { NavLink } from 'react-router-dom';
import { Calendar, Newspaper, Smartphone } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import './TabBar.css';

const TabBar = () => {
  const { canInstall, installPWA } = usePWA();

  return (
    <nav className="tab-bar glass">
      <NavLink to="/" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        <Calendar size={24} />
        <span>Événements</span>
      </NavLink>

      <NavLink to="/news" className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}>
        <Newspaper size={24} />
        <span>Actualités</span>
      </NavLink>

      {canInstall && (
        <button onClick={installPWA} className="tab-item install-btn">
          <div className="install-icon-wrapper">
            <Smartphone size={24} />
          </div>
          <span>Installer</span>
        </button>
      )}
    </nav>
  );
};

export default TabBar;
