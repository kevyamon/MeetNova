import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Edit2, Trash2, Camera, Calendar, MapPin, 
  Type, AlignLeft, X, Save, LogOut, LayoutDashboard 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './AdminDashboard.css';

const EVENT_TYPES = ['Conférence', 'Hackaton', 'Sortie Détente', 'Formation', 'Autre'];

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

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
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => api.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/events/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['events'])
  });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert("Maximum 5 images autorisées");
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
      if (key !== 'images') formData.append(key, data[key]);
    });
    
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
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setImages([]);
    setImagePreviews([]);
  };

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ? Les participants seront notifiés par email.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/mnccadmin');
  };

  if (isLoading) return <div className="flex-center">Chargement...</div>;

  return (
    <div className="admin-dashboard">
      <aside className="sidebar glass">
        <div className="sidebar-header">
          <img src="/src/assets/logo.png" alt="" className="sidebar-logo" />
          <span>MeetNova Admin</span>
        </div>
        <nav>
          <button className="nav-item active"><Calendar size={20} /> Événements</button>
          <button className="nav-item" onClick={() => navigate('/mnccadmin/scan')}><Camera size={20} /> Scan Pass</button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}><LogOut size={20} /> Déconnexion</button>
      </aside>

      <main className="admin-content">
        <header className="content-header">
          <h1>Gestion des Événements</h1>
          <button className="btn-primary" onClick={() => openModal()}>
            <Plus size={20} /> Nouvel Événement
          </button>
        </header>

        <div className="events-table-container glass">
          <table className="events-table">
            <thead>
              <tr>
                <th>Événement</th>
                <th>Type</th>
                <th>Date & Lieu</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events?.map(event => (
                <tr key={event._id}>
                  <td>
                    <div className="event-cell">
                      <img src={event.images?.[0] || '/placeholder.png'} alt="" />
                      <span>{event.title}</span>
                    </div>
                  </td>
                  <td><span className="badge-type">{event.type}</span></td>
                  <td>
                    <div className="date-cell">
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      <small>{event.location}</small>
                    </div>
                  </td>
                  <td><span className={`status-tag ${event.status}`}>{event.status}</span></td>
                  <td className="actions-cell">
                    <button onClick={() => openModal(event)} title="Modifier"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(event._id)} title="Supprimer" className="delete"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Création / Edition */}
      {isModalOpen && (
        <div className="modal-overlay flex-center">
          <div className="modal-card glass">
            <div className="modal-header">
              <h2>{editingEvent ? 'Modifier' : 'Créer'} un Événement</h2>
              <button onClick={closeModal}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label><Type size={16} /> Titre de l'événement</label>
                <input name="title" defaultValue={editingEvent?.title} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><Calendar size={16} /> Date</label>
                  <input type="date" name="date" defaultValue={editingEvent?.date?.split('T')[0]} required />
                </div>
                <div className="form-group">
                  <label>Heure</label>
                  <input type="time" name="time" defaultValue={editingEvent?.time} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" defaultValue={editingEvent?.type || EVENT_TYPES[0]}>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label><MapPin size={16} /> Lieu</label>
                  <input name="location" defaultValue={editingEvent?.location} required />
                </div>
              </div>

              <div className="form-group">
                <label><AlignLeft size={16} /> Description</label>
                <textarea name="description" defaultValue={editingEvent?.description} rows="3" />
              </div>

              <div className="form-group">
                <label><Camera size={16} /> Images (Max 5)</label>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="file-input" />
                <div className="previews-grid">
                  {imagePreviews.map((url, i) => (
                    <div key={i} className="preview-item">
                      <img src={url} alt="" />
                      <button type="button" onClick={() => removeImage(i)}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                  <Save size={20} /> {editingEvent ? 'Mettre à jour' : 'Publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
