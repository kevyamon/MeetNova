import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, ArrowLeft, CheckCircle, XCircle, 
  RefreshCcw, Info, Hash, Scan as ScanIcon, 
  User, BookOpen, Clock, MapPin
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import './Scan.css';

const Scan = () => {
  const navigate = useNavigate();
  const { toast } = useNotification();
  const [mode, setMode] = useState('code'); // 'code' ou 'scanner'
  const [uuid, setUuid] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleValidate = async (e) => {
    if (e) e.preventDefault();
    if (!uuid) return;

    setStatus('loading');
    setErrorMsg('');
    setResult(null);

    try {
      const res = await api.post('/scan/validate', { uuid });
      setResult(res.data.data);
      setStatus('success');
      toast("Pass validé avec succès !", "success");
      setUuid('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Code invalide ou déjà utilisé';
      setErrorMsg(msg);
      setStatus('error');
      toast(msg, "error");
    }
  };

  const handleFileScan = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStatus('loading');
      setTimeout(() => {
        setStatus('idle');
        setMode('code');
        toast("Analyse terminée. Confirmez le code détecté.", "info");
      }, 1500);
    }
  };

  return (
    <div className="scan-page">
      <main className="container-small scan-container">
        <header className="scan-header-v2 anim-fade-down">
          <h1>Vérificateur de Pass</h1>
          <p>NovaTech Event Access Control</p>
        </header>

        <div className="mode-switcher glass">
          <button 
            className={mode === 'code' ? 'active' : ''} 
            onClick={() => setMode('code')}
          >
            <Hash size={20} /> Code
          </button>
          <button 
            className={mode === 'scanner' ? 'active' : ''} 
            onClick={() => setMode('scanner')}
          >
            <ScanIcon size={20} /> Scanner
          </button>
        </div>

        <div className="scan-card-v2 glass anim-scale-in">
          {mode === 'code' ? (
            <div className="mode-content">
              <div className="input-group-v2">
                <input 
                  type="text" 
                  value={uuid}
                  onChange={(e) => setUuid(e.target.value)}
                  placeholder="Coller l'UUID du billet..."
                  autoFocus
                />
                <button 
                  className="btn-primary validate-btn" 
                  onClick={handleValidate}
                  disabled={status === 'loading' || !uuid}
                >
                  {status === 'loading' ? <RefreshCcw className="icon-spin" /> : 'Vérifier'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mode-content scanner-mode">
              <div className="scanner-placeholder">
                <Camera size={60} />
                <p>Prêt pour le scan optique</p>
              </div>
              <label className="btn-primary scanner-launch">
                Ouvrir la caméra
                <input type="file" accept="image/*" capture="environment" onChange={handleFileScan} hidden />
              </label>
            </div>
          )}

          <div className="status-display">
            {status === 'success' && result && (
              <div className="result-success anim-fade-up">
                <div className="result-icon"><CheckCircle size={40} /></div>
                <h2>Pass Valide</h2>
                <div className="info-grid">
                  <div className="info-item"><User size={16} /> <span>{result.attendee.prenoms} {result.attendee.nom}</span></div>
                  <div className="info-item"><BookOpen size={16} /> <span>{result.attendee.filiere}</span></div>
                  <div className="info-item"><Clock size={16} /> <span>{new Date(result.attendee.createdAt).toLocaleDateString()}</span></div>
                </div>
                <div className="event-badge">
                  <MapPin size={14} /> {result.event.title}
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="result-error anim-fade-up">
                <div className="result-icon"><XCircle size={40} /></div>
                <h2>Accès Refusé</h2>
                <p>{errorMsg}</p>
                <button className="btn-secondary" onClick={() => setStatus('idle')}>Réessayer</button>
              </div>
            )}
          </div>
        </div>

        <div className="scan-footer-note anim-fade-up">
          <Info size={16} />
          <span>Vérifiez que le participant possède une pièce d'identité correspondante.</span>
        </div>
      </main>
    </div>
  );
};

export default Scan;
