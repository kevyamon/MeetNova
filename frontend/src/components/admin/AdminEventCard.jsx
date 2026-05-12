import { Calendar, MapPin, Edit2, Trash2 } from 'lucide-react';

const AdminEventCard = ({ event, index, onEdit, onDelete }) => {
  return (
    <div className="event-card-admin glass" style={{animationDelay: `${index * 0.1}s`}}>
      <div className="card-banner">
        <img src={event.images?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'} alt="" />
      </div>
      <div className="card-body">
        <h3>{event.title}</h3>
        <div className="card-meta">
          <span><Calendar size={14} /> {new Date(event.date).toLocaleDateString()}</span>
          <span><MapPin size={14} /> {event.location}</span>
          <span className="type-badge-inline">{event.type}</span>
        </div>
        <div className="card-actions">
          <button className="btn-icon" onClick={() => onEdit(event)} title="Modifier">
            <Edit2 size={18} />
          </button>
          <button className="btn-icon delete" onClick={() => onDelete(event._id)} title="Supprimer">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEventCard;
