import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Send, CheckCircle, ChevronRight, GraduationCap, Building } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import './Register.css';

const NIVEAUX = ['BTS1', 'BTS2', 'Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'];

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

const Register = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useNotification();
  const [submitted, setSubmitted] = useState(false);
  const [showNiveauPicker, setShowNiveauPicker] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: '',
    prenoms: '',
    email: '',
    campus: '',
    niveau_etude: NIVEAUX[0],
    filiere: '',
    event: eventId
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/attendees/register', data),
    onSuccess: () => {
      setSubmitted(true);
      toast("Inscription validée ! À bientôt.", "success");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Une erreur est survenue lors de l'inscription.";
      toast(msg, "error");
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    
    if (name === 'filiere') {
      finalValue = value.toUpperCase().replace(/[^A-Z]/g, '');
    } else if (name === 'campus') {
      finalValue = value.toUpperCase();
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (submitted) {
    return (
      <div className="register-page flex-center">
        <div className="success-card glass flex-center" style={{flexDirection: 'column', textAlign: 'center', padding: '3rem'}}>
          <CheckCircle size={80} color="var(--success)" />
          <h2>Inscription Réussie !</h2>
          <p>Un email contenant ton billet (QR Code) vient de t'être envoyé.</p>
          <Link to="/" className="btn-primary" style={{marginTop: '2rem'}}>Retour au feed</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="container-small">
        <Link to="/" className="back-link"><ArrowLeft size={20} /> Retour</Link>
        
        <div className="register-container-v2">
          <form onSubmit={handleSubmit} className="register-form glass anim-scale-in">
            <div className="form-header">
              <div className="icon-circle"><GraduationCap size={32} /></div>
              <h2>Formulaire d'Inscription</h2>
              <p>Remplis tes informations pour recevoir ton pass.</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Nom</label>
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} required placeholder="Ex: KOUASSI" />
              </div>
              <div className="form-group">
                <label>Prénoms</label>
                <input type="text" name="prenoms" value={formData.prenoms} onChange={handleChange} required placeholder="Ex: Jean Luc" />
              </div>
            </div>

            <div className="form-group">
              <label>Email Académique / Personnel</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="jean.luc@univ.ci" />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Campus</label>
                <div className="input-with-icon">
                  <Building size={18} className="input-icon" />
                  <input 
                    type="text" 
                    name="campus" 
                    value={formData.campus} 
                    onChange={handleChange} 
                    required 
                    placeholder="Ex: LOKO, ABC..." 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Niveau d'étude</label>
                <div className="custom-input-trigger" onClick={() => setShowNiveauPicker(true)}>
                  <span>{formData.niveau_etude}</span>
                  <ChevronRight size={18} className="trigger-arrow" />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Filière (Abrégée)</label>
              <input 
                type="text" 
                name="filiere" 
                value={formData.filiere} 
                onChange={handleChange} 
                required 
                placeholder="Ex: IDA, RIT, MAGE..."
                maxLength={10}
              />
              <small>La filière sera automatiquement mise en majuscule.</small>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Envoi en cours...' : 'Confirmer ma participation'} <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      <NiveauPickerModal 
        isOpen={showNiveauPicker}
        onClose={() => setShowNiveauPicker(false)}
        value={formData.niveau_etude}
        onSelect={(n) => setFormData(p => ({ ...p, niveau_etude: n }))}
      />
    </div>
  );
};

export default Register;
