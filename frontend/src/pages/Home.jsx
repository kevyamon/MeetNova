import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, MapPin, Users, ArrowRight, Sparkles, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { socket, connectSocket, disconnectSocket } from '../services/socket';
import './Home.css';

const Home = () => {
  const queryClient = useQueryClient();

  // Fetch events via TanStack Query
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get('/events');
      return res.data.data;
    }
  });

  useEffect(() => {
    connectSocket();

    // Listen for real-time updates
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
    <div className="flex-center" style={{height: '100vh', flexDirection: 'column', gap: '1rem'}}>
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Rocket size={40} color="var(--primary)" />
      </motion.div>
      <p>Chargement du futur...</p>
    </div>
  );

  return (
    <div className="home-page">
      <header className="hero glass">
        <motion.div 
          className="container"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img src="/src/assets/logo.png" alt="MeetNova Logo" className="logo" />
          <h1>Découvrez le futur de l'innovation</h1>
          <p>Rejoignez les événements les plus marquants de NovaTech LoKo</p>
        </motion.div>
      </header>

      <main className="container">
        <motion.section 
          className="feed-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="title-with-icon">
            <Sparkles size={24} color="var(--primary)" />
            <h2>Événements à venir</h2>
          </div>
        </motion.section>

        <div className="events-grid">
          <AnimatePresence mode="popLayout">
            {events && events.length > 0 ? (
              events.map((event, index) => (
                <motion.article 
                  key={event._id} 
                  className="event-card glass"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
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
                </motion.article>
              ))
            ) : (
              <motion.div 
                className="empty-state glass flex-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ gridColumn: '1 / -1', padding: '5rem', flexDirection: 'column', gap: '1.5rem' }}
              >
                <div className="empty-icon-wrapper">
                  <Rocket size={60} className="floating-icon" />
                </div>
                <h3>C'est un peu calme ici...</h3>
                <p>Aucun événement n'est prévu pour le moment. Reviens bientôt pour ne rien rater !</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Home;
