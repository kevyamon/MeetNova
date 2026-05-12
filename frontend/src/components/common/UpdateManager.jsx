import { useState, useEffect } from 'react';
import { RefreshCcw, Sparkles, X } from 'lucide-react';
import './UpdateManager.css';

const UpdateManager = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setShowModal(true);
    };

    window.addEventListener('app-update-available', handleUpdate);
    return () => window.removeEventListener('app-update-available', handleUpdate);
  }, []);

  const handleUpdateClick = () => {
    // 1. Sauvegarder l'état actuel (URL et formulaires potentiels)
    sessionStorage.setItem('meetnova_last_path', window.location.pathname);
    
    // On peut aussi tenter de sauvegarder les inputs des formulaires
    const inputs = document.querySelectorAll('input, textarea');
    const formData = {};
    inputs.forEach(input => {
      if (input.name && input.value) {
        formData[input.name] = input.value;
      }
    });
    sessionStorage.setItem('meetnova_pending_form', JSON.stringify(formData));

    // 2. Recharger
    window.location.reload();
  };

  if (!showModal) return null;

  return (
    <div className="update-modal-overlay">
      <div className="update-modal glass anim-scale-in">
        <div className="update-icon-wrapper">
          <div className="update-ring"></div>
          <Sparkles size={32} className="sparkle-icon" />
        </div>
        
        <h2>Nouvelle Version !</h2>
        <p>Une mise à jour est prête avec de nouvelles fonctionnalités et corrections. Elle a déjà été téléchargée pour vous.</p>
        
        <div className="update-actions">
          <button className="btn-update-cancel" onClick={() => setShowModal(false)}>
            Plus tard
          </button>
          <button className="btn-update-confirm" onClick={handleUpdateClick}>
            <RefreshCcw size={18} />
            Mettre à jour
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateManager;
