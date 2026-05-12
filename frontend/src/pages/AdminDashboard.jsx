import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Edit2, Trash2, Camera, Calendar, MapPin, 
  AlignLeft, X, Save, LayoutDashboard,
  Sparkles, Hash, Clock, Info, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import './AdminDashboard.css';

const EVENT_TYPES = ['Conférence', 'Hackaton', 'Sortie Détente', 'Formation', 'Autre'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

const DatePickerModal = ({ isOpen, onClose, value, onSelect }) => {
  const today = new Date();
  const [viewDate, setViewDate] = useState(value ? new Date(value) : today);
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);

  if (!isOpen) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const selectDate = (day) => {
    const date = new Date(year, month, day);
    setSelectedDate(date);
    onSelect(date.toISOString().split('T')[0]);
    onClose();
  };

  const formatDisplay = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="custom-picker-overlay" onClick={onClose}>
      <div className="custom-picker-modal" onClick={e => e.stopPropagation()}>
        <div className="picker-header">
          <button onClick={prevMonth}><ChevronLeft size={20} /></button>
          <span>{MONTHS[month]} {year}</span>
          <button onClick={nextMonth}><ChevronRight size={20} /></button>
        </div>
        <div className="picker-weekdays">
          {DAYS.map(d => <span key={d}>{d}</span>)}
        </div>
        <div className="picker-days">
          {Array.from({ length: firstDay }).map((_, i) => <span key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const date = new Date(year, month, day);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isPast = date < today && date.toDateString() !== today.toDateString();
            return (
              <button 
                key={day} 
                className={`day-btn ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                onClick={() => !isPast && selectDate(day)}
                disabled={isPast}
              >
                {day}
              </button>
            );
          })}
        </div>
        {selectedDate && (
          <div className="picker-footer">
            <span>{formatDisplay(selectedDate)}</span>
            <button className="confirm-btn" onClick={() => { onSelect(selectedDate.toISOString().split('T')[0]); onClose(); }}>
              <Check size={18} /> Confirmer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const TimePickerModal = ({ isOpen, onClose, value, onSelect }) => {
  const [hours, setHours] = useState('08');
  const [minutes, setMinutes] = useState('00');

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setHours(h || '08');
      setMinutes(m || '00');
    }
  }, [value, isOpen]);

  if (!isOpen) return null;

  const adjustHours = (delta) => {
    let h = parseInt(hours) + delta;
    if (h < 0) h = 23;
    if (h > 23) h = 0;
    setHours(h.toString().padStart(2, '0'));
  };

  const adjustMinutes = (delta) => {
    let m = parseInt(minutes) + delta;
    if (m < 0) m = 45;
    if (m > 45) m = 0;
    setMinutes(m.toString().padStart(2, '0'));
  };

  const confirm = () => {
    onSelect(`${hours}:${minutes}`);
    onClose();
  };

  return (
    <div className="custom-picker-overlay" onClick={onClose}>
      <div className="custom-picker-modal time-picker" onClick={e => e.stopPropagation()}>
        <h3>Choisir l'heure</h3>
        <div className="time-display">
          <div className="time-column">
            <button onClick={() => adjustHours(1)}><ChevronUp size={24} /></button>
            <span className="time-value">{hours}</span>
            <button onClick={() => adjustHours(-1)}><ChevronDown size={24} /></button>
          </div>
          <span className="time-separator">:</span>
          <div className="time-column">
            <button onClick={() => adjustMinutes(15)}><ChevronUp size={24} /></button>
            <span className="time-value">{minutes}</span>
            <button onClick={() => adjustMinutes(-15)}><ChevronDown size={24} /></button>
          </div>
        </div>
        <div className="time-presets">
          <button onClick={() => { setHours('08'); setMinutes('00'); }}>08:00</button>
          <button onClick={() => { setHours('10'); setMinutes('00'); }}>10:00</button>
          <button onClick={() => { setHours('14'); setMinutes('00'); }}>14:00</button>
          <button onClick={() => { setHours('18'); setMinutes('00'); }}>18:00</button>
        </div>
        <div className="picker-actions">
          <button className="cancel-btn" onClick={onClose}>Annuler</button>
          <button className="confirm-btn" onClick={confirm}><Check size={18} /> Valider</button>
        </div>
      </div>
    </div>
  );
};

const CategoryPickerModal = ({ isOpen, onClose, value, onSelect, customValue, onCustomChange }) => {
  if (!isOpen) return null;

  const select = (type) => {
    onSelect(type);
    onClose();
  };

  return (
    <div className="custom-picker-overlay" onClick={onClose}>
      <div className="custom-picker-modal category-picker" onClick={e => e.stopPropagation()}>
        <h3>Choisir une catégorie</h3>
        <div className="category-list">
          {EVENT_TYPES.map(type => (
            <button 
              key={type} 
              className={`category-btn ${value === type ? 'selected' : ''}`}
              onClick={() => select(type)}
            >
              {type}
            </button>
          ))}
        </div>
        {value === 'Autre' && (
          <div className="custom-type-input">
            <input 
              type="text" 
              value={customValue} 
              onChange={(e) => onCustomChange(e.target.value)}
              placeholder="Nom de la catégorie..."
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast, confirm } = useNotification();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [selectedType, setSelectedType] = useState(EVENT_TYPES[0]);
  const [customType, setCustomType] = useState('');
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');

  useEffect(() => {
    if (isModalOpen || showDatePicker || showTimePicker || showCategoryPicker) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen, showDatePicker, showTimePicker, showCategoryPicker]);

  // Fetch Events
  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get('/events');
      return res.data.data;
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData) => api.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast("L'événement a été publié avec succès !");
      closeModal();
    },
    onError: (error) => {
      toast(error.response?.data?.message || "Erreur lors de la publication", "error");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => api.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast("Modifications enregistrées !");
      closeModal();
    },
    onError: (error) => {
      toast(error.response?.data?.message || "Erreur lors de la modification", "error");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast("Événement supprimé");
    },
    onError: () => toast("Erreur lors de la suppression", "error")
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast("Maximum 5 images autorisées", "warning");
      return;
    }
    setImages([...images, ...files]);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    const data = Object.fromEntries(new FormData(e.target));
    
    Object.keys(data).forEach(key => {
      if (key !== 'images' && key !== 'type') formData.append(key, data[key]);
    });
    
    const finalType = selectedType === 'Autre' ? customType : selectedType;
    formData.append('type', finalType);
    
    images.forEach(img => formData.append('images', img));

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent._id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openModal = (event = null) => {
    setEditingEvent(event);
    setImages([]);
    setImagePreviews(event?.images || []);
    setFormDate(event?.date ? event.date.split('T')[0] : '');
    setFormTime(event?.time || '');
    
    if (event) {
      if (EVENT_TYPES.includes(event.type)) {
        setSelectedType(event.type);
        setCustomType('');
      } else {
        setSelectedType('Autre');
        setCustomType(event.type);
      }
    } else {
      setSelectedType(EVENT_TYPES[0]);
      setCustomType('');
    }
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setImages([]);
    setImagePreviews([]);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowCategoryPicker(false);
  };

  const handleDelete = (id) => {
    confirm("Êtes-vous sûr de vouloir supprimer cet événement ?", () => {
      deleteMutation.mutate(id);
    });
  };

  if (isLoading) return (
    <div className="loading-screen">
      <div className="premium-loader">
        <div className="loader-ring"></div>
      </div>
      <p>Initialisation du Hub...</p>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <main className="admin-content">
        <header className="content-header anim-fade-down">
          <div>
            <h1>Gestion des Événements</h1>
            <p>Pilotez NovaTech LoKo</p>
          </div>
          <button className="btn-primary add-btn" onClick={() => openModal()}>
            <Plus size={20} /> <span className="hide-mobile">Nouveau</span>
          </button>
        </header>

        <div className="events-grid-admin anim-fade-up">
          {events && events.length > 0 ? (
            events.map((event, index) => (
              <div key={event._id} className="event-card-admin glass" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="card-banner">
                  <img src={event.images?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'} alt="" />
                  <span className="type-badge">{event.type}</span>
                </div>
                <div className="card-body">
                  <h3>{event.title}</h3>
                  <div className="card-meta">
                    <span><Calendar size={14} /> {new Date(event.date).toLocaleDateString()}</span>
                    <span><MapPin size={14} /> {event.location}</span>
                  </div>
                  <div className="card-actions">
                    <button className="btn-icon" onClick={() => openModal(event)} title="Modifier"><Edit2 size={18} /></button>
                    <button className="btn-icon delete" onClick={() => handleDelete(event._id)} title="Supprimer"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state glass" style={{gridColumn: '1 / -1', textAlign: 'center', padding: '4rem'}}>
              <Calendar size={48} style={{opacity: 0.3, marginBottom: '1rem'}} />
              <h3>Aucun événement pour le moment</h3>
              <p style={{color: 'var(--text-muted)'}}>Cliquez sur "Nouveau" pour commencer.</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Premium Overhaul */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card glass">
            <div className="modal-header">
              <div>
                <h2>{editingEvent ? 'Modifier l\'événement' : 'Nouvel Événement'}</h2>
                <p>Configurez les détails et publiez en un clic</p>
              </div>
              <button className="close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <input type="hidden" name="date" value={formDate} />
              <input type="hidden" name="time" value={formTime} />
              <div className="form-grid">
                {/* Colonne Gauche : Infos */}
                <div className="form-section">
                  <h3><Info size={18} /> Informations de base</h3>
                  <div className="form-group">
                    <label>Titre de l'événement</label>
                    <input name="title" defaultValue={editingEvent?.title} placeholder="Ex: Hackaton Innov'2024" required />
                  </div>

                  <div className="form-row" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem'}}>
                    <div className="form-group">
                      <label>Catégorie</label>
                      <div className="custom-input-trigger" onClick={() => setShowCategoryPicker(true)}>
                        <span>{selectedType}</span>
                        <ChevronRight size={18} className="trigger-arrow" />
                      </div>
                    </div>
                    {selectedType === 'Autre' && (
                      <div className="form-group anim-fade-up">
                        <label>Précisez le type</label>
                        <input 
                          value={customType} 
                          onChange={(e) => setCustomType(e.target.value)} 
                          placeholder="Nom du type" 
                          required 
                        />
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Description détaillée</label>
                    <textarea 
                      name="description" 
                      defaultValue={editingEvent?.description} 
                      placeholder="Décrivez l'expérience que vont vivre les participants..." 
                      className="premium-textarea"
                    />
                  </div>
                </div>

                {/* Colonne Droite : Logistique & Médias */}
                <div className="form-section">
                  <h3><Calendar size={18} /> Logistique & Lieu</h3>
                  <div className="form-row" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem'}}>
                    <div className="form-group">
                      <label>Date</label>
                      <div className="custom-input-trigger" onClick={() => setShowDatePicker(true)}>
                        <Calendar size={16} />
                        <span>{formDate ? new Date(formDate).toLocaleDateString('fr-FR') : 'Sélectionner'}</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Heure</label>
                      <div className="custom-input-trigger" onClick={() => setShowTimePicker(true)}>
                        <Clock size={16} />
                        <span>{formTime || 'Choisir'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Lieu / Salle</label>
                    <input name="location" defaultValue={editingEvent?.location} placeholder="Ex: Amphi A, Campus Loko" required />
                  </div>

                  <div className="form-group">
                    <label>Galerie Photos (Max 5)</label>
                    <label className="file-dropzone">
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} hidden />
                      <Camera size={24} style={{marginBottom:'0.5rem'}} />
                      <p style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Cliquez pour ajouter des photos</p>
                    </label>
                    <div className="previews-grid">
                      {imagePreviews.map((url, i) => (
                        <div key={i} className="preview-item">
                          <img src={url} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                          <button 
                            type="button" 
                            onClick={() => removeImage(i)}
                            style={{position:'absolute', top:2, right:2, background:'var(--error)', border:'none', borderRadius:'50%', color:'white', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'}}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-modal secondary" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn-modal primary" disabled={createMutation.isPending || updateMutation.isPending}>
                  <Save size={18} />
                  {editingEvent ? 'Mettre à jour' : 'Publier maintenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DatePickerModal 
        isOpen={showDatePicker} 
        onClose={() => setShowDatePicker(false)} 
        value={formDate}
        onSelect={setFormDate}
      />
      
      <TimePickerModal 
        isOpen={showTimePicker} 
        onClose={() => setShowTimePicker(false)} 
        value={formTime}
        onSelect={setFormTime}
      />
      
      <CategoryPickerModal 
        isOpen={showCategoryPicker} 
        onClose={() => setShowCategoryPicker(false)} 
        value={selectedType}
        onSelect={setSelectedType}
        customValue={customType}
        onCustomChange={setCustomType}
      />
    </div>
  );
};

export default AdminDashboard;
