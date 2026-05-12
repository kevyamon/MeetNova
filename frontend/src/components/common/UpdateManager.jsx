import { useState, useEffect } from 'react';
import { RefreshCcw, Rocket, X } from 'lucide-react';
import './UpdateManager.css';

const UpdateManager = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      if (sessionStorage.getItem('meetnova_update_reload') === 'true') {
        sessionStorage.removeItem('meetnova_update_reload');
        return;
      }
      setShowModal(true);
    };

    window.addEventListener('app-update-available', handleUpdate);
    return () => window.removeEventListener('app-update-available', handleUpdate);
  }, []);

  const handleUpdateClick = () => {
    sessionStorage.setItem('meetnova_update_reload', 'true');
    sessionStorage.setItem('meetnova_last_path', window.location.pathname);
    
    const inputs = document.querySelectorAll('input, textarea');
    const formData = {};
    inputs.forEach(input => {
      if (input.name && input.value) {
        formData[input.name] = input.value;
      }
    });
    sessionStorage.setItem('meetnova_pending_form', JSON.stringify(formData));

    window.location.reload();
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
