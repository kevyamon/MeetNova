import { Calendar, FileText, Edit2, Trash2, Image as ImageIcon, Video, File as FileIcon } from 'lucide-react';

const AdminNewsCard = ({ news, index, onEdit, onDelete }) => {
  const getMediaIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={14} />;
      case 'pdf': return <FileIcon size={14} />;
      default: return <ImageIcon size={14} />;
    }
  };

  return (
    <div className="event-card-admin glass" style={{animationDelay: `${index * 0.1}s`}}>
      <div className="card-banner">
        {news.media?.[0]?.type === 'video' ? (
          <video src={news.media[0].url} muted style={{width:'100%', height:'100%', objectFit:'cover'}} />
        ) : news.media?.[0]?.type === 'pdf' ? (
          <div className="flex-center" style={{height:'100%', background:'rgba(255,255,255,0.05)', flexDirection:'column', gap:'0.5rem'}}>
            <FileIcon size={40} className="text-dim" />
            <span style={{fontSize:'0.7rem'}}>Document PDF</span>
          </div>
        ) : (
          <img src={news.media?.[0]?.url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'} alt="" />
        )}
      </div>
      <div className="card-body">
        <h3>{news.title}</h3>
        <div className="card-meta">
          <span><Calendar size={14} /> {new Date(news.createdAt).toLocaleDateString()}</span>
          <span className="type-badge-inline">
            {news.media?.length || 0} média(s)
          </span>
        </div>
        <div className="card-actions">
          <button className="btn-icon" onClick={() => onEdit(news)} title="Modifier">
            <Edit2 size={18} />
          </button>
          <button className="btn-icon delete" onClick={() => onDelete(news._id)} title="Supprimer">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsCard;
