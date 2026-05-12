import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, CheckCircle, XCircle, RefreshCcw, Info } from 'lucide-react';
import api from '../services/api';
import './Scan.css';

const Scan = () => {
  const navigate = useNavigate();
  const [uuid, setUuid] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    if (!uuid) return;

    setStatus('loading');
    setErrorMsg('');
    setResult(null);

    try {
      const res = await api.post('/scan/validate', { uuid });
      setResult(res.data.data);
      setStatus('success');
      setUuid('');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Code invalide ou erreur serveur');
      setStatus('error');
    }
  };

  return (
    <div className="scan-page">
      <header className="scan-header container">
        <button className="back-btn" onClick={() => navigate('/mnccadmin/dashboard')}>
          <ArrowLeft size={24} />
        </button>
        <h1>Validation des Pass</h1>
      </header>

      <main className="container scan-content">
        <div className="scan-card glass">
          <div className="scan-visual">
            {status === 'idle' && <Camera size={100} className="icon-pulse" />}
            {status === 'loading' && <RefreshCcw size={100} className="icon-spin" />}
            {status === 'success' && <CheckCircle size={100} color="var(--success)" />}
            {status === 'error' && <XCircle size={100} color="var(--error)" />}
          </div>

          <form onSubmit={handleScan} className="scan-form">
            <p>Saisissez ou scannez l'UUID du billet</p>
            <input 
              type="text" 
              value={uuid} 
              onChange={(e) => setUuid(e.target.value)}
              placeholder="Ex: 550e8400-e29b-41d4-a716-446655440000"
              autoFocus
            />
            <button type="submit" className="btn-primary" disabled={status === 'loading'}>
              Valider le Pass
            </button>
          </form>

          {status === 'success' && result && (
            <div className="result-card success">
              <div className="result-header">
                <h3>Accès Autorisé</h3>
                <span className="badge-success">VALIDE</span>
              </div>
              <div className="result-info">
                <p><strong>Participant :</strong> {result.attendee.prenoms} {result.attendee.nom}</p>
                <p><strong>Filière :</strong> {result.attendee.filiere} ({result.attendee.niveau_etude})</p>
                <p><strong>Événement :</strong> {result.event.title}</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="result-card error">
              <div className="result-header">
                <h3>Accès Refusé</h3>
                <span className="badge-error">ERREUR</span>
              </div>
              <p className="error-text">{errorMsg}</p>
            </div>
          )}
        </div>

        <div className="scan-stats glass">
          <h3><Info size={18} /> Rappel Sécurité</h3>
          <ul>
            <li>Le pass est à usage unique.</li>
            <li>Vérifiez l'identité du participant si nécessaire.</li>
            <li>En cas de litige, contactez le support NovaTech.</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Scan;
