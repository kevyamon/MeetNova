import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Edit2, Trash2, Camera, Calendar, MapPin, 
  AlignLeft, X, Save, LayoutDashboard,
  Sparkles, Hash, Clock, Info, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import socket from '../services/socket';
import './AdminDashboard.css';

import { DatePickerModal, TimePickerModal, CategoryPickerModal } from '../components/admin/EventPickers';
import AdminEventCard from '../components/admin/AdminEventCard';
import AdminNewsCard from '../components/admin/AdminNewsCard';
import NewsEditorModal from '../components/admin/NewsEditorModal';

const EVENT_TYPES = ['Conférence', 'Hackaton', 'Sortie Détente', 'Formation', 'Autre'];

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast, confirm } = useNotification();
  
  const [activeTab, setActiveTab] = useState('events'); // 'events' ou 'news'
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingNews, setEditingNews] = useState(null);
  
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
    // Socket listeners for real-time updates
    socket.on('event:created', () => queryClient.invalidateQueries({ queryKey: ['events'] }));
    socket.on('event:updated', () => queryClient.invalidateQueries({ queryKey: ['events'] }));
    socket.on('event:deleted', () => queryClient.invalidateQueries({ queryKey: ['events'] }));
    
    socket.on('news:created', () => queryClient.invalidateQueries({ queryKey: ['news'] }));
    socket.on('news:updated', () => queryClient.invalidateQueries({ queryKey: ['news'] }));
    socket.on('news:deleted', () => queryClient.invalidateQueries({ queryKey: ['news'] }));

    if (isModalOpen || isNewsModalOpen || showDatePicker || showTimePicker || showCategoryPicker) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      socket.off('event:created');
      socket.off('event:updated');
      socket.off('event:deleted');
      socket.off('news:created');
      socket.off('news:updated');
      socket.off('news:deleted');
      document.body.style.overflow = '';
    };
  }, [queryClient, isModalOpen, isNewsModalOpen, showDatePicker, showTimePicker, showCategoryPicker]);

  // Fetch Events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get('/events');
      return res.data.data;
    }
  });

  // Fetch News
  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const res = await api.get('/news');
      return res.data.data;
    }
  });

  // Event Mutations
  const createEventMutation = useMutation({
    mutationFn: (formData) => api.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast("L'événement a été publié !");
      closeModal();
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, formData }) => api.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast("Modifications enregistrées !");
      closeModal();
    }
  });

  // News Mutations
  const createNewsMutation = useMutation({
    mutationFn: (formData) => api.post('/news', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['news']);
      toast("Actualité publiée avec succès !");
      setIsNewsModalOpen(false);
      setEditingNews(null);
    }
  });

  const updateNewsMutation = useMutation({
    mutationFn: ({ id, formData }) => api.put(`/news/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['news']);
      toast("Actualité mise à jour !");
      setIsNewsModalOpen(false);
      setEditingNews(null);
    }
  });

  const deleteNewsMutation = useMutation({
    mutationFn: (id) => api.delete(`/news/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['news']);
      toast("Actualité supprimée");
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id) => api.delete(`/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast("Événement supprimé");
    }
  });

  const handleEventSubmit = (e) => {
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
      updateEventMutation.mutate({ id: editingEvent._id, formData });
    } else {
      createEventMutation.mutate(formData);
    }
  };

  const handleNewsSave = (formData) => {
    if (editingNews) {
      updateNewsMutation.mutate({ id: editingNews._id, formData });
    } else {
      createNewsMutation.mutate(formData);
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

  const handleDeleteEvent = (id) => {
    confirm("Supprimer cet événement ?", () => deleteEventMutation.mutate(id));
  };

  const handleDeleteNews = (id) => {
    confirm("Supprimer cette actualité ?", () => deleteNewsMutation.mutate(id));
  };

  if (eventsLoading || newsLoading) return (
    <div className="loading-screen">
      <div className="premium-loader">
        <div className="loader-ring"></div>
      </div>
      <p>Chargement du Hub Admin...</p>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <main className="admin-content">
        <header className="content-header anim-fade-down">
          <div>
            <h1>Dashboard NovaTech</h1>
            <p>Pilotez votre communauté en temps réel</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-primary add-btn" 
              onClick={() => activeTab === 'events' ? openModal() : setIsNewsModalOpen(true)}
            >
              <Plus size={20} /> <span className="hide-mobile">Publier</span>
            </button>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="admin-tabs-v2 glass">
          <button 
            className={activeTab === 'events' ? 'active' : ''} 
            onClick={() => setActiveTab('events')}
          >
            <Calendar size={18} /> Événements
          </button>
          <button 
            className={activeTab === 'news' ? 'active' : ''} 
            onClick={() => setActiveTab('news')}
          >
            <FileText size={18} /> Actualités
          </button>
        </div>

        <div className="events-grid-admin anim-fade-up">
          {activeTab === 'events' ? (
            events && events.length > 0 ? (
              events.map((event, index) => (
                <AdminEventCard 
                  key={event._id} 
                  event={event} 
                  index={index} 
                  onEdit={openModal} 
                  onDelete={handleDeleteEvent} 
                />
              ))
            ) : (
              <div className="empty-state-admin glass">
                <Calendar size={48} />
                <h3>Aucun événement</h3>
                <p>Commencez par en créer un.</p>
              </div>
            )
          ) : (
            news && news.length > 0 ? (
              news.map((n, index) => (
                <AdminNewsCard 
                  key={n._id} 
                  news={n} 
                  index={index} 
                  onEdit={(item) => { setEditingNews(item); setIsNewsModalOpen(true); }} 
                  onDelete={handleDeleteNews} 
                />
              ))
            ) : (
              <div className="empty-state-admin glass">
                <FileText size={48} />
                <h3>Aucune actualité</h3>
                <p>Partagez une nouvelle avec les membres.</p>
              </div>
            )
          )}
        </div>
      </main>

      {/* Event Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card glass">
            <div className="modal-header">
              <div>
                <h2>{editingEvent ? 'Modifier l\'événement' : 'Nouvel Événement'}</h2>
                <p>Remplissez les détails ci-dessous</p>
              </div>
              <button className="close-btn" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleEventSubmit} className="modal-form">
              <input type="hidden" name="date" value={formDate} />
              <input type="hidden" name="time" value={formTime} />
              <div className="form-grid">
                <div className="form-section">
                  <h3><Info size={18} /> Infos</h3>
                  <div className="form-group">
                    <label>Titre</label>
                    <input name="title" defaultValue={editingEvent?.title} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Type</label>
                      <div className="custom-input-trigger" onClick={() => setShowCategoryPicker(true)}>
                        <span>{selectedType}</span>
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" defaultValue={editingEvent?.description} className="premium-textarea" />
                  </div>
                </div>
                <div className="form-section">
                  <h3><MapPin size={18} /> Logistique</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Date</label>
                      <div className="custom-input-trigger" onClick={() => setShowDatePicker(true)}>
                        <span>{formDate || 'Choisir'}</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Heure</label>
                      <div className="custom-input-trigger" onClick={() => setShowTimePicker(true)}>
                        <span>{formTime || 'Choisir'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Lieu</label>
                    <input name="location" defaultValue={editingEvent?.location} required />
                  </div>
                  <div className="form-group">
                    <label>Images (Max 5)</label>
                    <input type="file" multiple accept="image/*" onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setImages([...images, ...files]);
                      setImagePreviews([...imagePreviews, ...files.map(f => URL.createObjectURL(f))]);
                    }} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-modal secondary" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn-modal primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* News Modal */}
      <NewsEditorModal 
        isOpen={isNewsModalOpen} 
        onClose={() => { setIsNewsModalOpen(false); setEditingNews(null); }}
        news={editingNews}
        onSave={handleNewsSave}
        isSaving={createNewsMutation.isPending || updateNewsMutation.isPending}
      />

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
