import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, Newspaper, Smartphone, Download, EyeOff } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { useNotification } from '../context/NotificationContext';
import './TabBar.css';

const Navigation = () => {
  const { canInstall, installPWA } = usePWA();
  const { toast } = useNotification();
  const location = useLocation();

  const [isInstallVisible, setIsInstallVisible] = useState(true);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showAutoSuggestModal, setShowAutoSuggestModal] = useState(false);
  const timerRef = useRef(null);

  // Initialisation et détection automatique PWA
  useEffect(() => {
    const isHidden = localStorage.getItem('meetnova_install_hidden') === 'true';
    setIsInstallVisible(!isHidden);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    const autoAsked = localStorage.getItem('meetnova_auto_hide_asked') === 'true';

    if (isStandalone && !isHidden && !autoAsked) {
      // Un petit délai pour une apparition fluide après le chargement
      const timer = setTimeout(() => {
        setShowAutoSuggestModal(true);
        localStorage.setItem('meetnova_auto_hide_asked', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

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
      toast(
        "Pour installer MeetNova : Cliquez sur l'icône d'installation dans la barre d'adresse ou le menu du navigateur.", 
        "info",
        6000
      );
    }
  };

  const handleMobileInstallClick = () => {
    // Ouvre le menu d'options de l'icône
    setShowOptionsModal(true);
  };

  const hideInstallButton = () => {
    setIsInstallVisible(false);
    localStorage.setItem('meetnova_install_hidden', 'true');
    setShowOptionsModal(false);
    setShowAutoSuggestModal(false);
    toast(
      "Bouton masqué. Maintenez la barre de navigation appuyée pour le réafficher à tout moment.",
      "success",
      5000
    );
  };

  // Gestion du Long Press sur la TabBar pour masquer/démasquer instantanément
  const handleBarPressStart = () => {
    timerRef.current = setTimeout(() => {
      setIsInstallVisible(prev => {
        const next = !prev;
        localStorage.setItem('meetnova_install_hidden', (!next).toString());
        toast(
          next ? "Bouton d'installation réaffiché !" : "Bouton d'installation masqué.",
          "success",
          3000
        );
        return next;
      });
    }, 1500); // 1.5 secondes d'appui sur la barre
  };

  const handleBarPressEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <>
      {/* Mobile TabBar avec capteurs Long Press */}
      <nav 
        className="mobile-tab-bar glass"
        onMouseDown={handleBarPressStart}
        onMouseUp={handleBarPressEnd}
        onMouseLeave={handleBarPressEnd}
        onTouchStart={handleBarPressStart}
        onTouchEnd={handleBarPressEnd}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        <div className="nav-items">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleTabClick(e, '/')}>
            <Calendar size={24} />
            <span>Événements</span>
          </NavLink>

          {/* Bouton d'installation conditionné par l'état de visibilité */}
          {isInstallVisible && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleMobileInstallClick(); }} 
              className="nav-item install-btn"
              onTouchStart={(e) => e.stopPropagation()} // Évite de déclencher le long press de la barre
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="install-icon-wrapper">
                <Smartphone size={24} />
              </div>
              <span>Installer</span>
            </button>
          )}

          <NavLink to="/news" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={(e) => handleTabClick(e, '/news')}>
            <Newspaper size={24} />
            <span>Actualités</span>
          </NavLink>
        </div>
      </nav>

      {/* Modale d'options manuelles du bouton Installer */}
      {showOptionsModal && (
        <div className="tabbar-modal-overlay" onClick={() => setShowOptionsModal(false)}>
          <div className="tabbar-modal glass anim-scale-in" onClick={e => e.stopPropagation()}>
            <h3>Gestion de l'application</h3>
            <p className="modal-desc">
              {canInstall 
                ? "Installez MeetNova sur votre écran d'accueil pour un accès rapide et hors-ligne." 
                : "L'application est déjà installée ou gérée par votre navigateur."}
            </p>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', marginBottom: '1.2rem', textAlign: 'left' }}>
              <b>Astuce :</b> Vous pourrez réafficher ce bouton à tout moment en maintenant la barre du bas appuyée pendant 1,5 seconde.
            </div>
            
            <div className="modal-actions-column">
              {canInstall && (
                <button 
                  className="btn-primary" 
                  onClick={() => { setShowOptionsModal(false); installPWA(); }}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Download size={18} /> Installer maintenant
                </button>
              )}
              <button 
                className="btn-secondary btn-hide-option" 
                onClick={hideInstallButton}
                style={{ width: '100%', justifyContent: 'center', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <EyeOff size={18} /> Masquer ce bouton
              </button>
              <button 
                className="btn-text-cancel" 
                onClick={() => setShowOptionsModal(false)}
                style={{ width: '100%', padding: '0.8rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 600 }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de suggestion automatique (si PWA détectée) */}
      {showAutoSuggestModal && (
        <div className="tabbar-modal-overlay" onClick={() => setShowAutoSuggestModal(false)}>
          <div className="tabbar-modal glass anim-scale-in" onClick={e => e.stopPropagation()}>
            <h3>Application Installée !</h3>
            <p className="modal-desc">
              Nous avons détecté que vous utilisez déjà l'application installée. Voulez-vous masquer le bouton central "Installer" pour alléger votre barre de navigation ?
            </p>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', marginBottom: '1.2rem', textAlign: 'left' }}>
              <b>Astuce :</b> Vous pourrez le réafficher à tout moment en maintenant la barre du bas appuyée pendant 1,5 seconde.
            </div>
            
            <div className="modal-actions-row" style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setShowAutoSuggestModal(false)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Garder
              </button>
              <button 
                className="btn-primary" 
                onClick={hideInstallButton}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Masquer
              </button>
            </div>
          </div>
        </div>
      )}

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
