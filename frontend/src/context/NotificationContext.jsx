import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import './NotificationContext.css';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Fonction pour afficher un Toast
  const toast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  // Fonction pour afficher une confirmation
  const confirm = useCallback((message, onConfirm) => {
    setConfirmDialog({ message, onConfirm });
  }, []);

  const closeConfirm = () => setConfirmDialog(null);

  const handleConfirm = () => {
    if (confirmDialog?.onConfirm) confirmDialog.onConfirm();
    closeConfirm();
  };

  return (
    <NotificationContext.Provider value={{ toast, confirm }}>
      {children}
      
      {/* Container des Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-item glass ${t.type} anim-slide-in`}>
            <div className="toast-icon">
              {t.type === 'success' && <CheckCircle size={20} />}
              {t.type === 'error' && <XCircle size={20} />}
              {t.type === 'warning' && <AlertCircle size={20} />}
              {t.type === 'info' && <Info size={20} />}
            </div>
            <p className="toast-message">{t.message}</p>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Confirmation */}
      {confirmDialog && (
        <div className="confirm-overlay flex-center anim-fade-in">
          <div className="confirm-card glass anim-scale-in">
            <div className="confirm-icon-wrapper">
              <AlertCircle size={32} />
            </div>
            <h3>Confirmation</h3>
            <p>{confirmDialog.message}</p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={closeConfirm}>Annuler</button>
              <button className="btn-primary danger" onClick={handleConfirm}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
