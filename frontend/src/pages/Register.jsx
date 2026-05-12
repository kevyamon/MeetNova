import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import api from '../services/api';
import './Register.css';

const CAMPUSES = ['Abidjan', 'Bouaké', 'Yamoussoukro', 'Daloa', 'Korhogo'];
const NIVEAUX = ['BTS1', 'BTS2', 'Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'];

const Register = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: '',
    prenoms: '',
    email: '',
    campus: CAMPUSES[0],
    niveau_etude: NIVEAUX[0],
    filiere: '',
    event: eventId
  });

  // Fetch event details to show on form
  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await api.get(`/events`); // En réalité on devrait avoir une route GET /events/:id
      // Pour l'instant on filtre dans la liste
      return res.data.data.find(e => e._id === eventId);
    }
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/attendees/register', data),
    onSuccess: () => setSubmitted(true),
    onError: (error) => {
      alert(error.response?.data?.message || "Une erreur est survenue lors de l'inscription.");
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'filiere' ? value.toUpperCase().replace(/[^A-Z]/g, '') : value
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
      <div className="container">
        <Link to="/" className="back-link"><ArrowLeft size={20} /> Retour</Link>
        
        <div className="register-container">
          <div className="event-info-sidebar glass">
            {event?.images?.[0] && <img src={event.images[0]} alt={event.title} />}
            <div className="info-text">
              <span className="badge-type">{event?.type}</span>
              <h1>{event?.title}</h1>
              <p>{event?.description}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="register-form glass">
            <h2>Formulaire d'Inscription</h2>
            <p className="subtitle">Remplis tes informations pour recevoir ton pass.</p>

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
                <select name="campus" value={formData.campus} onChange={handleChange}>
                  {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Niveau d'étude</label>
                <select name="niveau_etude" value={formData.niveau_etude} onChange={handleChange}>
                  {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Filière (Abrégée, Majuscules)</label>
              <input 
                type="text" 
                name="filiere" 
                value={formData.filiere} 
                onChange={handleChange} 
                required 
                placeholder="Ex: IDA, RIT, MAGE..."
                maxLength={10}
              />
              <small>Seules les lettres en majuscules sont acceptées.</small>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Envoi en cours...' : 'Confirmer ma participation'} <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
