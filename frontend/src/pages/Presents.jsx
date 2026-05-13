import { useState, useEffect } from 'react';
import { Users, Search, RefreshCcw, Clock, CheckCircle } from 'lucide-react';
import api from '../services/api';
import './Presents.css';

const Presents = () => {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPresents = async () => {
    setLoading(true);
    try {
      // isPresent=true is handled by our backend update
      const res = await api.get('/scan/list?isPresent=true');
      setAttendees(res.data.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des présents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresents();
    // Rafraîchissement automatique toutes les 15 secondes
    const interval = setInterval(fetchPresents, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filtrage local en plus du backend si l'utilisateur tape une recherche
  const filteredAttendees = attendees.filter(a => 
    a.nom.toLowerCase().includes(search.toLowerCase()) || 
    a.prenoms.toLowerCase().includes(search.toLowerCase()) ||
    a.campus.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="presents-page">
      <main className="container presents-container">
        <header className="presents-header anim-fade-down">
          <div className="header-title">
            <h1>Liste des Présents</h1>
            <p>Contrôle d'accès en temps réel</p>
          </div>
          <div className="stats-badge">
            <Users size={20} />
            <span>{attendees.length} / Présents</span>
          </div>
        </header>

        <div className="presents-actions glass anim-scale-in">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher un participant..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-secondary refresh-btn" onClick={fetchPresents} disabled={loading}>
            <RefreshCcw size={18} className={loading ? 'icon-spin' : ''} />
            Actualiser
          </button>
        </div>

        <div className="presents-list anim-fade-up">
          {loading && attendees.length === 0 ? (
            <div className="loading-state">
              <RefreshCcw size={32} className="icon-spin" />
              <p>Chargement des participants...</p>
            </div>
          ) : filteredAttendees.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={48} className="empty-icon" />
              <p>Aucun participant présent trouvé.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="presents-table">
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Campus</th>
                    <th>Filière / Niveau</th>
                    <th>Heure d'arrivée</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map((attendee) => (
                    <tr key={attendee._id || attendee.uuid}>
                      <td>
                        <div className="participant-info">
                          <strong>{attendee.prenoms} {attendee.nom}</strong>
                          <span className="text-muted">{attendee.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge-campus">{attendee.campus}</span>
                      </td>
                      <td>
                        {attendee.filiere} ({attendee.niveau_etude})
                      </td>
                      <td>
                        <div className="time-info">
                          <Clock size={14} />
                          {new Date(attendee.scannedAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit', minute: '2-digit', second: '2-digit'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Presents;
