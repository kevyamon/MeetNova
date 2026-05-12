import { useState, useRef, useEffect } from 'react';
import { 
  Calendar, ChevronRight, X, ChevronLeft, 
  ArrowUp, Maximize2, FileText, Play, Download 
} from 'lucide-react';

const NewsModal = ({ isOpen, onClose, news, initialIndex = 0 }) => {
  const modalRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentMediaIndex(initialIndex);
      setShowScrollTop(false);
    } else {
      document.body.style.overflow = '';
    }

    const handleModalScroll = () => {
      if (modalRef.current && modalRef.current.scrollTop > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    const currentRef = modalRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleModalScroll);
    }

    return () => {
      document.body.style.overflow = '';
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleModalScroll);
      }
    };
  }, [isOpen]);

  if (!isOpen || !news) return null;

  const handleScrollToTop = (e) => {
    e.stopPropagation();
    modalRef.current?.querySelector('.modal-text-section').scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % news.media.length);
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + news.media.length) % news.media.length);
  };

  return (
    <div className="news-modal-overlay anim-fade-in" onClick={onClose}>
      <div className="news-modal-content glass anim-scale-in" onClick={e => e.stopPropagation()} ref={modalRef}>
        <button className="modal-close-v2" onClick={onClose}><X size={24} /></button>
        
        <div className="modal-media-section">
          {news.media && news.media.length > 0 ? (
            <div className="media-viewer">
              {news.media[currentMediaIndex].type === 'video' ? (
                <video src={news.media[currentMediaIndex].url} controls className="viewer-main" />
              ) : news.media[currentMediaIndex].type === 'pdf' ? (
                <div className="pdf-viewer-placeholder">
                  <FileText size={60} />
                  <a href={news.media[currentMediaIndex].url} target="_blank" rel="noreferrer" className="btn-primary">
                    <Download size={18} /> Télécharger le PDF
                  </a>
                </div>
              ) : (
                <img src={news.media[currentMediaIndex].url} alt="" className="viewer-main" />
              )}
              
              {news.media.length > 1 && (
                <>
                  <button className="nav-btn prev" onClick={prevMedia}><ChevronLeft size={24} /></button>
                  <button className="nav-btn next" onClick={nextMedia}><ChevronRight size={24} /></button>
                  <div className="media-counter">{currentMediaIndex + 1} / {news.media.length}</div>
                </>
              )}
            </div>
          ) : (
            <div className="media-placeholder-v2">
              <FileText size={48} />
            </div>
          )}
        </div>

        <div className="modal-text-section">
          <div className="modal-meta">
            <Calendar size={16} />
            <span>{new Date(news.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <h1>{news.title}</h1>
          <div className="modal-body-text">
            {news.content.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          
          {showScrollTop && (
            <button className="modal-scroll-top visible" onClick={handleScrollToTop}>
              <ArrowUp size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const NewsCard = ({ news, index }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const [currentImg, setCurrentImg] = useState(0);
  
  const images = news.media?.filter(m => m.type === 'image') || [];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    let interval;
    if (hasMultipleImages && !isModalOpen) {
      interval = setInterval(() => {
        setCurrentImg(prev => (prev + 1) % images.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [hasMultipleImages, isModalOpen, images.length]);

  const nextImg = (e) => {
    e.stopPropagation();
    setCurrentImg(prev => (prev + 1) % images.length);
  };

  const prevImg = (e) => {
    e.stopPropagation();
    setCurrentImg(prev => (prev - 1 + images.length) % images.length);
  };

  const handleOpenModal = () => {
    const realIndex = news.media.findIndex(m => m.url === images[currentImg]?.url);
    setInitialIndex(realIndex >= 0 ? realIndex : 0);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="news-card glass anim-scale-in" style={{animationDelay: `${index * 0.1}s`}}>
        <div className="news-card-banner">
          {images.length > 0 ? (
            <div className="carousel-mini">
              {images.map((img, i) => (
                <img 
                  key={i} 
                  src={img.url} 
                  alt="" 
                  className={i === currentImg ? 'active' : ''} 
                />
              ))}
              {hasMultipleImages && (
                <>
                  <button className="mini-nav-btn prev" onClick={prevImg}><ChevronLeft size={16} /></button>
                  <button className="mini-nav-btn next" onClick={nextImg}><ChevronRight size={16} /></button>
                  <div className="carousel-dots">
                    {images.map((_, i) => (
                      <div key={i} className={`dot ${i === currentImg ? 'active' : ''}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : news.media?.[0]?.type === 'video' ? (
            <div className="video-thumb">
              <Play size={40} />
              <video src={news.media[0].url} muted />
            </div>
          ) : (
            <div className="news-placeholder">
              <FileText size={48} />
            </div>
          )}
        </div>
        
        <div className="news-card-body">
          <div className="news-meta">
            <Calendar size={14} />
            <span>{new Date(news.createdAt).toLocaleDateString()}</span>
          </div>
          <h3>{news.title}</h3>
          <p className="news-excerpt">{news.content}</p>
          
          <button className="btn-read-more" onClick={handleOpenModal}>
            Tout lire <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <NewsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        news={news} 
        initialIndex={initialIndex}
      />
    </>
  );
};

export default NewsCard;
