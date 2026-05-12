import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sparkles, FileText, Search, RefreshCcw } from 'lucide-react';
import api from '../services/api';
import socket from '../services/socket';
import NewsCard from '../components/public/NewsCard';
import './News.css';
import { useEffect } from 'react';

const News = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    window.scrollTo(0, 0);

    socket.on('news:created', () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    });

    socket.on('news:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    });

    socket.on('news:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    });

    return () => {
      socket.off('news:created');
      socket.off('news:updated');
      socket.off('news:deleted');
    };
  }, [queryClient]);

  const { data: news, isLoading, error, refetch } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const res = await api.get('/news');
      return res.data.data;
    }
  });

  if (isLoading) return (
    <div className="news-loading">
      <div className="quantum-spinner"></div>
      <p>Chargement des actualités...</p>
    </div>
  );

  return (
    <div className="news-page">
      <header className="news-hero anim-fade-down">
        <div className="container">
          <div className="badge-new">
            <Sparkles size={14} /> Le pouls de NovaTech
          </div>
          <h1>Actualités & Innovations</h1>
          <p>Découvrez les dernières avancées, projets et moments forts de notre communauté.</p>
        </div>
      </header>

      <main className="container news-content-main">
        <div className="news-filters glass anim-fade-up">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Rechercher une actualité..." />
          </div>
          <button className="btn-refresh" onClick={() => refetch()} title="Actualiser">
            <RefreshCcw size={18} />
          </button>
        </div>

        {error ? (
          <div className="news-error glass">
            <p>Impossible de charger les actualités.</p>
            <button onClick={() => refetch()}>Réessayer</button>
          </div>
        ) : news && news.length > 0 ? (
          <div className="news-grid">
            {news.map((item, index) => (
              <NewsCard key={item._id} news={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="news-empty glass anim-scale-in">
            <FileText size={64} />
            <h2>Le silence est d'or</h2>
            <p>Aucune actualité n'a été publiée pour le moment. Revenez bientôt !</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default News;
