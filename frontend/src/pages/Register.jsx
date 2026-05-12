import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Send, CheckCircle, ChevronRight, GraduationCap, Building, ChevronLeft, ArrowUp } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import './Register.css';

import { FullScreenLoader } from '../components/common/Loaders';
import NiveauPickerModal, { NIVEAUX } from '../components/registration/NiveauPickerModal';

const Register = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useNotification();
  const [submitted, setSubmitted] = useState(false);
  const [showNiveauPicker, setShowNiveauPicker] = useState(false);
  const [step, setStep] = useState(1);
  const formRef = useRef(null);
  
  const [formData, setFormData] = useState({
    nom: '',
    prenoms: '',
    email: '',
    campus: '',
    niveau_etude: NIVEAUX[0],
    filiere: '',
    event: eventId
  });

  const [showScrollTop, setShowScrollTop] = useState(false);

  // Scroll visibility & to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mutation = useMutation({
    mutationFn: (data) => api.post('/attendees/register', data),
    onSuccess: () => {
      setSubmitted(true);
      toast("Inscription validée ! À bientôt.", "success");
      window.scrollTo(0, 0);
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

  const nextStep = () => {
    // Validation simple par étape
    if (step === 1 && (!formData.nom || !formData.prenoms)) return toast("Merci de remplir ton nom et prénom", "info");
    if (step === 2 && (!formData.email || !formData.campus)) return toast("L'email et le campus sont requis", "info");
    
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.filiere) return toast("Précise ta filière", "info");
    mutation.mutate(formData);
  };

  if (submitted) {
    return (
      <div className="register-page flex-center">
        <div className="success-card glass flex-center anim-scale-in" style={{flexDirection: 'column', textAlign: 'center', padding: '3rem'}}>
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
      {mutation.isPending && <FullScreenLoader />}
      
      <div className="container-register">
        {/* Bouton retour mobile uniquement (en haut du formulaire) */}
        <Link to="/" className="back-link mobile-only"><ArrowLeft size={20} /> Retour</Link>
        
        <div className="register-container-centered">
          <form onSubmit={handleSubmit} className="register-form glass anim-scale-in" ref={formRef}>
            <div className="form-header">
              {/* Bouton retour PC uniquement (intégré au formulaire) */}
              <Link to="/" className="back-btn-pc pc-only" title="Retour"><ChevronLeft size={24} /></Link>
              
              <div className="icon-circle"><GraduationCap size={32} /></div>
              <h2>Formulaire d'Inscription</h2>
              <div className="step-indicator">Étape {step} sur 3</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${(step/3)*100}%`}}></div>
              </div>
            </div>

            {/* ÉTAPE 1 : Identité */}
            {step === 1 && (
              <div className="form-step-content anim-fade-in">
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
                <button type="button" className="btn-primary w-full mt-2" onClick={nextStep}>
                  Suivant <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* ÉTAPE 2 : Contact & Campus */}
            {step === 2 && (
              <div className="form-step-content anim-fade-in">
                <div className="form-group">
                  <label>Email Académique / Personnel</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="jean.luc@univ.ci" />
                </div>

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

                <div className="step-actions">
                  <button type="button" className="btn-secondary" onClick={prevStep}><ChevronLeft size={20} /> Retour</button>
                  <button type="button" className="btn-primary" onClick={nextStep}>Suivant <ChevronRight size={20} /></button>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : Études & Validation */}
            {step === 3 && (
              <div className="form-step-content anim-fade-in">
                <div className="form-group">
                  <label>Niveau d'étude</label>
                  <div className="custom-input-trigger" onClick={() => setShowNiveauPicker(true)}>
                    <span>{formData.niveau_etude}</span>
                    <ChevronRight size={18} className="trigger-arrow" />
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

                <div className="step-actions">
                  <button type="button" className="btn-secondary" onClick={prevStep}><ChevronLeft size={20} /> Retour</button>
                  <button type="submit" className="btn-primary" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Envoi...' : 'Valider ma participation'} <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Bouton de retour en haut (Scroll to top) */}
      <button className={`scroll-top-btn glass ${showScrollTop ? 'visible' : ''}`} onClick={scrollToTop} aria-label="Remonter">
        <ArrowUp size={24} />
      </button>

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
