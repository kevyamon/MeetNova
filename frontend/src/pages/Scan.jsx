import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, ArrowLeft, CheckCircle, XCircle, 
  RefreshCcw, Info, Hash, Scan as ScanIcon, 
  User, BookOpen, Clock, MapPin
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
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

  const handleValidate = async (e, scannedUuid = null) => {
    if (e) e.preventDefault();
    const idToValidate = scannedUuid || uuid;
    if (!idToValidate) return;

    setStatus('loading');
    setErrorMsg('');
    setResult(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 secondes timeout

    try {
      const res = await api.put(`/scan/validate/${idToValidate}`, undefined, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      setResult(res.data.data);
      setStatus('success');
      toast("Pass validé avec succès ! Félicitations.", "success");
      setUuid('');
    } catch (err) {
      clearTimeout(timeoutId);
      let msg = "Une erreur est survenue lors de la validation.";
      
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        msg = "Délai d'attente dépassé (Timeout). Le serveur ne répond pas.";
      } else if (err.response?.status === 404) {
        msg = "Ce pass est introuvable dans la base de données.";
      } else if (err.response?.status === 400) {
        msg = err.response.data.message || "Ce pass a déjà été utilisé.";
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }

      setErrorMsg(msg);
      setStatus('error');
      toast(msg, "error");
    }
  };

  useEffect(() => {
    let scanner = null;
    
    if (mode === 'scanner') {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
        /* verbose= */ false
      );
      
      scanner.render((decodedText) => {
        // Met en pause le scanner pour éviter de spammer l'API
        scanner.pause(true);
        setUuid(decodedText);
        handleValidate(null, decodedText).finally(() => {
          // Reprend le scan après 3 secondes (le temps que l'utilisateur voit le résultat)
          setTimeout(() => {
            if (scanner && scanner.getState() === 2) { // 2 = SCANNING state
              scanner.resume();
            }
          }, 3000);
        });
      }, (error) => {
        // Ignorer les erreurs de scan continuelles (quand le code n'est pas encore net)
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [mode]); // Re-run whenever mode changes

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
            onClick={() => { setMode('code'); setStatus('idle'); }}
          >
            <Hash size={20} /> Code
          </button>
          <button 
            className={mode === 'scanner' ? 'active' : ''} 
            onClick={() => { setMode('scanner'); setStatus('idle'); }}
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
                  onClick={(e) => handleValidate(e)}
                  disabled={status === 'loading' || !uuid}
                >
                  {status === 'loading' ? <RefreshCcw className="icon-spin" /> : 'Vérifier'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mode-content scanner-mode">
              <div id="qr-reader" style={{ width: '100%', borderRadius: '10px', overflow: 'hidden' }}></div>
            </div>
          )}

          <div className="status-display">
            {status === 'success' && result && (
              <div className="result-card result-success">
                <div className="result-icon">
                  <CheckCircle size={48} />
                </div>
                <h2>Accès Autorisé</h2>
                <div className="success-badge">
                  <CheckCircle size={16} /> Participant vérifié
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <User size={18} />
                    <span>{result.nom} {result.prenoms}</span>
                  </div>
                  <div className="info-item">
                    <BookOpen size={18} />
                    <span>{result.campus}</span>
                  </div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="result-card result-error">
                <div className="result-icon">
                  <XCircle size={48} />
                </div>
                <h2>Accès Refusé</h2>
                <p>{errorMsg}</p>
                <button className="btn-secondary" onClick={() => setStatus('idle')}>
                  Réessayer
                </button>
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
