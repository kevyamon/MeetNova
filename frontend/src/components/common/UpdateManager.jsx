import { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, Rocket, X } from 'lucide-react';
import './UpdateManager.css';

const POLLING_INTERVAL = 1 * 60 * 1000; // 1 minute

const UpdateManager = () => {
  const [showModal, setShowModal] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [newVersionInfo, setNewVersionInfo] = useState(null);

  // Vérification de la version côté serveur
  const performCheck = useCallback(async () => {
    const currentVersion = document.querySelector('meta[name="app-version"]')?.content;
    if (!currentVersion || isUpdateAvailable) return;

    try {
      // Paramètre timestamp pour ignorer le cache
      const url = `/meta.json?t=${new Date().getTime()}`;
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) return;
      const meta = await response.json();
      
      if (meta.fullVersion !== currentVersion) {
        setNewVersionInfo(meta);
        setIsUpdateAvailable(true);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la version :", error);
    }
  }, [isUpdateAvailable]);

  // Polling automatique
  useEffect(() => {
    const interval = setInterval(performCheck, POLLING_INTERVAL);
    
    // On garde aussi l'écouteur d'événement au cas où le Service Worker le déclenche
    const handleSWUpdate = () => {
      setIsUpdateAvailable(true);
      setShowModal(true);
    };
    window.addEventListener('app-update-available', handleSWUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('app-update-available', handleSWUpdate);
    };
  }, [performCheck]);

  // Restauration post-mise à jour
  useEffect(() => {
    if (sessionStorage.getItem('meetnova_update_reload') === 'true') {
      sessionStorage.removeItem('meetnova_update_reload');
    }
  }, []);

  const handleUpdateClick = async () => {
    sessionStorage.setItem('meetnova_update_reload', 'true');
    sessionStorage.setItem('meetnova_last_path', window.location.pathname);
    
    // Sauvegarde des inputs (logique existante)
    const inputs = document.querySelectorAll('input, textarea');
    const formData = {};
    inputs.forEach(input => {
      if (input.name && input.value) {
        formData[input.name] = input.value;
      }
    });
    sessionStorage.setItem('meetnova_pending_form', JSON.stringify(formData));

    try {
      // Désenregistrement du Service Worker pour forcer la mise à jour
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
    } catch (error) {
      console.error("Échec de la désinscription du service worker:", error);
    }

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (!showModal) return null;

  return (
    <div className="update-modal-overlay">
      <div className="update-modal glass anim-scale-in">
        <div className="update-icon-wrapper">
          <div className="update-ring"></div>
          <Rocket size={32} className="rocket-icon" />
        </div>
        
        <h2>Nouvelle Version !</h2>
        <p>Une mise à jour est prête avec de nouvelles fonctionnalités et corrections. Elle a déjà été téléchargée pour vous.</p>
        
        <div className="update-actions">
          <button className="btn-update-confirm" onClick={handleUpdateClick} style={{ flex: 1 }}>
            <RefreshCcw size={18} />
            Mettre à jour maintenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateManager;
