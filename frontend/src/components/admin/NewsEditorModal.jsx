import { useState, useEffect } from 'react';
import { X, Save, Info, Camera, Video, File as FileIcon, Trash2 } from 'lucide-react';

const NewsEditorModal = ({ isOpen, onClose, news, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [media, setMedia] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title || '',
        content: news.content || ''
      });
      setPreviews(news.media || []);
      setMedia([]); // On ne modifie pas les anciens médias sauf si on en ajoute de nouveaux
    } else {
      setFormData({ title: '', content: '' });
      setMedia([]);
      setPreviews([]);
    }
  }, [news, isOpen]);

  if (!isOpen) return null;

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    setMedia([...media, ...files]);
    
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      type: file.mimetype.startsWith('video/') ? 'video' : 
            file.mimetype === 'application/pdf' ? 'pdf' : 'image',
      file
    }));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeMedia = (index) => {
    const itemToRemove = previews[index];
    setPreviews(previews.filter((_, i) => i !== index));
    
    if (itemToRemove.file) {
      setMedia(media.filter(f => f !== itemToRemove.file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    
    media.forEach(file => {
      data.append('media', file);
    });

    onSave(data);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card glass">
        <div className="modal-header">
          <div>
            <h2>{news ? 'Modifier l\'actualité' : 'Nouvelle Actualité'}</h2>
            <p>Informez la communauté en temps réel</p>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-section">
              <h3><Info size={18} /> Contenu</h3>
              <div className="form-group">
                <label>Titre</label>
                <input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Lancement du projet NovaTech 2024" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Corps de l'actualité</label>
                <textarea 
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  placeholder="Écrivez votre article ici..." 
                  className="premium-textarea"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3><Camera size={18} /> Médias (Images, Vidéos, PDF)</h3>
              <label className="file-dropzone">
                <input type="file" multiple accept="image/*,video/*,application/pdf" onChange={handleMediaChange} hidden />
                <div style={{display:'flex', gap:'1rem'}}>
                  <Camera size={24} />
                  <Video size={24} />
                  <FileIcon size={24} />
                </div>
                <p style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>Ajouter des fichiers (Max 50Mo)</p>
              </label>

              <div className="previews-grid">
                {previews.map((item, i) => (
                  <div key={i} className="preview-item">
                    {item.type === 'video' ? (
                      <div className="flex-center" style={{height:'100%', background:'#000'}}>
                        <Video size={20} />
                      </div>
                    ) : item.type === 'pdf' ? (
                      <div className="flex-center" style={{height:'100%', background:'#222'}}>
                        <FileIcon size={20} />
                      </div>
                    ) : (
                      <img src={item.url} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                    )}
                    <button 
                      type="button" 
                      onClick={() => removeMedia(i)}
                      className="remove-media-btn"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-modal secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-modal primary" disabled={isSaving}>
              <Save size={18} />
              {news ? 'Enregistrer' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        .remove-media-btn {
          position: absolute;
          top: 2px;
          right: 2px;
          background: var(--error);
          border: none;
          border-radius: 50%;
          color: white;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default NewsEditorModal;
