import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, ArrowRight, Sparkles, Clock, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import socket from '../services/socket';
import './Home.css';

const Home = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on('event:created', () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    });

    socket.on('event:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    });

    socket.on('event:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    });

    return () => {
      socket.off('event:created');
      socket.off('event:updated');
      socket.off('event:deleted');
    };
  }, [queryClient]);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get('/events');
      return res.data.data;
    }
  });

  if (isLoading) return (
    <div className="loading-screen">
      <div className="premium-loader">
        <div className="loader-ring"></div>
        <div className="loader-core"></div>
      </div>
      <p className="loading-text">Chargement</p>
    </div>
  );

  return (
    <div className="home-page">
      <header className="hero glass anim-fade-down">
        <div className="container">
          <div className="hero-content">
            <img src="https://res.cloudinary.com/dqueeyulc/image/upload/q_auto/f_auto/v1778560493/cdf28651-47ff-41a9-84e8-bb7f08543fc0.png" alt="MeetNova Logo" className="logo-header" />
            <div className="hero-text">
              <h1>Bienvenue sur notre centre d'événements</h1>
              <p>Rejoignez les événements les plus marquants de NovaTech LoKo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="feed-header anim-fade-up">
          <div className="section-title">
            <h2>Événements à venir</h2>
            <div className="title-underline"></div>
          </div>
        </section>

        <div className="events-grid">
          {events && events.length > 0 ? (
            events.map((event, index) => (
              <article
                key={event._id}
                className="event-card glass anim-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-image-container">
                  {event.images?.[0] ? (
                    <img src={event.images[0]} alt={event.title} loading="lazy" />
                  ) : (
                    <div className="placeholder-img flex-center">MeetNova</div>
                  )}
                  <div className="card-overlay">
                    <span className="event-type-badge">{event.type}</span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="card-meta">
                    <span className="meta-item"><Calendar size={14} /> {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                    <span className="meta-item"><Clock size={14} /> {event.time}</span>
                  </div>
                  
                  <h3>{event.title}</h3>
                  
                  <div className="location-info">
                    <MapPin size={14} className="icon-red" />
                    <span>{event.location}</span>
                  </div>

                  <p className="event-desc">{event.description}</p>

                  <Link to={`/register/${event._id}`} className="card-cta">
                    <span>Réserver ma place</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state glass anim-fade-up">
              <div className="empty-visual">
                <div className="pulse-ring"></div>
                <Calendar size={60} className="empty-icon" />
              </div>
              <h3>C'est un peu calme ici...</h3>
              <p>Aucun événement n'est prévu pour le moment. Reviens bientôt pour ne rien rater !</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
