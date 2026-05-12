import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, ArrowRight, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { socket, connectSocket, disconnectSocket } from '../services/socket';
import './Home.css';

const Home = () => {
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get('/events');
      return res.data.data;
    }
  });

  useEffect(() => {
    connectSocket();

    socket.on('event:created', (newEvent) => {
      queryClient.setQueryData(['events'], (old) => [...(old || []), newEvent]);
    });

    socket.on('event:updated', (updatedEvent) => {
      queryClient.setQueryData(['events'], (old) =>
        old?.map(event => event._id === updatedEvent._id ? updatedEvent : event)
      );
    });

    socket.on('event:deleted', (deletedId) => {
      queryClient.setQueryData(['events'], (old) =>
        old?.filter(event => event._id !== deletedId)
      );
    });

    return () => disconnectSocket();
  }, [queryClient]);

  if (isLoading) return (
    <div className="loading-screen">
      <div className="loading-rocket"><Rocket size={40} /></div>
      <p>Chargement du futur...</p>
    </div>
  );

  return (
    <div className="home-page">
      <header className="hero glass anim-fade-down">
        <div className="container">
          <img src="/src/assets/logo.png" alt="MeetNova Logo" className="logo" />
          <h1>Découvrez le futur de l'innovation</h1>
          <p>Rejoignez les événements les plus marquants de NovaTech LoKo</p>
        </div>
      </header>

      <main className="container">
        <section className="feed-header anim-fade-up">
          <h2>Événements à venir</h2>
        </section>

        <div className="events-grid">
          {events && events.length > 0 ? (
            events.map((event, index) => (
              <article
                key={event._id}
                className="event-card glass anim-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-image">
                  {event.images?.[0] ? (
                    <img src={event.images[0]} alt={event.title} />
                  ) : (
                    <div className="placeholder-img flex-center">MeetNova</div>
                  )}
                  <span className="event-type">{event.type}</span>
                </div>

                <div className="card-content">
                  <h3>{event.title}</h3>
                  <div className="event-details">
                    <span><Calendar size={16} /> {new Date(event.date).toLocaleDateString()} à {event.time}</span>
                    <span><MapPin size={16} /> {event.location}</span>
                  </div>
                  <p className="description">{event.description}</p>

                  <Link to={`/register/${event._id}`} className="btn-primary">
                    Participer <ArrowRight size={18} />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state glass anim-fade-up">
              <div className="empty-icon-wrapper">
                <Rocket size={60} className="floating-icon" />
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
