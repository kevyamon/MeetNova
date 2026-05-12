export const NIVEAUX = ['BTS1', 'BTS2', 'Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'];

const NiveauPickerModal = ({ isOpen, onClose, value, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="custom-picker-overlay" onClick={onClose}>
      <div className="custom-picker-modal" onClick={e => e.stopPropagation()}>
        <h3>Choisir ton niveau d'étude</h3>
        <div className="category-list">
          {NIVEAUX.map(n => (
            <button 
              key={n} 
              className={`category-btn ${value === n ? 'selected' : ''}`}
              onClick={() => { onSelect(n); onClose(); }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NiveauPickerModal;
